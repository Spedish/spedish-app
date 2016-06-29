'use strict';

var galleryUrl = '//54.183.97.63:3000/gallery/';

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
    $scope.addItem = true;
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
      angular.extend(fileUploadProvider.defaults, {
          // Enable image resizing, except for Android and Opera,
          // which actually support image resizing, but fail to
          // send Blob objects via XHR requests:
          disableImageResize: /Android(?!.*Chrome)|Opera/
              .test(window.navigator.userAgent),
          maxFileSize: 5000000,
          acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,

          // Disable simultaneous update of files. Sequential upload
          // is required as the first upload will trigger a gallery id
          // resolve
          sequentialUploads: true,
          limitConcurrentUploads: 1,

          // Request for a gallery id if none exists
          submit: function() {
            var elItemGid = $('#item_gid');
            var elGid = $('#gid');

            // Check if the item model already have gid set then we
            // simply copy it over
            if (elItemGid.val())
            {
              elGid.val(elItemGid.val());
            }
            // Otherwise we need to see if this is the first upload,
            // in which case we need to request for a gallery id
            else if (!elGid.val()) {
              // Get a new gid
              $.ajax({
                dataType: 'json',
                method: 'PUT',
                url: galleryUrl,
                async: false
              }).done(function(res) {
                elGid.val(res.gid);
                elItemGid.val(res.gid);
                elItemGid.trigger('input');
                return true;
              }).fail(function() {
                console.error('Error creating gallery');
                return false;
              });
            }
          },

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
        url: galleryUrl
      };
    }
  ]);

