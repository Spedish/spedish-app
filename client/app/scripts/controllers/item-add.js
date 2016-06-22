'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemAddCtrl
 * @description
 * # ItemAddCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemAddCtrl', function ($scope, Item, $location, $window) {
    $scope.item = {};
    $scope.saveItem = function() {
      Item.post($scope.item).then(function() {
        $window.alert('Item added');
        $location.path('/item');
      });
    };
  });
