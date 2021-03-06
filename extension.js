var tabsHolder, tabIndex, tabMap;
var positionScrub, volumeScrub, returnMessage;

	function formatTime(timeRaw) {
		var time = timeRaw;
		var hours = Math.floor(time / 3600);
		var minutes = Math.floor((time - 3600*hours)/60);
		var seconds = Math.floor(time - 3600*hours - 60*minutes);
		function stringMaker(string,pad,length){
			return (new Array(length+1).join(pad)+string).slice(-length);	
		}
		hours = (hours)? stringMaker(hours,'0',Math.floor(Math.log(hours))) +':' : '';
		minutes = stringMaker(minutes,'0',(minutes >= 10 || hours)?2:1) +':'; 
		return hours + minutes + stringMaker(seconds,'0',2);
	}
	function intervalVisualUpdate(tabKey) {
		var startTime = tabsHolder[tabKey].videoCurrentTime;
		var endTime = tabsHolder[tabKey].videoTotalTime;
		var cloned = tabsHolder[tabKey].clone;
		var cssScrollPosition = startTime/endTime * 100 + '%';
		$( cloned ).find(".selected").stop(true, true).width( cssScrollPosition );
		cloned.getElementsByClassName("control-button")[3].innerHTML = formatTime(startTime) + '/' + formatTime(endTime);
	}
	function volumeVisualUpdate(tabKey) {
		var VOLUME_BAR_WIDTH = $(document).find("div.volume-bar").last().width();
		var HANDLE_WIDTH_RADIUS = $(document).find("div.volume-handle").last().width()/2;
		var handleOffset = HANDLE_WIDTH_RADIUS/VOLUME_BAR_WIDTH;

		var currentVolume = tabsHolder[tabKey].videoCurrentVolume;
		var cloned = tabsHolder[tabKey].clone;

		var cssScrollPosition = (currentVolume - handleOffset) * 100 + '%';
		$( cloned ).find(".volume-level").stop(true, true).width( cssScrollPosition );
		$( cloned ).find(".volume-handle").stop(true, true).animate( { left:cssScrollPosition }, 0, "linear");
	}
var retrieve = function(){
	chrome.storage.local.get(null, function(items) {
		tabsHolder = items;
	    tabMap = Object.keys(tabsHolder);
	    var template = document.getElementById("template");
	    for(var key=0; key < tabMap.length; key++){
	    	var clone = template.cloneNode(true);
	    	clone.style.display = '';
	    	clone.id = tabMap[key];
	    	clone.getElementsByTagName('')
	    	clone.getElementsByClassName("control-button")[2].innerHTML = items[tabMap[key]].tabTitle;
	    	clone.getElementsByClassName("control-button")[2].title = items[tabMap[key]].tabTitle;
	    	clone.getElementsByClassName("control-button")[3].innerHTML = formatTime(items[tabMap[key]].videoCurrentTime) + '/' + formatTime(items[tabMap[key]].videoTotalTime);
	    	document.getElementById("container").appendChild(clone);

	    	tabsHolder[tabMap[key]].clone = clone;
	    	chrome.tabs.sendMessage(tabsHolder[tabMap[key]].tabId, {action:'checktime',tab:tabMap[key]}, function (response){
	    		tabsHolder[response.tab].videoCurrentTime = response.newTime;
	    		volumeVisualUpdate(response.tab);
	    		intervalVisualUpdate(response.tab);
			});
			
			tabsHolder[tabMap[key]].timer = new InvervalTimer(function(tabKey){
				tabsHolder[tabKey].videoCurrentTime += 1;
				if(tabsHolder[tabKey].videoCurrentTime >= tabsHolder[tabKey].videoTotalTime) {
					if (tabsHolder[tabKey].isLoop){
						tabsHolder[tabKey].videoCurrentTime = 0;
					} else {
						tabsHolder[tabKey].videoCurrentTime = tabsHolder[tabKey].videoTotalTime;
						tabsHolder[tabKey].timer.toggle();
						$(tabsHolder[tabKey].clone).find('.playPause').toggleClass('Paused');
					}
				}
				intervalVisualUpdate(tabKey);
			}, 1000, tabMap[key]);
		
			if(!tabsHolder[tabMap[key]].isPlaying){
				tabsHolder[tabMap[key]].timer.toggle();
				$(clone).find('.playPause').toggleClass('Paused');
			}

			if(tabsHolder[tabMap[key]].isLoop){
				$(clone).find('.repeat').toggleClass('repeatOn');
			}
	    }
	    setTrackListeners();
	});
}

