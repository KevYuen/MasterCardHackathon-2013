//user model
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var user = new Schema({
	email: String,
	cards: [{cardNumber: Number, expiryMonth: Number, expiryDate: Number, requestId:Number}],
	geoLocation: Number,
	password: String,
	address: String
});

module.exports = mongoose.model('User', user);
