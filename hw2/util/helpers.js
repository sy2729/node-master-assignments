var crypto = require('crypto');
var config = require('./config');

var helpers = {}

// hash user password
helpers.hash = function(str) {
  if (typeof str === 'string' && str.length > 0) {
     var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
     return hash
  }else {
    return false
  }
}


helpers.parseJSONtoObject = function(str) {
  try {
    return JSON.parse(str)
  }catch(e) {
    return {}
  }
}

helpers.randomString = function(length) {
  var length = typeof length === 'number' && length > 0 ? length : false
  if(!length) {
    return false
  }
  var all = 'abcdefghijklmnopqrstuvwxyz1234567890';
  var result = '';
  for(var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * all.length);
    var random = all[randomIndex];
    result += random;
  }
  return result
}

helpers.calculateCartPrice = function(cartInfo) {
  if(typeof cartInfo === 'object' && cartInfo instanceof Array && cartInfo.length > 0) {
    var price = 0;
    var text = '';
    cartInfo.forEach((i)=> {
      price += i.amount * i.price
      var eachText = i === 0 ? `You ordered ${i.amount} ${i.name}, ` : `${i.amount} ${i.name} ,`;
      text += eachText;
    })
    
    return {price, text};
  }else {
    return false
  }
}





module.exports = helpers;