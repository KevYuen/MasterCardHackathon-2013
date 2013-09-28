//user controller
var User = require('../models/user.js');

/*
 * login
 * POST - /user/login
 * server receive: {username: String, password: String}
 * server send: {user}
 */
exports.login = function(req,res){
	User.findOne({email: req.body.email, password: req.body.password}, 
		function(err, userdata){
			if(err) res.send({error: err});
			if(userdata) res.send(userdata);
			res.send({error:"user not found"});
	});
}

/*
 * login
 * GET - /user/:id
 * server receive: {username: String, password: String}
 * server send: {user}
 */
exports.getUser = function(req,res){
	User.findOne({_id: req.params.id}, function(err,userdata){
		if(err) res.send({error:err});
		res.send(userdata);
	});
}

/*
 * create user
 * POST - /user/create
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
		res.send({executionMessage : 'user created', id: user._id});
	});
}

/*
 * add a card to the user
 * PUT /user/:id/card/add
 * server receive: {cardNumber: Number, expiryMonth: Number, expiryDate: Number}
 * server send: {executionMessage: “card added”, cardID: String }
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

/*
 * get all the cards of a user
 * GET /user/:id/card
 * server receive: {}
 * server send: {cards: [card]}
 */
exports.getCards = function(req,res){
	User.findOne({_id: req.params.id}, 
		function(err, userdata){
			if(err) res.send({error: err});
			res.send({cards: userdata.cards});
	});
}


/*
 * GET the location of user
 * GET /user/:id/geo
 * server receive : {}
 * server send : {loc: Number}
 */
exports.getGeoLoc = function(req, res){
	User.findOne({_id: req.params.id}, function(err,userdata){
		if(err) res.send({error:err});
		res.send(userdata.geoLocation);
	});
}

/*
 * Updating the location of user
 * PUT /user/:id/geo
 * server receive : {loc: Number}
 * server send : {executionMessage: “Location Updated!"}
 */
exports.updateGeoLoc = function(req,res){
	User.update({_id: req.params.id}, {$set: {geoLocation: req.body}}, function(err){
		if(err) res.send({error: err});
		res.send({executionMessage: "Location Updated!"});
	});
}

/*
 * get a list of users that are close to the user
 * GET /user/:id/geo/close
 * server receive : {loc: Number}
 * server send : {"users:[ _id: String]"}
 */
exports.getCloseUsers = function(req, res){
	User.update({_id: req.params.id}, {$set: {geoLocation: req.body}}, function(err){
		if(err) res.send({error: err});
	});

	var timestamp = req.body.timestamp,
		longitude = req.body.longitude;


}



