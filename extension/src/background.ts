// background.ts

/**
 * Background script for Chrome Extension
 * - Listens for Clerk token from /extension-login
 * - Stores token in chrome.storage.local
 * - Opens login popup if no token is found
 */

function openLoginPopup() {
  chrome.windows.create({
    url: "https://everything-pilot.vercel.app/sign-in", // ← Replace with your domain
    type: "popup",
    width: 480,
    height: 620,
  });
}

// ✅ 1. On extension startup, check if token exists
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get("jwt", (data) => {
    if (!data.jwt) {
      console.log("🔒 No token found. Triggering login popup.");
      openLoginPopup();
    } else {
      console.log("🔐 Token found:", data.jwt.slice(0, 10) + "...");
    }
  });
});

// ✅ 2. Also check on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("jwt", (data) => {
    if (!data.jwt) {
      console.log("🔒 First-time install: Opening login popup.");
      openLoginPopup();
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CLERK_EXTENSION_AUTH") {
    const { token } = message;
    chrome.storage.local.set({ jwt: token });
    console.log("✅ Token received and stored:", token);
  }
});
