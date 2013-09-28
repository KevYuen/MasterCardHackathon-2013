//transaction model
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var transaction = new Schema({
	_id: String,
	userID: String,
	status: {type: String, default:"Unsent"},
	recipient_id: {type:String, default:null},
	amount: Number,
	currency: String,
	description: String
});

module.exports = mongoose.model('Transaction', transaction);