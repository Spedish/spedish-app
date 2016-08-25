var Resource = require('resourcejs');
var auth = require('../lib/auth');

module.exports = function(app, route, passport) {
  // Setup the controller for REST;
  Resource(app, '', route, app.models.item)
    .get({
        after: function(req, res, next) {
          if (auth.isResOwner(req, res.resource.item))
            res.resource.item._doc.canEdit = true;
          else {
            res.resource.item._doc.canEdit = false;
          }
          next();
        }
      })
    .post({
        before: function(req, res, next) {
          if (!req.isAuthenticated()) {
            console.error('Unauthenticated user attempted to create an item');
            res.status(403).json({'error': 'no user currently logged in'}).end();

            return false;
          }

          // Assign uid
          req.body._uid = req.user.id;

          next();
        }
      })
    .put({
        before: function(req, res, next) {
          return auth.isResOwnerResolveChained(req, res, next, req.params.itemId, app.models.item);
        }
      })
    .index({
        after: function(req, res, next) {
          // Disable caching for content files
          res.header("Cache-Control", "no-cache, no-store, must-revalidate");
          res.header("Pragma", "no-cache");
          res.header("Expires", 0);

          if(res.resource.item) {
            res.resource.item.forEach(function(item, idx, arr) {
            if (auth.isResOwner(req, item))
              item._doc.canEdit = true;
            else
              item._doc.canEdit = false;
            });
          }
          next();
        }
      })
    .delete({
        before: function(req, res, next) {
          return auth.isResOwnerResolveChained(req, res, next, req.params.itemId, app.models.item);
        }
      })

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
