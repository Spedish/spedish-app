module.exports = function(app, route, passport) {

  // =====================================
  // LOGIN ===============================
  // =====================================

  app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ //401 Unauthorized
          message: info.message
        });
      }
      return res.status(200).json(user);
    })(req, res, next);
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
