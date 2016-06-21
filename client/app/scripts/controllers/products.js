'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ProductsCtrl
 * @description
 * # ProductsCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
.controller('ProductsCtrl', function (Product) {
    this.products = Product.getList().$object;
});
