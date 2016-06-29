var Resource = require('resourcejs');
var Item = require('../models/item.js');
var Order = require('../models/order.js');

module.exports = function(app, route) {
  app.post('/order', function(req, res) {
    Item.findById(req.body.item_id, function (err, item) {
      if (err) return res.json({
                                status: 'failure',
                                message: "Item not found."
                              });
      if (item.inventory >= req.body.count) {
        item.inventory = (item.inventory - req.body.count);
        req.body.title = item.title;
        req.body.unit_price = item.unit_price;
        req.body.total_price = item.unit_price*req.body.count;
        Order.create(req.body, function (err, order) {
          if (err) return res.json({
                                    status: 'failure',
                                    message: "Order creation failed."
                                  });
          item.orders.push(order._id);
          item.save(function(err, docs) {
            if (err) return res.json({
                                      status: 'failure',
                                      message: "Update inventory failed."
                                    })
            console.log('Inventory successfully updated!');
            res.json(docs);
          });
        });
      } else res.json({
            status: 'failure',
            message: "We don't have enough inventory."
        });
    });
  });

  app.get('/order/:id', function(req, res) {
    Order.findById(req.params.id, function (err, order) {
      if (err) res.json({
                         status: 'failure',
                         message: "Order not found."
                       });
      if (order) {
        res.json(order);
      } else res.json({
            status: 'failure',
            message: "Order not found."
        });
    });
  });



  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
