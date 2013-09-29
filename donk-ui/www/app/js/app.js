'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers','ngRoute']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', 
    	{ templateUrl: 'partials/partial1.html', controller: 'MyCtrl1' }
  	);
    $routeProvider.when('/trans/new', 
    	{ templateUrl: 'partials/trans_new.html', controller: 'TransNewCtrl' }
  	);
    $routeProvider.when('/buyers', 
    	{ templateUrl: 'partials/buyers.html', controller: 'BuyersCtrl' }
  	);
    $routeProvider.when('/trans', 
    	{ templateUrl: 'partials/trans.html', controller: 'TransCtrl' }
  	);
    $routeProvider.when('/incoming/recipient/:recipientId/trans/:transId', 
    	{ templateUrl: 'partials/incoming.html', controller: 'IncomingCtrl' }
  	);
    $routeProvider.when('/trans/response/:transId', 
    	{ templateUrl: 'partials/response.html',  controller: 'TransRespCtrl' }
  	);
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
