'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('BuyerSignupCtrl', function($scope, $window, $location, $timeout,
    Signup, FlashService) {

    $scope.submit = function() {
      $scope.dataLoading = true;

      Signup.post({
        username: $scope.username,
        email: $scope.email,
        password: $scope.password,
        isSeller: false
      }).then(handleSuccess, handleError);
    };

    // private functions
    function handleSuccess(res) {
      FlashService.Success('Signup successful');
      $timeout(function() {
        $location.path('/login');
      }, 3000);
    }

    function handleError(res) {
      FlashService.Error(res.data.message);
      $scope.dataLoading = false;
    }

  });
