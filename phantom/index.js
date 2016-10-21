"use strict";
var sys = require("system"),
    page = require("webpage").create(),
    page2 = require("webpage").create(),
    logResources = false,
    step1url = "http://bhashsms.com/loginlanding.php";
var step2url = "http://bhashsms.com/pushsms/iframe/singlesms.php";
var step3url = "http://bhashsms.com/pushsms/iframe/singlesms.php#";
var localurl = "http://127.0.0.1/test/testphantom.php";
var msgSuccessURL = "http://bhashsms.com/pushsms/iframe/msgsentsuccess.php";
var to = null;
var msg = null;
var initialLoad = false;
getData();
initLog();
if (sys.args.length > 1 && sys.args[1] === "-v") {
    logResources = true;
}

function printArgs() {
    var i, ilen;
    for (i = 0, ilen = arguments.length; i < ilen; ++i) {
        console.log("    arguments[" + i + "] = " + JSON.stringify(arguments[i]));
    }
    console.log("");
}
var loginFinished = false,clickPushss=false,currentPage='login';
////////////////////////////////////////////////////////////////////////////////

// page.onInitialized = function() {
//     console.log("page.onInitialized");
//     printArgs.apply(this, arguments);
// };
// page.onLoadStarted = function() {
//     console.log("page.onLoadStarted");
//     printArgs.apply(this, arguments);
// };
page.onLoadFinished = function() {
    console.log("page.onLoadFinished" + loginFinished+ "+++++"+currentPage);
    printArgs.apply(this, arguments);
    if(loginFinished === false){
      onLoadFinishedExecute();
    }
    
    if(currentPage == step2url || currentPage == step3url ) {
      secondPage(true);
    }
    if(currentPage.indexOf(msgSuccessURL) > -1){
      initialLoad = false;
      getData();
      clickPush();
    }
};
page.onUrlChanged = function() {
    console.log("page.onUrlChanged");
    printArgs.apply(this, arguments);
    currentPage = arguments[0];
    if( currentPage == 'http://bhashsms.com/index.php'){
      clickPush();
    }
};
// page.onNavigationRequested = function() {
//     console.log("page.onNavigationRequested");
//     printArgs.apply(this, arguments);
// };
// page.onRepaintRequested = function() {
//     console.log("page.onRepaintRequested");
//     printArgs.apply(this, arguments);
// };

// if (logResources === true) {
//     page.onResourceRequested = function() {
//         console.log("page.onResourceRequested");
//         printArgs.apply(this, arguments);
//     };
//     page.onResourceReceived = function() {
//         console.log("page.onResourceReceived");
//         printArgs.apply(this, arguments);
//     };
// }

// page.onClosing = function() {
//     console.log("page.onClosing");
//     printArgs.apply(this, arguments);
// };

// window.console.log(msg);
page.onConsoleMessage = function() {
    console.log("page.onConsoleMessage");
    printArgs.apply(this, arguments);
};
page2.onConsoleMessage = function() {
    console.log("page2.onConsoleMessage");
    printArgs.apply(this, arguments);
};


// window.alert(msg);
page.onAlert = function() {
    console.log("page.onAlert");
    printArgs.apply(this, arguments);
};
// // var confirmed = window.confirm(msg);
// page.onConfirm = function() {
//     console.log("page.onConfirm");
//     printArgs.apply(this, arguments);
// };
// // var user_value = window.prompt(msg, default_value);
// page.onPrompt = function() {
//     console.log("page.onPrompt");
//     printArgs.apply(this, arguments);
// };

////////////////////////////////////////////////////////////////////////////////

function initLog() {
    console.log("");
    console.log("### STEP 1: Load '" + step1url + "'");
    page.open(step1url);
};
function getData(){
    console.log("");
    console.log("### STEP Separe: Load '" + localurl + "'");
    page2.open(localurl);
};
page2.onLoadFinished = function() {
    // console.log("page2.onLoadFinished  ---------------- Page2");
   getSendItem();
   // console.log("document.querySelector('to').length--------dddddddddd----------------"+to);
    // console.log("document.querySelector('msg').length-------ddddddddddd-----------------"+msg);
};
// setTimeout(function() {
//     console.log("");
//     console.log("### STEP 2: Load '" + step2url + "' (load same URL plus FRAGMENT)");
//     page.open(step2url);
// }, 5000);

function onLoadFinishedExecute(){
      console.log("");
      loginFinished = true;
    console.log("### +++++++++++++++++++++++++++++++++" + loginFinished);

    page.evaluate(function() {
        var ev = document.createEvent("MouseEvents");
        ev.initEvent("click", true, true);
        document.getElementById("username").value = "demotest";
        document.getElementById("password").value = "1234567";
        console.log("Username------------------------"+document.getElementById("username").value);
        console.log("Length------------------------"+document.querySelector('input[type="submit"][name="submituser"]').value);
        document.querySelector('input[type="submit"][name="submituser"]').dispatchEvent(ev);
        
    });
}

function clickPush(){
      console.log("");
      clickPushss = true;
    console.log("### +++++++++++++++++++++++++clickPush++++++++" + loginFinished);

      console.log("");
      console.log("### STEP 2: Load '" + step2url + "'");
      page.open(step2url);
}
function secondPage(initialArg){
    console.log("### +++++++++++++++++++++++++++++++++" + currentPage);

    var retunData = page.evaluate(function(to, msg, initialArg) {
      console.log("document.querySelector('center font').length------------------------"+document.querySelector("center > font"));
      if(document.querySelector("center > font") && initialArg == true){
        console.log("### +++++++++++++++++++++++++++++++++" + document.querySelector('center > font').innerHTML); 
        return 'getData';
      }
      console.log("groups------------------------"+document.getElementById("groups"));
      
      if(!document.getElementById("groups") || document.getElementById("groups").length == 0){
        console.log("### +++++++++++++++++++++++++++++++++ INVALID LOGIN");
        
        return 'initLog'; 
      }

      document.getElementById("groups").value = "demo";
      document.getElementById("sport3").value = "normal";
      document.getElementById("numbers").value = to;
      document.getElementById("message1").value = msg;
      console.log("document.querySelector('to').length------------------------"+to);
      console.log("document.querySelector('msg').length------------------------"+msg);
      var ev = document.createEvent("MouseEvents");
      ev.initEvent("click", true, true);
      document.querySelector('input[type="submit"][name="submitc"]').dispatchEvent(ev);
    },to, msg, initialArg);
    if(initialLoad == false || retunData == "getData")
      getData();
    initialLoad = true;
    if(retunData == "initLog"){
      loginFinished = false;
      initLog();
    }
    
    
    console.log("last------------------------"+to);
    console.log("last------------------------"+msg);
}
function getSendItem(){
    console.log("### +++++++++++++++++++++++++++++++++");

    var sendItem = page2.evaluate(function(to , msg) {
      console.log("document.querySelector('to').length------------------------"+document.querySelector("to"));
      console.log("document.querySelector('msg').length------------------------"+document.querySelector("msg"));
      return {
        to : document.querySelector("to").textContent,
        msg : document.querySelector("msg").textContent
      };
    });
    console.log("sendItem------------------------"+JSON.stringify(sendItem));
    if(initialLoad == true){
      if(to == 'null' || to == sendItem.to) {
        setTimeout(function(){
          getData();
        }, 120000);
        return;
      }
      else {
        to = sendItem.to;
        msg = sendItem.msg;
        secondPage(false);
      }
    }
    
}
