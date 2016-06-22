'use strict';

describe('Controller: ItemDeleteCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var ItemDeleteCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ItemDeleteCtrl = $controller('ItemDeleteCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ItemDeleteCtrl.awesomeThings.length).toBe(3);
  });
});
