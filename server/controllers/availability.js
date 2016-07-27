var Availability = require('../models/availability.js');
var moment = require('moment');

module.exports = function(app, route) {
  var Item = app.models.item;

  app.put('/item/:id/availability', function(req, res) {
    Item.findById(req.params.id, function(err, item) {
      if (err) return res.status(404).json({
        status: 'failure',
        message: "Item not found."
      });
      if (item['availability'] != undefined) {
        console.log(req.body);
        Availability.findByIdAndUpdate(item.availability._id, req.body, {
            new: true
          },
          function(err, availability) {
            console.log(availability);
            if (err) return res.status(404).json({
              status: 'failure',
              message: "Update availability failed."
            });
            console.log('Availability successfully updated!');
            res.status(200).json(availability);
          });
      } else {
        Availability.create(req.body, function(err, availability) {
          if (err) return res.status(500).json({
            status: 'failure',
            message: "Create availability failed."
          });
          item.availability = availability._id;
          item.save(function(err, doc) {
            if (err) return res.status(500).json({
              status: 'failure',
              message: "Create availability failed."
            });
            console.log('Availability successfully created!');
            res.status(200).json(availability);
          });
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
