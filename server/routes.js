module.exports = {
  'products': require('./controllers/product'),
  'item': require('./controllers/item'),
  'signup': require('./controllers/auth/signup'),
  'order': require('./controllers/order'),
  'login': require('./controllers/auth/login'),
  'profile': require('./controllers/auth/profile'),
  '': require('./controllers/auth/home'),
  'logout': require('./controllers/auth/logout'),
  'facebook': require('./controllers/auth/facebook'),
  'gallery': require('./controllers/gallery'),
  'availability': require('./controllers/availability')
};
