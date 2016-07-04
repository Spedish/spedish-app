'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:OrderCtrl
 * @description
 * # OrderCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('OrderCtrl', function($scope, Item, Order, $routeParams,
    $location, $window) {

    $scope.item = Item.one($routeParams.id).get().$object;

    Item.one($routeParams.id).get().then(function(item) {
      $scope.order.item_id = $scope.item._id;
      $scope.order.status = 'ordered';

      $scope.saveOrder = function() {
        Order.post($scope.order).then(function() {
          $window.alert('Ordered');
          $location.path('/item');
        });
      };

    });
  });
