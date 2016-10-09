'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:OrderViewCtrl
 * @description
 * # OrderViewCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('OrderViewCtrl', function($scope, Order, Item, $routeParams) {
    Order.one($routeParams.id).get().then(function(order) {
      $scope.order = order;
      Item.one(order.item).get().then(function(item) {
        $scope.item = item;
      });
    });
  })
