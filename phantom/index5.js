"use strict";
var page = require("webpage").create();
var mainPage = "https://openexchangerates.org/api/latest.json?app_id=713d131688d94d62b6067d12bfff520c";
var addDataInDBPage  = 'http://127.0.0.1:80/addCurrencyPriceData'
init();
function init() {
  console.log("### init ********--- init ---- : " );
  openMainPage();
  // openDetailsPage('/123/Petrol-price-in-Anantapur');
}

function saveToDBServer( data ){
  
  var buildQueryString = '?';
  var dataKeys = Object.keys( data );
  if( dataKeys.length == 0 ){
    return false;
  }
  dataKeys.forEach(function( key ){
    buildQueryString += key + '=' + encodeURIComponent( data[ key ] ) + '&';
  });
  page.open( addDataInDBPage + buildQueryString, function(status){
    console.log( "### +++++++++++++++++++++++++++++++++ : status : " + status + ': dataToSaveLocal[0] ' + addDataInDBPage  );
  if (status !== 'success') {
    setTimeout(function(){saveToDBServer();}, 2000);
  }
  else {
    phantom.exit();
  }
  });
}
 
function openMainPage() {
  console.log("### URL ********--- openPage ---- : " + mainPage );
  page.open( mainPage,function(){
    function checkReadyState() {
      setTimeout(function () {
        var readyState = page.evaluate(function () {
         return document.readyState;
        });
        if ("complete" === readyState) {
         console.log("page.readyState ----------- " + readyState );
         readPageURLs();
        } else {
        checkReadyState();
        }
      }, 1000);
    }
    checkReadyState();
  });
}

page.onLoadFinished = function() {
  console.log("page.onLoadFinished ----------- " + currentPage + page.framesCount + ' | ' + page.framesCount );return false;
};
 
function readPageURLs() {
  console.log( "### +++++++++++++++++++++++++++++++++ : readPageURLs" );
  var result = page.evaluate(function( page ) {
    var returnSet = [];
    var jsonSource = page.plainText;
    return JSON.parse(jsonSource);
  }, page );

  console.log( "### +++++++++++++++++++++++++++++++++ : result : " + JSON.stringify( result ) );
  console.log( " USD : " + result.rates.INR );
  var data = {
    currency : 'USD',
    price : result.rates.INR
  };
  saveToDBServer( data );
}
 
 
 
page.onUrlChanged = function() {
  console.log("page.onUrlChanged");
  currentPage = arguments[0];
  console.log("page.onUrlChanged ----------- " + currentPage );
};
 
page.onConsoleMessage = function() {
    console.log("page.onConsoleMessage");
    printArgs.apply(this, arguments);
};
page.onConsoleMessage = function() {
    console.log("page2.onConsoleMessage");
    printArgs.apply(this, arguments);
};
 
 
// window.alert(msg);
page.onAlert = function() {
    console.log("page.onAlert");
};
 
function printArgs() {
  var i, ilen;
  for (i = 0, ilen = arguments.length; i < ilen; ++i) {
      console.log("    arguments[" + i + "] = " + JSON.stringify(arguments[i]));
  }
}
