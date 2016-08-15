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
    $location, $window, moment) {

    $scope.meal_type = {};
    $scope.item = Item.one($routeParams.id).get().$object;
    $scope.minTime = {};
    $scope.maxTime = {};

    Item.one($routeParams.id).get().then(function(item) {
      $scope.order.item_id = $scope.item._id;
      $scope.order.status = 'ordered';
      $scope.order.pick_up_date = new Date();
      $scope.showDateTimePicker = $scope.item.availability.pickup_window.free_sell;

      $scope.saveOrder = function() {
        Order.post($scope.order).then(function(res) {
          $window.alert('Ordered');
          $location.path('/order/' + res._id);
        });
      };
    });

    $scope.setTimePicker = function(value) {
      switch(value) {
        case "lunch":
          $scope.minTime = moment($scope.item.availability.pickup_window.lunch.start_time, 'h:mm');
          $scope.maxTime = moment($scope.item.availability.pickup_window.lunch.end_time, 'h:mm');
          $scope.showDateTimePicker = true;
          break;
        case "dinner":
          $scope.minTime = moment($scope.item.availability.pickup_window.dinner.start_time, 'h:mm');
          $scope.maxTime = moment($scope.item.availability.pickup_window.dinner.end_time, 'h:mm');
          $scope.showDateTimePicker = true;
          break;
        default:
          break;
      }
    }

    var dateTimeNow = new Date();
    var dateInAWeek = (new Date(dateTimeNow)).setDate(dateTimeNow.getDate() + 7);

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
  });
