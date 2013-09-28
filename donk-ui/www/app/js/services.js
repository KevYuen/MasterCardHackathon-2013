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
  .factory('User', function(){
    //data and functions related to logging in and out.
  })