function InvervalTimer(callback, interval, tabKey) {
    var timerId, startTime, remaining = 0;
    var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.toggle = function(){
    	switch(state){
    		case 1:
	    		this.pause();
	    		break;
	    	case 2:
	    		this.resume();
	    	default:
	    		break;
    	}
    	
    }
    this.pause = function () {
        if (state != 1) return;

        remaining = interval - (new Date() - startTime);
        window.clearInterval(timerId);
        state = 2;
    };

    this.resume = function () {
        if (state != 2) return;

        state = 3;
        window.setTimeout(this.timeoutCallback, remaining);
    };

    this.timeoutCallback = function () {
        if (state != 3) return;

        startTime = new Date();
        timerId = window.setInterval(callback, interval, tabKey);
        state = 1;
    };

    startTime = new Date();
    timerId = window.setInterval(callback, interval, tabKey);
    state = 1;
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

var repeatMessageSet = function(){
	returnMessage = {
		action: "toggleRepeat",
	}
}

var volumeMessageSet = function(volumeLevel){
	returnMessage = {
		action: "soundControl",
		value: volumeLevel
	}
}

var findVolume = function(pageX, cTab){
	var VOLUME_BAR_WIDTH = $(document).find("div.volume-bar").last().width();
	var HANDLE_WIDTH_RADIUS = $(document).find("div.volume-handle").last().width()/2;
	var VOLUME_BAR_OFFSET = $(document).find("div.volume-bar").last().offset().left;
	var OFFSET = VOLUME_BAR_OFFSET;
	var scrollPosition, volumeSet;
	
	scrollPosition = (pageX - OFFSET);
	volumeSet = (scrollPosition < 0? 0: scrollPosition > VOLUME_BAR_WIDTH? VOLUME_BAR_WIDTH:scrollPosition)/VOLUME_BAR_WIDTH;
	tabsHolder[cTab].videoCurrentVolume = volumeSet;

	volumeVisualUpdate(cTab);
	volumeMessageSet(volumeSet)
}


var findPosition = function(pageX, cTab) {
	var SCROLL_BAR_WIDTH = $(document).find("div.scroll-bar").last().width();
	var SCROLL_BAR_OFFSET = $(document).find("div.scroll-bar").last().offset().left;
	var OFFSET = SCROLL_BAR_OFFSET;
	var scrollPosition;

	scrollPosition = (pageX - OFFSET);
	scrollPosition = (scrollPosition < 0? 0 : scrollPosition > SCROLL_BAR_WIDTH? SCROLL_BAR_WIDTH:scrollPosition)/SCROLL_BAR_WIDTH;
	tabsHolder[cTab].videoCurrentTime = tabsHolder[cTab].videoTotalTime * scrollPosition;

	intervalVisualUpdate(cTab);
	jumpToMessageSet(scrollPosition);	
}

var togglePlay = function(id) {
	tabsHolder[id].timer.toggle();
	playMessageSet();
}

var toggleRepeat = function(id) {
	// tabsHolder[id].timer.toggle();
	tabsHolder[id].isLoop = !tabsHolder[id].isLoop;
	repeatMessageSet();
}

var setTrackListeners = function(){
	$("div.volume-bar").mousedown(function(event){
		volumeScrub = event.currentTarget;
		var cTab = $(event.currentTarget).parents('.track').attr('id');
		findVolume(event.pageX, cTab);
	});
	
	$("div.scroll-bar").mousedown(function(event){
		positionScrub = event.currentTarget;
		var cTab = $(event.currentTarget).parents('.track').attr('id');
		findPosition(event.pageX, cTab);
	});

	$("div.playPause").mousedown(function(event){
		$(event.currentTarget).toggleClass('Paused');
		togglePlay($(event.currentTarget).parents('.track').attr('id'));
	});

	$("div.repeat").mousedown(function(event){
		$(event.currentTarget).toggleClass('repeatOn');
		toggleRepeat($(event.currentTarget).parents('.track').attr('id'));
	});

	$("div.track").mousedown(function(event){
		tabIndex = event.currentTarget.id;
		return false;
	});
}

$(document).mouseup(function(e){
    //Send Message
    if(returnMessage){
	    chrome.tabs.sendMessage(tabsHolder[tabIndex].tabId, returnMessage, function (){});	
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
		var cTab = $(positionScrub).parents('.track').attr('id');
		findPosition(event.pageX, cTab);
	}else if(volumeScrub){
		var cTab = $(volumeScrub).parents('.track').attr('id');
		findVolume(e.pageX, cTab);
	}
	return false;
});

window.onbeforeunload = function(e) {
  	// Save it using the Chrome extension storage API.
  	alert(2);
	chrome.storage.local.set(tabsHolder, function(){});
};


retrieve();