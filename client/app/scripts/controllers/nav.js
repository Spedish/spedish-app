'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('navCtrl', function($scope, $location, AuthService, userUtil) {

    $scope.isLoggedIn = function() {
      return AuthService.isLoggedIn();
    }

    $scope.logout = function() {
      AuthService.logout()
        .then(function () {
          $location.path('/login');
        });
    };

    $scope.isSeller = function() {
      return userUtil.isSeller();
    }
    
  });
