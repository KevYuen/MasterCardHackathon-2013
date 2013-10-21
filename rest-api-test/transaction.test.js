var superagent = require('superagent'),
    expect = require('expect.js'),
    http = require('support/http');

var serverUrl = "http://ec2-54-227-22-178.compute-1.amazonaws.com/";

describe('express rest api server', function(){

    before(function(done){
        done();
    });

    beforeEach(function(done){
        done();
    });

    it('GET / test if service is running', function(done){
    superagent.get(serverUrl)
        .end(function(e,res){
            console.log(res.text);
            expect(res.text).to.eql("Welcome to the Donk's API");
            done();
        });
    });

    afterEach(function(done){
        done();
    });

    after(function(done){
        done();
    });
});