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
		minutes = stringMaker(minutes,'0',(hours)?2:1) +':'; 
		return hours + minutes + stringMaker(seconds,'0',2);
	}
	function intervalVisualUpdate(tabKey) {
		var startTime = tabsHolder[tabKey].videoCurrentTime;
		var endTime = tabsHolder[tabKey].videoTotalTime;
		var cloned = tabsHolder[tabKey].clone;
		// console.log(tabsHolder);
		var cssScrollPosition = startTime/endTime * 100 + '%';
		$( cloned ).find(".selected").stop(true, true).width( cssScrollPosition );
		cloned.getElementsByClassName("control-button")[2].innerHTML = formatTime(startTime) + '/' + formatTime(endTime);
	}

var retrieve = function(){
	chrome.storage.local.get(null, function(items) {
		tabsHolder = items;
	    tabMap = Object.keys(tabsHolder);
	    var template = document.getElementById("template");
	    for(var key=0; key < tabMap.length; key++){
	    	if(tabMap[key] == 'tabs')
	    		continue;
	    	var clone = template.cloneNode(true);
	    	clone.style.display = '';
	    	clone.id = tabMap[key];
	    	clone.getElementsByTagName('')
	    	clone.getElementsByClassName("control-button")[1].innerHTML = items[tabMap[key]].tabTitle;
	    	clone.getElementsByClassName("control-button")[1].title = items[tabMap[key]].tabTitle;
	    	clone.getElementsByClassName("control-button")[2].innerHTML = formatTime(items[tabMap[key]].videoCurrentTime) + '/' + formatTime(items[tabMap[key]].videoTotalTime);
	    	document.getElementById("container").appendChild(clone);

	    	tabsHolder[tabMap[key]].clone = clone;
	    	chrome.tabs.sendMessage(tabsHolder[tabMap[key]].tabId, {action:'checktime',tab:tabMap[key]}, function (response){
	    		tabsHolder[response.tab].videoCurrentTime = response.newTime;
	    		intervalVisualUpdate(response.tab);
			});
			tabsHolder[tabMap[key]].timer = new InvervalTimer(function(tabKey){
				tabsHolder[tabKey].videoCurrentTime += 1;
				intervalVisualUpdate(tabKey);
			}, 1000, tabMap[key]);
			if(!tabsHolder[tabMap[key]].isPlaying){
				tabsHolder[tabMap[key]].timer.toggle();
				$(clone).find('.playPause').toggleClass('Paused');
			}
	    }
	    setTrackListeners();
	});
}

function InvervalTimer(callback, interval, tabKey) {
    var timerId, startTime, remaining = 0;
    var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.toggle = function(){
    	console.log(state);
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
        // callback(tabKey);

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
	var cssScrollPosition = (scrollPosition) * 100 + '%';
	$( volumeScrub ).find(".volume-level").stop(true, true).width( cssScrollPosition );
	$( volumeScrub ).find(".volume-handle").stop(true, true).animate( { left:cssScrollPosition }, 0, "linear", volumeMessageSet(volumeSet)) ;	
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
	// var cssScrollPosition = scrollPosition * 100 + '%';
	// $( positionScrub ).find(".selected").stop(true, true).width( cssScrollPosition );
	jumpToMessageSet(scrollPosition);	
}

var togglePlay = function(id) {
	tabsHolder[id].timer.toggle();
	playMessageSet();
}

var setTrackListeners = function(){
	$("div.volume-bar").mousedown(function(event){
		volumeScrub = event.currentTarget;
		findVolume(event.pageX);
	});
	
	$("div.scroll-bar").mousedown(function(event){
		positionScrub = event.currentTarget;
		var cTab = $(event.currentTarget).parents('.track').attr('id');
		findPosition(event.pageX, cTab);
	});

	$("div.playPause").mousedown(function(event){
		// $(event.currentTarget).toggleClass()
		$(event.currentTarget).toggleClass('Paused');
	
		togglePlay($(event.currentTarget).parents('.track').attr('id'));
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

window.onbeforeunload = function(e) {
  	// Save it using the Chrome extension storage API.
  	alert(2);
	chrome.storage.local.set(tabsHolder, function(){});
};


retrieve();