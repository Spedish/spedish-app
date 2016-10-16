'use strict';

angular.module('clientApp')
  .controller('ProfileViewCtrl', function ($scope, AuthService, $routeParams) {

    AuthService.getProfile($routeParams.username)
      .success(function(data, status) {
        $scope.user = data;

        if ($scope.user._gallery) {
          console.log('Profile image: ' + $scope.user._gallery.order[0]);
          $scope.profileImage = g_config.galleryUrl + '/' + $scope.user._gallery._id + '/thumbnail_' + $scope.user._gallery.order[0];

          $scope.preloadDone = true;
        }

      });
  });
