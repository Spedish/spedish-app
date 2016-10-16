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

    // Initialize
    initialize();

    // Page changed fn
    $scope.pageChanged = function() {
      // Set pagination params
      requestParams.skip = getItemOffset();
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

  });
