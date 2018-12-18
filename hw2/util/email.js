var querystring = require('querystring');
// var helpers = require('./helpers');
var config = require('./config');
var https = require('https');
// var StringDecoder = require('string_decoder');

var emailSys = {}
// auto email through Mailgun API
emailSys.sendEmail = function(orderData,paymentData, callback){
  // prepare the email Content
  var message  = '----Chinese Restuarant Order---- \n';
      message += 'Order ID :' + orderData.orderId +'\n';
      message += 'Order Date:' + orderData.orderDate +'\n';
      message += 'Total Amount:'+ orderData.total +'\n';
      message += 'Currency:'+ paymentData.currency +'\n';
      message += '----Thank you, Pls order again---';

  var payload ={
       from: config.mailGun.from,
       to: orderData.email,
       subject : orderData.description,
       text: message
  };

  var stringpayload = querystring.stringify(payload);
  // configure the request details
  var requestDetails = {
    'protocol': 'https:',
            'hostname': 'api.mailgun.net',
            'method': 'POST',
            'path': '/v3/'+ config.mailGun.domain + '/messages',
            'auth': `api:${config.mailGun.apiKey}`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringpayload)
            }
  };

  var req = https.request(requestDetails,function(res){
    // Grab the status of the sent request
    var status =  res.statusCode;

   if(status == 200 || status == 201){
       callback(false);
   } else {
       callback('Status code returned was '+status);
       console.log(status);
   }
  });

  // Bind to the error event so it doesn't get thrown
  req.on('error',function(e){
    callback(e);
  });
  // Add the payload
  req.write(stringpayload);
  // End the request
  req.end();
};

module.exports = emailSys;