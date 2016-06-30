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
    'restangular',
    'blueimp.fileupload',
    'ui.bootstrap',
    'ui.sortable'
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
})

// Override the restangular framework's id keyword from id to _id,
// as _id is used in nodejs
.factory('ItemRestangular', function(Restangular) {
    return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setRestangularFields({
            id: '_id'
        });
    });
})

// Provide the product factory
.factory('Item', function(ItemRestangular) {
    return ItemRestangular.service('item');
});
