'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', function($scope) {

  })

  .controller('TransNewCtrl', function($scope, User) {
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

  .controller('NavBarCtrl', function($scope, $location, User){
    $scope.location = $location;
  })
  .controller('TransCtrl', function($scope, Trans, User){
  	$scope.purchases = Trans.purchases;
  })
  .controller('LogInCtrl', function($scope, User){
    $scope.user = User;
    $scope.email = '';
    $scope.password = '';
    $scope.logInError = false;
    $scope.logIn = function(){
      User.logIn($scope.email, $scope.password, function(response){
        console.log(response);
      });
    };
  })
  ;
