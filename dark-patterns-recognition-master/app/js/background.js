// Background script to handle extension badge and messaging

// Initialize badge
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setBadgeBackgroundColor({ color: "#4BE680" });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "update_detailed_analysis" && sender.tab) {
    // Update the badge based on risk level
    updateBadge(sender.tab.id, request.risk_level, request.total_patterns);
  }
});

function updateBadge(tabId, riskLevel, totalPatterns) {
  let badgeText = "";
  let badgeColor = "#4BE680"; // Default green

  if (totalPatterns > 0) {
    badgeText = totalPatterns.toString();

    switch (riskLevel) {
      case "Low":
        badgeColor = "#4BE680"; // Green
        break;
      case "Medium":
        badgeColor = "#FFA500"; // Orange
        break;
      case "High":
        badgeColor = "#FF4444"; // Red
        break;
    }
  }

  chrome.action.setBadgeText({ text: badgeText, tabId: tabId });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId: tabId });
}

// Reset badge when tab is updated/refreshed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    chrome.action.setBadgeText({ text: "", tabId: tabId });
  }
});
