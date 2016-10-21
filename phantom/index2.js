"use strict";
var page = require("webpage").create();
var loginURL = "http://www.tnebnet.org/awp/login";
var dataPage = "http://www.tnebnet.org/awp/paymentDetail?execution=e1s1";
var userDataURL  = 'http://localhost:8080/getUsers'
var addUserDataURL  = 'http://localhost:8080/addBillData'
var currentPage = null;
var allowAfterInvalidLogin = false;
var userData = [];
var resultSet = [];
var currentUser = {};
var interval = setInterval(init, 1000 * 60 * 60);
openGetUserDataPage();
function init() {
  var date = new Date();
  if( date.getHours() == 14 ) {
    openGetUserDataPage();
  }
  
}


function readUserData(){
  console.log( "### +++++++++++++++++++++++++++++++++ : readUserData" );
  var returnData = page.evaluate(function() {
      console.log( document.querySelector("body pre").textContent );
      return document.querySelector("body pre").textContent;
  });
  userData = JSON.parse( returnData );
  openLoginPage();
  return returnData;
}

function readPaymentData() {
  console.log( "### +++++++++++++++++++++++++++++++++ : readPaymentData" );
  var result = page.evaluate(function( currentUser ) {
    var rowLength = document.querySelector("table[role='grid'] tbody").rows.length;
    var date = new Date();
    // console.log("+++++++++++++++++++++++ rowLength : " + JSON.stringify( rowLength ) );
    var returnData = [];
    for (var i = 0; i < rowLength; i++) {
      var data = {};
      data['number'] = document.querySelector("table[role='grid'] tbody").rows[ i ].cells[ 0 ].textContent;
      data['name'] = document.querySelector("table[role='grid'] tbody").rows[ i ].cells[ 1 ].textContent;
      data['address'] = document.querySelector("table[role='grid'] tbody").rows[ i ].cells[ 2 ].textContent;
      data['billAmount'] = document.querySelector("table[role='grid'] tbody").rows[ i ].cells[ 3 ].textContent;
      data['dueDate'] = document.querySelector("table[role='grid'] tbody").rows[ i ].cells[ 4 ].textContent;
      data['id'] = currentUser._id;
      data['username'] = currentUser.username;

      data['timestamp'] = date.getTime();
      // console.log("+++++++++++++++++++++++ data : " + JSON.stringify( data ) );
      returnData.push( data );
    }
    // console.log("+++++++++++++++++++++++ returnData : " + JSON.stringify( returnData ) );
    return returnData;
  }, currentUser );
  resultSet = resultSet.concat( result );
  console.log("+++++++++++++++++++++++ result : " + JSON.stringify( result ) );
  openLoginPage();
}

function performLogin(){
  console.log( "### +++++++++++++++++++++++++++++++++ : performLogin" );
  if( userData.length == 0 ) {
    console.log( "### +++++++++++++++++++++++++++++++++ : No User data" );
    console.log( "### +++++++++++++++++++++++++++++++++ : Result" + JSON.stringify( resultSet ) );
    openAddBillDataPage();
    return false;
  }
  var username = userData[ 0 ].username;
  var password = userData[ 0 ].password;
  console.log( "### +++++++++++++++++++++++++++++++++ : username : " + username );
  console.log( "### +++++++++++++++++++++++++++++++++ : password : " + password );
  console.log( "### +++++++++++++++++++++++++++++++++ : allowAfterInvalidLogin : " + allowAfterInvalidLogin );
  var returnData = page.evaluate(function( username, password, allowAfterInvalidLogin ) {
      if(document.querySelector("#login b span[title='Click here']") && allowAfterInvalidLogin == false ){
        return 'invalid-login';
      }
      allowAfterInvalidLogin = false;
      var ev = document.createEvent("MouseEvents");
      ev.initEvent("click", true, true);
      document.getElementById("userName").value = username;
      document.getElementById("password").value = password;
      document.querySelector('input[type="submit"][name="submit"]').dispatchEvent(ev);
      return true;
  }, username, password, allowAfterInvalidLogin );
  
  if( returnData == 'invalid-login' ) {
    console.log("### Invalid Login ********---  ---- : " );
    allowAfterInvalidLogin = true;
    // userData.splice( 0, 1 );
    performLogin();
  }
  if( returnData == true ) {
    allowAfterInvalidLogin = false;
    currentUser = userData[ 0 ];
    userData.splice( 0, 1 );
  }
}

function openLoginPage() {
  console.log("### URL ********--- openPage ---- : " + loginURL );
  page.open( loginURL );
}

function openGetUserDataPage() {
  console.log("### URL ********--- openPage ---- : " + userDataURL );
  page.open( userDataURL );
}

function openAddBillDataPage() {
  console.log("### URL ********--- openPage ---- : " + addUserDataURL );
  if( resultSet.length == 0 ) {
    console.log( "### +++++++++++++++++++++++++++++++++ : No User data" );
    console.log( "### +++++++++++++++++++++++++++++++++ : Result" + JSON.stringify( resultSet ) );
    phantom.exit();
    return false;

  }
  var buildQueryString = '?';
  var dataKeys = Object.keys( resultSet[ 0 ] );
  dataKeys.forEach(function( key ){
    buildQueryString += key + '=' + encodeURIComponent( resultSet[ 0 ][ key ] ) + '&';
  });
  console.log( "### +++++++++++++++++++++++++++++++++ : buildQueryString : " + JSON.stringify( buildQueryString ) );
  page.open( addUserDataURL + buildQueryString );
  resultSet.splice( 0, 1 );
}

page.onLoadFinished = function() {

  console.log("page.onLoadFinished ----------- " + currentPage );
  if( currentPage == loginURL || currentPage.indexOf( loginURL ) > -1 ) {
    performLogin();
  }
  if( currentPage == dataPage ) {
    readPaymentData();
  }
  if( currentPage == userDataURL || currentPage.indexOf( userDataURL ) > -1 ) {
    readUserData();
  }
  if( currentPage == addUserDataURL || currentPage.indexOf( addUserDataURL ) > -1 ) {
    openAddBillDataPage();
  }
};

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





