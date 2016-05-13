// JavaScript source code
//Document already loaded on content script injection
document.onload = function () {
    console.log("ran");
}

var tabs = {};
var tabIds = [];	
var focusedWindowId = undefined;
var currentWindowId = undefined;

var startUp = function(){
	console.log("ran");
	console.log(chrome);
}

chrome.runtime.sendMessage({
	action: 'createWindow',
	url: 'http://google.com'
},
function(createdWindow) {
	console.log(createdWindow);
});

startUp();