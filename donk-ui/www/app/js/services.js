'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  .value('version', '0.1')
  .factory('Trans', function(){

    var service = {
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
    console.log(service);
    return service;

  })
  .factory('User', function($http){
    //data and functions related to logging in and out.

    var service = {
      isLoggedIn: false,
      email: '',
      userId: '',
      cards: [],
    };

    var logIn = function(email, password, errorCallBack){
      var url = 'http://ec2-54-227-22-178.compute-1.amazonaws.com/user/login';
      $http({
        method: 'POST',
        url: url,
        data: {
          'email': email,
          'password': password
        },
      }).then(function(response){
        console.log(response);
        service.email = response.data.email;
        service.isLoggedIn = true;
        service.userId = response.data._id;
        service.cards = response.data.cards;
      }, function(response){
        errorCallBack(response);
      });
    };

    service.logIn = logIn;

    window.User = service;

    return service;
  })
