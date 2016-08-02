// JavaScript source code
//Document already loaded on content script injection
document.onload = function () {
    console.log("ran");
}

var registered = false;;
var tabIds = [];	
var focusedWindowId = undefined;
var currentWindowId = undefined;
var videoDOMList;

var startUpCheck = function(){
	videoDOMList = document.getElementsByTagName("video");
	if( videoDOMList.length ){
		for(var i=0; i < videoDOMList.length; i++ ){
			
			// videoDOMList[i].addEventListener("playing", function(event){
			//     register(event.target);
			//     registered = true;
			// });
			videoDOMList[i].addEventListener("playing", function(event){
			    register(event.target);
			    registered = true;
			});
			// videoDOMList[i].onplay = function(event){
			// 	console.log("OKOK")
			//     register(event.target);
			//     registered = true;
			// };
			videoDOMList[i].onpause  = function(event){
				console.log(event.target.currentTime)
			    updateStatus(event.target);
			};
		}

	}
}

var updateStatus = function(targetElement) {
	if(!targetElement.duration)
		return;
	
	chrome.runtime.sendMessage({
		action:"updateStatus",
		isPlaying: false
	},
	function(response) {
		console.log("RegisteredPause");
	});
}

var register = function(targetElement) {
	if(!targetElement.duration)
		return;
	
	chrome.runtime.sendMessage({
		action: 'registerTab',
		totalTime: targetElement.duration,
		currentTime: targetElement.currentTime,
		isPlaying: true
	},
	function(response) {
		console.log("RegisteredPlay");
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
			vid.volume = request.value;
			break;
		case "recheck":
			startUpCheck();
			break;
		case "checktime":
			sendResponse({
				newTime: vid.currentTime,
				tab:request.tab
			});
			break;			
		default:
			break;	
	}
});

// var hasChange = function(){
// 	console.log("SSSS");
// }
// window.onhashchange = hasChange();

// startUpCheck();
