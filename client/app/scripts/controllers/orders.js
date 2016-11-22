'use strict';

angular.module('clientApp').controller('OrdersCtrl', function($scope, Order, SellerPortal, userUtil) {
    // Pagination config
    $scope.currentPage = 1;
    $scope.currentPageForSeller = 1;
    $scope.limit = 4;
    $scope.totalItems;

    var requestParams = {
      limit: $scope.limit,
      skip: 0
    };

    var sellerPortalParams = {
      limit: $scope.limit,
      skip: 0
    }

    // Track seller's received order/ placed order tab selection
    $scope.receivedOrderMode = true;

    $scope.isSeller = userUtil.isSeller();
    // is seller
    if($scope.isSeller) {
        getSellerReceivedOrder();
    }
    getOrder();

    $scope.showPlacedOrder = function() {
      return !$scope.isSeller || ($scope.isSeller && !$scope.receivedOrderMode);
    };

    $scope.setReceivedOrderMode = function(isReceivedOrderMode) {
     $scope.receivedOrderMode = isReceivedOrderMode;
    }

    $scope.hasImage = function(order) {
      if(order && order.item && order.item._gallery)
        return order.item._gallery.order && order.item._gallery.order.length > 0;
      return false;
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

    $scope.sellerPageChanged = function() {
      sellerPortalParams.skip = ($scope.currentPageForSeller - 1) * $scope.limit;
      getSellerReceivedOrder();
    };

    $scope.getOrderStatusClass = function(status) {
      return 'order-status-' + status;
    };

    $scope.changeReceivedOrderStatus = function(orderId, status, index) {
      var updated = [{ "op": "replace", 
                      "path": "/status", 
                      "value": status
                    }];
      SellerPortal.one('order').one(orderId).patch(updated).then(function (data) {
        $scope.receivedOrders[index] = data;
      },function(error) {
        console.log(error);
      });
    };

    $scope.changePlacedOrderStatus = function(orderId, status, index) {
      var updated = [{"value": status,
                      "op": "replace", 
                      "path": "/status"
                    }];
      Order.one(orderId).patch(updated).then(function (data) {
        $scope.orders[index] = data;
      },function(error) {
        console.log(error);
      });
    };

    function getItemOffset() {
      return ($scope.currentPage - 1) * $scope.limit;
    };

    function getOrder() {
      // get user placed order
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

    function getSellerReceivedOrder() {
      SellerPortal.one('order').get(sellerPortalParams).then(function(responses) {
          $scope.receivedOrders = responses;
          // update page numbers
          if (responses && responses.pagination) {
            $scope.sellerTotal = responses.pagination.total;
          }
      }).catch(function() {
          $scope.receivedOrders = [];
      });
    };

  });
