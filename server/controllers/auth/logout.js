module.exports = function(app, route, passport) {

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    // Return middleware.
    return function(req, res, next) {
        next();
    };

};