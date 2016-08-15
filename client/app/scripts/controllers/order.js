'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:OrderCtrl
 * @description
 * # OrderCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('OrderCtrl', function($scope, Item, Order, $routeParams,
    $location, $window) {

    $scope.meal_type = {};
    $scope.item = Item.one($routeParams.id).get().$object;

    Item.one($routeParams.id).get().then(function(item) {
      $scope.order.item_id = $scope.item._id;
      $scope.order.status = 'ordered';
      $scope.order.pick_up_date = new Date();

      $scope.saveOrder = function() {
        Order.post($scope.order).then(function(res) {
          $window.alert('Ordered');
          $location.path('/order/' + res._id);
        });
      };
    });

    var dateTimeNow = new Date();
    var dateInAWeek = (new Date(dateTimeNow)).setDate(dateTimeNow.getDate() + 7);

    $scope.minTime = new Date();
    $scope.minTime.setHours (11);
    $scope.minTime.setMinutes(0);

    $scope.maxTime = new Date();
    $scope.maxTime.setHours (13);
    $scope.maxTime.setMinutes(0);

    // We only allow advance purchase for items within the next 7 days
    $scope.dateOptions = {
      showWeeks: false,
      startingDay: 0,
      minDate: dateTimeNow,
      maxDate: dateInAWeek

    };


    // Map day_of_week availability to calender
    $scope.disabled = function(calendarDate, mode) {
      return mode === 'day' && ( !$scope.item.availability.day_of_week[calendarDate.getDay()]);
    };

    $scope.open = function($event,opened) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.dateOpened = true;
    };

    $scope.dateOpened = false;
    $scope.format = "MMM-dd-yyyy";
    $scope.showMeridian = true;
    $scope.hstep = 1;
    $scope.mstep = 15;

    $scope.$watch("date", function(date) {
      // read date value
    }, true);
  });
