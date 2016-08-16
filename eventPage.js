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
		if(items.tabs.hasOwnProperty(tabId)){
			chrome.storage.local.remove(items.tabs[tabId].toString(), function(){
				delete items.tabs[tabId];
			});
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
  				items.tabs = items.tabs || {};
  			    var nextEntry = sender.tab.id;
			    items.tabs[sender.tab.id] = nextEntry;
			    var saveObject = {};
			    saveObject[nextEntry] = {
					senderTab: sender.tab,
					tabId: sender.tab.id,
					tabTitle: sender.tab.title,
					tabUrl: sender.tab.url,
					videoCurrentTime: request.currentTime,
					videoTotalTime: request.totalTime,
					videoCurrentVolume: request.currentVolume,
					isPlaying: request.isPlaying
				}
				saveChanges(saveObject, function() {
					sendResponse('Tab registered');
				});
				saveChanges({tabs:items.tabs}, function(){});
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
			}
		});
});

