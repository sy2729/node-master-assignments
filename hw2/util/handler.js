var _data = require('./_data');
var helpers = require('./helpers');
var pay = require('./charge');
var emailSys = require('./email');
var menu = require('../.data/menu/menu.json');

var handler = {}
handler.home = function(data, callback) {
  if(data.method.toLowerCase() === 'get') {
    callback(200, {"Data": "This is the home page"})
  }else {
    callback(401, {"Error": "Other method are not allowed"})
  }
}
handler.ping = function(data, callback) {
  callback(200)
}

// User related operation
handler.user = function(data, callback) {
  var methods = ['get', 'post', 'put', 'delete'];
  if(methods.indexOf(data.method) > -1) {
    handler.user[data.method](data, callback);
  }
  
}

handler.user.post = function(data, callback) {
  var firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var email = typeof (data.payload.email) === 'string' && data.payload.email.indexOf('@') > -1 && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var address = typeof (data.payload.address) === 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
  var password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  var agreement = typeof (data.payload.agreement) === 'boolean' && data.payload.agreement === true ? data.payload.agreement : false;
  if(firstName && lastName && password && phone && agreement && email && address) {
    
    // first check whether user already exist
    _data.read('user', phone, function(err, data) {
      // 没读取到用户，返回false，这反倒说明此用户没被创建，可以进行下一步操作
      if(err) {
        var hashPassword = helpers.hash(password);
        if(hashPassword) {
          var userObj = {firstName, lastName, phone, agreement, email, address, password: hashPassword};
          _data.create(
            'user',
            phone,
            userObj,
            // the callback
            function(err) {
              if(!err) {
                callback(200, {firstName, lastName, phone, email, address, agreement});
              }else {
                console.log(err)
                callback(500, {"Error": 'failed to create new user'})
              }
            }
          )
        }else {
          callback(500, {"Error": 'failed to hash user password'})
        }
      }else {
        callback(400, {"Error": 'User with the phone number already exist'})
      }
    })
  }else {
    callback(400, {"Error": "Bad request, one of the required files is missing or not valid"})
  }
  
}

handler.user.get = function(data, callback) {
  var phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

  var token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

  if(phone) {
    handler.token.verifyToken(token, phone, function(tokenIsValid) {
      if(tokenIsValid) {
        _data.read('user', phone, function(err, data) {
          if(!err && data) {
            delete data.password
            callback(200, data)
          }else {
            callback(500, {"Error": "can't find the user info"})
          }
        })
      }else {
        callback(403, {"Error": "the token is mismatched or expired"})
      }
    })
  }else {
    callback(401, {"Error": "the phone is missing or in wrong format"})
  }
}

handler.user.put = function(data, callback) {
  var firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  var email = typeof (data.payload.email) === 'string' && data.payload.email.indexOf('@') > -1 && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var address = typeof (data.payload.address) === 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;

  // first check if the phone  is valid
  if(phone) {

    var token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    // then valid user token
    handler.token.verifyToken(token, phone, function(tokenIsValid) {
      if(tokenIsValid) {
          // then check if it is necessary to update - whether new info exist
          if(firstName || lastName || password || email) {
            // check whether the user to update exist
            _data.read('user', phone, function(err, userData) {
              if(!err && userData) {
                // user exist

                firstName ? userData.firstName = firstName : undefined
                lastName ? userData.lastName = lastName : undefined
                password ? userData.password = helpers.hash(password) : undefined
                email ? userData.email = email : undefined
                address ? userData.address = address : undefined
                _data.update('user', phone, userData, function(err) {
                  if(!err) {
                    callback(200, {firstName, lastName, phone})
                  }else {
                    console.log(err)
                    callback(500, {"Error" : "Fail to update the user info"})
                  }
                })
              }else {
                callback(403, {"Error": "The queries user does not exist in the system"})
              }
            })
          }else {
            callback(400, {"Error": "There is no need to update, since required info missing or invalid"})
          }
      }else {
        callback(403, {"Error": "the token is mismatched or expired"})
      }
    })
  }else {
    callback(400, {"Error": "The phone format is missing or not valid"})
  }
}

handler.user.delete = function(data, callback) {
  var phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
    var token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    // validate the token
    handler.token.verifyToken(token, phone, function(tokenIsValid) {
      if(tokenIsValid) {
        // delete user after validation
        _data.delete('user', phone, function(err) {
          if(!err) {
            callback(200, {"success": 'the user is deleted successfully'})
          }else {
            callback(500, {"Error": "Error in deleting the user"})
          }
        })
      }else {
        callback(403, {"Error": "The Token is missmatched or expired"})
      }
    })
  }else {
    callback(401, {"Error": "The required phone is missing or invalid"})
  }
}


// Token related operation
handler.token = function(data, callback) {
  var methods = ['get', 'post', 'put', 'delete'];
  if(methods.indexOf(data.method) > -1) {
    handler.token[data.method](data, callback);
  }
}

