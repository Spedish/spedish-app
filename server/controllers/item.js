var Resource = require('resourcejs');

function isResOwner(req, obj) {
  if (!req.isAuthenticated()) {
    return false;
  }

  // If we are checking for the resource owner, then the resource must
  // have an owner field
  if (!obj._uid)
    return false;

  return obj._uid == req.user._id;
}

// Because this is a sequence of steps, we chain it together
// instead of using a sycnhronise library
function isResOwnerResolveChained(req, res, next, objId, objType) {
  if (!req.isAuthenticated()) {
    res.status(403).json({'error': 'user not logged in'});

    return false;
  }

  // Get the object
  objType.findOne({_id: objId}, function(err, obj) {
    if (err || !obj) {
      res.status(404).json({'error': 'object being edited does not exist'}).end();

      return false;
    }

    // Check that the object has an id
    if (!obj._uid) {
      res.status(500).json({'error': 'model error'}).end();

      return false;
    }

    if (obj._uid == req.user._id) {
      next();
    } else {
      res.status(403).json({'error': 'you do not own this resource'}).end();

      return false;
    }
  });
}

module.exports = function(app, route, passport) {
  // Setup the controller for REST;
  Resource(app, '', route, app.models.item)
    .get({
        after: function(req, res, next) {
          if (isResOwner(req, res.resource.item))
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
          return isResOwnerResolveChained(req, res, next, req.params.itemId, app.models.item);
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
          return isResOwnerResolveChained(req, res, next, req.params.itemId, app.models.item);
        }
      })

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
