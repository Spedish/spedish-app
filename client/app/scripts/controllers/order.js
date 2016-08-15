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

    $scope.enableDateTimePicker = function() {
      $scope.showDateTimePicker = true;
    }
    $scope.setTimePicker = function() {
      $scope.showDateTimePicker = true;
      switch($scope.meal_type) {
        case "lunch":
          //var pickUpDateMoment = moment(pickUpDate);
          var minTime = moment($scope.item.availability.pickup_window.lunch.start_time, 'h:mm');
          var maxTime = moment($scope.item.availability.pickup_window.lunch.end_time, 'h:mm');
          $scope.minTime = moment($scope.order.pick_up_date).set({
            'hour': minTime.get('hour'),
            'minute': minTime.get('minute'),
            'second': minTime.get('second')
          });
          $scope.order.pick_up_date = moment($scope.minTime).toDate();
          console.log("Lunch: set pick up time to min time");
          $scope.maxTime = moment($scope.order.pick_up_date).set({
            'hour': maxTime.get('hour'),
            'minute': maxTime.get('minute'),
            'second': maxTime.get('second')
          });
          break;
        case "dinner":
          var minTime = moment($scope.item.availability.pickup_window.dinner.start_time, 'h:mm');
          var maxTime = moment($scope.item.availability.pickup_window.dinner.end_time, 'h:mm');
          $scope.minTime = moment($scope.order.pick_up_date).set({
            'hour': minTime.get('hour'),
            'minute': minTime.get('minute'),
            'second': minTime.get('second')
          });
          console.log("Dinner: set pick up time to min time");
          //$scope.order.pick_up_date = moment($scope.minTime).toDate();
          $scope.maxTime = moment($scope.order.pick_up_date).set({
            'hour': maxTime.get('hour'),
            'minute': maxTime.get('minute'),
            'second': maxTime.get('second')
          });
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
