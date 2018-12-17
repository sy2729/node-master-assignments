var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');





_data = {};

_data.path = path.join(__dirname, '../.data/');

_data.create = function(dir, fileName, data, callback) {
  fs.open(_data.path + dir + '/' + fileName + '.json', 'wx', function(err, fileDescriptor) {
    if(!err && fileDescriptor) {
      var stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if(!err) {
          fs.close(fileDescriptor, function(err) {
            if(!err) {
              callback(false)
            }else {
              callback('Couldn\'t close the new create file')
            }
          })
        }else {
          callback('Couldn\'t write data to the new file')    
        }
      })
    }else {
      callback("Couldn't open the file and create new file ", err)
    }
  })
}


_data.read = function(dir, fileName, callback) {
  fs.readFile(_data.path + dir + '/' + fileName + '.json', 'utf-8', function(err, data) {
    if(!err && data) {
      var parseData = helpers.parseJSONtoObject(data);
      callback(false, parseData)
    }else {
      callback(err, data)
    }
  })
}

_data.update = function(dir, fileName, newInfo, callback) {
  fs.open(_data.path + dir + '/' + fileName + '.json', 'r+', function(err, fileDescriptor) {
    if(!err && fileDescriptor) {
      var stringData = JSON.stringify(newInfo);

      fs.truncate(fileDescriptor, function(err) {
        if(!err) {
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if(!err) {
              fs.close(fileDescriptor, function(err) {
                if(!err) {
                  callback(false)
                }else {
                  callback("Error closing the updated file")
                }
              })
            }else {
              callback("Error updating the file - writing file to the old file")
            }
          })
        }else {
          callback('Error truncating the old file')
        }
      })
    }else {
      callback("Can't find the file to open")
    }
  })
}

_data.delete = function(dir, fileName, callback) {
  fs.unlink(_data.path + dir + "/" + fileName + '.json', function(err) {
    if(!err) {
      callback(false)
    }else {
      callback("Error deleting the file")
    }
  })
}





module.exports = _data;