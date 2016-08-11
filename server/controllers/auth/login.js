module.exports = function(app, route, passport) {

  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user) {
      req.logIn(user, function() {
        res.status(200).send(user);
      })
    })(req, res, next);
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
