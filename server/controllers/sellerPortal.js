var Resource = require('resourcejs');
var auth = require('../lib/auth');
var ses = require('../lib/ses');
var config = require('config');
var utils = require('../lib/utils');

module.exports = function(app, route, passport) {
  var Order = app.models.order;

  Resource(app, '/sellerPortal', 'order', Order)
    .patch({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          console.error('Unauthenticated user attempted update an order');
          utils.sendErrorResponse(res, 403, 'no user currently logged in');
          return false;
        }

        if (!req.params.orderId) {
          utils.sendErrorResponse(res, 400, 'no order specified');
          return false;
        }

        return auth.isResOwnedBySellerResolveChained(req, res, next, req.params.orderId, Order);
      },
      after: function(req, res, next) {
        var updatedOrder = res.resource.item;
        app.models.user.findById(updatedOrder._uid, function(err, user) {
          if (err || !user) {
            console.error('Cannot find user ' + updatedOrder._uid);
            utils.sendErrorResponse(res, 404, 'user not found');
          } else {
            switch (updatedOrder.status) {
              case "confirmed":
                var orderDetails = "Thank you for ordering with us, your order is confirmed by chef " +
                  `${req.user.username}. You will receive an email when your order is ready.`;
                ses.send(user,
                  `order ${res.resource.item._id}`,
                  orderDetails, function (err, data, resonse) {
                    if (err) {
                      return utils.sendErrorResponse(res, 500, 'email notification failure', false);
                    }
                });
                break;
              case "ready":
                var completeOrderUrl = config.get('server.baseUrl') + "/order/" + updatedOrder._id + "/complete/" + updatedOrder.complete_order_id;
                var orderDetails = "Thank you for ordering with us, your order is now ready for pick up. " +
                "Plese click the following link to complete your order after picking up your meal: " + completeOrderUrl;
                ses.send(user,
                  `order ${res.resource.item._id}`,
                  orderDetails, function (err, data, resonse) {
                    if (err) {
                      return utils.sendErrorResponse(res, 500, 'email notification failure', false);
                    }
                });
                break;
              case "declined":
                var orderDetails = `Chef ${req.user.username} has declined your order. Please feel ` +
                  `free to contact your chef at ${req.user.email} if you have any questions.`
                ses.send(user,
                  `order ${res.resource.item._id}`,
                  orderDetails, function (err, data, resonse) {
                    if (err) {
                      return utils.sendErrorResponse(res, 500, 'email notification failure', false);
                    }
                });
                break;

              default:
                console.err('Unhandled case in oder status update');
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
            utils.sendErrorResponse(res, 403, 'no user currently logged in');
            return false;
          }
          req.modelQuery = this.model.where('_sid').equals(req.user.id).populate('item');
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
