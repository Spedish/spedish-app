'use strict';

var g_scope;

angular.module('clientApp')
  // For the uploader
  .config([
    '$httpProvider', 'fileUploadProvider',
    function ($httpProvider, fileUploadProvider) {
      delete $httpProvider.defaults.headers.common['X-Requested-With'];

      var galleryUrl = g_config.galleryUrl;

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

          // Overriding the default Done handler to setup gallery viewer
          done: function(e, data) {
            if (e.isDefaultPrevented()) {
              return false;
            }

            var that = this;
            data.scope.$apply(function () {
              data.handleResponse.call(that, e, data);
            });

            if (data.result && data.result.order && data.result.gid) {
              // Rewrite the URL for the images
              console.log('Recevied gallery order: ' + data.result.order);

              g_scope.images = [];

              angular.forEach(data.result.order, function(val) {
                g_scope.images.push(galleryUrl + '/' + data.result.gid + '/thumbnail_' + val);
              });

              // hide the uploader table
              $('#uploaderTable').hide();
              $('#galleryViewerWrapper').show();
              console.log(g_scope.images);
            }
          }
      });
    }
  ])

  .controller('FileUploadCtrl', [
    '$scope', '$http', '$filter', '$window',
    function($scope) {

      var galleryUrl = g_config.galleryUrl;

      $scope.options = {
        url: galleryUrl
      };

      // Bind some event listeners
      $('#fileupload')
        // Hide the uploader table once the UI has been rendered
        .bind('fileuploadadded', function() {
          $('#uploaderTable').hide();
        })
        // Show the uploader table when new files are being added
        .bind('fileuploadadd', function() {
          $('#uploaderTable').show();
        });
    }
  ])

  .controller('SortableCtrl', function($scope, GalleryService) {

    var galleryUrl = g_config.galleryUrl;

    $scope.saveOrder = 'none';
    $scope.deleteImage = 'none';
    $scope.dropzone = {}; // A default control will do fine
    $scope.dropzoneFields = [];

    $scope.galleryViewer = {

      connectWith:'.dropzone',

      start: function() {
        $('.dropzone').show();
        $('.dropzone').sortable('refresh');
      },

      stop: function(e, ui) {
        $('.dropzone').hide();

        $('#imageRemoved').hide();
        $('#orderSaved').hide();
        $('#savingOrderError').hide();
        $('#savingOrder').hide();

        var gid = $('#gid').val();

        // See if this image was re-ordered or removed
        if (ui.item.sortable.droptarget[0].id == 'galleryViewer') {
          // Restore the list of images to their orignial names
          var images = [];
          var f;

          angular.forEach($scope.images, function(val) {
            f = val.substring(val.lastIndexOf('/') + 1);
            f = f.replace('thumbnail_', '');
            images.push(f);
          });
          console.log(images);

          // Post new image order
          $('#savingOrder').show();

          if (gid) {
            $scope.saveOrder = 'start';
            GalleryService.saveOrder(gid, images)
              .then(function() {
                $scope.saveOrder = 'done';
              }, function(){
                $scope.saveOrder = 'error';
              });
          }
        } else if (ui.item.sortable.droptarget[0].classList[0] == 'dropzone') {
          var val = $scope.dropzoneFields[0];

          $scope.dropzoneFields = [];

          f = val.substring(val.lastIndexOf('/') + 1);
          f = f.replace('thumbnail_', '');
          console.log('Deleting ' + f);

          $scope.deleteImage = 'start';
          GalleryService.deleteImage(gid, f)
            .then(function() {
              $scope.deleteImage = 'done';
            }, function() {
              $scope.deleteImage = 'error';
            });
        }
      }
    };
  });
