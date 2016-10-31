module.exports = {

  getUserId: function(req) {
    debugger;
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
  },

  // This version checks whether this resource is owned by a seller
  isResOwnedBySellerResolveChained: function(req, res, next, objId, objType) {
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
      if (!obj._sid) {
        res.status(500).json({'error': 'model error'}).end();

        return false;
      }

      if (obj._sid == req.user._id) {
        next();
      } else {
        res.status(403).json({'error': 'you do not own this resource'}).end();

        return false;
      }
    });
  }
}
