"use strict";
var page = require("webpage").create();
var pageTemp = require("webpage").create();
var mainPage = "http://www.mypetrolprice.com/petrol-price-in-india.aspx";
var mainURL = "http://www.mypetrolprice.com";
var addDataInDBPage  = 'http://localhost:8080/addPriceData'
var currentUsingPage = null;
var currentStateIndex = 0;
var currentCityIndex = 0;
var allPageDetails = [];
var currentPage = null;
var totalStateLength = 0;
init();
function init() {
  console.log("### init ********--- init ---- : " );
  openMainPage();
  // openDetailsPage('/123/Petrol-price-in-Anantapur');
}

function insertDataInDB( data ) {

  if( data.length == 0 ) {
    console.log( "### +++++++++++++++++++++++++++++++++ : No User data to save" );
    console.log( "### +++++++++++++++++++++++++++++++++ : data : " + JSON.stringify( data ) );
    return false;
  }
  var buildQueryString = '?';
  var dataKeys = Object.keys( data );
  dataKeys.forEach(function( key ){
    buildQueryString += key + '=' + encodeURIComponent( data[ key ] ) + '&';
  });
  console.log( "### +++++++++++++++++++++++++++++++++ : buildQueryString : " + JSON.stringify( buildQueryString ) );
  pageTemp.open( addDataInDBPage + buildQueryString );
}

function getDetails() {
  if( allPageDetails.length < ( currentStateIndex + 1 ) ) {
    console.log( "### +++++++++++++++++++++++++++++++++ : Exceeeeeeeeeeeds" );
    console.log( "### +++++++++++++++++++++++++++++++++ : Result" + JSON.stringify( allPageDetails ) );
    return false;
  }
  if( allPageDetails.length == 0 ) {
    console.log( "### +++++++++++++++++++++++++++++++++ : No User data" );
    console.log( "### +++++++++++++++++++++++++++++++++ : Result" + JSON.stringify( allPageDetails ) );
    return false;
  }
  if( allPageDetails[ currentStateIndex ] ) {
    if( allPageDetails[ currentStateIndex ].cities[ currentCityIndex ] ) {
      var link = allPageDetails[ currentStateIndex ].cities[ currentCityIndex ].link;
      openDetailsPage( link );
      
    }
    else {
      currentStateIndex++;
      getDetails();
      return false;
    }
  }
  else {

  }
  
}

function openDetailsPage( subUrl ) {
  console.log("### URL ********--- openPage ---- : " + mainURL + subUrl );
  page.open( mainURL + subUrl, function(){
    getDetailsFromPage();
  });
}

function openMainPage() {
  console.log("### URL ********--- openPage ---- : " + mainPage );
  page.open( mainPage, function(){
    console.log("page.load Completed ----------- " );
    readPageURLs();
  });
}

page.onLoadFinished = function() {
  console.log("page.onLoadFinished ----------- " + currentPage );return false;
  // console.log("page.onLoadFinished ----------- " + mainURL + allPageDetails[ currentStateIndex ].cities[ currentCityIndex ].link );
  if( currentPage == mainPage || currentPage.indexOf( mainPage ) > -1 ) {
    readPageURLs();
  }
  else {
    var pageUr = mainURL + allPageDetails[ currentStateIndex ].cities[ currentCityIndex ].link;
    console.log("page.onLoadFinished ----------- pageUr : " + pageUr );
    console.log("page.onLoadFinished ----------- pageUr : " + decodeURIComponent( currentPage ) );
   if( decodeURIComponent( currentPage ) == pageUr || pageUr.indexOf( decodeURIComponent( pageUr ) ) > -1 ) {
    getDetailsFromPage();
   }
  }
};

function getDetailsFromPage() {
  console.log( "### +++++++++++++++++++++++++++++++++ : getDetailsFromPage" );
  var result = page.evaluate(function() {
    var resultset = {};
    var priceTxt = document.querySelector("table.DDGridView span.price").textContent;
    var priceChange = document.querySelector("table.DDGridView span.alignment").textContent;

    var startIndex = priceTxt.indexOf("=") + 1;
    var endIndex = priceTxt.indexOf("Rs");
    resultset.price = priceTxt.substring(startIndex, endIndex).trim();
    startIndex = priceChange.indexOf(":") + 1;
    endIndex = priceChange.indexOf(")");
    resultset.recentPriceChange = priceChange.substring(startIndex, endIndex).trim();

    // console.log("returnSet :::::::::: " + JSON.stringify( returnSet ));
    return resultset;
  });
  console.log( 'priceTxt ::::::::::::::::::::: ' + JSON.stringify( result ));
  allPageDetails[ currentStateIndex ].cities[ currentCityIndex ].price = result.price;
  allPageDetails[ currentStateIndex ].cities[ currentCityIndex ].recentPriceChange = result.recentPriceChange;
  var dataToSave = {
    state : allPageDetails[ currentStateIndex ].name,
    city : allPageDetails[ currentStateIndex ].cities[ currentCityIndex ].name,
    price : allPageDetails[ currentStateIndex ].cities[ currentCityIndex ].price,
    recentPriceChange : allPageDetails[ currentStateIndex ].cities[ currentCityIndex ].recentPriceChange
  };
  insertDataInDB( dataToSave );
  currentCityIndex++;
  getDetails();
}

function readPageURLs() {
  console.log( "### +++++++++++++++++++++++++++++++++ : readPageURLs" );
  var result = page.evaluate(function() {
    var returnSet = [];

    var states = document.querySelectorAll("h3.h3State");
    // console.log("states.length" + states.length);
    for (var i = 0; i < 5; i++) {
      var state = {};
      state.name = states[ i ].textContent.replace("Petrol Price in", "").trim();
      var innerElement = states[ i ].nextElementSibling.querySelectorAll('div table ul li');
      // console.log('state.name  :::::::::::::: ' + state.name);
      state.cities = [];
      for (var j = 0; j < innerElement.length; j++) {
        var city = {};
        city.name = innerElement[ j ].querySelector("a").textContent.replace("Petrol Price", "").trim();
        city.link = innerElement[ j ].querySelector("a").getAttribute("href");
        state.cities.push( city );
        // console.log("Name :::::::" + innerElement[ j ].querySelector("a").textContent);
      }
      returnSet.push( state );
    }
    
    // console.log("returnSet :::::::::: " + JSON.stringify( returnSet ));
    return returnSet;
  });
  console.log( 'result ::::::::::::::::::::: ' + JSON.stringify( result ));
  if( result.length > 0 ) {
    allPageDetails = result;
    getDetails();
  }
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