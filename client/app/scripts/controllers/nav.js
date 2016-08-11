'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('navCtrl', function($scope, $location, AuthService) {

    $scope.isLoggedIn = function() {
      return AuthService.isLoggedIn();
    }

    $scope.logout = function() {
      AuthService.logout()
        .then(function () {
          $location.path('/login');
        });
    };
  });
