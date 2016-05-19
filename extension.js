var tabsHolder, tabIndex;
var positionScrub, returnMessage;

var retrieve = function(){
	chrome.storage.local.get(null, function(items) {
		tabsHolder = items;
	    var allKeys = Object.keys(tabsHolder);
	    var template = document.getElementById("template");
	    for(var key=0; key < allKeys.length; key++){
	    	var clone = template.cloneNode(true);
	    	clone.style.display = '';
	    	clone.id = key;
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

var findPosition = function(pageX, byTime){
		var SCROLL_BAR_WIDTH = $(document).find("div.scroll-bar").last().width();
		var HANDLE_WIDTH = $(document).find("div.scroll-handle").last().width();
		var SCROLL_BAR_OFFSET = $(document).find("div.scroll-bar").last().offset().left;
		var OFFSET = SCROLL_BAR_OFFSET;
		var scrollPosition;
	if(!byTime){
		scrollPosition = (pageX - OFFSET);
		scrollPosition = (scrollPosition < 0? 0 : scrollPosition > SCROLL_BAR_WIDTH? SCROLL_BAR_WIDTH:scrollPosition)/SCROLL_BAR_WIDTH;
	}else{
		scrollPosition = pageX/byTime;
	}
	var cssScrollPosition = Math.floor((scrollPosition - HANDLE_WIDTH/SCROLL_BAR_WIDTH) * 100) + '%';
	$( positionScrub ).find(".scroll-handle").stop(true, true).animate( { left:cssScrollPosition }, 0, "linear", jumpToMessageSet(scrollPosition)) ;	
}

var setTrackListeners = function(){
	$("div.scroll-bar").mousedown(function(event){
		positionScrub = event.currentTarget;
		findPosition(event.pageX);
	});
	$("button.playPause").mousedown(function(event){
		//TODO
		playMessageSet();
	});
	$("button.volume").mousedown(function(event){
		//TODO
		volumeMessageSet(1);
	});
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
    tabIndex = null;
    returnMessage = null
    return false;
});

$(document).on('mousemove', function(e){
	if(positionScrub){
		findPosition(e.pageX);
	}
	return false;
});


var sendMessage = function(){
	chrome.tabs.sendMessage(0, "any message", function (){
		console.log("Years");
	});	
}



retrieve();