'use strict';

var g_scope;

/**
 * @ngdoc function
 * @name clientApp.controller:ItemAddCtrl
 * @description
 * # ItemAddCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemAddCtrl', function ($rootScope, $scope, Item, $location, $window, AuthService, GalleryService, Restangular, $timezone, itemUtil) {
    g_scope = $scope;

    $scope.preloadDone = false;
    $scope.item = {};
    $scope.days=  itemUtil.getDays();
    $scope.availability = {};
    $scope.availability.day_of_week = {
                                "1": false,
                                "2": false,
                                "3": false,
                                "4": false,
                                "5": false,
                                "6": false,
                                "0": false
                              };
    $scope.addItem = true;

    GalleryService.createGID()
      .then(function(data) {
        $scope.item._gallery = data.data.gid;

        // Gallery module config
        $scope.gid = data.data.gid;
        $scope.galleryHideViewer = true;
        $scope.preloadDone = true;
      });

    $scope.categories = ['CatA', 'CatB'];
    $scope.mealOptions = ['Vegetarian', 'Vegan'];

    // Prepopulate the item with user profile information
    AuthService.getProfile().then(function(data, status) {
      data = data.data;
      $scope.item.street = data.address;
      $scope.item.city = data.city;
      $scope.item.zip = data.zip;
      $scope.item.contact_name = data.firstname + ' ' + data.lastname;
      $scope.item.contact_number = data.contact;
    });

    //Config for angular bootstrap time picker
    $scope.timeConfig = itemUtil.getTimePickerConfig();
    $scope.mealTimeOptions = ['lunch', 'dinner'];

    // Keep the mealtype status be opposite to free_sell status
    $scope.updateMealtypeStatus = function () {
      itemUtil.updateMealTypeStatus($scope.availability.pickup_window);
    };

    // Convert date object JSON string to server expected date string
    $scope.formatDate = function(mealType, timeSection, dateObject) {
      var formattedDate = itemUtil.formatDate(dateObject);
      $scope.availability.pickup_window[mealType][timeSection] = formattedDate;
    };

    $scope.saveItem = function() {
      if ($scope.item.meal_options && ($scope.item.meal_options instanceof Array))
        $scope.item.meal_options = $scope.item.meal_options.join();
      if ($scope.item.category && ($scope.item.category instanceof Array))
        $scope.item.category = $scope.item.category.join();

      Item.post($scope.item).then(function(response) {
        console.log("update availability");
        console.log(response);
        Restangular.one("item", response._id).customPUT($scope.availability, "availability");
        //$scope.item.one('availability').put($scope.availability);
        console.log("finish updating availability");
        $window.alert('Item added');
        $location.path('/item');
      });
    };

    initialize();
    function initialize() {
      // Add user timezone string
      $scope.availability.timezone = $timezone.getName();
      // Initialize property
      $scope.availability.pickup_window = $scope.availability.pickup_window || {};
      $scope.availability.pickup_window.free_sell = false;
      $scope.availability.pickup_window['lunch'] = $scope.availability.pickup_window['lunch'] || {};
      $scope.availability.pickup_window['lunch']['status'] = false;
      $scope.availability.pickup_window['dinner'] = $scope.availability.pickup_window['dinner'] || {};
      $scope.availability.pickup_window['dinner']['status'] = false;

      // For now, default lunch time is 11:30 pm to 12:30pm
      $scope.lunchStartTime = createDateObject(11, 30);
      $scope.formatDate('lunch', 'start_time', $scope.lunchStartTime);
      $scope.lunchEndTime = createDateObject(12, 30);
      $scope.formatDate('lunch', 'end_time', $scope.lunchEndTime);

      // For now, default dinner time is 16:30 pm to 18:30pm
      $scope.dinnerStartTime = createDateObject(16, 30);
      $scope.formatDate('dinner', 'start_time', $scope.dinnerStartTime);
      $scope.dinnerEndTime = createDateObject(18, 30);
      $scope.formatDate('dinner', 'end_time', $scope.dinnerEndTime);
    };

    // Function to create date that can be used by time picker directive
    function createDateObject(hour, min) {
      var d = new Date();
      d.setHours(hour);
      d.setMinutes(min);
      d.setSeconds('00');
      d.setMilliseconds('000');
      return d;
    };
  });
