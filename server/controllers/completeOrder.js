
module.exports = function(app, route) {
  var Order = app.models.order;

  app.get('/completeOrder', function(req, res) {

    var orderId = req.query.orderId;
    var completeOrderId = req.query.completeOrderId;

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

  // Return middleware.
  return function(req, res, next) {
    next();
  };
};
