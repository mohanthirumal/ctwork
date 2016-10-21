var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment');
var gcm = require('android-gcm');
var app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/test');
app.set('port', 8080);
app.use(bodyParser.json());
// app.use(function(req, res, next) {
//   res.setHeader('Content-Type', 'application/json');
//   next();
// });
var User = mongoose.model('User', {username: String, password: String});
var Bill = mongoose.model('Bill', {username: String, id: String, address: String, billAmount: String, dueDate: String, name: String, number: String, timestamp: String});
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

app.get('/getBilldata', function(request, response) {
	var data = request.body;
	Bill.find({}, function (err, userObj) {
	  if (err) {
		console.log(err);
	  } else if (userObj) {
		var data = [];
		userObj.forEach(function( user ){
			console.log("username : " + user.username + " | password : " + user.password);
			
			data.push(user);
		});
		response.header("Content-Type", "application/json");
		// response.write( returnData );
		response.end(JSON.stringify(data));
		 } else {
		console.log('Bill not found!');
		response.end("Bill not found!" );
	  }
	});
});

app.get('/getUser', function(request, response) {
	var data = request.body;
	User.find({username: data.username, password: data.password}, function (err, userObj) {
	  if (err) {
		console.log(err);
	  } else if (userObj) {
		var data = [];
		userObj.forEach(function( user ){
			console.log("username : " + user.username + " | password : " + user.password);
			var returnData = {};
			returnData.username = user.username;
			returnData.password = user.password;
			data.push(user);
		});
		response.header("Content-Type", "application/json");
		// response.write( returnData );
		response.end(JSON.stringify(data));
		 } else {
		console.log('User not found!');
		response.end("User not found!" );
	  }
	});
});
app.get('/getUsers', function(request, response) {
	var data = request.body;
	User.find({}, function (err, userObj) {
	  if (err) {
		console.log(err);
	  } else if (userObj) {
		var data = [];
		userObj.forEach(function( user ){
			console.log("username : " + user.username + " | password : " + user.password);
			var returnData = {};
			returnData.username = user.username;
			returnData.password = user.password;
			data.push(user);
		});
		response.header("Content-Type", "application/json");
		// response.write( returnData );
		response.end(JSON.stringify(data));
		 } else {
		console.log('User not found!');
		response.end("User not found!" );
	  }
	});
});
app.post('/addUser', function(request, response) {
	var data = request.body;
	var userData = new User({ username: data.username, password: data.password });
	console.log(userData);
	userData.save(function (err, userObj) {
	  if (err) {
		console.log(err);
		response.end(err);
	  } else {
		response.end("saved successfully: " + userObj );
	  }
	});
	
});
app.post('/deleteUser', function(request, response) {
	if(!request.body.id) {
		response.end("id does not exist");
	}
	User.remove({ _id: request.body.id }, function(err) {
		if (err) {
			console.log(err);
			response.end(err);
		}
		else {
			response.end("Deleted successfully");
		}
	});
});

app.get('/addBillData', function(request, response) {
	
	var data = request.query;
	if(!data.number) {
		response.end("number does not exist");
	}
	Bill.remove({ number: data.number, id: data.id }, function(err) {
		if (err) {
			console.log(err);
			response.end(err);
		}
		else {
			var dueDate = '-';
			if( data.dueDate != '-'){
				dueDate = moment( data.dueDate, "DD/MM/YYYY" );
			}
			var billdModel = new Bill({username: data.username, id: data.id, address: data.address, billAmount: data.billAmount, dueDate: dueDate.valueOf(), name: data.name, number: data.number, timestamp: data.timestamp});
			console.log(billdModel);
			billdModel.save(function (err, userObj) {
			  if (err) {
				console.log(err);
				response.end(err);
			  } else {
				response.end("saved successfully: " + userObj );
			  }
			});
		}
	});
});

app.get('*', function(request, response) {
	//response.redirect("/endpoint");
	response.end("Page Not Found");
});

