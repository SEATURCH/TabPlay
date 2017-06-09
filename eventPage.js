var saveChanges = function (theValue, cb) {
	if (!theValue) {
	  message('Error: No value specified');
	  return;
	}
	// Save it using the Chrome extension storage API.
	chrome.storage.local.set(theValue, cb());
}

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	chrome.storage.local.get(null, function(items) {
		if(items.hasOwnProperty(tabId)){
			chrome.storage.local.remove(tabId.toString(), function(){});
		}
	});
});

chrome.webNavigation.onCompleted.addListener(function (details) {
 	var tabId = details.tabId;
 	chrome.storage.local.get(null, function(items) {
	 		chrome.tabs.sendMessage(tabId, {action:"recheck"}, function (response) {});
	 });
})
// chrome.storage.local.clear(function(){});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  		chrome.storage.local.get(null, function(items) {
			if (request && request.action === 'registerTab') {
  				var saveObject = {};
			    saveObject[sender.tab.id] = {
					senderTab: sender.tab,
					tabId: sender.tab.id,
					tabTitle: sender.tab.title,
					tabUrl: sender.tab.url,
					videoCurrentTime: request.currentTime,
					videoTotalTime: request.totalTime,
					videoCurrentVolume: request.currentVolume,
					isPlaying: request.isPlaying,
					isLoop: request.isLoop
				}
				saveChanges(saveObject, function() {
					sendResponse('Tab registered');
				});
			} else if (request && request.action === "updateStatus"){
				var updateObject = {};
				updateObject[sender.tab.id] = items[sender.tab.id];
				updateObject[sender.tab.id].isPlaying = false;
				saveChanges(updateObject, function(){});
			} else if (request && request.action === "volumeUpdate"){
				var updateObject = {};
				updateObject[sender.tab.id] = items[sender.tab.id];
				updateObject[sender.tab.id].videoCurrentVolume = request.newVolume;
				saveChanges(updateObject, function(){});
			} else if (request && request.action === "loopUpdate"){
				var updateObject = {};
				updateObject[sender.tab.id] = items[sender.tab.id];
				updateObject[sender.tab.id].isLoop = request.loopBoolean;
				saveChanges(updateObject, function(){});
			}
		});
});

