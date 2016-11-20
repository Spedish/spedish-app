'use strict';

var g_scope;

/**
 * @ngdoc function
 * @name clientApp.controller:ReviewAddCtrl
 * @description
 * # ReviewAddCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ReviewAddCtrl', function ($scope, Item, Review, $routeParams, $window,
    AuthService, GalleryService, Restangular, itemUtil) {
    g_scope = $scope;

    $scope.preloadDone = false;
    $scope.item = {};
    $scope.review = {};

    GalleryService.createGID()
      .then(function(data) {
        $scope.item._gallery = data.data.gid;

        // Gallery module config
        $scope.gid = data.data.gid;
        $scope.galleryHideViewer = true;
        $scope.preloadDone = true;
      });

    // Prepopulate the item with user profile information
    AuthService.getProfile().then(function(data, status) {
      data = data.data;
      $scope.item.street = data.address;
      $scope.item.city = data.city;
      $scope.item.zip = data.zip;
      $scope.item.contact_name = data.firstname + ' ' + data.lastname;
      $scope.item.contact_number = data.contact;
    });

    $scope.saveReview = function() {
      Review.post($scope.review).then(function(response) {
        console.log("Save review");
        console.log(response);
        $window.alert('Review added');
        $location.path('/item');
      });
    };

    initialize();
    function initialize() {
      $scope.review.order=$routeParams.oid;
      Item.one($routeParams.id).get().then(function(item) {
        $scope.item = item;
        $scope.review.item = item._id;

        // Load the gallery viewer
        $scope.item.image = [];

        console.log('Recevied gallery order: ' + item._gallery.order);

        // var gid = response._gallery._id;
        // // Has pic
        // if (response._gallery.order) {
        //   response.image = g_config.galleryUrl + '/' + gid + '/';
        //   response.image += response._gallery.order.length >1 ? response._gallery.order[0] : response._gallery.order;
        // }

        angular.forEach(item._gallery.order, function(val) {
          $scope.item.image.push(g_config.galleryUrl + '/' + item._gallery._id + '/thumbnail_' + val);
        });

        $scope.gid = item._gallery._id;
      });
    };
  });
