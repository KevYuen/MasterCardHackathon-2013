var express = require('express'),
    mongoose = require('mongoose'),
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

var user = require("./controllers/userController.js");

app.get("/", function(req, res){res.send("Welcome to the Donk's API");});
app.post("/user/login", user.login);
app.post("/user/create", user.create);
app.post("/user/:id/card/add", user.addCard);

app.listen(3000);
console.log('Express server listening on port 3000');
