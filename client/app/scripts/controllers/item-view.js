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

    $scope.viewItem = true;

    $scope.item = Item.one($routeParams.id).get().$object;
  })

.controller('CarouselCtrl', function($scope, Item, $routeParams) {
  $scope.rotateInterval = 3000;
  $scope.noWrapSlides = false;
  $scope.active = 0;
  var currIdx = 0;

  Item.one($routeParams.id).get().then(function(data) {

    // Form gallery links
    var galleryUrl = '//54.183.97.63:3000/gallery';
    var gid = data._gallery._id;

    $scope.slides = [];

    angular.forEach(data._gallery.order, function(val) {
      $scope.slides.push({
        image: galleryUrl + '/' + gid + '/' + val,
        id: currIdx++
      });
    });
  });
});
