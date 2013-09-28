//user controller
var User = require('../models/user.js');

/*
 * login
 * user - /user/login
 * server receive: {username: String, password: String}
 * server send: {user}
 */
exports.login = function(req,res){
	User.find({username: req.body.username, password: req.body.password}, 
		function(err, userdata){
			if(err) res.send({error: err});
			res.send(userdata);
	});
}

/*
 * create user
 * user - /user/create
 * server receive: {email: String, password: String, address: String}
 * server send: {executionMessage: “user created”}
*/
exports.create = function(req,res){
	var user = new User;
	user.email = req.body.email;
	user.cards = [];
	user.address = req.body.address;
	user.password = req.body.password;
	user.save(function(err, user){
		if (err) res.send({error: err});
		res.send({executionMessage : 'user created'});
	});
}

/*
 * add a card to the user
 * POST /user/:id/card/add
 * server send: {cardNumber: Number, expiryMonth: Number, expiryDate: Number}
 * server receive: {executionMessage: “card added”, cardID: String }
 */
exports.addCard = function(req,res){
	User.findOne({_id: req.params.id}, function(err, user){
		if (err) res.send({error: err});
		//console.log(user);
		user.cards.push(req.body);
		var newCard = user.cards[0];
		
		user.save(function (err) {
  			if (err) res.send({error: err});
  			res.send({executionMessage : 'card added', cardID: newCard._id});
		});
	});
}