var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
// string decoder
var StringDecoder = require('string_decoder').StringDecoder;
var handler = require('./util/handler');
// using helpers for some quick functions
var helpers = require('./util/helpers');


var server = {}


server.httpServer = http.createServer(function(req, res) {
  var parseUrl = url.parse(req.url, true);
  // prepare the request info
  var path = parseUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');
  var queryStringObject = parseUrl.query;
  var method = req.method.toLowerCase();
  var headers = req.headers;

  // get the payload if there is any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  })
  req.on('end', function(data) {
    // end the buffer decoding
    buffer += decoder.end();
    var chosenHandler = typeof server.router[trimmedPath] !== undefined ? server.router[trimmedPath] : handler.notFound
    // prepare the passed in data
    var data = {
      method,
      queryStringObject,
      headers,
      trimmedPath,
      payload: helpers.parseJSONtoObject(buffer)
    };
    
    chosenHandler(
      data,
      function(statusCode, payload) {
        statusCode = typeof statusCode === 'number' ? statusCode : 200;
        payload = typeof payload === 'object' ? payload : {};

        var payloadString = JSON.stringify(payload);

        // return the header
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString)
        if(statusCode >= 200 && statusCode < 400) {
          console.log('\x1b[33m%s\x1b[0m','the payload string is ' + payloadString)
        }else {
          console.log('\x1b[31m%s\x1b[0m','the payload string is ' + payloadString)
        }
      }
    )
    
  })

})

// defined a router collection
server.router = {
  'ping': handler.ping,
  'user': handler.user,
  'token': handler.token,
  'menu': handler.menu,
}


server.init = function() {
  server.httpServer.listen(3000, function() {    //configPort
    console.log('the port is litened on 3000')
  })   
}


module.exports = server;

