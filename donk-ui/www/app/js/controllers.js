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

          window.location.hash = '#/buyers';
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

  .controller( 'BuyersCtrl', function( $scope, Trans ) {
    Trans.getClosestBuyers()
    .then(
      // Success
      function( data ) {
        $scope.buyers = data;
      },

      // Error
      function( data ) {
        $scope.error = data;
      }
    );

    $scope.selectBuyer = function( e ) {
    	console.log( 'selectBuyer!' );
    	var buyer = $( e.currentTarget ),
    		buyerId = buyer.data( 'userId' ),
    		update = {
    			action: "Modify",
    			senderId: buyerId
    		};

    	buyer.addClass( 'active' );
    	Trans.updateTransaction( update ).then(
        // Success
        function() {
          // Redirect to page awaiting response
          window.location.hash = '#/trans/response/' + Trans.currentTransaction._id;
        },
        // Error
        function() {

        }
      );
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
  .controller('LogInCtrl', function($scope, User, Trans, API_DOMAIN){
    $scope.email = '';
    $scope.password = '';
    $scope.logInError = false;
    $scope.canRecieve = true;
    $scope.logIn = function(){
      User.logIn($scope.email, $scope.password, function(response){
        console.log(response);
        Trans.repeatedlyPoll();
      });
    };
    $scope.setRecieve = function(recieve){
      //make into boolean
      $scope.canRecieve = !!recieve;
    };  
  })

  .controller( 'IncomingCtrl', function( $scope, $routeParams, User, Trans ) {
  	$scope.error = false;

  	Trans.getTransaction( $routeParams.transId ).then(
  		function( data ) {
  			$scope.trans = data;
  		},
  		function( data ) {
  			$scope.error = data;
  		}
		);

		$scope.send = function( e, sendMoney ) {
			e && e.preventDefault();
			// Must do this to avoid overwriting the current transaction
			var backupTrans = jQuery.extend(true, {}, Trans.currentTransaction);
			Trans.currentTransaction = $scope.trans;

      var restoreTransaction = function() {
        Trans.currentTransaction = backupTrans;
        Trans.repeatedlyPoll();
      };

			var action = sendMoney ? "Start" : "Reject";

			Trans.updateTransaction({ action: action }).then(
				// Success
				function( data ) {
					console.log( action + ' successful for transaction' );
          restoreTransaction();
					window.location.hash = '#/trans';
				},
				// Error
				function( data ) {
					console.log( action + ' error' );
          restoreTransaction();
					$scope.error = data;
				}
			);
		}

    $scope.dismissError = function() {
      $scope.error = false;
    };
  })

  .controller( 'TransRespCtrl', function( $scope, $routeParams, Trans, User ) {
    // var transId = $routeParams.transId;
    $scope.status = 'waiting';
    $scope.trans = Trans.currentTransaction;

    var onComplete = function( data ) {
      $scope.trans = data;
      $scope.status = 'complete';      
    };

    var onReject = function( data ) {
      User.getUser( data.senderId ).then(
        // Success
        function( userData ) {
          $scope.trans = Trans.currentTransaction;
          $scope.trans.user = userData;
          $scope.status = 'reject';
        },
        // Error
        function( resp ) {
          $scope.trans = Trans.currentTransaction;
          $scope.trans.user = { email: 'Unknown' };
          $scope.status = 'error';
        }
      );      
    };

    var onError = function( errData ) {
      $scope.status = 'error';
      $scope.error = JSON.stringify( errData, undefined, 2 );
    };

    Trans.pollForDonkResponse(
      // Success
      function( data ) {
        if ( data.status == 'Completed' )
          onComplete( data );
        else if ( data.status == 'Rejected' )
          onReject( data );
        else if ( data.status == 'Error' )
          onError( data );
      },
      // Error
      function( errData ) {
        onError( errData );
      }
    );
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
