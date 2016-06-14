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
	if( videoDOMList.length ){
		// var vid = videoDOMList[0];
		// var indicatePlay = function(){
		// 	chrome.runtime.sendMessage({
		// 		action: 'registerTab'
		// 	},
		// 	function(response) {
		// 		console.log(response);
		// 	});
		// };
		// if(vid.autoPlay){
		// 	// indicatePlay();
		// 	console.log("autoplay")
		// }
			
		// // vid.onplaying = indicatePlay();
		register();
		console.log(videoDOMList)
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
	var vid = (videoDOMList)?videoDOMList[0]:null;
	switch(request.action){
		case "jumpTo":
			vid.currentTime = vid.duration * request.value;
			break;
		case "togglePlay":
			if(vid.paused || vid.ended || vid.currentTime <= 0 ){
				vid.play();
			}else{
				vid.pause();
			}
			break;
		case "soundControl":
			console.log("Current "+ vid.volume);
			vid.volume = request.value;
			
			console.log("value "+ request.value);
			console.log("after "+ vid.volume);
			break;
		case "recheck":
			startUpCheck();
			break;			
		default:
			break;	
	}
	// sendResponse();
});

// var hasChange = function(){
// 	console.log("SSSS");
// }
// window.onhashchange = hasChange();

// startUpCheck();
