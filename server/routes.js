module.exports = {
  'products': require('./controllers/product'),
  'item': require('./controllers/item'),
  'signup': require('./controllers/auth/signup'),
  'order': require('./controllers/order'),
  'login': require('./controllers/auth/login'),
  'logout': require('./controllers/auth/logout'),
  'availability': require('./controllers/availability'),
  'user_status': require('./controllers/auth/status'),
  'profile': require('./controllers/auth/profile'),
  'gallery': require('./controllers/gallery'),
  'sellerPortal': require('./controllers/sellerPortal')
};
