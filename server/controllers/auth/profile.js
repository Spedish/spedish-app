var utils = require('../../lib/utils');

module.exports = function(app, route, passport, User) {

  app.get('/profile', function(req, res, next) {
    if (!req.isAuthenticated()) {
      utils.sendErrorResponse(res, 403, 'no logged in user');
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
        isSeller: req.user.isSeller,
        profileImage: req.user.profile_image
      });
    }

    next();
  });

  // TODO: Why do we have this even? this should be combined with the above
  app.get('/profile/:username', function(req, res, next) {
    var username = req.params.username;

    app.models.user.findOne({username: username}, function(err, user) {
      if (err || !user) {
        utils.sendErrorResponse(res, 404, 'user not found');
      } else {
        res.status(200).json({
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          address: user.address,
          city: user.city,
          zip: user.zip,
          contact: user.contact,
          isSeller: user.isSeller,
          profileImage: req.user.profile_image
        });
      }

      next();
    });
  });

  app.post('/profile', function(req, res, next) {
    if (!req.isAuthenticated()) {
      utils.sendErrorResponse(res, 403, 'user not found');
    } else {
      req.user.update(req.body, function(err, user) {
        if (!err && user)
          res.status(200).json({status: 'updated'});
        else
          utils.sendErrorResponse(res, 500, 'unable to update');

        next();
      });
    }
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
