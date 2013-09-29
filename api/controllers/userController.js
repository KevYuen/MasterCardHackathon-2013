//user controller
var User = require('../models/user.js'),
 geolib = require('geolib');
   
/*
 * login
 * POST - /user/login
 * server receive: {username: String, password: String}
 * server send: {user}
 */
exports.login = function(req,res){
	User.findOne({email: req.body.email, password: req.body.password}, 
		function(err, userdata){
			if(err) errorhandler(res, err);
			if(userdata) res.send(userdata);
			res.status("404");
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
		if(err) errorhandler(res, err);
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
	user.name = req.body.name;
	user.address = req.body.address;
	user.password = req.body.password;
	user.save(function(err, user){
		if (err) errorhandler(res, err);
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
		if (err) errorhandler(res, err);
		//console.log(user);
		user.cards.push(req.body);
		var newCard = user.cards[0];

		user.save(function (err) {
  			if (err) errorhandler(res, err);
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
			if(err) errorhandler(res, err);
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
		if(err) errorhandler(res, err);
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
		if(err) errorhandler(res, err);
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
	User.findOne({_id: req.params.id}, function(err, userdata){
		if (err) errorhandler(res, err);
		if(userdata == null){
			res.status(500);
			res.send({error: "No one else is here"});
		}
		var longitude = userdata.geoLocation.longitude,
			latitude = userdata.geoLocation.latitude;
			
		User.find( { _id: {$ne: req.params.id}}, function(err, data){
			if (err) errorhandler(res, err);
			var coords = new Object();
			var object;
			for (var i = 0; i< data.length; i++){
				if (data[i].geoLocation.longitude && data[i].geoLocation.latitude){
					object = {longitude: data[i].geoLocation.longitude, latitude: data[i].geoLocation.latitude};
					//console.log(object);
					coords[JSON.stringify(data[i])] = object;
				}
			}
			//console.log(coords);
			var list = geolib.orderByDistance({latitude: latitude, longitude: longitude}, coords);
			for(var i = 0; i < list.length; i++){
				if(list[i].distance > 50){
					list.splice(i, 1);
					i--;
				} else {
					console.log(list[i].key);
					list[i].key = JSON.parse(list[i].key);
					var date = new Date(list[i].key.geoLocation.timestamp);
                	if ((new Date()).getTime() - date.getTime() > 30000){
                		list.splice(i, 1);
						i--;
                	}
				}
			}

			res.send(list);
		});
	});
}

/*
 * upload a photo for the user
 * PUT /user/:id/photo
 * server receive : {photo: String}
 * server send : {executionMessage: "photo Uploaded!"}
 */
exports.updatePhoto = function(req, res){
	User.update({_id: req.params.id}, {$set: {photo: req.body.photo}}, function(err){
		if(err) errorhandler(res, err);
		res.send({executionMessage: "photoUploaded!"});
	});
}

function errorhandler(res, err){
	res.status(500);
	res.send({error:err});
}
