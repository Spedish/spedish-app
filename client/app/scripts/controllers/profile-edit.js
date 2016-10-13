'use strict';

angular.module('clientApp')
  .controller('ProfileEditCtrl', function ($scope, AuthService, GalleryService) {
    AuthService.getProfile()
      .success(function(data, status) {
        $scope.user = data;
      });

    $scope.startGallery = function() {
      GalleryService.createGID()
        .then(function(data) {
          $scope.user._gallery = data.data.gid;
        });
    }

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
