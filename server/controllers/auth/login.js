var utils = require('../../lib/utils');

module.exports = function(app, route, passport) {

  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, message) {
      req.logIn(user, function(err) {
        if (user == false || err) {
          res.status(400).send(message);
        }
        else {
          res.status(200).send({isSeller: user.isSeller});
        }
      })
    })(req, res, next);
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
