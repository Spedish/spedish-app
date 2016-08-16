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

    $scope.item = Item.one($routeParams.id).get().$object;
    $scope.meal_type = {};
    $scope.minTime = {};
    $scope.maxTime = {};
    $scope.dateOpened = false;
    $scope.format = "MMM-dd-yyyy";
    $scope.showMeridian = true;
    $scope.hstep = 1;
    $scope.mstep = 15;
    var dateTimeNow = new Date();
    var dateInAWeek = (new Date(dateTimeNow)).setDate(dateTimeNow.getDate() + 7);

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

    $scope.setTimePicker = function(setDefaultTime) {
      $scope.showDateTimePicker = true;
      switch($scope.meal_type) {
        case "lunch":
          //var pickUpDateMoment = moment(pickUpDate);
          var minTime = moment($scope.item.availability.pickup_window.lunch.start_time, 'HH:mm:ss.SSSSZ');
          var maxTime = moment($scope.item.availability.pickup_window.lunch.end_time, 'HH:mm:ss.SSSSZ');
          $scope.minTime = moment($scope.order.pick_up_date).set({
            'hour': minTime.get('hour'),
            'minute': minTime.get('minute'),
            'second': minTime.get('second'),
            'millisecond': minTime.get('millisecond')
          });
          if (setDefaultTime) {
            $scope.order.pick_up_date = moment($scope.minTime).toDate();
          }
          $scope.maxTime = moment($scope.order.pick_up_date).set({
            'hour': maxTime.get('hour'),
            'minute': maxTime.get('minute'),
            'second': maxTime.get('second'),
            'millisecond': minTime.get('millisecond')
          });
          break;
        case "dinner":
          var minTime = moment($scope.item.availability.pickup_window.dinner.start_time, 'HH:mm:ss.SSSSZ');
          var maxTime = moment($scope.item.availability.pickup_window.dinner.end_time, 'HH:mm:ss.SSSSZ');
          $scope.minTime = moment($scope.order.pick_up_date).set({
            'hour': minTime.get('hour'),
            'minute': minTime.get('minute'),
            'second': minTime.get('second'),
            'millisecond': minTime.get('millisecond')
          });
          if (setDefaultTime) {
            $scope.order.pick_up_date = moment($scope.minTime).toDate();
          }
          //$scope.order.pick_up_date = moment($scope.minTime).toDate();
          $scope.maxTime = moment($scope.order.pick_up_date).set({
            'hour': maxTime.get('hour'),
            'minute': maxTime.get('minute'),
            'second': maxTime.get('second'),
            'millisecond': minTime.get('millisecond')
          });
        default:
          break;
      }
    }
  });
