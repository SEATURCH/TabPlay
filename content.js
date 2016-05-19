// JavaScript source code
//Document already loaded on content script injection
document.onload = function () {
    console.log("ran");
}

var tabs = {};
var tabIds = [];	
var focusedWindowId = undefined;
var currentWindowId = undefined;
var videoDOMList;

var startUpCheck = function(){
	videoDOMList = document.getElementsByTagName("video");
	if( videoDOMList.length || true){
		register();
	}
}

var register = function() {
	chrome.runtime.sendMessage({
		action: 'registerTab'
	},
	function(response) {
		console.log(response);
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(request);
	var vid = videoDOMList[0].play();

	switch(request.action){
		case "jumpTo":
			videoDOMList[0].play();
			break;
		case "togglePlay":
			
			break;
		case "soundControl":
			videoDOMList[0].play();
			break;
		default;
			break;	
	}
	// sendResponse();
});

startUpCheck();