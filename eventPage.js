var tabMap = {};

var saveChanges = function (theValue, cb) {
	if (!theValue) {
	  message('Error: No value specified');
	  return;
	}
	// Save it using the Chrome extension storage API.
	chrome.storage.local.set(theValue, cb());
}

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
	chrome.storage.local.remove(tabMap[tabId], function(){
		console.log("successfull removal");
		delete tabMap[tabId];
	})
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.action === 'registerTab') {

	  	// chrome.storage.local.clear(function(){  // ---------------

	  	if(!tabMap[sender.tab.id]){
	  		chrome.storage.local.get(null, function(items) {
			    var nextEntry = Object.keys(items).length;
			    var saveObject = {};
			    saveObject[nextEntry] = {
					senderTab: sender.tab,
					tabId: sender.tab.id,
					tabTitle: sender.tab.title,
					tabUrl: sender.tab.url
				}
			    tabMap[sender.tab.id] = nextEntry.toString();
			    saveChanges(saveObject, function() {
					sendResponse('Tab registered');
				});
			});
	  	}
	  		
			
		
	  	// });	// ---------------
  	 	
    // chrome.windows.create({url: request.url}, function (win) {
      // sendResponse(win);
    // });
  }
});


// startUp();