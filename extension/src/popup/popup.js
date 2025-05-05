document.addEventListener("DOMContentLoaded", () => {
  // You can add any initialization code here
  const statusValue = document.querySelector(".status-value");

  // Example: Update status based on extension state
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab) {
      statusValue.textContent = "Active on " + new URL(currentTab.url).hostname;
    }
  });
});
