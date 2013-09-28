//user model
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var user = new Schema({
	email: String,
	cards: [{cardNumber: Number, expiryMonth: Number, expiryDate: Number, requestId:{type:Number, default:0}}],
	geoLocation:
		{	
			"timestamp": Date,
			"longitude": Number,
			"latitude": Number,
			"accuracy": Number,
			"speed": Number,
			"heading": Number
		},
	password: String,
	address: String
});

module.exports = mongoose.model('User', user);
