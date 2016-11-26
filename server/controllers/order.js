var Order = require('../models/order.js');
var moment = require('moment-timezone');
var auth = require('../lib/auth');
var ses = require('../lib/ses');
var Resource = require('resourcejs');
var uuid = require('node-uuid');
var utils = require('../lib/utils');

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
module.exports = function(app, route, passport) {
  var Item = app.models.item;

  app.get('/order/:orderId/complete/:completeOrderId', function(req, res) {

    var orderId = req.params.orderId;
    var completeOrderId = req.params.completeOrderId;

    Order.findById(orderId, function(err, order) {
      if (err || !order) {
        utils.sendErrorResponse(res, 404, "Order with orderId " + orderId + " can not be found.");
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
                if (err) {
                  utils.sendErrorResponse(res, 500, "Update order with orderId " + orderId + " failed.");
                }

                res.status(200).json("Order is complete.");
              });
            }
            else {
              utils.sendErrorResponse(res, 500, "Can not complete order with orderId " + orderId + ". Order is not under ready status.");
            }
          }
          else {
            utils.sendErrorResponse(res, 404, "Order with orderId " + orderId + " does not contain completeOrderId " + completeOrderId + " .");
          }
        }
      }
    });
  });

  Resource(app, '', route, app.models.order)
    .get({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          utils.sendErrorResponse(res, 403, 'no user currently logged in');
          return false;
        }
        req.modelQuery = this.model.where().populate('item');
        next();
      },
      after: function(req, res, next) {
        if(!auth.isResOwner(req, res.resource.item)) {
          utils.sendErrorResponse(res, 403, 'this user does not own this order');
        } else {
          res.resource.item._doc.canEdit = true;
        }

        next();
      }
    })
    .post({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          utils.sendErrorResponse(res, 403, 'no user currently logged in');
          return false;
        }

        // Assign uid
        req.body._uid = req.user.id;

        Item.findById(req.body.item, function(err, item) {
          if (err || !item) {
            return utils.sendErrorResponse(res, 404, 'item not found', false);
          }

          //TODO: Provide details on the response instead of a boolean, consider
          //throw exceptions
          if (checkAvailability(item, req.body)) {
            req.body.title = item.title;
            req.body.unit_price = item.unit_price;
            req.body.total_price = item.unit_price * req.body.count;
            req.body._sid = item._uid;
            req.body.complete_order_id = uuid.v4();
          } else {
            return utils.sendErrorResponse(res, 409, "There's an issue processing your order, please try again later.", false);
          };

          next();
        });
      },
      after: function(req, res, next) {
        if (res.resource.status >= 200 && res.resource.status < 300) {
          Item.findById(req.body.item, function(err, item) {
            if (err || !item) {
              return utils.sendErrorResponse(res, 404, 'item not found', false);
            }

            item.orders.push(res.resource.item._id);
            item.inventory = (item.inventory - req.body.count);
            item.save(function(err, docs) {
              if (err) {
                return utils.sendErrorResponse(res, 500, 'update inventory failed', false);
              }

              console.log('Inventory successfully updated!');

              app.models.user.findById(res.resource.item._sid, function(err, user) {
                if (err || !user) {
                  console.error('Cannot find user ' + res.resource.item._sid);
                  utils.sendErrorResponse(res, 500, 'user not found');
                } else {
                  var emailBodyForBuyer = "Thank you for ordering with us, please wait for your chef " +
                    "to confirm your order.";
                  var emailBodyForSeller = `${req.user.username} has placed an order on ${item.title}. ` +
                    `Please confirm at your earliest convenience. Thank you Chef!`;
                  ses.send(req.user,
                    `order ${res.resource.item._id}`,
                    emailBodyForBuyer, function (err, data, res) {
                      if (err) {
                        return utils.sendErrorResponse(res, 500, 'Email notification failure', false);
                      }
                    });
                  ses.send(user,
                    `New order ${res.resource.item._id}`,
                    emailBodyForSeller, function (err, data, resonse) {
                      if (err) {
                        return utils.sendErrorResponse(res, 500, 'Email notification failure', false);
                      }
                    });
                }
              });
            });
          });
        }

        next();
      }
    })
    .index({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          console.error('Unauthenticated user attempted to retrieve all orders');
          utils.sendErrorResponse(res, 403, 'no user currently logged in');

          return false;
        }

        req.modelQuery = this.model.where('_uid').equals(req.user.id).populate('item')

        // Assign uid
        req.body._uid = req.user.id;

        next();
      },
      after: function(req, res, next) {
        if (res.resource.status >= 200 && res.resource.status < 300) {
          res.resource.item.forEach(function(item, idx, arr) {
            item._doc.canEdit = true;
          });
        }

        next();
      }
    })
    .patch({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          console.error('Unauthenticated user attempted update an order');
          return utils.sendErrorResponse(res, 403, 'no user currently logged in');
        }

        Order.findById(req.params.orderId, function(err, item) {
          if (err || !item) {
            return utils.sendErrorResponse(res, 404, 'order not found', false);
          }
          switch (req.body[0].value) {
            case "canceled":
              if (item.status != "ordered") {
                return utils.sendErrorResponse(res, 409, 'order cannot be canceled after it was confirmed by the chef', false);
              }
            default:
              return utils.sendErrorResponse(res, 409, 'buyer can only change order status to canceled', false);
          }
          return auth.isResOwnerResolveChained(req, res, next, req.params.orderId, Order);
        });
      },
      after: function(req, res, next) {
        if (res.resource.status >= 200 && res.resource.status < 300) {
          var updatedOrder = res.resource.item;
          app.models.user.findById(updatedOrder._sid, function(err, user) {
            if (err || !user) {
              console.error('Cannot find user ' + updatedOrder._sid);
              utils.sendErrorResponse(res, 404, 'user not found');
            } else {
              switch (updatedOrder.status) {
                case "canceled":
                  var emailBodyForBuyer = "We have canceled your order with chef " +
                    `${user.username}. We look forward to your next order in the future.`;
                  var emailBodyForSeller = `${req.user.username} has canceled order ${res.resource.item._id}.`;
                  ses.send(req.user,
                    `order ${res.resource.item._id}`,
                    emailBodyForBuyer, function (err, data, resonse) {
                      if (err) {
                        return utils.sendErrorResponse(res, 500, 'Email notification failure', false);
                      }
                    });
                  ses.send(user,
                    `order ${res.resource.item._id}`,
                    emailBodyForSeller, function (err, data, resonse) {
                      if (err) {
                        return utils.sendErrorResponse(res, 500, 'Email notification failure', false);
                      }
                    });
                  break;
                // TODO: Migrate complete order api to call this route instead.
                //
                // case "complete":
                //   var orderDetails = `Thank you for picking up your ${res.resource.item.title}, we have you enjoy it! ` +
                //     `Meanwhile, please feel free to contact your chef ${req.user.username} at ${req.user.email} if you have any questions.`;
                //   ses.send(user,
                //     `order ${res.resource.item._id}`,
                //     orderDetails, function (err, data, resonse) {
                //       if (err) return res.status(500).json({
                //         status: 'failure',
                //         message: "Email notification sent failure."
                //     });
                //   });
                //   break;
              }
            }
          });
        }

        next();
      }
    })

  // Return middleware.
  return function(req, res, next) {
    next();
  };
};
