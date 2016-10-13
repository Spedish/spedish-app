'use strict';

var g_scope;

angular.module('clientApp')
  .controller('ProfileEditCtrl', function ($scope, AuthService, GalleryService) {
    AuthService.getProfile()
      .success(function(data, status) {
        $scope.user = data;
      });

    // TODO: very ugly... need to get rid of this
    g_scope = $scope;

    $scope.startGallery = function() {
      GalleryService.createGID()
        .then(function(data) {
          $scope.user._gallery = data.data.gid;
          // TODO: This needs to be changed, its tied to item
          $scope.item = {};
          $scope.item._gallery = data.data.gid;
          $scope.preloadDone = true;
          // TODO: Remove the need for this option, its tied to item
          $scope.addItem = true;
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
