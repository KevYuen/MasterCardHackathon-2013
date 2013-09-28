'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', function($scope) {

  })
  .controller('MyCtrl2', function($scope) {

  })
  .controller('NavBarCtrl', function($scope, $location){
    $scope.location = $location;

    $scope.$watch('location.path()', function (path) {
      $scope.statusFilter = (path === '/active') ?
        { completed: false } : (path === '/completed') ?
        { completed: true } : null;
    });
  });