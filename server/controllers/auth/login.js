module.exports = function(app, route, passport) {

  app.post('/login', passport.authenticate('local-login'), function(req, res) {
    return res.status(200).json(req.user);
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
