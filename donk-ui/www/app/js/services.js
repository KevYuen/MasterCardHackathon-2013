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

      getTransactions: function() {
        var deferred = $q.defer(),
          url = API_DOMAIN + '/user/' + User.userId + '/trans',
          that = this;
        $http({
          method: 'GET',
          url: url
        })
        .success( function( data ) {
          console.log( 'getTransactions success: ' );
          console.log( JSON.stringify( data, undefined, 2 ) );
          that.transactions = data;
          deferred.resolve( data );
        })
        .error( function( data ) {
          console.log( 'getTransactions error: ' );
          console.log( JSON.stringify( data, undefined, 2 ) );
          deferred.reject( data );
        });

        return deferred.promise;
      },

      createTransaction: function( amount, description ) {
        var result = { position: null, transaction: null, error: false },
          deferred = $q.defer(),
          that = this;

        var onSuccess = function( position ) {
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

      transactions: [
        {
          amount: 350,
          description: 'canoe',
          status: 'Unsent',
          date: { geoLocation: { timestamp: '2013-09-29T04:19:12.531Z' } }
        },
        {
          amount: 123,
          description: 'T-Shirt',
          status: 'Unsent',
          date: { geoLocation: { timestamp: '2013-09-29T04:19:12.531Z' } }
        },
        {
          amount: 35,
          description: 'Ice Cream',
          status: 'Unsent',
          date: { geoLocation: { timestamp: '2013-09-29T04:19:12.531Z' } }
        },
        {
          amount: 70,
          description: 'Laptop',
          status: 'Unsent',
          date: { geoLocation: { timestamp: '2013-09-29T04:19:12.531Z' } }
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
          console.log( 'getDeviceLocation success: ' );
          console.log( JSON.stringify( position, undefined, 2 ) );
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
            console.log( 'saveLocation success: ' );
            console.log( JSON.stringify( data, undefined, 2 ) );
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
  .factory('Accel', function($rootScope){
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
