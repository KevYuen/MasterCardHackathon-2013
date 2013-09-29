'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  .value('version', '0.1')
  .factory('Trans', function( $q, $http, API_DOMAIN, User, Geo ){

    var service = {
      currentTransaction: {
        amount: null,
        currency: 'CAD',
        description: '',
        geoLocation: null
      },

      createTransaction: function( amount, description ) {
        var result = { position: null, transaction: null, error: false },
          deferred = $q.defer(),
          that = this;

        var onSuccess = function( position ) {
          console.log( 'Geolocation success: (' + position.latitude + ', ' + position.longitude + ')' );
          result.position = position;
          deferred.notify( result );

          var transaction = {
            amount: amount,
            currency: 'CAD', // TODO: Figure out a way NOT to hard code this...
            description: description,
            geoLocation: position
          };

          var url = API_DOMAIN + '/user/' + User.userId + '/trans';
          $http({
            method: 'POST',
            url: url,
            data: transaction
          })
          .success( function( data ) {
            console.log( 'Transaction created: ' + JSON.stringify( data, undefined, 2 ) );
            that.currentTransaction = data;
            result.transaction = data;
            deferred.resolve( result );
          })
          .error( function( data ) {
            console.log( 'Error creating transaction: ' + JSON.stringify( data, undefined, 2 ) );
            result.error = data;
            deferred.reject( result );
          });
        };

        var onError = function( data ) {
          console.log( 'createTransaction - location save failed' );
          deferred.reject( data );
        };

        Geo.saveLocation( onSuccess, onError );

        return deferred.promise;
      },

      purchases: [
        {
          amount: 350,
          item: 'canoe',
          buyer: 'Person name',
          date: 'a date'
        },
        {
          amount: 123,
          item: 'T-Shirt',
          buyer: 'Person name',
          date: 'a date'
        },
        {
          amount: 35,
          item: 'Ice Cream',
          buyer: 'Person name',
          date: 'a date'
        },
        {
          amount: 70,
          item: 'Laptop',
          buyer: 'Person name',
          date: 'a date'
        }
      ]
    };
    return service;

  })
  .value('API_DOMAIN', 'http://ec2-54-227-22-178.compute-1.amazonaws.com')
  .factory('User', function($http, API_DOMAIN){
    //data and functions related to logging in and out.

    var service = {
      isLoggedIn: false,
      email: '',
      userId: '',
      cards: [],
    };

    var logIn = function(email, password, successCallback, errorCallBack){
      var url = API_DOMAIN + '/user/login';
      $http({
        method: 'POST',
        url: url,
        data: {
          'email': email,
          'password': password
        }
      }).then(function(response){
        service.email = response.data.email;
        service.isLoggedIn = true;
        service.userId = response.data._id;
        service.cards = response.data.cards;
        successCallback( response );
      }, function(response){
        errorCallBack(response);
      });
    };

    service.logIn = logIn;

    window.User = service;

    return service;
  })
  .factory('Geo', function( $http, API_DOMAIN, User ) {
    // Enables capture of geolocation data
    var service = {
      getDeviceLocation: function(onSuccess, onError) {
        var onLocalSuccess = function( position ) {
          var location = {
            timestamp: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading
          };
          onSuccess( location );
        };

        // Proxies the PhoneGap geolocation API
        navigator.geolocation.getCurrentPosition(onLocalSuccess, onError);
      },

      saveLocation: function( onSuccess, onError ) {
        // TODO: Convert this method to return a promise object

        // TODO: Add User service to Geo service - check for user status before attempting save

        var onLocalSuccess = function( position ) {
          var url = API_DOMAIN + '/user/' + User.userId + '/geo/update';

          $http({
            method: 'PUT',
            url: url,
            data: position
          })
          .success( function( data ) {
            console.log( 'Success saving location' );
            // Pre-process server response here and return data expected - nothing for now
            onSuccess && onSuccess( position );
          })
          .error( function( data ) {
            console.log( 'Error saving location - server sent back: ' );
            console.log( JSON.stringify( data, undefined, 2 ) );
            onError && onError( data );
          });
        };

        this.getDeviceLocation(onLocalSuccess, onError);
      }
    } 

    return service;
  })
  .factory('Accel', function($rootScope, cordovaReady){
    var accelLog = [];
    var updateAccerometer = function(acceleration){
      //console.log(acceleration)
      $rootScope.$broadcast('accelerometer', acceleration);
    };
    if (navigator.accelerometer){

      var watchID = navigator.accelerometer.watchAcceleration(
        updateAccerometer,
        function(){},
        {frequency: 3000 }
      );
    } else {
      window.addEventListener('deviceorientation', updateAccerometer);
    }
    var service  = {
      signalTest: function(){
        $rootScope.$broadcast('accelerometer', {x: 1, y: 1, z: 1});
      }
    };
    window.Accel = service;
    return service;
    
  })
