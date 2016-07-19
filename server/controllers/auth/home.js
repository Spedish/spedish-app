module.exports = function(app, route, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // Return middleware.
    return function(req, res, next) {
        next();
    };

};
