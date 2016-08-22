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
  .controller('ItemEditCtrl', function ($scope, Item, $routeParams, $location, $window, Restangular, itemUtil) {
    g_scope = $scope;

    var galleryUrl = g_config.baseUrl + '/gallery';

    $scope.categories = ['CatA', 'CatB'];
    $scope.mealOptions = ['Vegetarian', 'Vegan'];

    $scope.preloadDone = true;
    $scope.editItem = true;
    $scope.item = {};
    //config for time picker
    $scope.timeConfig = itemUtil.getTimePickerConfig();
    $scope.mealTimeOptions = ['lunch', 'dinner'];

    Item.one($routeParams.id).get().then(function(item) {
      item.meal_options = item.meal_options.split(',');
      item.category = item.category.split(',');
      $scope.item = item;
      $scope.availability = item.availability;
      if($scope.availability){
        convertDateStringToObject();
      }

      // Load the gallery viewer
      $scope.images = [];

      console.log('Recevied gallery order: ' + item._gallery.order);

      angular.forEach(item._gallery.order, function(val) {
        $scope.images.push(galleryUrl + '/' + item._gallery._id + '/thumbnail_' + val);
      });
    });

    // Keep the mealtype status be opposite to free_sell status
    $scope.updateMealtypeStatus = function () {
      itemUtil.updateMealTypeStatus($scope.availability.pickup_window);
    };

    $scope.saveItem = function() {
      $scope.item.meal_options = $scope.item.meal_options.join();
      $scope.item.category = $scope.item.category.join();

      $scope.item.save().then(function(response) {
        console.log("update availability");
        console.log(response);
        Restangular.one("item", response._id).customPUT($scope.availability, "availability");
        $window.alert('Updated');
        $location.path('/item/' + $routeParams.id);
      });
    };

    function convertDateStringToObject() {
      $scope.lunchStartTime = utcToLocalDate($scope.availability.pickup_window.lunch.start_time, $scope.lunchStartTime);
      $scope.lunchEndTime = utcToLocalDate($scope.availability.pickup_window.lunch.end_time);
      $scope.dinnerStartTime = utcToLocalDate($scope.availability.pickup_window.dinner.start_time);
      $scope.dinnerEndTime = utcToLocalDate($scope.availability.pickup_window.dinner.end_time);
    }

    function utcToLocalDate(timeNeedToConvert){
      var utcTime = moment(timeNeedToConvert, 'HH:mm:ss.SSSSZ');
      return utcTime.local().toDate();
    }
  });