// login the user
handler.token.post = function(data, callback) {
  var password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  if(password && phone) {
    // look up the user
    _data.read('user', phone, function(err, userData) {
      if(!err) {
        // check whether the password is matched
        if(helpers.hash(password) === userData.password) {
          // starte to create the token for the user
          var tokenId = helpers.randomString(20);
          // user token expired in 5 minutes
          var minute = 60;
          var expireTime = Date.now() + 1000 * 60 * minute;
          _data.create('token', tokenId, {tokenId, phone, expireTime}, function(err) {
            if(!err) {
              callback(200, {tokenId, phone, expireTime})
            }else {
              callback(500, {"Error": "Fail to login the user, can't create the token"} )
            }
          })
        }else {
          callback(403, {"Error": "Wrong Password, The user is not authorized"})
        }
      }else {
        callback(401, {"Error": "the user doesn't exist in the system"})
      }
    })

  }else {
    callback(401, {"Error": "bad request with invalid info or missing info"})
  }
}

// query the login state
handler.token.get = function(data, callback) {
  var token = typeof (data.headers.token) === 'string' ? data.headers.token : false
  if(token) {
    _data.read('token', token, function(err, tokenInfo) {
      if(!err) {
        callback(200, tokenInfo)
      }else {
        callback(401, {"Error": "the token doesn't exist, please login"})
      }
    })
  }else {
    callback(401, {"Error": "the query is not valid, missing tokenId"})
  }
};

// extend the user login time
handler.token.put = function(data, callback) {
  var token = typeof (data.headers.token) === 'string' ? data.headers.token : false
  var extendTokenTime = typeof (data.payload.extendTokenTime) === 'boolean' && data.payload.extendTokenTime === true ? data.payload.extendTokenTime : false;

  if(token) {
    if(extendTokenTime) {
      _data.read('token', token, function(err, tokenInfo) {
        if(!err && tokenInfo) {
          // check whether the expire date already passed
          if(Date.now() < tokenInfo.expireTime) {
            var extendTime = 10 //minutes
            tokenInfo.expireTime = Date.now() + 1000 * 60 * extendTime;
            _data.update('token', token, tokenInfo, function(err) {
              if(!err) {
                callback(200, tokenInfo)
              }else {
                callback(500, {"Error": "Faile to update the token and extend the expire time"})            
              }
            })
          }else {
            callback(403, {"Error": "thiis token already passed, please log in and create another token again"})        
          }
        }else {
          callback(401, {"Error": "requested token not found"})      
        }
      })
    }else {
      callback(401, {"Error": "not request to extend the token expire date"})  
    }
  }else {
    callback(401, {"Error": "the query is not valid, missing tokenId"})
  }
}

// Log out the user, destroy the token
handler.token.delete = function(data, callback) {
  var id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
  if(id) {
    _data.read('token', id, function(err, tokenInfo) {
      if(!err && tokenInfo) {
        _data.delete('token', id, function(err) {
          if(!err) {
            callback(200, {"Success": "you have logged out, the token is deleted"});
          }else {
            callback(500, {"Error": "Can't delete the token"})    
          }
        })
      }else {
        callback(500, {"Error": "the query id is not found"})
      }
    })
  }else {
    callback(401, {"Error": "the query id is not valid"})
  }
}

handler.token.verifyToken = function(token, phone, callback) {
  _data.read('token', token, function(err, tokenInfo) {
    if(!err && tokenInfo) {
      if(phone === tokenInfo.phone && tokenInfo.expireTime > Date.now()) {
        callback(true)
      }else {
        callback(false);
      }
    }else {
      callback(false)
    }
  })
}
handler.token.verifyTokenTime = function(token, callback) {
  _data.read('token', token, function(err, tokenInfo) {
    if(!err && tokenInfo) {
      if(tokenInfo.expireTime > Date.now()) {
        callback(true, tokenInfo)
      }else {
        callback(false, tokenInfo);
      }
    }else {
      callback(false, tokenInfo)
    }
  })
}


// Menu related Operation     @TODO - update the function with verifyTokenTime
handler.menu = function(data, callback) {
  if(data.method === 'get') {
    // check whether there is a token
    var token = typeof (data.headers.token) === "string" && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
    if(token) {
    //  check whether the token is expired
    _data.read('token', token, function(err, tokenInfo) {
      if(!err && tokenInfo) {
        if(tokenInfo.expireTime > Date.now()) {
          // return the menu info (hard coded);
          callback(200, menu)
        }else {
          callback(403, {"Error": "Token expired, please login again"})    
        }
      }else {
        callback(500, {"Error": "Can't find the token file"})  
      }
    })
    }else {
      callback(403, {"Error": "No Token, not logged in, please log in"})
    }
  }else {
    callback(401, {"Error": "Methods except get are not allowed in menu route"})
  }
}

// Shopping cart related Operation
handler.cart = function(data, callback) {
  var methods = ['get', 'post'];
  if(methods.indexOf(data.method) > -1) {
    handler.cart[data.method](data, callback)
  }else {
    callback(401, {"Error": "Method not allowed"})
  }
}

