var saveChanges = function (theValue, cb) {
	// Check that there's some code there.
	if (!theValue) {
	  message('Error: No value specified');
	  return;
	}
	console.log(cb)
	// Save it using the Chrome extension storage API.
	chrome.storage.local.set(theValue, cb);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.action === 'createWindow' && request.url) {
  	 
		var saveObject = {
			tabId: "tabId"
		}
		saveChanges(saveObject, function() {
			sendResponse('Settings saved');
		});
    // chrome.windows.create({url: request.url}, function (win) {
      // sendResponse(win);
    // });
  }
});

// startUp();