'use strict';

var galleryUrl = '//54.183.97.63:3000/gallery/';
var g_scope;

/**
 * @ngdoc function
 * @name clientApp.controller:ItemAddCtrl
 * @description
 * # ItemAddCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemAddCtrl', function ($scope, Item, $location, $window) {
    g_scope = $scope;

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

      // Bind some event listeners
      $('#fileupload')
        .bind('fileuploadadded', function() {
            $('#uploaderTable').hide();
          });
    }
  ])

  .controller('SortableCtrl', function($scope) {

    $scope.galleryViewer = {
      stop: function(e, ui) {
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
        $('#orderSaved').hide();
        $('#savingOrderError').hide();
        $('#savingOrder').show();

        var gid = $('#gid').val();
        if (gid) {
          $.ajax({
            dataType: 'json',
            method: 'PUT',
            url: galleryUrl + gid,
            data: { order: images }
          }).done(function(res) {
            $('#savingOrder').hide();
            $('#orderSaved').show();
            console.log('Updated ordering');
          }).fail(function(textStatus) {
            $('#savingOrder').hide();
            $('#savingOrderError').show();
            console.error('Unable to update ordering');
          });
        }
      }
    };
  });

