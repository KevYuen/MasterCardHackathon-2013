//transaction controller
var Trans = require('../models/transaction.js');

/*
 * Create a new transaction
 * POST /user/:id/trans/
 * server receive: {amount: Number, currency: String, description: String}
 * server send: {transaction}
 */
exports.create = function(req,res){
	var trans = new Trans;
	trans.userID = req.params.id;
	trans.amount = req.body.amount;
	trans.currency = req.body.currency;
	trans.description = req.body.description;
	trans.save(function(err, newTrans){
		if (err) res.send({error: err});
		res.send(newTrans);
	});
}
