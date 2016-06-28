var Resource = require('resourcejs');
var Item = require('../models/item.js');

module.exports = function(app, route) {
  app.post('/order', function(req, res) {
    Item.findById(req.body.item_id, function (err, item) {
      if (err) return next(err);
      if (item.inventory >= req.body.count) {
        item.inventory = (item.inventory - req.body.count);
        item.orders.push(req.body);
        item.save(function(err, docs) {
          if (err) return handleError(error)
          console.log('Inventory successfully updated!');
          res.json(docs);
        });
      } else res.json({
            status: 'failure',
            message: "We don't have enough inventory."
        });
    });
  });

  app.get('/order/:id', function(req, res) {
    Order.findById(req.path.id, function (err, order) {
      if (err) return next(err);
      if (order) {
        res.json(order);
      } else res.json({
            status: 'failure',
            message: "We didn't find this order."
        });
    });
  });



  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
