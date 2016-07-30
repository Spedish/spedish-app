'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('LoginCtrl', function($scope, $window, $location, Login,
    FacebookLogin, AuthenticationService, FlashService, Restangular) {

    (function initController() {
      // reset login status
      AuthenticationService.ClearCredentials();
    })();

    // Basic login
    $scope.basicLogin = function() {
      $scope.dataLoading = true;

      Login.post({
        username: $scope.username,
        password: $scope.password
      }).then(handleSuccess, handleError);
    };

    // Facebook login
    $scope.facebookLogin = function() {
      // Need to implement later
    };

    // private functions
    function handleSuccess(user) {
      AuthenticationService.SetCredentials($scope.username, $scope.password,
        user);
      $location.path('/profile');
    }

    function handleError(res) {
      FlashService.Error(res.data.message);
      $scope.dataLoading = false;
    }

  });
