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
    // set quantity dropdown
    $scope.itemQuantityArray = generateQuantity();
    $scope.selected = { value: $scope.itemQuantityArray[0] };
    // Get item info from backend
    Item.one($routeParams.id).get().then(function(responses) {
        $scope.item = responses;
        $scope.totalPrice = $scope.selected.value.name * $scope.item.unit_price;
      }).catch(function() {
        $scope.items = [];
    });
    $scope.getEmbedMapSrc = function() {
      return g_config.embeddedMapUrl + $scope.item.street + ',' + $scope.item
        .city + ',' + $scope.item.zip;
    }

    $scope.$watch('selected.value', quantityChanged);

    //update total price
    function quantityChanged() {
      if($scope.item)
        $scope.totalPrice =  $scope.item.unit_price * $scope.selected.value.name;
    };

    function generateQuantity() {
      var quantityArray = [];
      for(var i = 0; i < 9; i++) {
        quantityArray[i] = {
          id: i + 1,
          name: i + 1
        }
      };
      return quantityArray;
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
