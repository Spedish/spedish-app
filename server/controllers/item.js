var Resource = require('resourcejs');

function isResOwner(req, obj) {
  if (!req.isAuthenticated())
    return false;

  // If we are checking for the resource owner, then the resource must
  // have an owner field
  if (!obj._uid)
    return false;

  return obj._uid == req.user._id;
}

module.exports = function(app, route, passport) {
  // Setup the controller for REST;
  //Resource(app, '', route, app.models.item).rest()
  Resource(app, '', route, app.models.item)
    .get({
        after: function(req, res, next) {
          if (isResOwner(req, res))
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
            res.status(403).json({'error': 'no user currently logged in'});

            return false;
          }

          // Assign uid
          debugger;
          req.item._uid = req.user._id;

          next();
        }
      })
    .put({
        before: function(req, res, next) {
          if (!isResOwner(req, req.item)) {
            res.status(403).json({'error': 'This user does not own current resource'});

            return false;
          } else {
            next();
          }
        }
      })
    .index({
        after: function(req, res, next) {
          res.resource.item.forEach(function(item, idx, arr) {
            if (isResOwner(req, item))
              item._doc.canEdit = true;
            else {
              item._doc.canEdit = false;
            }
          });

          next();
        }
      })
    .delete({
        before: function(req, res, next) {
          if (!isResOwner(req, req.item)) {
            res.status(403).json({'error': 'This user does not own current resource'});

            return false;
          } else {
            next();
          }
        }
      })

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
