//user model
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var user = new Schema({
	name: String,
	email: String,
	cards: [{cardNumber: Number, expiryMonth: Number, expiryYear: Number, requestId:{type:Number, default:0}}],
	geoLocation:
		{	
			timestamp: Date,
			longitude: Number,
			latitude: Number,
			accuracy: Number,
			speed: Number,
			heading: Number
		},
	photo: {type:String, default:null},
	password: String,
	address: String,
	spend: {type:Number, default: 0},
	receive: {type:Number, default: 0}

});

module.exports = mongoose.model('User', user);
