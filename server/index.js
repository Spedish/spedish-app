var express  = require('express');
var mongoose = require('mongoose');

var app      = express();

mongoose.connect('mongodb://localhost/server');
mongoose.connection.once('open', function() {
    console.log('Connection opened');
    app.listen(3000);
});
