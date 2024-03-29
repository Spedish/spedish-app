// load up the user model
var User = require('../../models/user');
var uuid = require('node-uuid');
var utils = require('../../lib/utils');

module.exports = function(app, route, passport) {

  app.post('/facebookLogin', function(req, res, next) {

    // find the user in the database based on their facebook id
    User.findOne({
      'thirdParty_id': req.body.thirdParty_id
    }, function(err, user) {
      if (err || !user) {
        return utils.sendErrorResponse(res, 404, 'user not found', false);
      }

      // Existed user
      if (user) {
        console.log("Found an existing user.");
        req.logIn(user, function(err) {
          if (err) {
            return utils.sendErrorResponse(res, 500, 'unable to login', false);
          }

          res.status(200).send({
            isSeller: user.isSeller
          });
        });
      } else {
        // Check if exist a local user with the same email
        User.findOne({
          'email': req.body.thirdParty_email
        }, function(err, user) {
          if (err || !user) {
            return utils.sendErrorResponse(res, 500, 'user not found', false);
          }

          if (user) {
            console.log("Merge with an existing local user.");

            // set all of the information in our user model
            user.thirdParty_source = req.body.thirdParty_source;
            user.thirdParty_id = req.body.thirdParty_id; // set the users facebook id
            user.thirdParty_token = req.body.thirdParty_token; // Save the token that facebook provides to the user
            user.thirdParty_name = req.body.thirdParty_name;
            user.thirdParty_email = req.body.thirdParty_email;

            // save the updated user to the database
            user.save(function(err, user) {
              if (err || !user) {
                return utils.sendErrorResponse(res, 500, 'unable to save new user into database', false);
              } else {
                req.logIn(user, function(err) {
                  if (err) {
                    return utils.sendErrorResponse(res, 500, 'unable to login', false);
                  }

                  res.status(200).send({
                    isSeller: user.isSeller
                  });
                })
              }
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

            newUser.password = uuid.v4(); // Create a temp password
            newUser.email = req.body.thirdParty_email;
            newUser.isSeller = "false";

            // Check if exist a local user with the same username
            User.findOne({
              'username': req.body.thirdParty_name
            }, function(err, user) {
              if (err || !user) {
                return utils.sendErrorResponse(res, 500, 'user not found', false);
              }

              if (!user) {
                newUser.username = req.body.thirdParty_name;
              } else {
                newUser.username = uuid.v4(); // Create a temp username.
              }

              // save our user to the database
              newUser.save(function(err, user) {
                if (err) {
                  return utils.sendErrorResponse(res, 500, 'unable to save new user to database', false);
                } else {
                  req.logIn(user, function() {
                    res.status(200).send({
                      isSeller: user.isSeller
                    });
                  })
                }
              });
            });
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
