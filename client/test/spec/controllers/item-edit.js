'use strict';

describe('Controller: ItemEditCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var ItemEditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ItemEditCtrl = $controller('ItemEditCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ItemEditCtrl.awesomeThings.length).toBe(3);
  });
});
