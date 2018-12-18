// var stripe = require("stripe")("sk_test_7hzgjXF0Ww5KpB6pDWRn9iLw");

// Token is created using Checkout or Elements!
// Get the payment token ID submitted by the form:
// const token = request.body.stripeToken; // Using Express
// const charge = stripe.charges.create({
//   amount: 999,
//   currency: 'usd',
//   description: 'Example charge',
//   source: token,
// });
var querystring = require('querystring');
var helpers = require('./helpers');
var config = require('./config');
var https = require('https');
var StringDecoder = require('string_decoder');

var pay = {};

// accept payment through stripe.com api
// required data: amount, currency, customer, description
// optional data: none
pay.charge = function(orderData,callback){
  // config the payload
  var payload = {
    amount  : orderData.amount,
    currency : orderData.currency,
    source : orderData.source,
    description : orderData.description
  };

  var stringCharge = querystring.stringify(payload);

  // configure the request details
  var requestDetails = {
    'protocol' : 'https:',
    'hostname' : 'api.stripe.com',
    'method' : 'POST',
    'path' : '/v1/charges',
    'auth' : config.stripe,
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringCharge)
    }
  };

  var req = https.request(requestDetails,function(res){
    // Grab the status of the sent request
    var status =  res.statusCode;

    // process the response
    var decoder = new StringDecoder.StringDecoder("utf-8");
    var buffer ="";
    var paymentData ={};

    res.on('data', function(data){
      buffer += data;
    });

    res.on('end',function(){
      buffer += decoder.end();
      paymentData = helpers.parseJSONtoObject(buffer);

      // Callback successfully if the request went through
      if(status == 200 || status == 201){
        callback(false, paymentData);
      //  console.log(paymentData);
      } else {
        callback('Status code returned was '+status);
      }

    });

  });

  // Bind to the error event so it doesn't get thrown
  req.on('error',function(e){
    callback(e);
  });

  // Add the payload
  req.write(stringCharge);

  // End the request
  req.end();

};

module.exports = pay;