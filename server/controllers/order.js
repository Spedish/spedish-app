var Order = require('../models/order.js');
var moment = require('moment');

module.exports = function(app, route) {
  var Item = app.models.item;

  function checkAvailability(item, order) {
    var pickUpTime = moment(order.pick_up_time, 'h:mm');
    var pickUpDayOfWeek = moment(order.pick_up_date, 'YYYY-MM-DD').weekday();
    var lunchWindowStartTime = moment(item.availability.pickup_window.lunch.start_time, 'h:mm');
    var lunchWindowEndTime = moment(item.availability.pickup_window.lunch.end_time, 'h:mm');
    var dinnerWindowStartTime = moment(item.availability.pickup_window.lunch.start_time, 'h:mm');
    var dinnerWindowStartTime = moment(item.availability.pickup_window.lunch.start_time, 'h:mm');

    if (item.availability.pickup_window.free_sell && order.count >= item.inventory) {
      true
    } else {
      console.log(item.availability.day_of_week.get(pickUpDayOfWeek.toString()));
      if (item.availability.day_of_week.pickUpDayOfWeek && //pickUpTime is in slots &&
        moment().add(item.availability.lead_time, 'minutes').isSameOrBefore(pickUpTime)) {
        if (order.count <= item.inventory) {
          true
        } else {
          false
        }
      } else {
        false
      }
    }
  }

  app.post('/order', function(req, res) {
    Item.findById(req.body.item_id, function(err, item) {
      if (err) return res.status(404).json({
        status: 'failure',
        message: "Item not found."
      });
      if (item.inventory >= req.body.count) {
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
        message: "We don't have enough inventory."
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
