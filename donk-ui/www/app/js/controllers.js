'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', function($scope) {

  })
  .controller('TransNewCtrl', function($scope) {

  })
  .controller('NavBarCtrl', function($scope, $location){
    $scope.location = $location;
  })
  .controller('HistoryCtrl', function($scope, History){
  	$scope.purchases = History.purchases;
  })
  ;
