var _data = require('./_data')
var helpers = require('./helpers');

var menuInfo = {
  dishes: [
    {
      name: "宫保鸡丁",
      price: 12
    },{
      name: "鱼香肉丝",
      price: 14
    },{
      name: "夫妻肺片",
      price: 9
    },{
      name: "毛血旺",
      price: 20
    },{
      name: "干锅鸡",
      price: 16
    }
  ]
}

// console.log(JSON.stringify(menuInfo))

var dishAmount;
// first get the idea of how many dishes already have in the menu
_data.read('menu', 'menu', function(err, menuData) {
  if(!err && menuData) {
    var oldDishes = typeof (menuData.dishes) === 'object' && menuData.dishes instanceof Array ? menuData.dishes : [];
    oldDishAmount = oldDishes.length;
    var newDishes = menuInfo.dishes.slice(oldDishAmount, menuInfo.dishes.length);
    newDishes.forEach((i)=> {
      i.id = helpers.randomString(10);
    })
    oldDishes.push(...newDishes);
    menuData.dishes = oldDishes;

    // update the new dishes
    _data.update('menu', 'menu', menuData, function(err) {
      if(!err) {
        console.log('\x1b[33m%s\x1b[0m','update the menu successfully')
      }else {
        console.log('\x1b[31m%s\x1b[0m','update the menu failed')
      }
    })
    
  }else {
    menuInfo.dishes.forEach((i)=> {
      i.id = helpers.randomString(10);
    })
    // create the json file for the first time
    _data.create('menu', 'menu', menuInfo, function(err) {
      if(!err) {
        console.log('\x1b[33m%s\x1b[0m', 'convert successfully! create new file')   
      }else {
        console.log('\x1b[31m%s\x1b[0m', 'convert fail! Fail to create new json file')   
      }
    })
  }
})