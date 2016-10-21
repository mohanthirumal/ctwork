var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment-timezone');
var gcm = require('android-gcm');
var app = express();
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/test123');
app.set('port', 80);
app.use(bodyParser.json());
// app.use(function(req, res, next) {
//   res.setHeader('Content-Type', 'application/json');
//   next();
// });
var Prices = mongoose.model('Prices', {state: String, city: String, price: String, recentPriceChange: String, changed: String, timestamp: Number, type: String });
var GCM = mongoose.model('Users', {gcm_id: String, enable_gcm: String, city: String});
var CurrencyRates = mongoose.model('CurrencyRates', {timestamp: String, currency: String, inr: String});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

app.get('/getCurrencyRates', function(request, response) {
	var requestData = request.query;
	var type = requestData.type;
	CurrencyRates.find({ $query: {}, $orderby: { timestamp : -1 } }, function (err, userObj) {
	  if (err) {
		console.log(err);
	  } 
	  else if (userObj) {
	  	console.log(userObj);
			var dataSet = [];
			userObj.forEach( function( user ){
				var date = new moment.tz( parseInt(user.timestamp), 'Asia/Kolkata' );
				var data = {
					date : date.format('YYYY-MM-DD'),
					currency : user.currency,
					inr : user.inr,
					timestamp : user.timestamp,
					id : user._id
				};
				dataSet.push( data );
			});
			response.header("Content-Type", "application/json");
			// response.write( returnData );
			response.end(JSON.stringify(dataSet));
		 } 
		else {
			console.log('User not found!');
			response.end("User not found!" );
	  }
	});
});

app.get('/addCurrencyPriceData', function(request, response) {
	var data = request.query;
	var current = new moment.utc();
	var price = new CurrencyRates({currency: data.currency, inr: data.price, timestamp : current.valueOf() });
	
	price.save(function (err, userObj) {
	  if (err) {
		console.log(err);
		response.end(err);
	  } else {
		response.end("saved successfully: " + userObj );
	  }
	});
});

app.post('/updateSettings', function(request, response) {
	var data = request.body;
	var current = new moment.utc();
	var gcm = {gcm_id: data.gcm_id, enable_gcm: data.enabled, city: data.city};
	GCM.findOneAndUpdate({'gcm_id': data.gcm_id}, gcm, function (err, userObj) {
	  if (err) {
		console.log(err);
		response.end(err);
	  } else {
		response.end("Updated successfully: " + userObj );
	  }
	});
});
app.post('/unRegisterUser', function(request, response) {
	var data = request.body;
  GCM.remove({ gcm_id: data.gcm_id }, function(err) {
		if (err) {
			console.log(err);
			response.end(err);
		}
		else {
			response.end("Deleted successfully");
		}
	});
});
app.post('/registerUser', function(request, response) {
	var data = request.body;
	var gcm = new GCM({gcm_id: data.gcm_id, enable_gcm: 1});
  console.log(gcm);
  GCM.remove({ gcm_id: data.gcm_id }, function(err) {
		if (err) {
			console.log(err);
			response.end(err);
		}
		else {
			gcm.save(function (err, userObj) {
		    if (err) {
		      console.log(err);
		    } else {
		      response.end("saved successfully: " + userObj);
		    }
		  });
		}
	});
});
app.get('/addPriceData', function(request, response) {
	var data = request.query;
	var current = new moment.utc();
	var price = new Prices({state: data.state, city: data.city, price: data.price, recentPriceChange: data.recentPriceChange, changed: 0, timestamp : current.valueOf(), type: data.type });
	
	price.save(function (err, userObj) {
	  if (err) {
		console.log(err);
		response.end(err);
	  } else {
		response.end("saved successfully: " + userObj );
	  }
	});
});

app.get('/getBillData', function(request, response) {
	var data = request.query;
	// Prices.find({}, function (err, userObj) {
	//   if (err) {
	// 	console.log(err);
	//   } else if (userObj) {
	// 	var data = [];
	// 	userObj.forEach(function( user ){
	// 		data.push(user);
	// 	});
	// 	response.header("Content-Type", "application/json");
	// 	// response.write( returnData );
	// 	response.end(JSON.stringify(data));
	// 	 } else {
	// 	console.log('User not found!');
	// 	response.end("User not found!" );
	//   }
	// });
	var type = data.type;
	Prices.aggregate([
	{ $match: { "type": type } },
	{ $sort: { "timestamp": -1 } },
	{
		$group: {
      _id: "$city",
      price : { $first: '$price' },
      timestamp : { $first: '$timestamp' },
      city : { $first: '$city' },
      type : { $first: '$type' },
      count: { $sum: 1 }
    }
	},
	{ $sort: { "_id": 1 } }
	], function (err, userObj) {
	  if (err) {
		console.log(err);
	  } else if (userObj) {
		var data = [];
		userObj.forEach(function( user ){
			var date = new moment.tz(user.timestamp, 'Asia/Kolkata');
			user.date = date.format('YYYY-MM-DD');
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

app.get('/getBillDataOld', function(request, response) {
	var data = request.body;
	Prices.find({}, function (err, userObj) {
	  if (err) {
		console.log(err);
	  } else if (userObj) {
		var data = [];
		userObj.forEach(function( user ){
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
	// Prices.aggregate([
	// {
	// 	$group: {
 //      _id: "$city",
 //      timestamp: "$timestamp",
 //      count: { $sum: 1 }
 //    }
	// },
	// { $sort: { "timestamp": 1 } },
	// ], function (err, userObj) {
	//   if (err) {
	// 	console.log(err);
	//   } else if (userObj) {
	// 	var data = [];
	// 	userObj.forEach(function( user ){
	// 		data.push(user);
	// 	});
	// 	response.header("Content-Type", "application/json");
	// 	// response.write( returnData );
	// 	response.end(JSON.stringify(data));
	// 	 } else {
	// 	console.log('User not found!');
	// 	response.end("User not found!" );
	//   }
	// });
});

app.get('/sendPush', function(request, response) {

	var returnData = {};
	Prices.aggregate([
		{ $sort: { "timestamp": -1 } },
		{
			$group: {
	      _id: "$city",
	      price : { $first: '$price' },
	      timestamp : { $first: '$timestamp' },
	      city : { $first: '$city' },
	      type : { $first: '$type' },
	      count: { $sum: 1 }
	    }
		},
		{ $sort: { "_id": 1 } }
	], function (err, userObj) {
	  if (err) {
		console.log(err);
	  } else if (userObj) {
	  	console.log( JSON.stringify(userObj) );
			var data = [];
			var completed = 0;
			userObj.forEach(function( user ){

				getGCMIDsByCity( user.city, function( gcmIds ){
					returnData[ user.city ] = gcmIds;
					completed++;
					if( completed >= userObj.length ) {
						response.header("Content-Type", "application/json");
						response.end(JSON.stringify(returnData));
					}
				});
			});

		 } else {
			console.log('User not found!');
			response.end("User not found!" );
	  }
	});

});

app.get('*', function(request, response) {
	//response.redirect("/endpoint");
	response.end("Page Not Found");
});

function getGCMIDsByCity( city, callback ) {
	
	GCM.aggregate([
		{ 
			$match: { 
				"city": city,
				"enable_gcm": "1"
			} 
		}
	], function (err, userObj) {
	  if (err) {
			console.log(err);
	  } 
	  else {
			var gcmIds = [];
			userObj.forEach(function( user ){
				gcmIds.push( user.gcm_id );
			});
			callback( gcmIds );
		}
	});
}