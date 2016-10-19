'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemCtrl
 * @description
 * # ItemCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemCtrl', function($scope, Item, $window) {

    // Pagination config
    $scope.currentPage = 1;
    $scope.limit = 4;
    $scope.totalItems;

    // initial pagination params
    var paginationParams = {
      limit: $scope.limit,
      skip: 0
    };

    var dayOfWeekParams = {};
    var mealChoiceParams = {};

    // Initialize
    initialize();

    // Page changed fn
    $scope.pageChanged = function() {
      // Set pagination params
      paginationParams.skip = getItemOffset();
      getItem();
    };

    function initialize() {
      getItem();
      getNextSevenDays();
    };

    function getNextSevenDays() {
      $scope.nextSevenDays = [];
      // current day
      var dateStart = moment().format('MMM DD');
      $scope.nextSevenDays.push(dateStart);
      for (var i = 1; i < 7; i++) {
        var dateAfter = moment().add(i, 'd').format('MMM DD');
        $scope.nextSevenDays.push(dateAfter);
      }
    };

    function getItemOffset() {
      return ($scope.currentPage - 1) * $scope.limit;
    };

    function getItem() {
      var requestParams = {};
      Object.assign(requestParams, paginationParams, dayOfWeekParams, mealChoiceParams);
      Item.getList(requestParams).then(function(responses) {

        // Form gallery links
        angular.forEach(responses, function(response) {

          var gid = response._gallery._id;
          // Has pic
          if (response._gallery.order) {
            response.image = g_config.galleryUrl + '/' + gid + '/';
            response.image += response._gallery.order.length >1 ? response._gallery.order[0] : response._gallery.order;
          }
        });

        $scope.items = responses;
        // update page numbers
        if (responses && responses.pagination) {
          $scope.totalItems = responses.pagination.total;
        }
      }).catch(function() {
        $scope.items = [];
      });
    };

    $scope.filterByDayOfWeek = function(day) {
      var dayOfWeek = "availability.day_of_week." + moment(day).day();
      dayOfWeekParams = {
        [dayOfWeek]: true
      }
      getItem();
    };

    $scope.filterByMealChoice = function(time) {
      if (time == "free_sell") {
        var mealChoice = "availability.pickup_window.free_sell";
      } else {
        var mealChoice = `availability.pickup_window.${time}.status`;
      }
      mealChoiceParams = {
        [mealChoice]: true
      }
      getItem();
    };

  });
