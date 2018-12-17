var server = require('./server')

var app = {}

app.init = function() {
  server.init();
}

app.init();

module.exports = app;