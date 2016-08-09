// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User = require('../models/user');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        User.findOne({
          'username': username
        }, function(err, user) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if there is already a user with that username
          if (user) {
            return done(null, false, {
              message: 'Username is already taken.'
            });
          } else {
            // if there is no user with that username
            // create the user
            var newUser = new User();

            // set the user's required information
            newUser.username = username;
            newUser.password = newUser.generateHash(password);
            newUser.email = req.body.email;
            newUser.isSeller = req.body.isSeller;

            // set the user's other information
            newUser.firstname = req.body.firstname;
            newUser.lastname = req.body.lastname;
            newUser.address = req.body.address;
            newUser.city = req.body.city;
            newUser.zip = req.body.zip;
            newUser.contact = req.body.contact;
            newUser.about = req.body.about;

            // save the user
            newUser.save(function(err) {
              if (err) {
                return done(err);
              } else {
                return done(null, newUser);
              }
            });
          }
        });
      });
    }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

      // find a user whose username is the same as the forms username
      // we are checking to see if the user trying to login already exists
      User.findOne({
        'username': username
      }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, {
            message: 'Username is incorrect.'
          });

        // if the user is found but the password is wrong
        if (!user.validPassword(password))
          return done(null, false, {
            message: 'Oops! Wrong password.'
          });

        // all is well, return successful user
        return done(null, user);
      });

    }));

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy({
      // pull in our app id and secret from our auth.js file
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL,
      profileFields: configAuth.facebookAuth.profileFields
    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function() {

        // find the user in the database based on their facebook id
        User.findOne({
          'thirdParty_id': profile.id
        }, function(err, user) {

          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err)
            return done(err);

          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();

            // set all of the information in our user model
            newUser.thirdParty_source = 'Facebook';
            newUser.thirdParty_id = profile.id; // set the users facebook id
            newUser.thirdParty_token = token; // we will save the token that facebook provides to the user
            newUser.thirdParty_name = profile.name.givenName +
              ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
            newUser.thirdParty_email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;

              // if successful, return the new user
              return done(null, newUser);
            });
          }
        });
      });
    }));
};
