module.exports = function(app, route, passport, User) {

  app.get('/profile', function(req, res, next) {
    if (!req.isAuthenticated()) {
      res.status(403).json({error: 'no logged in user'});
    } else {
      res.status(200).json({
        username: req.user.username,
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        address: req.user.address,
        city: req.user.city,
        zip: req.user.zip,
        contact: req.user.contact,
        isSeller: req.user.isSeller
      });
    }

    next();
  });

  app.post('/profile', function(req, res, next) {
    if (!req.isAuthenticated()) {
      res.status(403).json({error: 'no logged in user'});

      next();
    } else {
      req.user.update(req.body, function(err, user) {
        if (!err)
          res.status(200).json({status: 'updated'});
        else
          res.status(500).json({error: 'unable to update'});

        next();
      });
    }
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
