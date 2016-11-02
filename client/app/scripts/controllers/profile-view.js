'use strict';

angular.module('clientApp')
  .controller('ProfileViewCtrl', function ($scope, AuthService, $routeParams) {

    AuthService.getProfile($routeParams.username)
      .success(function(data, status) {
        $scope.user = data;

        if (data.profileImage) {
          $scope.profileImgUrl = g_config.galleryUrl + '/profiles/' + 'thumbnail_' + data.profileImage;
        }

      });
  });
