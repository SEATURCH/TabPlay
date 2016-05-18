var positionScrub;

var SCROLL_BAR_WIDTH = $(document).find("div.scroll-bar").first().width();

var HANDLE_WIDTH = $(document).find("div.scroll-handle").first().width();
var CONTAINER_OFFSET = document.getElementById("container").offsetLeft;
var SCROLL_BAR_OFFSET = document.getElementsByClassName("scroll-bar")[0].offsetLeft;
var OFFSET = CONTAINER_OFFSET + SCROLL_BAR_OFFSET + HANDLE_WIDTH/2;


var retrieve = function(){
	console.log("Retrieve");
	console.log(chrome);
	chrome.storage.local.get(null, function(items) {
	    var allKeys = Object.keys(items);
	    console.log(allKeys);
	});
}
var jumpTo = function(){
	// console.log("Progress jumped to");
}
	
var findPosition = function(pageX){
	var scrollPosition = (pageX - OFFSET);
	scrollPosition = scrollPosition < 0? 0 : scrollPosition > SCROLL_BAR_WIDTH-HANDLE_WIDTH/2? SCROLL_BAR_WIDTH-HANDLE_WIDTH:scrollPosition;
	scrollPosition = Math.floor(scrollPosition/SCROLL_BAR_WIDTH * 100) + '%';
	$( positionScrub ).find(".scroll-handle").stop(true, true).animate( { left:scrollPosition }, 0, "linear", jumpTo()) ;	
}

$("div.scroll-bar").mousedown(function(event){
	positionScrub = event.currentTarget;
	findPosition(event.pageX);
	return false;
});

$(document).mouseup(function(e){
    positionScrub = null;
    return false;
});

$(document).on('mousemove', function(e){
	if(positionScrub){
		findPosition(e.pageX);
	}
	return false;
});




retrieve();