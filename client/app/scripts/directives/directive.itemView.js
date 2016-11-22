/*
 This directive contains the common part for buyer to view item list and seller to manager item
 */
angular.module('clientApp').directive('itemView', function() {
	"use strict";

	return {
		restrict: 'E',
		replace: false,
		scope: {
			items: '=item',
			sellerView: '@'
		},
        templateUrl: '/views/item-view-all-template.html',
        controller: function ($scope, $window) {
            $scope.$watch('items', function(newVal) {
                if(newVal)
                    console.log(newVal);
            });
            $scope.sellerMealsPage = $scope.sellerView === 'true';

            // Left pic add padding to right, right pic add padding to left
            $scope.getPaddingForDish = function(index) {
              if (index % 2 == 0)
                return {
                  'padding': '0 1.5rem 0 0'
                };
              else
                return {
                  'padding': '0 0 0 1.5rem'
                };
            };
            
            $scope.goToItemPage = function(i) {
                if($scope.sellerMealsPage)
                    $window.location.href = '/#/item/' + i._id + '/edit';
                else
                    $window.location.href = '/#/item/' + i._id;
            };

            $scope.actionOnItem = function(i) {
                var url = '/#/item/' + i._id + '/';
                url += $scope.sellerMealsPage ? 'edit' : 'order';
                $window.location.href = url;
            };

            $scope.getActionName = function() {
                return $scope.sellerMealsPage ? 'Edit' : 'Order';
            }

        }
    }
});