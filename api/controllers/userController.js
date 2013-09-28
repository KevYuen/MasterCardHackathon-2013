//user controller
var User = require('../models/user.js');

/*
 * login
 * POST - /user/login
 * server receive: {username: String, password: String}
 * server send: {user}
 */
export.login = function(req,res){

}

/*
 * create user
 * POST - /user/create
 * server receive: {email: String, password: String, address: String}
 * server send: {executionMessage: “user created”}
*/
export.create = function(req,res){

}
