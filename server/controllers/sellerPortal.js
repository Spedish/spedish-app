var Resource = require('resourcejs');
var auth = require('../lib/auth');

module.exports = function(app, route, passport) {
  // Setup the controller for REST;
  Resource(app, '', 'sellerPortal/order', app.models.order)
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
