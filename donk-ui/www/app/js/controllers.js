'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', function($scope) {

  })

  .controller('TransNewCtrl', function($scope, Geo, User) {
    $scope.amount = '';
    $scope.description = '';
    $scope.position = false;
    $scope.result = false;

    $scope.save = function( e ) {
      console.log( 'Save clicked' );      
      createTransaction();
    };

    $scope.donk = function( e ) {
      console.log( 'Donk clicked' );
      $scope.save( e );
      getLocation();
      startTransaction();
    };

    $scope.cancel = function( e ) {
      console.log( 'Cancel clicked' );
      $scope.amount = '';
      $scope.description = '';
    };

    var createTransaction = function() {
      // TODO: validate amount to be rounded to 2 decimal places
      $scope.amount = ~~$scope.amount; // coerce into a number
      $scope.result = $scope.result || { success: true };
      $scope.result.trans = {
        amount: $scope.amount,
        description: $scope.description
      };

      // TODO: make API calls (via Service) to create transaction on server
    }

    var getLocation = function() {
      // TODO: persist location via API call to server

      var onSuccess = function( position ) {
        console.log( 'Geolocation success: (' + position.latitude + ', ' + position.longitude + ')' );
        var date = new Date( ~~position.timestamp ),
          dateString = date.toLocaleString();
        $scope.$apply(function() {
          position.dateString = dateString;
          $scope.result = $scope.result || { success: true };
          $scope.result.position = position;
        });
      };

      var onError = function( error ) {
        console.log( 'Geolocation error: ' + JSON.stringify( error ) );
        $scope.$apply(function() {
          $scope.result = $scope.result || {};
          $scope.result.success = false;
          $scope.position = error;
        });
      };

      Geo.getLocation( onSuccess, onError );
    }

    var startTransaction = function() {
      console.log( 'Should make API call to start transaction now' );
      // TODO: initiate actual transaction process here
    };
  })

  .controller('NavBarCtrl', function($scope, $location, User){
    $scope.location = $location;
  })
  .controller('TransCtrl', function($scope, Trans, User){
    $scope.purchases = Trans.purchases;
  })
  .controller('AppCtrl', function($scope, User){
    $scope.user = User;

  })
  .controller('LogInCtrl', function($scope, User, API_DOMAIN){
    $scope.email = '';
    $scope.password = '';
    $scope.logInError = false;
    $scope.canRecieve = true;
    $scope.logIn = function(){
      User.logIn($scope.email, $scope.password, function(response){
        console.log(response);
      });
    };
    $scope.setRecieve = function(recieve){
      //make into boolean
      $scope.canRecieve = !!recieve;
    };  
  })
  .controller('SignUpCtrl', function($scope, API_DOMAIN, $http){
    $scope.signUp = function(){
      //Create the user
      $http({
        method: 'POST',
        url: API_DOMAIN + '/user/create',
        data: {
          email: $scope.email,
          password: $scope.password,
          address: $scope.address
        }
      })
      //Add the credit card
      .then(function(response){
        var user_id = response.data.id;

        var expiry_array = $scope.expiry.split('/');
        console.log(expiry_array);

        return $http({
          method: 'POST',
          url: API_DOMAIN + '/user/' + user_id + '/card/add',
          data: {
            cardNumber: $scope.cardNumber,
            expiryMonth: expiry_array[0],
            expiryYear: expiry_array[1]
          }
        });
      })
      //Sign in
      .then(function(response){
        User.logIn($scope.email, $scope.password, function(response){
          console.log(response);
        });
      });
    }
  })
  ;
