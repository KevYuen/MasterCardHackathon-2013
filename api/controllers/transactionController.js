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
	trans.senderID = req.params.id;
	trans.amount = req.body.amount;
	trans.currency = req.body.currency;
	trans.description = req.body.description;
	trans.save(function(err, newTrans){
		if (err) res.send({error: err});
		res.send(newTrans);
	});
}

/*
 * update a transaction
 * PUT /user/user_id/trans/trans_id
 * Server receive: { recipient_id: String, action: String, amount: Number, currency: String, description: String}
 * Server send: {transaction}
 */
exports.updateTrans = function(req, res){
	var update = {$set:{}},
		conditions = {_id: req.params.trans_id},
		options = {multi: false},
		action = req.body.action;

	if(action == "Modify"){
		if(req.body.recipient_id){ 
			update.$set.recipient_id = req.body.recipient_id; 
			update.$set.status = "Recipient Set";
		}
		if(req.body.amount) update.$set.amount = req.body.amount;
		if(req.body.currency) update.$set.currency = req.body.currency;
		if(req.body.description) update.$set.description = req.body.description;

		function callback(err, numdocs){
			if (numdocs < 1 ) res.send({error: "Transaction not found"});
			if (err) res.send({error:err});
			Trans.findOne(conditions, function(err, trans){
				if(err) res.send({error:err});
				res.send(trans);
			});
		}

		Trans.update(conditions, update, options, callback);
	} else if (action == "Start"){
		//start the transaction
		//set the status to Complete or Rejected
	} else if (action == "Cancel"){
		//cancel the transaction
		Trans.remove(conditions, function(err){
			if (err) res.send({error: err});
			res.send({executionMessage: "Transaction Deleted"});
		});
	} else {
		res.send({error:"Invalid action"});
	}
}