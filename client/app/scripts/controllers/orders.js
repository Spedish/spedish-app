'use strict';

angular.module('clientApp').controller('OrdersCtrl', function($scope, Order) {
    // Pagination config
    $scope.currentPage = 1;
    $scope.limit = 4;
    $scope.totalItems;

    var requestParams = {
        limit: $scope.limit,
        skip: 0
    };

    getOrder();

    $scope.hasImage = function(order) {
      return order.item._gallery.order && order.item._gallery.order.length > 0;
    };

    $scope.getOrderImage = function(order) {
      if(order && order.item) {
        var gid = order.item._gallery._id;
        return g_config.galleryUrl + '/' + gid + '/' + order.item._gallery.order[0];
      }
    };

    // Page changed fn
    $scope.pageChanged = function() {
      // Set pagination params
      requestParams.skip = getItemOffset();
      getOrder();
    };

    function getItemOffset() {
      return ($scope.currentPage - 1) * $scope.limit;
    };
    
    function getOrder() {
      Order.getList(requestParams).then(function(responses) {
        $scope.orders = responses;
        // update page numbers
        if (responses && responses.pagination) {
          $scope.totalItems = responses.pagination.total;
        }
      }).catch(function() {
        $scope.orders = [];
      });
    };

  });
