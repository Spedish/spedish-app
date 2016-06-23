'use strict';

describe('Controller: ItemAddCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var ItemAddCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ItemAddCtrl = $controller('ItemAddCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ItemAddCtrl.awesomeThings.length).toBe(3);
  });
});
