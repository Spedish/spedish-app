'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
  .module('clientApp', [
    'config',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'restangular',
    'blueimp.fileupload',
    'ui.bootstrap',
    'ui.sortable',
    'multipleSelect'
  ])
  .config(function(ENV, $httpProvider, $routeProvider, RestangularProvider) {

    initConfig(ENV);

    $httpProvider.defaults.withCredentials = true;

    RestangularProvider.setBaseUrl(g_config.baseUrl);

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/products', {
        templateUrl: 'views/products.html',
        controller: 'ProductsCtrl',
        controllerAs: 'products'
      })
      .when('/item', {
        templateUrl: 'views/item.html',
        controller: 'ItemCtrl',
        controllerAs: 'item'
      })
      .when('/create/item', {
        templateUrl: 'views/item-add.html',
        controller: 'ItemAddCtrl',
        controllerAs: 'itemAdd'
      })
      .when('/item/:id', {
        templateUrl: 'views/item-view.html',
        controller: 'ItemViewCtrl',
        controllerAs: 'itemView'
      })
      .when('/item/:id/delete', {
        templateUrl: 'views/item-delete.html',
        controller: 'ItemDeleteCtrl',
        controllerAs: 'itemDelete'
      })
      .when('/item/:id/edit', {
        templateUrl: 'views/item-edit.html',
        controller: 'ItemEditCtrl',
        controllerAs: 'itemEdit'
      })
      .when('/item/:id/order', {
        templateUrl: 'views/order.html',
        controller: 'OrderCtrl',
        controllerAs: 'order'
      })
      .when('/order/:id', {
        templateUrl: 'views/order-view.html',
        controller: 'OrderViewCtrl',
        controllerAs: 'orderView'
      })
      .when('/item/:id/orders', {
        templateUrl: 'views/orders.html',
        controller: 'OrdersCtrl',
        controllerAs: 'orders'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .when('/logout', {
        controller: 'LogoutCtrl',
      })
      .when('/buyerSignup', {
        templateUrl: 'views/buyerSignup.html',
        controller: 'BuyerSignupCtrl',
        controllerAs: 'buyerSignup'
      })
      .when('/sellerSignup', {
        templateUrl: 'views/sellerSignup.html',
        controller: 'SellerSignupCtrl',
        controllerAs: 'sellerSignup'
      })
      .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl',
        controllerAs: 'profile'
      })
      .otherwise({
        redirectTo: '/'
      });
  })

// Override the restangular framework's id keyword from id to _id,
// as _id is used in nodejs
.factory('ProductRestangular', function(Restangular) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setRestangularFields({
      id: '_id'
    });
  });
})

.factory('ItemRestangular', function(Restangular) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setRestangularFields({
      id: '_id'
    });
  });
})

.factory('OrderRestangular', function(Restangular) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setRestangularFields({
      id: '_id'
    });
  });
})

.factory('UserRestangular', function(Restangular) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setRestangularFields({
      id: '_id'
    });
  });
})

// Provide the product factory
.factory('Product', function(ProductRestangular) {
  return ProductRestangular.service('products');
})

// Provide the item factory
.factory('Item', function(ItemRestangular) {
  return ItemRestangular.service('item');
})

// Provide the product factory
.factory('Order', function(OrderRestangular) {
  return OrderRestangular.service('order');
})

// Provide the signup factory
.factory('Signup', function(UserRestangular) {
  return UserRestangular.service('signup');
})

// Provide the login factory
.factory('Login', function(UserRestangular) {
  return UserRestangular.service('login');
})

// Provide the facebook login factory
.factory('FacebookLogin', function(UserRestangular) {
  return UserRestangular.all('auth/facebook');
});
