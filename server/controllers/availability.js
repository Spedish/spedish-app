var moment = require('moment');
var auth = require('../lib/auth');
var utils = require('../lib/utils');

module.exports = function(app, route, passport) {
  var Item = app.models.item;

  app.put('/item/:id/availability', function(req, res) {
    if (!req.isAuthenticated()) {
      console.error('Unauthenticated user attempted to modify availability of an item');
      utils.sendErrorResponse(res, 403, 'no user currently logged in');

      return false;
    }

    // Assign uid
    req.body._uid = req.user.id;

    Item.findById(req.params.id, function(err, item) {
      if (err || !item) {
        return utils.sendErrorResponse(res, 404, 'item not found', false);
      }

      if(!auth.isResOwner(req, item)) {
        utils.sendErrorResponse(res, 403, 'this user does not own this item');
      } else {
        item.availability = req.body;
        item.save(function(err, doc) {
          if (err || !doc) {
            return utils.sendErrorResponse(res, 500, 'update availablity failed', false);
          }

          console.log('Availability successfully updated!');
          res.status(200).json(doc.availability);
        });
      }
    });
  });

  app.get('/item/:id/availability', function(req, res) {

    Item.findById(req.params.id, 'availability', function(err,
      availability) {
      if (err || !availability) {
        return utils.sendErrorResponse(res, 404, 'item not found', false);
      }

      console.log('Availability successfully retrieved!');
      res.status(200).json(availability);
    });
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };
};
