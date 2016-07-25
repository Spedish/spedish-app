module.exports = function(app, route, passport) {

  // =====================================
  // SIGNUP ==============================
  // =====================================

  app.post('/signup', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) {
        return res.status(500).json({
          message: "Create user failed."
        });
      }
      if (!user) {
        return res.status(409).json({ // 409 Conflict
          message: info.message
        });
      }
      return res.status(201).json(user);
    })(req, res, next);
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
