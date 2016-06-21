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
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'restangular'
])
.config(function ($routeProvider, RestangularProvider) {

    RestangularProvider.setBaseUrl('http://54.183.97.63:3000');

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

// Provide the product factory
.factory('Product', function(ProductRestangular) {
    return ProductRestangular.service('products');
});
