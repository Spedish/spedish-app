'use strict';

var g_scope;

/**
 * @ngdoc function
 * @name clientApp.controller:ItemAddCtrl
 * @description
 * # ItemAddCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemAddCtrl', function ($rootScope, $scope, Item, $location, $window) {
    g_scope = $scope;

    $scope.item = {};
    $scope.addItem = true;

    $scope.categories = ['CatA', 'CatB'];
    $scope.mealOptions = ['Vegetarian', 'Vegan'];

    // Prepopulate the item with user profile information
    if ($rootScope.globals && $rootScope.globals.currentUser) {
      $scope.item.street = $rootScope.globals.currentUser.address;
      $scope.item.city = $rootScope.globals.currentUser.city;
      $scope.item.zip = $rootScope.globals.currentUser.zip;
      $scope.item.contact_name = $rootScope.globals.currentUser.firstname + ' ' + $rootScope.globals.currentUser.lastname;
      $scope.item.contact_number = $rootScope.globals.currentUser.contact;
    }

    $scope.saveItem = function() {
      if ($scope.item.meal_options && ($scope.item.meal_options instanceof Array))
        $scope.item.meal_options = $scope.item.meal_options.join();
      if ($scope.item.category && ($scope.item.category instanceof Array))
        $scope.item.category = $scope.item.category.join();

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

      var galleryUrl = g_config.baseUrl + '/gallery/';

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
              console.log(g_scope.images);
            }
          }
      });
    }
  ])

  .controller('FileUploadCtrl', [
    '$scope', '$http', '$filter', '$window',
    function($scope) {

      var galleryUrl = g_config.baseUrl + '/gallery';

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

  .controller('SortableCtrl', function($scope) {

    var galleryUrl = g_config.baseUrl + '/gallery/';

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
            $.ajax({
              dataType: 'json',
              method: 'PUT',
              url: galleryUrl + gid,
              data: { order: images }
            }).done(function() {
              $('#savingOrder').hide();
              $('#orderSaved').show();
              console.log('Updated ordering');
            }).fail(function() {
              $('#savingOrder').hide();
              $('#savingError').show();
              console.error('Unable to update ordering');
            });
          }
        } else if (ui.item.sortable.droptarget[0].classList[0] == 'dropzone') {
          var val = $scope.dropzoneFields[0];

          $scope.dropzoneFields = [];

          f = val.substring(val.lastIndexOf('/') + 1);
          f = f.replace('thumbnail_', '');
          console.log('Deleting ' + val);

          $.ajax({
            dataType: 'json',
            method: 'DELETE',
            url: galleryUrl + gid + '/' + f,
          }).done(function() {
            console.log('Image removed');
            $('#imageRemoved').show();
          }).fail(function() {
            console.error('Unable to remove image');
            $('#savingError').show();
          });
        }
      }
    };
  });