handler.cart.post = function(data, callback) {
  // first check wheter login
  var token = typeof (data.headers.token) === "string" && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;

  var newCartItem = typeof (data.payload.cart) === 'object' && data.payload.cart instanceof Array && data.payload.cart.length > 0 ? data.payload.cart : false;

  if(token) {
    // make sure there is item in the add-to-cart request
    if(newCartItem) {
      // make sure token is not expired
      handler.token.verifyTokenTime(token, function(tokenIsValid, tokenInfo) {
        if(tokenIsValid) {
          // read user data and add item to the shopping cart list
          _data.read('user', tokenInfo.phone, function(err, userData) {
            if(!err && userData) {
              var cart = typeof userData.cart === 'object' && userData.cart instanceof Array && userData.cart.length > 0 ? userData.cart : [];
              cart.push(...newCartItem);
              // write new cart item into user data and update
              userData.cart = cart;
              _data.update('user', tokenInfo.phone, userData, function(err) {
                if(!err) {
                  delete userData.password
                  callback(200, userData)
                }else {
                  callback(500, {"Error": "Can't update the user info with new add items in cart"})        
                }
              })
            }else {
              callback(500, {"Error": "Can't read the user data when adding item to the cart"})    
            }
          })
        }else {
          callback(403, {"Error": "The token might expire, please login"})
        }
      })
    }else {
      callback(401, {"Error": "Missnig order info, please place order"})
    }
  }else {
    callback(401, {"Error": "The token is missing, please first login and then order"})
  }
}

handler.cart.get = function(data, callback) {
  var token = typeof (data.headers.token) === "string" && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
  if(token) {
    handler.token.verifyTokenTime(token, function(tokenIsValid, tokenInfo) {
      if(tokenIsValid) {
        // read user Data
        _data.read('user', tokenInfo.phone, function(err, userData) {
          if(!err) {
            var cartInfo = userData.cart;
            callback(200, {items: cartInfo});
          }else {
            callback(500, {"Error": "can't find user info"})    
          }
        })
      }else {
        callback(401, {"Error": "Token is expired"})
      }
    })
  }else {
    callback(401, {"Error": "Token is not presented, please login"})
  }
}

// handler.cart.update = function(data, callback) {

// }


// Order related Operation - Payment
handler.charge = function(data, callback){
  if(data.method.toLowerCase() === 'post') {
    handler.charge.post(data, callback)
  }
}

handler.charge.post = function(data, callback) {
  var token = typeof (data.headers.token) === "string" && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;

  handler.token.verifyTokenTime(token, function(tokenIsValid, tokenInfo) {
    if(tokenIsValid) {
      // read cart Data
      _data.read('user', tokenInfo.phone, function(err, userData) {
        if(!err) {
          var cartInfo = userData.cart;
          var result = helpers.calculateCartPrice(cartInfo);
          if(typeof result === 'object' && typeof (result.price) === 'number' && result.price > 0) {
            // test stripe token and email
            var testStripeToken = 'tok_visa';
            // var email = 'yazeishuai@gmail.com'
            // the base price is cent, so * 100
            var orderData = {amount: result.price * 100, currency: 'usd', description: result.text, source: testStripeToken};
            pay.charge(orderData, function(err) {
              if(!err) {
                console.log({"Success": "The payment was successful"})

                // process for completting the order
                // create new order file
                var orderId = helpers.randomString(20);
                var props = ['cart', 'phone'];
                var temp = {};
                props.forEach((i)=> {
                  temp[i] = userData[i];
                })
                Object.assign(orderData, temp);
                _data.create('order', orderId, orderData, function(err) {
                  if(!err) {
                    // deleted the cart record from user info and add the order record
                    userData.cart = [];
                    var userOrderRecord = typeof (userData.order) === "object" && userData.order instanceof Array && userData.order > 0 ? userData.order : [];
                    userOrderRecord.push(orderId);
                    userData.order = userOrderRecord;
                    _data.update('user', tokenInfo.phone, userData, function(err) {
                      if(!err) {
                        console.log({"Success": "Payment was made successfully"})

                        // prepare data for sending email
                        var orderdetail = {
                          orderId,
                          orderDate: new Date(),
                          email: userData.email,
                          description: 'Order Success' + orderData.description,
                          total : orderData.amount * 100
                        };
                        var paymentdetail = {
                          currency: 'usd'
                        };
                        // process for sending the email
                        emailSys.sendEmail(orderdetail, paymentdetail, function(err) {
                          if(!err) {
                            callback(200, {"Sucess": "the payment was made and the email was send successfully"})
                          }else {
                            callback(500, {"Error": "payment was made successfully but the email failed to send"})
                          }
                        })

                      }else {
                        callback(500, {"Error": "Payment was made and order was created  successfully, but updating user file failed"})
                      }
                    })
                  }else {
                    callback(500, {"Error": "pay succussfully, but failed to create order file"})
                  }
                })
              }else {
                callback(500, {"Error": err})
              }
            })
          }else {
            callback(500, {"Error": "Nothing to check out!!!"})
          }
        }else {
          callback(500, {"Error": "can't find user info"})    
        }
      })
    }else {
      callback(403, "Token Expired")
    }
  })
}


module.exports = handler;