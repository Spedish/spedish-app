module.exports = function(app, route, passport) {

  app.post('/logout', function(req, res) {
    req.logout();
    return res.status(200).json({'action': 'logged out'});
  });

  // Return middleware.
  return function(req, res, next) {
    next();
  };

};
