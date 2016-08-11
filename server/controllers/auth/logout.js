module.exports = function(app, route, passport) {

    app.get('/logout', function(req, res) {
       req.logout();
       res.status(200).json({status: 'bye'});
    });

    // Return middleware.
    return function(req, res, next) {
        next();
    };

};
