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
