'use strict';

angular.module('clientApp')
  .controller('ProfileViewCtrl', function ($scope, AuthService, $routeParams) {

    // TODO: Maybe move this to top level config
    var galleryUrl = g_config.baseUrl + '/gallery';

    AuthService.getProfile($routeParams.username)
      .success(function(data, status) {
        $scope.user = data;

        if ($scope.user._gallery) {
          console.log('Profile image: ' + $scope.user._gallery.order[0]);
          $scope.profileImage = galleryUrl + '/' + $scope.user._gallery._id + '/thumbnail_' + $scope.user._gallery.order[0];

          // TODO: collapse this with the below
          $scope.preloadDone = true;
        }

      });
  });
