var superagent = require('superagent');
var expect = require('expect.js');
var serverUrl = "http://ec2-54-227-22-178.compute-1.amazonaws.com/";

describe('express rest api server', function(){
    it('test if service is running', function(done){
    superagent.get(serverUrl)
        .end(function(e,res){
            console.log(res.text);
            expect(res.text).to.eql("Welcome to the Donk's API");
            done();
        });
    });
});