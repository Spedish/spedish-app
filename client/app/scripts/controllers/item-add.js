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
      fileUploadProvider.defaults.redirect = window.location.href.replace(
        /\/[^\/]*$/,
        '/cors/result.html?%s'
      );

      // Override settings
      angular.extend(fileUploadProvider.defaults, {
          // Enable image resizing, except for Android and Opera,
          // which actually support image resizing, but fail to
          // send Blob objects via XHR requests:
          disableImageResize: /Android(?!.*Chrome)|Opera/
              .test(window.navigator.userAgent),
          maxFileSize: 999000,
          acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
      });
    }
  ])

  .controller('FileUploadCtrl', [
    '$scope', '$http', '$filter', '$window',
    function($scope) {
      $scope.name = 'test';
      $scope.options = {
        url: 'test/'
      };
    }
  ]);

