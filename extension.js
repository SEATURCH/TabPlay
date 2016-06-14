var tabsHolder, tabIndex;
var positionScrub, volumeScrub, returnMessage;

var retrieve = function(){
	chrome.storage.local.get(null, function(items) {
		tabsHolder = items;
	    var allKeys = Object.keys(tabsHolder);
	    var template = document.getElementById("template");
	    console.log(items);
	    for(var key=0; key < allKeys.length; key++){
	    	var clone = template.cloneNode(true);
	    	clone.style.display = '';
	    	clone.id = key;
	    	document.getElementsByClassName("control-button")[1].innerHTML = items[key].tabTitle;
			document.getElementById("container").appendChild(clone);
	    }
	    setTrackListeners();
	});
}

var jumpToMessageSet = function(scrollPosition){
	returnMessage = {
		action: "jumpTo",
		value: scrollPosition
	}
}

var playMessageSet = function(){
	returnMessage = {
		action: "togglePlay",
	}
}

var volumeMessageSet = function(volumeLevel){
	returnMessage = {
		action: "soundControl",
		value: volumeLevel
	}
}

var findVolume = function(pageX, setPercent){
		var VOLUME_BAR_WIDTH = $(document).find("div.volume-bar").last().width();
		var HANDLE_WIDTH_RADIUS = $(document).find("div.volume-handle").last().width()/2;
		var VOLUME_BAR_OFFSET = $(document).find("div.volume-bar").last().offset().left;
		var OFFSET = VOLUME_BAR_OFFSET;
		var scrollPosition, volumeSet;
		
	if(!setPercent){
		scrollPosition = (pageX - OFFSET);
		volumeSet = (scrollPosition < 0? 0: scrollPosition > VOLUME_BAR_WIDTH? VOLUME_BAR_WIDTH:scrollPosition)/VOLUME_BAR_WIDTH;
		scrollPosition = volumeSet - HANDLE_WIDTH_RADIUS/VOLUME_BAR_WIDTH;
	}else{
		scrollPosition = pageX/setPercent;
	}
	var cssScrollPosition = Math.floor((scrollPosition) * 100) + '%';
	$( volumeScrub ).find(".volume-level").stop(true, true).width( cssScrollPosition );
	$( volumeScrub ).find(".volume-handle").stop(true, true).animate( { left:cssScrollPosition }, 0, "linear", volumeMessageSet(volumeSet)) ;	
}


var findPosition = function(pageX, byTime) {
		var SCROLL_BAR_WIDTH = $(document).find("div.scroll-bar").last().width();
		var SCROLL_BAR_OFFSET = $(document).find("div.scroll-bar").last().offset().left;
		var OFFSET = SCROLL_BAR_OFFSET;
		var scrollPosition;
	if(!byTime){
		scrollPosition = (pageX - OFFSET);
		scrollPosition = (scrollPosition < 0? 0 : scrollPosition > SCROLL_BAR_WIDTH? SCROLL_BAR_WIDTH:scrollPosition)/SCROLL_BAR_WIDTH;
	}else{
		scrollPosition = pageX/byTime;
	}
	var cssScrollPosition = Math.floor(scrollPosition * 100) + '%';
	$( positionScrub ).find(".selected").stop(true, true).width( cssScrollPosition );
	jumpToMessageSet(scrollPosition);	
}

var setTrackListeners = function(){
	$("div.volume-bar").mousedown(function(event){
		volumeScrub = event.currentTarget;
		findVolume(event.pageX);
	});
	
	$("div.scroll-bar").mousedown(function(event){
		positionScrub = event.currentTarget;
		findPosition(event.pageX);
	});

	$("div.playPause").mousedown(function(event){
		//TODO
		playMessageSet();
	});
	// $("div.volume").mousedown(function(event){
	// 	//TODO
	// 	volumeMessageSet(1);
	// });
	$("div.track").mousedown(function(event){
		tabIndex = event.currentTarget.id;
		console.log(tabIndex);
		return false;
	});
}

$(document).mouseup(function(e){
    //Send Message
    if(returnMessage){
	    chrome.tabs.sendMessage(tabsHolder[tabIndex].tabId, returnMessage, function (){
			console.log("Years");
		});	
		console.log("MessageSent");
	}
	

	//Clean
    positionScrub = null;
    volumeScrub = null;
    tabIndex = null;
    returnMessage = null
    return false;
});

$(document).on('mousemove', function(e){
	if(positionScrub){
		findPosition(e.pageX);
	}else if(volumeScrub){
		findVolume(e.pageX);
	}
	return false;
});


var sendMessage = function(){
	chrome.tabs.sendMessage(0, "any message", function (){
		console.log("Years");
	});	
}



retrieve();