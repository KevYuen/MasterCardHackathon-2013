var express = require('express'),
    mongoose = require('mongoose'),
    mc = require('./libs/mc'),
    utils = require('./libs/utils'),
    fs = require('fs'),
    app = module.exports = express();
 
mongoose.connect(process.env.Mongo|| "mongodb://localhost/mastercard");

//cors middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    next();
}; 

app.configure(function(){
 	  app.use(express.bodyParser());
  	app.use(express.methodOverride());
  	app.use(allowCrossDomain);
  	app.use(app.router);  	
});

var user = require("./controllers/userController.js"),
    trans = require("./controllers/transactionController.js");

app.get("/", function(req, res){res.send("Welcome to the Donk's API");});

//user
app.get("/user/:id", user.getUser);
app.post("/user/login", user.login);
app.post("/user/create", user.create);
app.put("/user/:id/photo", user.updatePhoto);

//card
app.get("/user/:id/card", user.getCards);
app.put("/user/:id/card/add", user.addCard);

//geo
app.get("/user/:id/geo", user.getGeoLoc);
app.put("/user/:id/geo/update", user.updateGeoLoc);
app.get("/user/:id/geo/close", user.getCloseUsers);

//transaction
app.post("/user/:id/trans", trans.create);
app.put("/user/:user_id/trans/:trans_id", trans.updateTrans);
app.get("/user/:id/trans", trans.getTrans);
app.get("/trans/:id", trans.getSingleTrans);

app.listen(3000);
console.log('Express server listening on port 3000');

/*
function responseHandler(res) {
    console.log("status: ", res.statusCode);
    res.on('data', function(d) {
        process.stdout.write(d);
    });
}


var data = {
                month: utils.getMonth(),
                day: utils.getDay(),
                hours: utils.getHours(),
                minutes: utils.getMinutes(),
                seconds: utils.getSeconds()
           }
var template = utils.resolveTemplate('./templates/CreateTransferRequest.xml', data);
console.log(template);

mc.post('sandbox.api.mastercard.com',
       '/moneysend/v1/transfer',
       { "Format": "XML" },
       fs.readFileSync('./templates/CreateTransferRequest.xml').toString('ascii'),
       responseHandler);
*/

/*
mc.post('sandbox.api.mastercard.com',
       '/moneysend/mapping/v1/card',
       { "Format": "XML" },
       fs.readFileSync('./templates/CreateMappingRequest.xml').toString('ascii'),
       responseHandler);
*/

