'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemAddCtrl
 * @description
 * # ItemAddCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemAddCtrl', function ($scope, Item, $location, $window) {
    $scope.item = {};
    $scope.saveItem = function() {
      Item.post($scope.item).then(function() {
        $window.alert('Item added');
        $location.path('/item');
      });
    };
  })

  // For the uploader
  .config([
    '$httpProvider', 'fileUploadProvider',
    function ($httpProvider, fileUploadProvider) {
      delete $httpProvider.defaults.headers.common['X-Requested-With'];

      // Override settings
          console.log('what');
      angular.extend(fileUploadProvider.defaults, {
          // Enable image resizing, except for Android and Opera,
          // which actually support image resizing, but fail to
          // send Blob objects via XHR requests:
          disableImageResize: /Android(?!.*Chrome)|Opera/
              .test(window.navigator.userAgent),
          maxFileSize: 999000,
          acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,

          // Overriding the default Done handler to provide a gid
          done: function(e, data) {
            if (e.isDefaultPrevented()) {
              return false;
            }

            var that = this;
            data.scope.$apply(function () {
                data.handleResponse.call(that, e, data);
            });

            if (data.result && data.result.gid) {
              data.scope.gid = data.result.gid;
            }
          }
      });
    }
  ])

  .controller('FileUploadCtrl', [
    '$scope', '$http', '$filter', '$window',
    function($scope) {
      $scope.options = {
        url: '//54.183.97.63:3000/gallery/'
      };
    }
  ]);

