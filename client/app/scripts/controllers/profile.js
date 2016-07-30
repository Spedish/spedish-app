(function() {
  'use strict';

  angular
    .module('clientApp')
    .controller('ProfileCtrl', ProfileCtrl);

  ProfileCtrl.$inject = ['$rootScope', '$scope'];

  function ProfileCtrl($rootScope, $scope) {
    $scope.user = $rootScope.globals.currentUser;
  }
})();
