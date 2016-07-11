'use strict';

describe('Controller: OrderViewCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var OrderViewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OrderViewCtrl = $controller('OrderViewCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(OrderViewCtrl.awesomeThings.length).toBe(3);
  });
});
