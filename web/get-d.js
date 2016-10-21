var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/test');
var Prices = mongoose.model('Prices', {type: String, city: String, price: String, timestamp: String, changed: String});
var Users = mongoose.model('Users', {gcm_id: String, enable_gcm: String, city: String});
Users.find({ city : 'Chennai', enable_gcm : 1}, function (err, userObj) {
    if (err) {
    console.log(err);
    } else if (userObj) {
      console.log("Total Length : " + userObj.length);
      return;
    userObj.forEach(function( user ){
      console.log("gcm_id : " + user.gcm_id + " | city : " + user.city);
    });
    } else {
      console.log('User not found!');
    }
  });
Prices.find({ city : 'Chennai'}, function (err, userObj) {
    if (err) {
    console.log(err);
    } else if (userObj) {
      console.log("Total Length : " + userObj.length);
      return;
    userObj.forEach(function( user ){
      console.log("gcm_id : " + user.gcm_id + " | city : " + user.city);
    });
    } else {
      console.log('User not found!');
    }
  }).sort({timestamp: 'desc', limit : 1})