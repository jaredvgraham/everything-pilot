console.log("[AI Autocomplete] Content script loaded");
let debounceTimer: number | null = null;
let currentSuggestion: string | null = null;
let ghostElement: HTMLSpanElement | null = null;

function createGhostElement(): HTMLSpanElement {
  const ghost = document.createElement("span");
  ghost.style.position = "absolute";
  ghost.style.left = "0";
  ghost.style.top = "0";
  ghost.style.opacity = "0.5";
  ghost.style.color = "#666";
  ghost.style.pointerEvents = "none";
  return ghost;
}

async function getSuggestion(input: string): Promise<string | null> {
  console.log("[AI Autocomplete] Fetching suggestion for input:", input);
  try {
    const response = await fetch("http://localhost:3000/api/autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error("Failed to get suggestion");
    }

    const data = await response.json();
    console.log("[AI Autocomplete] Suggestion received:", data.suggestion);
    return data.suggestion;
  } catch (error) {
    console.error("[AI Autocomplete] Error getting suggestion:", error);
    return null;
  }
}

function updateGhostText(
  element: HTMLInputElement | HTMLTextAreaElement,
  suggestion: string
) {
  console.log("[AI Autocomplete] Updating ghost text:", suggestion);
  if (!ghostElement) {
    ghostElement = createGhostElement();
    element.parentElement?.appendChild(ghostElement);
  }

  const rect = element.getBoundingClientRect();
  ghostElement.style.position = "absolute";
  ghostElement.style.left = `${rect.left}px`;
  ghostElement.style.top = `${rect.top}px`;
  ghostElement.style.width = `${rect.width}px`;
  ghostElement.style.height = `${rect.height}px`;
  ghostElement.style.fontSize = window.getComputedStyle(element).fontSize;
  ghostElement.style.fontFamily = window.getComputedStyle(element).fontFamily;
  ghostElement.style.padding = window.getComputedStyle(element).padding;
  ghostElement.style.border = window.getComputedStyle(element).border;
  ghostElement.textContent = element.value + suggestion;
}

function handleInput(event: Event) {
  const element = event.target as HTMLInputElement | HTMLTextAreaElement;
  console.log("[AI Autocomplete] Input event detected:", element.value);

  // Immediately clear current suggestion and ghost text
  currentSuggestion = null;
  if (ghostElement && ghostElement.parentElement) {
    console.log("[AI Autocomplete] Removing ghost element");
    ghostElement.remove();
    ghostElement = null;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(async () => {
    const suggestion = await getSuggestion(element.value);
    if (suggestion) {
      currentSuggestion = suggestion;
      updateGhostText(element, suggestion);
    }
  }, 1000);
}

function handleKeyDown(event: Event) {
  console.log("handleKeyDown");

  const keyboardEvent = event as KeyboardEvent;
  if (
    (keyboardEvent.key === "Tab" || keyboardEvent.key === "ArrowRight") &&
    currentSuggestion
  ) {
    console.log(
      "[AI Autocomplete] Accepting suggestion with key:",
      keyboardEvent.key
    );
    keyboardEvent.preventDefault();
    const element = keyboardEvent.target as
      | HTMLInputElement
      | HTMLTextAreaElement;
    element.value += currentSuggestion;
    currentSuggestion = null;
    if (ghostElement) {
      ghostElement.remove();
      ghostElement = null;
    }
  }
}

function initialize() {
  const inputs = document.querySelectorAll(
    'input:not([type="password"]), textarea'
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
        'input:not([type="password"]), textarea'
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
