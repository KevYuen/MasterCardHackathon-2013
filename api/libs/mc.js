var crypto = require("crypto"),
    https = require("https"),
    fs = require("fs");

var NONCE_CHARS= [  'a','b','c','d','e','f','g','h','i','j','k','l','m','n',
                    'o','p','q','r','s','t','u','v','w','x','y','z','A','B',
                    'C','D','E','F','G','H','I','J','K','L','M','N','O','P',
                    'Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3',
                    '4','5','6','7','8','9'];

function _getNonce() {
   var result = [];
   var char_pos;
   
   for (var i = 0; i < 19; i++) {
       char_pos= Math.floor(Math.random() * NONCE_CHARS.length);
       result[i]=  NONCE_CHARS[char_pos];
   }
   return result.join('');
}

function _getTimestamp() {
    return Math.floor((new Date()).getTime()/1000);
}

function _getConsumerKey() {
    var key = fs.readFileSync('./keys/Consumer.key').toString('ascii');
    key = key.replace(/\r?\n|\r/, '');
    return key;
}

function _getPrivateKey() {
    return fs.readFileSync('./keys/MCKey.pem').toString('ascii');
    //return fs.readFileSync('./keys/MCTest.pem').toString('ascii');
}

function _constructURL(hostname, path, params) {
    var requestURL = "https://" + hostname + path;

    if(params != null) {
        requestURL += "?";
    }

    for(var key in params) {
        requestURL += key + "=" + params[key] + "&";
    }
    
    return requestURL.substr(0, requestURL.length - 1);
}

function _getQueryString(params, auth) {
    var queryString = "";
    var splitParams = params.split("&");

    splitParams.sort();

    for(var i = 0; i < splitParams.length; i++){
        queryString = queryString + encodeURIComponent(splitParams[i]);
        if(splitParams.length - i > 1){
            queryString = queryString + "%26";
        }
    }
    queryString = queryString.replace('!', '%21'); // strange case

    return queryString;
}

function _getBaseString(method, requestURL, auth) {
    for(var key in auth){
        requestURL = requestURL + "&" + key + "=" + auth[key];
    }
    var url = requestURL.split("?");
    var encodedURL = encodeURIComponent(url[0]);
    var queryString = _getQueryString(url[1]);
    var baseString = method + "&" + encodedURL + "&" + queryString;
    
    return baseString;
}

function _getSignature(baseString) {
    var signer = crypto.createSign("SHA1");
    var rsa_key = _getPrivateKey();
    
    signer.update(baseString);
    return encodeURIComponent(signer.sign(rsa_key, output_format = "base64"));
}

function _getBodyHash(body) {
    var shasum = crypto.createHash("sha1");
    
    shasum.update(body);
    return shasum.digest('base64');
}

function _getAuthHeader(signature, auth){
    var OAuthHeader = "OAuth ";

    for(var key in auth){
        OAuthHeader = OAuthHeader + key + "=" + '"' + auth[key] + '",';
    }

    return OAuthHeader + 'oauth_signature="' + signature + '"';
}

/**
 * mc.get('sandbox.api.mastercard.com', '/atms/v1/atm', { "Format" : "XML", "PageOffset" : 0 }, callback); 
 */
exports.get = function(hostname, path, params, callback) {
    var requestURL = _constructURL(hostname, path, params);
    
    var auth = {
        oauth_consumer_key      :   _getConsumerKey(),
        oauth_nonce             :   _getNonce(),
        oauth_timestamp         :   _getTimestamp(),
        oauth_version           :   "1.0",
        oauth_signature_method  :   "RSA-SHA1"
    }; 

    var baseString = _getBaseString("GET", requestURL, auth);    
    var signature = _getSignature(baseString);
    var authHeader = _getAuthHeader(signature, auth);
   
    var updatedPath = path + "?";
    for(var key in params) {
        updatedPath += key + "=" + params[key] + "&";
    }
    updatedPath =  updatedPath.substr(0, updatedPath.length - 1);

    var options = {
        hostname: hostname,
        method: 'GET',
        path: updatedPath,
        headers: {
            Authorization: authHeader
        }
    };   

    var req = https.request(options, callback);
    req.end();
};

/**
 * mc.post('sandbox.api.mastercard.com', '/atms/v1/atm', { "Format" : "XML", "PageOffset" : 0 }, '<xml data>', callback); 
 */
exports.post = function(hostname, path, params, body, callback) {
    var requestURL = _constructURL(hostname, path, params);
    console.log("Request: " + requestURL);

    var auth = {
        oauth_consumer_key      :   _getConsumerKey(),
        oauth_nonce             :   _getNonce(),
        oauth_timestamp         :   _getTimestamp(),
        oauth_version           :   "1.0",
        oauth_signature_method  :   "RSA-SHA1"
    };

    if(body == null) { body = ""; }

    var hashedBody = _getBodyHash(body);
    auth.oauth_body_hash = hashedBody;

    var baseString = _getBaseString("POST", requestURL, auth);
    var signature = _getSignature(baseString);
    var authHeader = _getAuthHeader(signature, auth);
  
    var updatedPath = path + "?";
    for(var key in params) {
        updatedPath += key + "=" + params[key] + "&";
    }
    updatedPath =  updatedPath.substr(0, updatedPath.length - 1);

    var options = {
        hostname: hostname,
        method: 'POST',
        path: updatedPath,
        headers: {
            Authorization: authHeader,
            "content-type" : "application/xml"
        }
    };

    var req = https.request(options, callback);
    req.write(body);
    req.end();
};
