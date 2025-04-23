
// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel
  chrome.sidePanel.open({ tabId: tab.id });
});

// Initialize side panel settings
chrome.runtime.onInstalled.addListener(() => {
  // Set default side panel state
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'sidepanel.html'
  });
});
