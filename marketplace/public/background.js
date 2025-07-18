
// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: "addToListingsBuffer",
    title: "Add to Listings Buffer",
    contexts: ["all"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToListingsBuffer") {
    // Send message to content script to extract post data
    chrome.tabs.sendMessage(tab.id, {
      action: "extractPost",
      clickedElement: info
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "postExtracted") {
    // Get stored auth token and send to API
    chrome.storage.local.get(['authToken', 'apiUrl'], (result) => {
      const authToken = result.authToken;
      const apiUrl = result.apiUrl || 'https://nhwwhpbxlqsdbirdrxmc.supabase.co';
      
      if (!authToken) {
        sendResponse({ success: false, error: "Please login first" });
        return;
      }

      // Send extracted data to API
      fetch(`${apiUrl}/functions/v1/extract-facebook-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(request.data)
      })
      .then(response => response.json())
      .then(data => {
        sendResponse({ success: true, data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    });
    
    return true; // Keep message channel open for async response
  }
});
