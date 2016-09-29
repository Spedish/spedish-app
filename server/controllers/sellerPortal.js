var Resource = require('resourcejs');
var auth = require('../lib/auth');
var ses = require('../lib/ses');

module.exports = function(app, route, passport) {
  var Order = app.models.order;

  Resource(app, '/sellerPortal', 'order', Order)
    .patch({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          console.error('Unauthenticated user attempted update an order');
          res.status(403).json({'error': 'no user currently logged in'}).end();
          return false;
        }

        return auth.isResOwnedBySellerResolveChained(req, res, next, req.params.orderId, Order);
      },
      after: function(req, res, next) {
        var updatedOrder = res.resource.item;
        app.models.user.findById(updatedOrder._uid, function(err, user) {
          if (err || !user) {
            console.error('Cannot find user ' + updatedOrder._uid);
            res.status(404).json({error: 'user not found'});
          } else {
            switch (updatedOrder.status) {
              case "ordered":
                var orderDetails = "Thank you for ordering with us, you will receive an email " +
                  `when your order is confirmed by chef ${req.user.username}.`;
                ses.send(user.email,
                  `Spedish order ${res.resource.item._id}`,
                  orderDetails, function (err, data, resonse) {
                    if (err) return res.status(500).json({
                      status: 'failure',
                      message: "Email notification sent failure."
                  });
                });
                break;
              case "confirmed":
                var orderDetails = "Thank you for ordering with us, your order is confirmed by chef " +
                  `${req.user.username}. You will receive an email when your order is ready.`;
                ses.send(user.email,
                  `Spedish order ${res.resource.item._id}`,
                  orderDetails, function (err, data, resonse) {
                    if (err) return res.status(500).json({
                      status: 'failure',
                      message: "Email notification sent failure."
                  });
                });
                break;
              case "ready":
                var completeOrderUrl = "http://localhost:3000/completeOrder?orderId=" + updatedOrder._id + "&completeOrderId=" + updatedOrder.complete_order_id;
                var orderDetails = "Thank you for ordering with us, your order is now ready for pick up. " +
                "Plese click the following link to complete your order after picking up your meal: " + completeOrderUrl;
                ses.send(user.email,
                  `Spedish order ${res.resource.item._id}`,
                  orderDetails, function (err, data, resonse) {
                    if (err) return res.status(500).json({
                      status: 'failure',
                      message: "Email notification sent failure."
                  });
                });
                break;
              case "complete":
                var orderDetails = `Thank you for picking up your ${res.resource.item.title}, we have you enjoy it! ` +
                  `Meanwhile, please feel free to contact your chef ${req.user.username} at ${req.user.email} if you have any questions.`;
                ses.send(user.email,
                  `Spedish order ${res.resource.item._id}`,
                  orderDetails, function (err, data, resonse) {
                    if (err) return res.status(500).json({
                      status: 'failure',
                      message: "Email notification sent failure."
                  });
                });
                break;
              case "declined":
                var orderDetails = `Chef ${req.user.username} has declined your order. Please feel ` +
                  `free to contact your chef at ${req.user.email} if you have any questions.`
                ses.send(user.email,
                  `Spedish order ${res.resource.item._id}`,
                  orderDetails, function (err, data, resonse) {
                    if (err) return res.status(500).json({
                      status: 'failure',
                      message: "Email notification sent failure."
                  });
                });
                break;
            }
          }
        });

        next();
      }
    })
    .index({
        before: function(req, res, next) {
          if (!req.isAuthenticated()) {
            console.error('Unauthenticated user attempted retrieve orders');
            res.status(403).json({'error': 'no user currently logged in'}).end();
            return false;
          }
          req.modelQuery = this.model.where('_sid').equals(req.user.id);
          next();
        },
        after: function(req, res, next) {
          // Disable caching for content files
          res.header("Cache-Control", "no-cache, no-store, must-revalidate");
          res.header("Pragma", "no-cache");
          res.header("Expires", 0);

          if(res.resource.item) {
            res.resource.item.forEach(function(item, idx, arr) {
              item._doc.canEdit = true;
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
