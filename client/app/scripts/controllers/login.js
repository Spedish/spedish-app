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
        .catch(function() {
          $scope.error = true;
          $scope.errorMessage = 'Failed to log in';
          $scope.disabled = false;
          $scope.loginForm = {};
        });
    };
  });
