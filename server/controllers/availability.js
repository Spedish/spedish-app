var Availability = require('../models/availability.js');
var moment = require('moment');
var auth = require('../lib/auth');

module.exports = function(app, route, passport) {
  var Item = app.models.item;

  app.put('/item/:id/availability', function(req, res) {
    if (!req.isAuthenticated()) {
      console.error('Unauthenticated user attempted to modify availability of an item');
      res.status(403).json({'error': 'no user currently logged in'}).end();

      return false;
    }

    // Assign uid
    req.body._uid = req.user.id;

    Item.findById(req.params.id, function(err, item) {
      if (err) return res.status(404).json({
        status: 'failure',
        message: "Item not found."
      });
      if(!auth.isResOwner(req, item)) {
        res.status(403).json({error: 'This user does not own this item'}).end();
      } else {
        item.availability = req.body;
        item.save(function(err, doc) {
          if (err) return res.status(500).json({
            status: 'failure',
            message: "Update availability failed."
          });
          console.log('Availability successfully updated!');
          res.status(200).json(doc.availability);
        });
      }
    });
  });

  app.get('/item/:id/availability', function(req, res) {

    Item.findById(req.params.id, 'availability', function(err,
      availability) {
      if (err) res.status(404).json({
        status: 'failure',
        message: "Item not found."
      });
      console.log('Availability successfully retrieved!');
      res.status(200).json(availability);
    });
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };
};
