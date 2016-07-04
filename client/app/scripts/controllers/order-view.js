'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:OrderViewCtrl
 * @description
 * # OrderViewCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('OrderViewCtrl', function($scope, Order, $routeParams) {

    //$scope.viewOrder = true;

    $scope.order = Order.one($routeParams.id).get().$object;
    console.log($scope.order);
  })
