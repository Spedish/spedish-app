var Resource = require('resourcejs');
var auth = require('../lib/auth');

module.exports = function(app, route, passport) {
  // Setup the controller for REST;
  Resource(app, '', route, app.models.review).rest();

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
