var storedPings = {}

// Ensure page is PLANIT-relevant before sending data
function preApprove(deets) {
  if (deets.url) {
    $.ajax({
      url: 'http://localhost:3000/api/v1/allowable_sites/test',
      type: 'GET',
      data: {
        url: deets.url
      },
      success: function(response) {
        preLoad(deets);
      },
      error: function(response) {
        storedPings[deets.url] = 'general'
      },
      beforeSend: function() {
        // alert("Pre-Gatekeep")
      }
    })
  }
}

// Pre-load relevant PLANIT pages in background
function preLoad(deets) {
  chrome.tabs.executeScript(deets.tabId, {
    file: "getPagesSource.js"
  }, function() {
    if (chrome.extension.lastError) {
      chrome.browserAction.disable(deets.tabId);
    }
  });
}

// Only send datapacket once source has been prepared
chrome.extension.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    $.ajax({
      url: 'http://localhost:3000/api/v1/users/niko-klein/marks/scrape',
      type: 'POST',
      data: {
        tabId: sender.tab.id,
        page: request.source,
        url: request.url
      },
      success: function(response) {
        chrome.browserAction.setIcon({path: "icon19_blue.png", tabId: sender.tab.id});
        chrome.browserAction.setBadgeText({text: "#", tabId: sender.tab.id});
        chrome.browserAction.setTitle({title: "# Saveable Items", tabId: sender.tab.id});
        storedPings[request.url] = 'ID-string'
      },
      error: function(response) {
        chrome.browserAction.setTitle({title: "Save to Planit Manually", tabId: sender.tab.id});
        storedPings[request.url] = 'manual'
      },
      beforeSend: function() {
        // alert("Pre-Save")
      }
    })
  }
});

// OnClick Bookmarklet Functionality
function displayBookmarklet(deets) {
  if (storedPings[deets.url] == 'ID-string') {
    // If IDs, render results w/ commands
    alert("saving...")
  } else if (storedPings[deets.url] == 'general') {
    // Run scraper?
    alert("general")
  } else if (storedPings[deets.url] == 'manual') {
    // Produce manual entry popup
    alert("manual")
  } else {
    // Run scraper?
    alert("no data")
  }
}

// When browser has changed location, preLoad if not a subframe
chrome.webNavigation.onDOMContentLoaded.addListener( function(deets) {
  if (deets.frameId === 0) {
    preApprove(deets);
  }
});

// When the browser action is clicked, call
chrome.browserAction.onClicked.addListener( function(deets) {
  displayBookmarklet(deets);
});
