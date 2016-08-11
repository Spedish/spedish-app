module.exports = {
    'products': require('./controllers/product'),
    'item': require('./controllers/item'),
    'signup': require('./controllers/auth/signup'),
    'order': require('./controllers/order'),
    'login': require('./controllers/auth/login'),
    'profile': require('./controllers/auth/profile'),
    'logout': require('./controllers/auth/logout'),
    'user_status': require('./controllers/auth/status'),
    'facebook': require('./controllers/auth/facebook'),
    'gallery': require('./controllers/gallery')
};
