'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemCtrl
 * @description
 * # ItemCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemCtrl', function($scope, Item) {

  	// Pagination config
  	$scope.currentPage = 1;
  	$scope.limit = 10;
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

  	// Initialize
  	getItem();

  	// Page changed fn
  	$scope.pageChanged = function() {
  		// Set pagination params
  		requestParams.skip = getItemOffset();
  		getItem();
  	}

  	function getItemOffset() {
  		return ($scope.currentPage - 1) * $scope.limit;
  	}

  	function getItem() {
  		Item.getList(requestParams).then(function (response) {
  			$scope.items = response;
  			// update page numbers
  			if(response && response.pagination) {
  				$scope.totalItems = response.pagination.total;
  			}
        }).catch(function () {
            $scope.items = [];
        });
  	}
  });
