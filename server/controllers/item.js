var Resource = require('resourcejs');
var auth = require('../lib/auth');
var utils = require('../lib/utils');

module.exports = function(app, route, passport) {
  // Setup the controller for REST;
  Resource(app, '', route, app.models.item)
    .get({
        before: function(req, res, next) {
          req.modelQuery = this.model.where().populate('orders');
          next();
        },
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
            utils.sendErrorResponse(res, 403, 'no user currently logged in');

            return false;
          }

          // Assign uid, request userid guaranteed to exist since we
          // passed authentication check
          req.body._uid = req.user.id;

          next();
        }
      })
    .put({
        before: function(req, res, next) {
          if (req.params.itemId)
            return auth.isResOwnerResolveChained(req, res, next, req.params.itemId, app.models.item);
          else
            return utils.sendErrorResponse(res, 400, 'item not specified', false);
        }
      })
    .index({
        before: function(req, res, next) {
          req.modelQuery = this.model.where().populate('orders');
          next();
        },
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
          if (req.params.itemId)
            return auth.isResOwnerResolveChained(req, res, next, req.params.itemId, app.models.item);
          else
            return utils.sendErrorResponse(res, 500, 'item not specified', false);
        }
      })

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
