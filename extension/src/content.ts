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

function getElementText(element: Element): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value;
  } else if (element instanceof HTMLElement && element.isContentEditable) {
    return element.innerText;
  }
  return "";
}

function setElementText(element: Element, text: string) {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    element.value = text;
  } else if (element instanceof HTMLElement && element.isContentEditable) {
    element.innerText = text;
  }
}

function escapeHtml(text: string) {
  return text.replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[
        c
      ]!)
  );
}

function getContrastingGhostColor(element: HTMLElement) {
  const color = window.getComputedStyle(element).color;
  let r = 0,
    g = 0,
    b = 0;
  if (color.startsWith("rgb")) {
    [r, g, b] = color.match(/\d+/g)!.map(Number);
  } else if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  }
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180 ? "rgba(255,255,255,0.7)" : "rgba(60,60,60,0.7)";
}

function updateGhostText(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLElement,
  suggestion: string
) {
  console.log("[AI Autocomplete] Updating ghost text:", suggestion);

  // Always append ghostElement to document.body
  if (!ghostElement) {
    ghostElement = createGhostElement();
    document.body.appendChild(ghostElement);
  }
  console.log("ghostElement", ghostElement);

  const rect = element.getBoundingClientRect();
  ghostElement.style.position = "absolute";
  ghostElement.style.left = `${rect.left + window.scrollX}px`;
  ghostElement.style.top = `${rect.top + window.scrollY}px`;
  ghostElement.style.width = `${rect.width}px`;
  ghostElement.style.height = `${rect.height}px`;
  ghostElement.style.fontSize = window.getComputedStyle(element).fontSize;
  ghostElement.style.fontFamily = window.getComputedStyle(element).fontFamily;
  ghostElement.style.padding = window.getComputedStyle(element).padding;
  ghostElement.style.border = window.getComputedStyle(element).border;
  ghostElement.style.background = "transparent";
  ghostElement.style.zIndex = "999999";
  ghostElement.style.pointerEvents = "none";
  ghostElement.style.whiteSpace = "pre-wrap";
  ghostElement.style.display = "block";
  const ghostColor = getContrastingGhostColor(element as HTMLElement);
  ghostElement.innerHTML =
    `<span style='opacity:0; user-select:none;'>${escapeHtml(
      getElementText(element)
    )}</span>` +
    `<span style='opacity:0.7; color:${ghostColor};'>${escapeHtml(
      suggestion
    )}</span>`;
}

function handleInput(event: Event) {
  const element = event.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLElement;
  const text = getElementText(element);
  console.log("[AI Autocomplete] Input event detected:", text);

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
    const suggestion = await getSuggestion(text);
    if (suggestion) {
      currentSuggestion = suggestion;
      updateGhostText(element, suggestion);
    }
  }, 1000);
}

function insertAtCaretContenteditable(
  element: HTMLElement,
  suggestion: string
) {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.collapse(false); // Move to end of selection
  const textNode = document.createTextNode(suggestion);
  range.insertNode(textNode);

  // Move caret to after the inserted text
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
}

function handleKeyDown(event: Event) {
  console.log("handleKeyDown");

  const keyboardEvent = event as KeyboardEvent;
  const element = keyboardEvent.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLElement;
  if (
    (keyboardEvent.key === "Tab" || keyboardEvent.key === "ArrowRight") &&
    currentSuggestion
  ) {
    console.log(
      "[AI Autocomplete] Accepting suggestion with key:",
      keyboardEvent.key
    );
    keyboardEvent.preventDefault();
    if (element instanceof HTMLElement && element.isContentEditable) {
      element.focus();
      const success = document.execCommand(
        "insertText",
        false,
        currentSuggestion
      );
      if (!success) {
        alert("Could not insert suggestion. Please paste manually.");
      }
    } else {
      const text = getElementText(element) + currentSuggestion;
      setElementText(element, text);
    }
    currentSuggestion = null;
    if (ghostElement) {
      ghostElement.remove();
      ghostElement = null;
    }
  }
}

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
