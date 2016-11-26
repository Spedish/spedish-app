require('../lib/utils.js');

module.exports = {

  getUserId: function(req) {
    return req.user._id;
  },

  isResOwner: function(req, obj) {
    if (!req.isAuthenticated()) {
      return false;
    }

    // If we are checking for the resource owner, then the resource must
    // have an owner field
    if (!obj._uid)
      return false;

    return obj._uid == req.user._id;
  },

  // Because this is a sequence of steps, we chain it together
  // instead of using a sycnhronise library
  isResOwnerResolveChained: function(req, res, next, objId, objType) {
    if (!req.isAuthenticated()) {
      sendErrorResponse(res, 403, 'user not logged in');

      return false;
    }

    // Get the object
    objType.findOne({_id: objId}, function(err, obj) {
      if (err || !obj) {
        sendErrorResponse(res, 404, 'object being edited does not exist');

        return false;
      }

      // Check that the object has an id
      if (!obj._uid) {
        sendErrorResponse(res, 500, 'model error');

        return false;
      }

      if (obj._uid == req.user._id) {
        next();
      } else {
        sendErrorResponse(res, 403, 'you do not own this resource');

        return false;
      }
    });
  },

  // This version checks whether this resource is owned by a seller
  isResOwnedBySellerResolveChained: function(req, res, next, objId, objType) {
    if (!req.isAuthenticated()) {
      sendErrorResponse(res, 403, 'user not logged in');

      return false;
    }

    // Get the object
    objType.findOne({_id: objId}, function(err, obj) {
      if (err || !obj) {
        sendErrorResponse(res, 404, 'object being edited does not exist');

        return false;
      }

      // Check that the object has an id
      if (!obj._sid) {
        sendErrorResponse(res, 500, 'model error');

        return false;
      }

      if (obj._sid == req.user._id) {
        next();
      } else {
        sendErrorResponse(res, 403, 'you do not own this resource');

        return false;
      }
    });
  }
}
