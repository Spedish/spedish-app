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
        before: function(req, res) {
          // If user not logged in then redirect to login
          if (!req.isAuthenticated()) {
            res.redirect('/login');
          }

          // Assign uid
          req.item._uid = req.user._id;
        }
      })
    .put({
        before: function(req, res) {
          isResOwner(req, req.item);
        }
      })
    .index({
        after: function(req, res, next) {
          debugger;
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
        before: function(req, res) {
          isResOwner(req, req.item);
        }
      })

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
