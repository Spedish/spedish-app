// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../models/user');

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

};
