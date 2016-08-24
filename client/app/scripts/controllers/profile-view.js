'use strict';

angular.module('clientApp')
  .controller('ProfileViewCtrl', function ($scope, AuthService, $routeParams) {
    AuthService.getProfile($routeParams.username)
      .success(function(data, status) {
        $scope.user = data;
      });
  });
