'use strict';

var g_scope;

angular.module('clientApp')
  .controller('ProfileEditCtrl', function ($scope, AuthService, GalleryService) {

    // TODO: very ugly... need to get rid of this
    g_scope = $scope;
    $scope.images = [];

    AuthService.getProfile()
      .success(function(data, status) {
        $scope.user = data;
        if ($scope.user._gallery) {
          console.log('Recevied gallery order: ' + $scope.user._gallery.order);

          angular.forEach($scope.user._gallery.order, function(val) {
            $scope.images.push(g_config.galleryUrl + '/' + $scope.user._gallery._id + '/thumbnail_' + val);
          });

          // Gallery module config
          $scope.gid = $scope.user._gallery._id;
          $scope.galleryHideViewer = false;
          $scope.preloadDone = true;
        }
      });


    $scope.startGallery = function() {
      GalleryService.createGID()
        .then(function(data) {
          $scope.user._gallery = data.data.gid;

          // Gallery module config
          $scope.gid = data.data.gid;
          $scope.galleryHideViewer = true;
          $scope.preloadDone = true;
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

      // If the gallery has been populated then it means this
      // gallery already exists so we dont need to save id again
      if (!($scope.user._gallery && $scope.user._gallery.id))
        user._gallery = $scope.user._gallery;

      AuthService.saveProfile(user);
    }
  });
