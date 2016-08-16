'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemCtrl
 * @description
 * # ItemCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemCtrl', function($scope, Item) {

    $scope.canSell = false;
    if (g_config.user && g_config.user.isSeller)
      $scope.canSell = true;

    $scope.items = Item.getList().$object;
  });
