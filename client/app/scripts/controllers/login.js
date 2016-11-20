'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('LoginCtrl', function($scope, $location, AuthService) {

    $scope.error = false;
    $scope.disabled = false;

    $scope.login = function() {
      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
        .then(function() {
          $location.path('/');
          $scope.disabled = false;
          $scope.loginForm = {};
        })
        .catch(function(message) {
          $scope.error = true;
          $scope.errorMessage = message;
          $scope.disabled = false;
          $scope.loginForm = {};
        });
    };

    $scope.FBLogin = function() {
      FB.login(function(response) {
        if (response.authResponse) {
          FB.api('/me', {
            fields: 'id, name, email'
          }, function(response) {
            console.log(response);
            var accessToken = FB.getAuthResponse().accessToken;

            AuthService.facebookLogin(response.id, response.name,
                response.email, accessToken)
              .then(function() {
                $location.path('/');
                $scope.disabled = false;
                $scope.loginForm = {};
              })
              .catch(function() {
                $scope.error = true;
                $scope.errorMessage = 'Failed to log in';
                $scope.disabled = false;
                $scope.loginForm = {};
              });
          });
        } else {
          console.log(
            'User cancelled login or did not fully authorize.');
          $scope.error = true;
          $scope.errorMessage = 'Failed to log in';
          $scope.disabled = false;
          $scope.loginForm = {};
        }
      }, {
        scope: 'public_profile,email'
      });

    };

  });
