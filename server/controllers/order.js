var Order = require('../models/order.js');
var moment = require('moment');

module.exports = function(app, route) {
  var Item = app.models.item;

  var checkAvailability = function(item, order) {
    var pickUpDate = moment(order.pick_up_date, '"YYYY-MM-DDTHH:mm:ss.SSSSZ"').utc();
    var currentDateTime = moment().utc();
    var pickUpTime = moment(pickUpDate);
    pickUpTime.set('year', currentDateTime.get('year'))
              .set('month', currentDateTime.get('month'))
              .set('date', currentDateTime.get('date'));
    var pickUpDayOfWeek = pickUpDate.weekday();

    var checkPickUpWindow = function(pickUpTime) {
      //TODO: Need to check status of lunch and dinner window
      var lunchWindowStartTime = moment(item.availability.pickup_window.lunch.start_time, 'HH:mm:ss.SSSSZ').utc();
      var lunchWindowEndTime = moment(item.availability.pickup_window.lunch.end_time, 'HH:mm:ss.SSSSZ').utc();
      var dinnerWindowStartTime = moment(item.availability.pickup_window.dinner.start_time, 'HH:mm:ss.SSSSZ').utc();
      var dinnerWindowEndTime = moment(item.availability.pickup_window.dinner.end_time, 'HH:mm:ss.SSSSZ').utc();
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
            res.status(200).json(order);
          });
        });
      } else res.status(409).json({
        status: 'failure',
        message: "There's an issue processing your order, please try again later."
      });
    });
  });

  app.get('/order/:id', function(req, res) {
    Order.findById(req.params.id, function(err, order) {
      if (err) res.status(404).json({
        status: 'failure',
        message: "Order not found."
      });
      res.status(200).json(order);
    });
  });



  // Return middleware.
  return function(req, res, next) {
    next();
  };
};
