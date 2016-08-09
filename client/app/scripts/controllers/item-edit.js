'use strict';

var g_scope;

/**
 * @ngdoc function
 * @name clientApp.controller:ItemEditCtrl
 * @description
 * # ItemEditCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemEditCtrl', function ($scope, Item, $routeParams, $location, $window) {
    g_scope = $scope;

    var galleryUrl = g_config.baseUrl + '/gallery';

    $scope.categories = ['CatA', 'CatB'];
    $scope.mealOptions = ['Vegetarian', 'Vegan'];

    $scope.editItem = true;
    $scope.item = {};

    Item.one($routeParams.id).get().then(function(item) {
      item.meal_options = item.meal_options.split(',');
      item.category = item.category.split(',');
      $scope.item = item;

      // Load the gallery viewer
      $scope.images = [];

      console.log('Recevied gallery order: ' + item._gallery.order);

      angular.forEach(item._gallery.order, function(val) {
        $scope.images.push(galleryUrl + '/' + item._gallery._id + '/thumbnail_' + val);
      });

      $scope.saveItem = function() {
        $scope.item.meal_options = $scope.item.meal_options.join();
        $scope.item.category = $scope.item.category.join();

        $scope.item.save().then(function() {
          $window.alert('Updated');
          $location.path('/item/' + $routeParams.id);
        });
      };

    });
  });
