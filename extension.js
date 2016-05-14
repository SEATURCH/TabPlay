var retrieve = function(){
	console.log("Retrieve");
	console.log(chrome);
	chrome.storage.local.get(null, function(items) {
	    var allKeys = Object.keys(items);
	    console.log(allKeys);
	});
}

$(document).mousemove(function(e){
    $("#image").stop().animate({left:e.pageX});
});

retrieve();