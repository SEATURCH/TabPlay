var saveChanges = function (theValue, cb) {
	if (!theValue) {
	  message('Error: No value specified');
	  return;
	}
	// Save it using the Chrome extension storage API.
	chrome.storage.local.set(theValue, cb());
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.action === 'registerTab') {

	  	chrome.storage.local.clear(function(){  // ---------------
	  	
	  	
	  		chrome.storage.local.get(null, function(items) {
			    var nextEntry = Object.keys(items).length;
			    var saveObject = {};
			    saveObject[nextEntry] = {
					senderTab: sender.tab,
					tabId: sender.tab.id,
					tabTitle: sender.tab.title,
					tabUrl: sender.tab.url
				}
			    console.log(saveObject)

			    saveChanges(saveObject, function() {
					sendResponse('Tab registered');
				});
			});
			
		
	  	});	// ---------------
  	 	
    // chrome.windows.create({url: request.url}, function (win) {
      // sendResponse(win);
    // });
  }
});


// startUp();