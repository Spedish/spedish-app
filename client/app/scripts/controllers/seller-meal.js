'use strict';
angular.module('clientApp')
  .controller('sellerMealCtrl', function($scope, Item, userUtil) {

    // Pagination config
    $scope.currentPage = 1;
    $scope.limit = 4;
    $scope.totalItems;
    var userId = userUtil.getUserId();


    // initial pagination params
    var requestParams = {
      _uid: userId,
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
    };

    function getItemOffset() {
      return ($scope.currentPage - 1) * $scope.limit;
    };

    //TODO: Update this get call to only get item that belongs to the specific seller
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
