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

    $scope.uploadUrl = g_config.galleryUrl;

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
      var fd = new FormData();
      fd.append('profile_mode', 'true');
      fd.append('file', file);

      $http.post(g_config.galleryUrl, fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });

      //AuthService.saveProfile(user);
    }
  });
