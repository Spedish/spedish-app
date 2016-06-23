'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemCtrl
 * @description
 * # ItemCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
.controller('ItemCtrl', function ($scope, Item) {
    $scope.items = Item.getList().$object;
});

