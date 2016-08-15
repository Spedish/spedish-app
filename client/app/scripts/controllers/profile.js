'use strict';

angular.module('clientApp')
  .controller('ProfileCtrl', function ($scope, AuthService) {
    AuthService.getProfile()
      .success(function(data, status) {
        $scope.user = data;
      });

    $scope.saveProfile = function() {
      var user = {
        email: $scope.profile.email.$modelValue,
        firstname: $scope.profile.firstname.$modelValue,
        lastname: $scope.profile.lastname.$modelValue,
        address: $scope.profile.address.$modelValue,
        city: $scope.profile.city.$modelValue,
        zip: $scope.profile.zip.$modelValue,
        contact: $scope.profile.contact.$modelValue
      };

      AuthService.saveProfile(user);
    }
  });
