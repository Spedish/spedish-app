var Order = require('../models/order.js');
var moment = require('moment-timezone');
var auth = require('../lib/auth');
var ses = require('../lib/ses');

module.exports = function(app, route, passport) {
  var Item = app.models.item;

  var checkAvailability = function(item, order) {
    var timezone = item.availability.timezone;
    //Set default timezone
    moment.tz.setDefault(timezone);
    var pickUpDate = moment(order.pick_up_date, '"YYYY-MM-DDTHH:mm:ss.SSSZ"');
    var currentDateTime = moment();
    var pickUpTime = moment(pickUpDate);
    var pickUpDayOfWeek = pickUpDate.weekday();

    // Modify the date portion of time to the date portion from the other date.
    function setDate(time, date) {
      return moment(time, 'HH:mm:ss.SSSSZ')
                  .set('year', date.get('year'))
                  .set('month', date.get('month'))
                  .set('date', date.get('date'));
    }

    var checkPickUpWindow = function(pickUpTime) {
      // TODO: Need to check status of lunch and dinner window
      // Set the date of the start and end time to the same day from the pickup date
      var lunchWindowStartTime = setDate(item.availability.pickup_window.lunch.start_time, pickUpTime);
      var lunchWindowEndTime = setDate(item.availability.pickup_window.lunch.end_time, pickUpTime);
      var dinnerWindowStartTime = setDate(item.availability.pickup_window.dinner.start_time, pickUpTime);
      var dinnerWindowEndTime = setDate(item.availability.pickup_window.dinner.end_time, pickUpTime);
      var isBetweenLunchHours = item.availability.pickup_window.lunch.status?
        pickUpTime.isBetween(lunchWindowStartTime, lunchWindowEndTime, null, '[]'): false
      var isBetweenDinnerHours = item.availability.pickup_window.dinner.status?
        pickUpTime.isBetween(dinnerWindowStartTime, dinnerWindowEndTime, null, '[]'): false
      return (isBetweenLunchHours || isBetweenDinnerHours);
    }

    //Inventory has to satify the order item count
    if (order.count <= item.inventory) {
      //If item is free sell, returns true
      if (item.availability.pickup_window.free_sell) {
        return true;
      } else {
        /*
        If all following condition are satisfied, we will return true and process the order request:
          1. Pickup date is on or after today
          2. Item is available on this day of weekday
          3. Pickup time is within lunch or dinner pickup window
          4. Current time plus lead time is on or before pickup time
        */
        if (pickUpDate.isSameOrAfter(currentDateTime) &&
            item.availability.day_of_week.get(pickUpDayOfWeek.toString()) &&
            checkPickUpWindow(pickUpTime) &&
            currentDateTime.add(item.availability.lead_time, 'minutes').isSameOrBefore(pickUpDate)) {
          return order.count <= item.inventory;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  app.post('/order', function(req, res) {
    if (!req.isAuthenticated()) {
      console.error('Unauthenticated user attempted to place an order');
      res.status(403).json({'error': 'no user currently logged in'}).end();

      return false;
    }

    // Assign uid
    req.body._uid = req.user.id;

    Item.findById(req.body.item_id, function(err, item) {
      if (err) return res.status(404).json({
        status: 'failure',
        message: "Item not found."
      });
      //TODO: Provide details on the response instead of a boolean, consider
      //throw exceptions
      if (checkAvailability(item, req.body)) {
        item.inventory = (item.inventory - req.body.count);
        req.body.title = item.title;
        req.body.unit_price = item.unit_price;
        req.body.total_price = item.unit_price * req.body.count;
        Order.create(req.body, function(err, order) {
          if (err) return res.status(500).json({
            status: 'failure',
            message: "Create order failed."
          });
          item.orders.push(order._id);
          item.save(function(err, docs) {
            if (err) return res.status(500).json({
              status: 'failure',
              message: "Update inventory failed."
            });
            console.log('Inventory successfully updated!');

            // Give SES the details and let it construct the message for you.
            ses.getClient().sendEmail({
               to: 'huaxi.wang@gmail.com'
             , from: 'huaxi.wang@gmail.com'
             , cc: ''
             , subject: 'greetings from spedish'
             , message: 'spedish test'
             , altText: 'plain text'
           }, function (err, data, resonse) {
              console.log(data);
              console.log(res);
              res.status(200).json(order);
            });
          });
        });
      } else res.status(409).json({
        status: 'failure',
        message: "There's an issue processing your order, please try again later."
      });
    });
  });

  app.get('/order/:id', function(req, res) {
    if (!req.isAuthenticated()) {
      console.error('Unauthenticated user attempted to place an order');
      res.status(403).json({'error': 'no user currently logged in'}).end();

      return false;
    }

    // Assign uid
    req.body._uid = req.user.id;

    Order.findById(req.params.id, function(err, order) {
      if (err) res.status(404).json({
        status: 'failure',
        message: "Order not found."
      });

      if(!auth.isResOwner(req, order)) {
        res.status(403).json({error: 'This user does not own this order'}).end();
      } else {
        res.status(200).json(order);
      }
    });
  });



  // Return middleware.
  return function(req, res, next) {
    next();
  };
};
