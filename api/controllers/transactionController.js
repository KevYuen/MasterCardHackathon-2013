//transaction controller
var Trans = require('../models/transaction.js'),
    User = require('../models/user.js'),
    mc = require('../libs/mc'),
    utils = require('../libs/utils');


function responseHandler(res) {
    console.log("status: ", res.statusCode);
    //res.on('data', function(d) {
    //    process.stdout.write(d);
    //});
}

/*
 * Create a new transaction
 * POST /user/:id/trans/
 * server receive: {amount: Number, currency: String, description: String}
 * server send: {transaction}
 */
exports.create = function(req,res){
	var trans = new Trans;
	trans.recipientId = req.params.id;
	trans.amount = req.body.amount;
	trans.currency = req.body.currency;
	trans.description = req.body.description;
	trans.geoLocation = req.body.geoLocation;
	trans.save(function(err, newTrans){
		if (err) errorhandler(res, err);
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
		if(req.body.senderId){ 
			update.$set.senderId = req.body.senderId; 
			update.$set.status = "Sender Set";
		}
		if(req.body.amount) update.$set.amount = req.body.amount;
		if(req.body.currency) update.$set.currency = req.body.currency;
		if(req.body.description) update.$set.description = req.body.description;
		if(req.body.geoLocation) update.$set.geoLocation = req.body.geoLocation;

		function callback(err, numdocs){
			if (numdocs < 1 ){
				res.status(404);
				res.send({error: "Transaction not found"});
			}
			if (err) errorhandler(res, err);
			Trans.findOne(conditions, function(err, trans){
				if(err) errorhandler(res, err);
				res.send(trans);
			});
		}

		Trans.update(conditions, update, options, callback);
	} else if (action == "Start"){
		//start the transaction
		//set the transaction as started
		//set the status to Complete or Rejected
        Trans.findOne(conditions, function(err, trans){
            if(err) errorhandler(res, err);
            if(trans.status != "Sender Set"){
            	res.status(400);
            	res.send({error: "you have not selected the sender!"});
            }
            User.findOne({_id: trans.senderId}, function(err, sender){
                if(err) errorhandler(res, err);
                User.findOne({_id: trans.recipientId}, function(err, recipient){
                    if(err) errorhandler(res, err);
                    try{
                    	var data = {
                    		hours: utils.getHours(),
                    		minutes: utils.getMinutes(),
                    		day: utils.getDay(),
                    		month: utils.getMonth(),
                    		seconds: utils.getSeconds(),
                    		sender_card: sender.cards[0].cardNumber,
                    		sender_month: (sender.cards[0].expiryMonth < 10) ? "0" + sender.cards[0].expiryMonth : sender.cards[0].expiryMonth,
                    		sender_year: sender.cards[0].expiryYear,
                    		sender_name: sender.name,
                    		amount: trans.amount,
                    		receiver_name: recipient.name,
                    		receiver_card: recipient.cards[0].cardNumber,
                    		transaction_number: utils.getTransactionId()
                    	}
                    	var template = utils.resolveTemplate('./templates/CreateTransferRequest.xml', data);
                    	console.log(template);

                    	mc.post('sandbox.api.mastercard.com',
                    		'/moneysend/v1/transfer',
                    		{ "Format": "XML" },
                    		template,
                    		function(result){
                    			console.log("statusCode: " + result.statusCode);
                    			result.on('data', function(d){
                    				process.stdout.write(d);
                    			});
                    			transCleanup(sender, recipient, trans, result.statusCode);
                    			res.status = result.statusCode;
                    			res.send(trans);
                    		});
                    }catch(e){
                    	Trans.update(conditions, {$set:{status:"Error"}}, function(err, numdocs){
                    		if (err) errorhandler(res, err);
                    	});
                    	res.status(500);
                    	res.send({error:e});
                    }
                });        
             });
        }); 

	} else if (action == "Reject"){
		//cancel the transaction
		Trans.update(conditions, {$set: {status: "Rejected"}}, function(err){
			if (err) errorhandler(res, err);
			res.send({executionMessage: "Transaction rejected"});
		});
	}else if (action == "Cancel"){
		Trans.remove(conditions, function(err){
			if (err) errorhandler(res, err);
			res.send({executionMessage: "Transaction Deleted"});
		});

	} else {
		res.status(400);
		res.send({error:"Invalid action"});
	}
}

/*
 * get all transaction started by user
 * GET /user/id/trans/recipient
 * Server receive: {}
 * Server send: [transaction]
 */
exports.getTransRecipient = function(req, res){
	Trans.find({recipientId: req.params.id}, function(err, trans){
		if (err) errorhandler(res, err);
		res.send(trans);
	});
}


/*
 * get all transaction started by user
 * GET /user/id/trans/sender
 * Server receive: {}
 * Server send: [transaction]
 */
exports.getTransSender = function(req, res){
	Trans.find({senderId: req.params.id}, function(err, trans){
		if (err) errorhandler(res, err);
		res.send(trans);
	});
}

/*
 * get transaction
 * GET /trans/id
 * Server receive: {}
 * Server send: {transaction}
 */
exports.getSingleTrans = function(req, res){
	Trans.findOne({_id: req.params.id}, function(err, trans){
		if (err) errorhandler(res, err);
		res.send(trans);
	});
}

/*
 * get all requests for the user
 * GET /user/id/poll
 * Server receive: {}
 * Server send : {trans}
 */
exports.pollRequests = function(req, res){
	Trans.findOne({senderId: req.params.id, status: "Sender Set"}, function(err, trans){
		if (err) errorhandler(res, err);
		res.send(trans);
	});
}

function errorhandler(res, err){
	res.status(500);
	res.send({error:err});
}

function transCleanup(sender, recipient, trans, resultCode){
	if (resultCode == 200){
		Trans.update({_id: trans._id}, {$set: {status: "Completed"}}, function(err, numdocs){
			if (err) errorhandler(res, err);
		});
		User.update({_id: trans.senderId}, {$inc: {spend: trans.amount}}, function(err, numdocs){
			if (err) errorhandler(res, err);
		});
		User.update({_id: trans.recipientId}, {$inc: {receive: trans.amount}}, function(err, numdocs){
			if (err) errorhandler(res, err);
		});
	} else {
		Trans.update({_id: trans._id}, {$set: {status: "Error"}}, function(err, numdocs){
			if (err) errorhandler(res, err);
		});
	}
}
