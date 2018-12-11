const http = require('http');

const url = require('url');

// var _data = require('./lib/data')

// test
// ----------create-----------
// _data.create('test', 'newFile', {name: 'shuai', age: 23}, function(err, e) {
//   console.log(err, e);
// })
// ----------read-----------
// _data.read('test', 'newFile', function(err, data) {
//   console.log(err, data);
// })
// ----------update-----------
// _data.update('test', 'newFile', {name: 'yujie zhang', age: 23}, function(err, data) {
//   console.log(err, data);
// })
// ----------delete-----------
// _data.delete('test', 'newFile', function(err, data) {
//   console.log(err, data);
// })

var server = http.createServer(function(req, res) {

  let parsedUrl = url.parse(req.url, true);
  let {pathname, query} = parsedUrl;
  pathname = pathname.replace(/^\/+|\/+$/g, '')
  // 
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  // 

  req.on('data', function(e) {
    
  })
  req.on('end', function() {

     let chosenHandlers = typeof (routers[pathname]) !== 'undefined' ? routers[pathname] : handlers.notFound;
     var data = {
      'trimmedPath': pathname,
      'query': query,
    };

     chosenHandlers(
       data, 
       function(statusCode, payload){
          statusCode = typeof statusCode === 'number'? statusCode : 200;
          payload = typeof payload === 'object'? payload : {};
          res.writeHead(statusCode)
          res.end(JSON.stringify(payload))
       }
     )
  })
  
})


server.listen(3000, function() {
  console.log('listen on 3000')
})


var handlers = {};
handlers.hello = function(data, callback) {
  callback(200, {
    'name': 'shuai',
    'age': '22',
    'gender': 'male',
    'height': '6 inch',
    'weight': '78kg',
    'msg': 'hello, my name is shuai, nice to meet you'
  });
}
handlers.notFound = function(data, callback) {
  callback(404);
}

var routers = {
  'hello': handlers.hello
}