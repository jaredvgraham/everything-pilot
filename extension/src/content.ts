import { handleInput, handleKeyDown } from "./events";

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
