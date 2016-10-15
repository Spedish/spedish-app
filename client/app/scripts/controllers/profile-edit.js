'use strict';

var g_scope;

angular.module('clientApp')
  .controller('ProfileEditCtrl', function ($scope, AuthService, GalleryService) {

    // TODO: Maybe move this to top level config
    var galleryUrl = g_config.baseUrl + '/gallery';

    $scope.hasGallery = 0;

    // TODO: very ugly... need to get rid of this
    g_scope = $scope;
    $scope.images = [];

    AuthService.getProfile()
      .success(function(data, status) {
        $scope.user = data;
        if ($scope.user._gallery) {
          // TODO: don't need this
          $scope.hasGallery = $scope.user._gallery.id;

          console.log('Recevied gallery order: ' + $scope.user._gallery.order);

          angular.forEach($scope.user._gallery.order, function(val) {
            $scope.images.push(galleryUrl + '/' + $scope.user._gallery._id + '/thumbnail_' + val);
          });

          // TODO: collapse this with the below
          $scope.preloadDone = true;
        }
      });


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
          // TODO: consider, maybe we dont need so many copies
          $scope.hasGallery = data.data.gid;
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
        user._gallery = $scope.hasGallery;

      AuthService.saveProfile(user);
    }
  });
