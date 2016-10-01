var Order = require('../models/order.js');
var moment = require('moment-timezone');
var auth = require('../lib/auth');
var ses = require('../lib/ses');
var Resource = require('resourcejs');
var uuid = require('node-uuid');

module.exports = function(app, route, passport) {
  var Item = app.models.item;

  app.get('/order/:orderId/complete/:completeOrderId', function(req, res) {

    var orderId = req.params.orderId;
    var completeOrderId = req.params.completeOrderId;

    if (orderId != undefined && completeOrderId != undefined) {
      Order.findById(orderId, function(err, order) {
        if (err) {
          res.status(404).json({
            status: 'failure',
            message: "Order with orderId " + orderId + " can not be found."
          });
        }
        else {
          if (order.status == 'complete') {
            res.status(200).json("Order is already complete.");
          }
          else {
            if (order.complete_order_id == completeOrderId) {
              if (order.status == 'ready') {
                order.status = 'complete';
                order.save(function(err, order) {
                  if (err) res.status(500).json({
                    status: 'failure',
                    message: "Update order with orderId " + orderId + " failed."
                  });
                  res.status(200).json("Order is complete.");
                });
              }
              else {
                res.status(500).json({
                  status: 'failure',
                  message: "Can not complete order with orderId " + orderId + ". Order is not under ready status."
                });
              }
            }
            else {
              res.status(404).json({
                status: 'failure',
                message: "Order with orderId " + orderId + " does not contain completeOrderId " + completeOrderId + " ."
              });
            }
          }
        }
      });
    }
    else {
      res.status(404).json({
        status: 'failure',
        message: "Wrong request formatt. Please set orderId and completeOrderId in URL."
      });
    }
  });

  Resource(app, '', route, app.models.order)
    .get({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          console.error('Unauthenticated user attempted to place an order');
          res.status(403).json({'error': 'no user currently logged in'}).end();
          return false;
        }

        next();
      },
      after: function(req, res, next) {
        if(!auth.isResOwner(req, res.resource.item)) {
          res.status(403).json({error: 'This user does not own this order'}).end();
        } else {
          res.resource.item._doc.canEdit = true;
        }

        next();
      }
    })
    .post({
      before: function(req, res, next) {
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
            req.body._sid = item._uid;
            req.body.complete_order_id = uuid.v4();
          } else res.status(409).json({
            status: 'failure',
            message: "There's an issue processing your order, please try again later."
          });

          next();
        });
      },
      after: function(req, res, next) {
        Item.findById(req.body.item_id, function(err, item) {
          if (err) return res.status(404).json({
            status: 'failure',
            message: "Item not found."
          });
          item.orders.push(res.resource.item._id);
          item.save(function(err, docs) {
            if (err) return res.status(500).json({
              status: 'failure',
              message: "Update inventory failed."
            });
            console.log('Inventory successfully updated!');
            var orderDetails = "Thank you for ordering with us, please wait for your chef " +
            "to confirm your order.";
            ses.send(req.user.email,
              `Spedish order ${res.resource.item._id}`,
              orderDetails, function (err, data, res) {
                if (err) return res.status(500).json({
                  status: 'failure',
                  message: "Email notification sent failure."
              });
            });
          });
        });

        next();
      }
    })
    .index({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          console.error('Unauthenticated user attempted to retrieve all orders');
          res.status(403).json({'error': 'no user currently logged in'}).end();

          return false;
        }

        req.modelQuery = this.model.where('_uid').equals(req.user.id)

        // Assign uid
        req.body._uid = req.user.id;

        next();
      },
      after: function(req, res, next) {
        res.resource.item.forEach(function(item, idx, arr) {
          item._doc.canEdit = true;
        });

        next();
      }
    })

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
  // Return middleware.
  return function(req, res, next) {
    next();
  };
};
