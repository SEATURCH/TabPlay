// JavaScript source code
//Document already loaded on content script injection

var registered = false;;
var tabIds = [];	
var focusedWindowId = undefined;
var currentWindowId = undefined;
var videoDOMList;

var startUpCheck = function(){
	videoDOMList = document.getElementsByTagName("video");
	if( videoDOMList.length ){
		for(var i=0; i < videoDOMList.length; i++ ){
			videoDOMList[i].addEventListener("playing", function(event){
			    register(event.target);
			    registered = true;
			});
			videoDOMList[i].onpause  = function(event){
			    updateStatus(event.target);
			};
			videoDOMList[i].onended  = function(event){
			    updateStatus(event.target);
			};
			videoDOMList[i].onvolumechange  = function(event){
				var newVolume = (event.target.muted)? 'muted' : event.target.volume;
				volumeUpdate(event.target, newVolume);
			};
		}

	}
}

var volumeUpdate = function(targetElement, newVolume) {
	if(!targetElement.duration)
		return;
	console.log("Volume Content");
	chrome.runtime.sendMessage({
		action:"volumeUpdate",
		newVolume: newVolume
	},
	function(response) {});
}

var updateStatus = function(targetElement) {
	if(!targetElement.duration)
		return;
	
	chrome.runtime.sendMessage({
		action:"updateStatus",
		isPlaying: false
	},
	function(response) {});
}

var loopUpdate = function(loopBoolean) {
	chrome.runtime.sendMessage({
		action:"loopUpdate",
		loopBoolean: loopBoolean
	},
	function(response) {});
}

var register = function(targetElement) {
	if(!targetElement.duration)
		return;
	
	chrome.runtime.sendMessage({
		action: 'registerTab',
		totalTime: targetElement.duration,
		currentTime: targetElement.currentTime,
		currentVolume: targetElement.volume,
		isLoop: targetElement.loop,
		isPlaying: true
	},
	function(response) {});
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
		case "toggleRepeat":
			vid.loop = !vid.loop;
			loopUpdate(vid.loop);
			break;	
		case "soundControl":
			vid.muted = false;
			vid.volume = request.value;
			break;
		case "recheck":
			startUpCheck();
			break;
		case "checktime":
			sendResponse({
				newTime: vid.currentTime,
				newVolume: vid.volume,
				tab:request.tab
			});
			break;			
		default:
			break;	
	}
});
