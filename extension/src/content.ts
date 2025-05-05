import { handleInput, handleKeyDown, handleFocusOut } from "./events";

console.log("[AI Autocomplete] Content script loaded");

function initialize() {
  const inputs = document.querySelectorAll(
    'input:not([type="password"]), textarea, [contenteditable="true"]'
  );
  console.log(
    `[AI Autocomplete] Initializing. Found ${inputs.length} input(s)/textarea(s).`
  );
  inputs.forEach((input) => {
    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeyDown as EventListener);
    input.addEventListener("focusout", handleFocusOut);
    console.log("[AI Autocomplete] Listener attached to:", input);
  });
}

// Initialize when the page is loaded
document.addEventListener("DOMContentLoaded", initialize);

// Also initialize for dynamically added inputs
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      const inputs = document.querySelectorAll(
        'input:not([type="password"]), textarea, [contenteditable="true"]'
      );
      inputs.forEach((input) => {
        if (!input.hasAttribute("data-autocomplete-initialized")) {
          input.addEventListener("input", handleInput);
          input.addEventListener("keydown", handleKeyDown as EventListener);
          input.addEventListener("focusout", handleFocusOut);
          input.setAttribute("data-autocomplete-initialized", "true");
          console.log(
            "[AI Autocomplete] Listener attached to (dynamic):",
            input
          );
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Listen for token from /extension-login via postMessage
window.addEventListener("message", (event) => {
  console.log("received message from extension-login");

  if (event.source !== window) {
    console.log("event.source", event.source);
    console.log("event.sourse is not window");

    return;
  }
  console.log("event.data", event.data);
  console.log("event.data.type", event.data?.type);
  console.log("event.data.token", event.data?.token);

  if (event.data?.type === "CLERK_EXTENSION_AUTH") {
    console.log("event.data.type is CLERK_EXTENSION_AUTH");
    const token = event.data.token;
    if (token) {
      chrome.storage.local.set({ jwt: token });
      console.log("✅ Clerk JWT stored securely.");
      console.log("geting the token:", chrome.storage.local.get("jwt"));
    }
  }
});
