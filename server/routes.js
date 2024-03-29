module.exports = {
  'item': require('./controllers/item'),
  'signup': require('./controllers/auth/signup'),
  'order': require('./controllers/order'),
  'login': require('./controllers/auth/login'),
  'facebookLogin': require('./controllers/auth/facebookLogin'),
  'logout': require('./controllers/auth/logout'),
  'availability': require('./controllers/availability'),
  'user_status': require('./controllers/auth/status'),
  'profile': require('./controllers/auth/profile'),
  'gallery': require('./controllers/gallery'),
  'sellerPortal': require('./controllers/sellerPortal'),
  'review': require('./controllers/review')
};
