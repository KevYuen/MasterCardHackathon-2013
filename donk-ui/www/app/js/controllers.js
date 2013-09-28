'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', function($scope) {

  })

  .controller('TransNewCtrl', function($scope) {
  	$scope.amount = '';
  	$scope.description = '';

  	// TODO: validate amount to be rounded to 2 decimal places

  	$scope.save = function( e ) {
  		console.log( 'Save clicked' );
  		$scope.amount = ~~$scope.amount; // coerce into a number
  		console.log( $scope.amount + ' for ' + $scope.description );
  	};

  	$scope.donk = function( e ) {
  		console.log( 'Donk clicked' );
  		$scope.amount = ~~$scope.amount; // coerce into a number
  		console.log( $scope.amount + ' for ' + $scope.description );
  	};

  	$scope.cancel = function( e ) {
  		console.log( 'Cancel clicked' );
  		$scope.amount = '';
  		$scope.description = '';
  	};
  })

  .controller('NavBarCtrl', function($scope, $location){
    $scope.location = $location;
  })
  .controller('TransCtrl', function($scope, Trans){
  	$scope.purchases = Trans.purchases;
  })
  ;
