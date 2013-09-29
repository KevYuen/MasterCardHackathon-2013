//transaction model
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var transaction = new Schema({
	senderId: {type: String, default:null },
	status: {type: String, default:"Unsent"},
	recipientId: String,
	amount: Number,
	currency: String,
	description: String,
	geoLocation:
		{	
			timestamp: Date,
			longitude: Number,
			latitude: Number,
			accuracy: Number,
			speed: Number,
			heading: Number
		}
});

module.exports = mongoose.model('Transaction', transaction);