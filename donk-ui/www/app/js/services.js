'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  .value('version', '0.1')
  .value('POLL_INTERVAL', 3000)
  .factory('Trans', function( $q, $http, API_DOMAIN, POLL_INTERVAL, User, Geo ){

    var service = {
      currentTransaction: {
        amount: null,
        currency: 'CAD',
        description: '',
        geoLocation: null
      },

      getTransaction: function( transId ) {
        var deferred = $q.defer(),
          url = API_DOMAIN + '/trans/' + transId;

        $http({
          method: 'GET',
          url: url
        })
        .success( function( data ) {
          deferred.resolve( data );
        })
        .error( function( data ) {
          deferred.reject( data );
        });

        return deferred.promise;
      },

      getTransactions: function() {
        var deferred = $q.defer(),
          url = API_DOMAIN + '/user/' + User.userId + '/trans/recipient',
          that = this;
        $http({
          method: 'GET',
          url: url
        })
        .success( function( data ) {
          // console.log( 'getTransactions success: ' );
          // console.log( JSON.stringify( data, undefined, 2 ) );
          that.transactions = data;
          deferred.resolve( data );
        })
        .error( function( data ) {
          // console.log( 'getTransactions error: ' );
          // console.log( JSON.stringify( data, undefined, 2 ) );
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
            // console.log( 'Transaction created: ' + JSON.stringify( data, undefined, 2 ) );
            that.currentTransaction = data;
            result.transaction = data;
            deferred.resolve( result );
          })
          .error( function( data ) {
            // console.log( 'Error creating transaction: ' + JSON.stringify( data, undefined, 2 ) );
            result.error = data;
            deferred.reject( result );
          });
        };

        var onError = function( data ) {
          // console.log( 'createTransaction - location save failed' );
          deferred.reject( data );
        };

        Geo.saveLocation().then( onSuccess, onError );

        return deferred.promise;
      },

      updateTransaction: function( update ) {
        // TODO: Validate that an action is set in the update JSON data

        var deferred = $q.defer(),
          url = API_DOMAIN + '/user/' + User.userId + '/trans/' + this.currentTransaction._id,
          that = this;

        // TODO: Consider not fetching geoLocation again when action = "Start"

        Geo.saveLocation().then(
          // Success
          function( position ) {
            update.geoLocation = position;
            deferred.notify( that.currentTransaction );

            $http({
              method: 'PUT',
              url: url,
              data: update
            })
            .success( function( data ) {
              // console.log( 'updateTransaction success: ' + JSON.stringify( data, undefined, 2 ) );
              that.currentTransaction = data;
              deferred.resolve( data );
            })
            .error( function( data ) {
              // console.log( 'updateTransaction error: ' + JSON.stringify( data, undefined, 2 ) );
              deferred.reject( data );
            });
          },

          // Error
          function( resp ) {
            deferred.reject( resp );
          }
        );

        return deferred.promise;
      },

      getClosestBuyers: function() {
        var deferred = $q.defer(),
          url = API_DOMAIN + '/user/' + User.userId + '/geo/close';

        $http({
          method: 'GET',
          url: url
        })
        .success( function( data ) {
          // console.log( 'getClosestBuyers success: ' );
          // console.log( JSON.stringify( data, undefined, 2 ) );
          deferred.resolve( data );
        })
        .error( function( data ) {
          // console.log( 'getClosestBuyers error: ' );
          // console.log( JSON.stringify( data, undefined, 2 ) );
          deferred.reject( data );
        });

        return deferred.promise;
      },

      repeatedlyPoll: function() {
        var that = this;

        var onPoll = function( data ) {
          if ( data ) {
            window.location.hash = '#/incoming/recipient/' + data.user._id + '/trans/' + data.transaction._id;
          }
          else {
            that.repeatedlyPoll();
          }
        };

        var onPollError = function( data ) {
          // console.log( 'Failed to poll!' );
          // console.log( JSON.stringify( data, undefined, 2 ) );
        };

        setTimeout(function() { 
          that.pollForIncomingTransaction().then( onPoll, onPollError );
        }, POLL_INTERVAL );
      },

      pollForIncomingTransaction: function() {
        var deferred = $q.defer(),
          url = API_DOMAIN + '/user/' + User.userId + '/poll';

        $http({
          method: 'GET',
          url: url
        })
        .success( function( data ) {
          if ( data && data.status == 'Sender Set' ) {
            // console.log( 'There is an incoming request' );

            User.getUser( data.recipientId ).then(
              // Success
              function( userData ) {
                deferred.resolve({ user: userData, transaction: data });
              },
              // Error
              function( resp ) {
                deferred.reject( resp );
              }
            );
          }
          else {
            deferred.resolve( data );  
          }
        })
        .error( function( data ) {
          deferred.reject( data );
        });

        return deferred.promise;
      },

      pollForDonkResponse: function( onSuccess, onError ) {
        var that = this;

        var onLocalSuccess = function( data ) {
          if ( data.status !== "Sender Set" ) {
            that.currentTransaction = data;
            onSuccess && onSuccess( data );   
          }
          else {
            that.pollForDonkResponse(onSuccess, onError);
          }
        }

        var onLocalError = function( data ) {
          // console.log( 'Failed to poll!' );
          // console.log( JSON.stringify( data, undefined, 2 ) );
          onError && onError( data );
        }

        setTimeout(function() {
          var transId = that.currentTransaction._id;
          that.getTransaction( transId ).then( onLocalSuccess, onLocalError );
        }, POLL_INTERVAL );
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
  .factory('User', function($q, $http, API_DOMAIN){
    //data and functions related to logging in and out.

    var service = {
      isLoggedIn: false,
      email: '',
      userId: '',
      cards: [],
      receive: 0,
      spend: 0
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
        service.receive = response.data.receive;
        service.spend = response.data.spend;

        successCallback( response );
      }, function(response){
        errorCallBack(response);
      });
    };

    var getUser = function( userId ) {
      var url = API_DOMAIN + '/user/' + userId,
        deferred = $q.defer();

      $http({
        method: 'GET',
        url: url
      })
      .success( function( data ) {
        deferred.resolve( data );
      })
      .error( function( data ) {
        deferred.reject( data );
      });

      return deferred.promise;
    };

    service.logIn = logIn;
    service.getUser = getUser;

    return service;
  })
  .factory('Geo', function( $q, $http, API_DOMAIN, User ) {
    // Enables capture of geolocation data
    var service = {
      getDeviceLocation: function() {
        var deferred = $q.defer();

        var onSuccess = function( position ) {
          // console.log( 'getDeviceLocation success: ' );
          // console.log( JSON.stringify( position, undefined, 2 ) );
          var location = {
            timestamp: position.timestamp,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading
          };
          // onSuccess( location );
          deferred.resolve( location );
        };

        var onError = function( resp ) {
          deferred.reject( resp );
        };

        // Proxies the PhoneGap geolocation API
        navigator.geolocation.getCurrentPosition(onSuccess, onError);

        return deferred.promise;
      },

      saveLocation: function() {
        var deferred = $q.defer();

        var onSuccess = function( position ) {
          var url = API_DOMAIN + '/user/' + User.userId + '/geo/update';

          $http({
            method: 'PUT',
            url: url,
            data: position
          })
          .success( function( data ) {
            // console.log( 'saveLocation success: ' );
            // console.log( JSON.stringify( data, undefined, 2 ) );
            // Pre-process server response here and return data expected - nothing for now
            deferred.resolve( position );
          })
          .error( function( data ) {
            // console.log( 'Error saving location - server sent back: ' );
            // console.log( JSON.stringify( data, undefined, 2 ) );
            deferred.reject( data );
          });
        };

        var onError = function( resp ) {
          deferred.reject( resp );
        }

        this.getDeviceLocation().then(onSuccess, onError);

        return deferred.promise;
      },

      repeatedlyUpdateLocation: function() {
        var that = this;
        var intervalHandler = setInterval(function() {
          that.saveLocation();
        }, 10000);
      }
    } 

    return service;
  })


  .factory('Accel', function($rootScope){
    var accelLog = {
      alpha: [],
      beta: [],
      gamma:[]
    };
    var updateAccerometer = function(acceleration){
      //console.log(acceleration)
      accelLog.alpha.push(acceleration.alpha);
      accelLog.beta.push(acceleration.beta);
      accelLog.gamma.push(acceleration.gamma);
      //accelLog.push([acceleration.alpha, acceleration.beta, acceleration.gamma]);
      
    };
    var dotProduct = function(v1, v2){
      return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    };
    var averageAndBroadcast = function(){
      if (accelLog.alpha.length < 20){
        return;
      }

      var cloneLog = angular.copy(accelLog);
      //console.log(cloneLog)
      accelLog = {
        alpha: [],
        beta: [],
        gamma: []
      };
      var retArray = {};
      _.each(['alpha', 'beta', 'gamma'], function(key){
        retArray[key] = _.max(cloneLog[key]) - _.min(cloneLog[key]);
      });

      var currentMin = 1;
      var currentMax = -1;
      for(var i=0; i< cloneLog.alpha.length; i++){
        for(var j=0; j< cloneLog.alpha.length; j++){
          if(i != j){
            var result = dotProduct(              
              [cloneLog.alpha[i], cloneLog.beta[i], cloneLog.gamma[i]],
              [cloneLog.alpha[j], cloneLog.beta[j], cloneLog.gamma[j]]
            );
            currentMin = Math.min(result, currentMin);
            currentMax = Math.max(result, currentMax);
          }
        }
      }
      //console.log(currentMin);
      retArray.currentMin = currentMin;
      retArray.currentMax = currentMax;

      $rootScope.$broadcast('accelerometer', retArray);
      if (retArray.gamma > 200) {
        $rootScope.$broadcast('DONK', retArray);
      }
    }

    // Uncomment to re-enable accel sampling
    // window.setInterval(averageAndBroadcast, 3);

    if (navigator.accelerometer){

      var watchID = navigator.accelerometer.watchAcceleration(
        updateAccerometer,
        function(){},
        {frequency: 3000 }
      );
    } else {
    	// Uncomment to re-enable accel
      // window.addEventListener('deviceorientation', updateAccerometer);
    }
    return {};
    
  })



