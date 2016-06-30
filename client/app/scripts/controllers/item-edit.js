'use strict';

var galleryUrl = '//54.183.97.63:3000/gallery/';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemEditCtrl
 * @description
 * # ItemEditCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemEditCtrl', function ($scope, Item, $routeParams, $location, $window) {

    $scope.editItem = true;
    $scope.item = {};

    Item.one($routeParams.id).get().then(function(item) {
      $scope.item = item;

      // Load the gallery viewer
      $scope.images = [];
      angular.forEach(item._gallery.order, function(val) {
        $scope.images.push(galleryUrl + '/' + item._gallery._id + '/thumbnail_' + val);
      });

      $scope.saveItem = function() {
        $scope.item.save().then(function() {
          $window.alert('Updated');
          $location.path('/item/' + $routeParams.id);
        });
      };

    });
  });
