var fs = require('fs');

exports.resolveTemplate = function(templateFile, data) {
    var template = fs.readFileSync(templateFile).toString('ascii');
  
    for(var key in data){
        var token = "{"+key+"}";
        var regex = new RegExp(token, 'g');
        template = template.replace(token, data[key]);
        // Don't look here... eww
        if(key == "amount"){template = template.replace(token, data[key]);}
    }
    
    return template;
}

// Silly date functions because the mastercard api requires 0's in front of any single digit numbers
exports.getHours = function() {
    var d = new Date();
    var hours = d.getHours();

    if(hours <  10) {
        hours = "0" + hours;
    }
    return "" + hours;
}

exports.getDay = function() {
    var d = new Date();
    var day = d.getDate();

    if(day < 10) {
        day = "0" + day;
    }
    return "" + day;
}
    
exports.getMonth = function() {
    var d = new Date();
    var month = d.getMonth();

    if(month < 10) {
        month = "0" + month;
    }
    return "" + month;
}


exports.getMinutes = function() {
    var d = new Date();
    var minutes = d.getMinutes();

    if(minutes < 10) {
        minutes = "0" + minutes;
    }
    return "" + minutes;
}


exports.getSeconds = function() {
    var d = new Date();
    var seconds = d.getSeconds();

    if(seconds < 10) {
        seconds = "0" + seconds;
    }
    return "" + seconds;
}

exports.getTransactionId = function() {
    var transId = "";
    for(var i = 0; i < 19; i++) {
        transId = transId + Math.floor(Math.random() * 10);
    }
    return transId; 
}
