'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:OrdersCtrl
 * @description
 * # OrdersCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('OrdersCtrl', function($scope, $routeParams, $location, Item) {
    Item.one($routeParams.id).get().then(function(item) {
      $scope.item = item;
      $scope.orders = item.orders;
    });
  });
