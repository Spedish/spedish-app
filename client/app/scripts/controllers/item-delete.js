'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemDeleteCtrl
 * @description
 * # ItemDeleteCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemDeleteCtrl', function ($scope, $routeParams, Item, $location, $window) {
    $scope.item = Item.one($routeParams.id).get().$object;
    $scope.deleteItem = function() {
        $scope.item.remove().then(function() {
          $window.alert('Item removed');
          $location.path('/item');
        });
    };

    $scope.back = function() {
      $location.path('/item');
    };
  });
