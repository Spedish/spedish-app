module.exports = function(app, route, passport) {

  app.get('/user_status', function(req, res, next) {
    if (!req.isAuthenticated()) {
      res.status(200).json({
        status: false
      });
    } else {
      res.status(200).json({
        status: true,
        isSeller: req.user.isSeller,
        id: req.user.id,
        isFacebookUser: req.user.thirdParty_source == "Facebook"
      });
    }

    next();
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
