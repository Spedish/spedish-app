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
  .controller('ItemAddCtrl', function ($rootScope, $scope, Item, $location, $window, AuthService, GalleryService) {
    g_scope = $scope;

    $scope.preloadDone = false;
    $scope.item = {};
    $scope.days=[{id:1, day: 'Monday'},{id:2, day: 'Tuesday'},{id:3, day: 'Wednesday'},{id:4, day: 'Thursday'}, {id:5, day: 'Friday'}, {id:6, day:'Saturday'}, {id:0, day:'Sunday'}];
    $scope.availability = {};
    $scope.availability.day_of_week = {
                                "1": false,
                                "2": false,
                                "3": false,
                                "4": false,
                                "5": false,
                                "6": false,
                                "0": false
                              };
    $scope.addItem = true;

    GalleryService.createGID()
      .then(function(data) {
        $scope.item._gallery = data.data.gid;
        $scope.preloadDone = true;
      });

    $scope.categories = ['CatA', 'CatB'];
    $scope.mealOptions = ['Vegetarian', 'Vegan'];

    // Prepopulate the item with user profile information
    AuthService.getProfile().then(function(data, status) {
      data = data.data;
      $scope.item.street = data.address;
      $scope.item.city = data.city;
      $scope.item.zip = data.zip;
      $scope.item.contact_name = data.firstname + ' ' + data.lastname;
      $scope.item.contact_number = data.contact;
    });

    //Config for angular bootstrap time picker
    $scope.timeConfig = {
      hstep: 1,
      mstep: 10,
      ismeridian: true
    };
    $scope.mealOptions = ['lunch', 'dinner'];

    // Keep the mealtype status be opposite to free_sell status
    $scope.updateMealtypeStatus = function () {
      if($scope.availability.pickup_window.free_sell) {
        for(var key in $scope.availability.pickup_window) {
          // Reset mealtype status (checkbox)
          if(key != 'free_sell')
            $scope.availability.pickup_window[key].status = false;
        }
      }
    };

    // Convert date object JSON string to server expected date string
    $scope.formatDate = function(mealType, timeSection, dateObject) {
      var dateString = dateObject.toISOString();
      var formattedDate = dateString.substring(dateString.indexOf("T") + 1);
      $scope.availability.pickup_window[mealType][timeSection] = formattedDate;
    };

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

    initialize();
    function initialize() {
      // Initialize property
      $scope.availability.pickup_window = $scope.availability.pickup_window || {};
      $scope.availability.pickup_window.free_sell = false;
      $scope.availability.pickup_window['lunch'] = $scope.availability.pickup_window['lunch'] || {};
      $scope.availability.pickup_window['lunch']['status'] = false;
      $scope.availability.pickup_window['dinner'] = $scope.availability.pickup_window['dinner'] || {};
      $scope.availability.pickup_window['dinner']['status'] = false;

      // For now, default lunch time is 11:30 pm to 12:30pm
      $scope.lunchStartTime = createDateObject(11, 30);
      $scope.formatDate('lunch', 'start_time', $scope.lunchStartTime);
      $scope.lunchEndTime = createDateObject(12, 30);
      $scope.formatDate('lunch', 'end_time', $scope.lunchEndTime);

      // For now, default dinner time is 16:30 pm to 18:30pm
      $scope.dinnerStartTime = createDateObject(16, 30);
      $scope.formatDate('dinner', 'start_time', $scope.dinnerStartTime);
      $scope.dinnerEndTime = createDateObject(18, 30);
      $scope.formatDate('dinner', 'end_time', $scope.dinnerEndTime);
    };

    // Function to create date that can be used by time picker directive
    function createDateObject(hour, min) {
      var d = new Date();
      d.setHours(hour);
      d.setMinutes(min);
      d.setSeconds('00');
      d.setMilliseconds('000');
      return d;
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

  .controller('SortableCtrl', function($scope, GalleryService) {

    var galleryUrl = g_config.baseUrl + '/gallery/';

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
