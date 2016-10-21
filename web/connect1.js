var mysql      = require('mysql');
var mongoose = require('mongoose');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'testdb'
});
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/test');
var Prices = mongoose.model('Users', {gcm_id: String, enable_gcm: String, city: String});
connection.connect();

connection.query('SELECT * FROM fuel_gcm', function(err, rows, fields) {
  console.log('The solution is: '+ JSON.stringify(rows));
  if (err) throw err;
  rows.forEach(function(row){
    var userData = new Prices({gcm_id: row.gcm_id, enable_gcm: row.enable_gcm, city: row.city});
    console.log(userData);
    userData.save(function (err, userObj) {
      if (err) {
        console.log(err);
      } else {
        console.log("saved successfully: " + userObj);
      }
    });  
  });
  // console.log('The solution is: ', rows[0].solution);
});

connection.end();