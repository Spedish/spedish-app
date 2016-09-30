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
    'ui.bootstrap.datetimepicker',
    'angularMoment',
    'multipleSelect',
    'ui.bootstrap',
    'ngTimezone'
  ])
  .config(function(ENV, $httpProvider, $routeProvider, RestangularProvider) {
    initConfig(ENV);

    $httpProvider.defaults.withCredentials = true;

    RestangularProvider.setBaseUrl(g_config.baseUrl);

    // Function to add pagination info to response
    // Any response with pagination can use the pagination property
    RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
        var responseData = response.data;
        var contentRange = response.headers('Content-Range');

        if (contentRange) {
            var rangeFields = contentRange.split(/\s|-|\//);

            var paginationFrom = parseInt(rangeFields[0]) + 1;
            var paginationTo = parseInt(rangeFields[1]) + 1;
            var paginationTotal = parseInt(rangeFields[2]);
            var paginationSubTotal = parseInt(paginationTo - paginationFrom);

            responseData.pagination = {
                from: paginationFrom,
                to: paginationTo,
                total: paginationTotal,
                numPages: Math.ceil(paginationTotal / paginationSubTotal),
                currentPage: Math.ceil(paginationFrom / paginationSubTotal)
            };
        }

        return responseData;
    });

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
      .when('/seller-meal', {
        templateUrl: 'views/seller-meal.html',
        controller: 'sellerMealCtrl',
        controllerAs: 'mealCtrl'
      })
      .when('/create/item', {
        templateUrl: 'views/item-add.html',
        controller: 'ItemAddCtrl',
        controllerAs: 'itemAdd',
        requireAuth: true
      })
      .when('/item/:id', {
        templateUrl: 'views/item-view.html',
        controller: 'ItemViewCtrl',
        controllerAs: 'itemView'
      })
      .when('/item/:id/delete', {
        templateUrl: 'views/item-delete.html',
        controller: 'ItemDeleteCtrl',
        controllerAs: 'itemDelete',
        requireAuth: true
      })
      .when('/item/:id/edit', {
        templateUrl: 'views/item-edit.html',
        controller: 'ItemEditCtrl',
        controllerAs: 'itemEdit',
        requireAuth: true
      })
      .when('/item/:id/order', {
        templateUrl: 'views/order.html',
        controller: 'OrderCtrl',
        controllerAs: 'order',
        requireAuth: true
      })
      .when('/order/:id', {
        templateUrl: 'views/order-view.html',
        controller: 'OrderViewCtrl',
        controllerAs: 'orderView'
      })
      .when('/orders', {
        templateUrl: 'views/orders.html',
        controller: 'OrdersCtrl',
        controllerAs: 'orders'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
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
        templateUrl: 'views/profile-edit.html',
        controller: 'ProfileEditCtrl',
        controllerAs: 'profileEdit',
        requireAuth: true
      })
      .when('/profile/:username', {
        templateUrl: 'views/profile-view.html',
        controller: 'ProfileViewCtrl',
        controllerAs: 'profileView'
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

.factory('AvailabilityRestangular', function(Restangular) {
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

// Provide the availability factory
.factory('Availability', function(AvailabilityRestangular) {
  return AvailabilityRestangular.service('availability');
})
