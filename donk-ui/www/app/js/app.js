'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers','ngRoute']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/trans/new', {templateUrl: 'partials/trans_new.html', controller: 'TransNewCtrl'});

    $routeProvider.when('/history', {templateUrl: 'partials/history.html', controller: 'HistoryCtrl'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
