'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ItemViewCtrl
 * @description
 * # ItemViewCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ItemViewCtrl', function($scope, Item, $routeParams) {

    $scope.item = Item.one($routeParams.id).get().$object;

    $scope.getEmbedMapSrc = function() {
      return g_config.embeddedMapUrl + $scope.item.street + ',' + $scope.item
        .city + ',' + $scope.item.zip;
    }
  })

.controller('CarouselCtrl', function($scope, Item, $routeParams) {
  $scope.rotateInterval = 3000;
  $scope.noWrapSlides = false;
  $scope.active = 0;
  var currIdx = 0;

  Item.one($routeParams.id).get().then(function(data) {

    // Form gallery links
    var gid = data._gallery._id;

    $scope.description = data.description;

    $scope.slides = [];

    angular.forEach(data._gallery.order, function(val) {
      $scope.slides.push({
        image: g_config.galleryUrl + '/' + gid + '/' + val,
        id: currIdx++
      });
    });
  });
});
