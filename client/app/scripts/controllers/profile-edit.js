'use strict';

angular.module('clientApp')
  .directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;

          element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
  }])

  .controller('ProfileEditCtrl', function ($scope, $http, AuthService, GalleryService) {

    AuthService.getProfile()
      .success(function(data, status) {
        $scope.user = data;

        if (data.profileImage) {
          $scope.profileImgUrl = g_config.galleryUrl + '/profiles/' + 'thumbnail_' + data.profileImage;
        }
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

      var file = $scope.image;
      if (file) {
        var fd = new FormData();
        fd.append('profile_mode', 'true');
        fd.append('file', file);

        $http.post(g_config.galleryUrl, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).then(function() {
          AuthService.saveProfile(user).then(alert('saved'));
        });
      } else {
        AuthService.saveProfile(user).then(alert('saved'));
      }
    }
  });
