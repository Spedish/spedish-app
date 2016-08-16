var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');
var config = require('config');

var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require("cookie-parser");

// Create the application.
var app = express();

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(require('express-session')({
  secret: 'SpedishRocks',
  resave: false,
  saveUninitialized: false
}));

// required for passport
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// pass passport for configuration
require('./config/passport')(passport);

app.use(flash()); // use connect-flash for flash messages stored in session

// CORS Support
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', config.get('server.CORSOrigin'));
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Disposition');
  next();
});

// Connect to MongoDB
mongoose.connect(config.get('server.dbConfig.url'));
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {

  // Load the models.
  app.models = require('./models/index');

  // Load the routes.
  var routes = require('./routes');
  _.each(routes, function(controller, route) {
    app.use(route, controller(app, route, passport));
  });

  app.use(logErrors);
  app.use(clientErrorHandler);
  app.use(errorHandler);

  function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
  }

  function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
      res.status(500).send({
        error: 'Something failed!'
      });
    } else {
      next(err);
    }
  }

  function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('error', {
      error: err
    });
  }

  console.log('Listening on port ' + config.get('server.port'));
  app.listen(config.get('server.port'));
});
