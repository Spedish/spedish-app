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
    var requestParams = {
      limit: $scope.limit,
      skip: 0
    };

    // User property set
    $scope.canSell = false;
    if (g_config.user && g_config.user.isSeller)
      $scope.canSell = true;

    $scope.goToItemPage = function(i) {
      $window.location.href = '/#/item/' + i._id;
    };

    // Initialize
    initialize();

    // Page changed fn
    $scope.pageChanged = function() {
      // Set pagination params
      requestParams.skip = getItemOffset();
      getItem();
    };

    $scope.order = function(i) {
      $window.location.href = '/#/item/' + i._id + '/order';
    }

    // Left pic add padding to right, right pic add padding to left
    $scope.getPaddingForDish = function(index) {
      if (index % 2 == 0)
        return {
          'padding': '0 1.5rem 0 0'
        };
      else
        return {
          'padding': '0 0 0 1.5rem'
        };
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
      Item.getList(requestParams).then(function(responses) {

        // Form gallery links
        var galleryUrl = g_config.baseUrl + '/gallery';
        angular.forEach(responses, function(response) {
          var gid = response._gallery._id;
          // Has pic
          if (response._gallery.order)
            response.image = galleryUrl + '/' + gid + '/' + response._gallery.order;
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

  });