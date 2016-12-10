var utils = require('../../lib/utils.js');

module.exports = function(app, route, passport) {

  app.post('/signup', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) {
        return utils.sendErrorResponse(res, 500, 'Create user failed', false);
      }
      if (!user) {
        return utils.sendErrorResponse(res, 409, info.message, false);
      }
      return res.status(201).json(user);
    })(req, res, next);
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
