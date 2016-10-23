// load up the user model
var User = require('../../models/user');
var uuid = require('node-uuid');

module.exports = function(app, route, passport) {

  app.post('/facebookLogin', function(req, res, next) {

    // find the user in the database based on their facebook id
    User.findOne({
      'thirdParty_id': req.body.thirdParty_id
    }, function(err, user) {
      if (err) {
        return res.status(500).json({
          error: 'unable to connect to the database'
        });
      }

      // Existed user
      if (user) {
        console.log("Found an existing user.");
        req.logIn(user, function() {
          res.status(200).send({
            isSeller: user.isSeller
          });
        });
      } else {
        console.log("Create a new user.");
        var newUser = new User();

        // set all of the information in our user model
        newUser.thirdParty_source = req.body.thirdParty_source;
        newUser.thirdParty_id = req.body.thirdParty_id; // set the users facebook id
        newUser.thirdParty_token = req.body.thirdParty_token; // Save the token that facebook provides to the user
        newUser.thirdParty_name = req.body.thirdParty_name;
        newUser.thirdParty_email = req.body.thirdParty_email;

        newUser.username = uuid.v4(); // Create a temp username
        newUser.password = uuid.v4(); // Create a temp password
        newUser.email = req.body.thirdParty_email;
        newUser.isSeller = "false";

        // save our user to the database
        newUser.save(function(err, user) {
          if (err) {
            return res.status(500).json({
              error: 'unable to save the new user to the database'
            });
          } else {
            req.logIn(user, function() {
              res.status(200).send({
                isSeller: user.isSeller
              });
            })
          }
        });
      }
    });

  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };
};
