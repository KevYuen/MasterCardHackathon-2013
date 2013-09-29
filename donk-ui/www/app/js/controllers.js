'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', function($scope) {

  })

  .controller('TransNewCtrl', function($scope, Geo, Trans) {
    $scope.amount = '';
    $scope.description = '';
    $scope.position = false;
    $scope.result = false;

    $scope.save = function( e ) {
      console.log( 'Save clicked' );      
      // createTransaction();

      // TODO: validate amount to be rounded to 2 decimal places
  
      $scope.amount = ~~$scope.amount; // coerce into a number
      Trans.createTransaction( $scope.amount, $scope.description )
      .then(
        // Success
        function( resp ) {
          resp.success = true;
          $scope.result = resp;
        },

        // Error
        function( resp ) {
          resp.success = false;
          $scope.result = resp;
        }
      );
    };

    $scope.donk = function( e ) {
      console.log( 'Donk clicked' );

      Trans.createTransaction( $scope.amount, $scope.description )
      .then(
        // Success
        function( resp ) {
          var date = new Date( resp.position.timestamp ),
            dateString = date.toLocaleString();
          resp.position.dateString = dateString;

          resp.success = true;
          $scope.result = resp;

          // TODO: initiate actual transaction process here
          console.log( 'Should make API call to start transaction now' );
        },

        // Error
        function( resp ) { 
          resp.success = false;
          $scope.result = resp;
        }
      );
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
  .controller('TransCtrl', function($scope, Trans){
    $scope.transactions = Trans.transactions;
    Trans.getTransactions().then(
      // Success
      function( data ) {
        $scope.transactions = data;
      },

      // Error
      function( data ) {
        // TODO: error handling code for this
      }
    );
  })
  .controller('AppCtrl', function($scope, User, Accel){
    $scope.user = User;
    $scope.navigator = navigator;
    $scope.$on('accelerometer', function(ev, accel){
      $scope.$apply(function(){
        $scope.accel = accel;

      });
      //console.log(accel);
    });

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
          method: 'PUT',
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
