//user model
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var user = new Schema({
	email: String,
	cards: [{cardNumber: Number, expiryMonth: Number, expiryDate: Number, requestId:Number}],
	geoLocation:{type:Number, default:0},
	password: String,
	address: String
});

module.exports = mongoose.model('User', user);
