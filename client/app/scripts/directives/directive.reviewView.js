/*
 This directive contains the common part for buyer to view reviews and for seller to manager reviews
 */
angular.module('clientApp')
  .controller('ReviewViewCtrl', function($scope, $http, $routeParams) {

    $http.get(g_config.baseUrl + '/review?item=' +
        $routeParams.id)
      .then(function(response) {
        //First function handles success
        $scope.reviews = response.data;
      }, function(response) {
        //Second function handles error
        $scope.retrieveReviewError = "Failed to retrieve reviews.";
      });

  })
  .directive('reviewView', function() {
    "use strict";

    return {
      templateUrl: '/views/review-view-all-template.html'
    }
  });
