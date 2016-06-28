var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');

var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var cookieParser = require("cookie-parser");

var configDB = require('./config/database');

// Create the application.
var app = express();

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));

// CORS Support
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.set('view engine', 'ejs'); // set up ejs for templating

// pass passport for configuration
require('./config/passport')(passport);

// required for passport
app.use(session({
    secret: 'SpedishRocks!!!',
    resave: false,
    saveUninitialized: false
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Connect to MongoDB
mongoose.connect(configDB.url);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function () {

    // Load the models.
    app.models = require('./models/index');

    // Load the routes.
    var routes = require('./routes');
    _.each(routes, function (controller, route) {
        app.use(route, controller(app, route, passport));
    });

    console.log('Listening on port 3000...');
    app.listen(3000);
});
