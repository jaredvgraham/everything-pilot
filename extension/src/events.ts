// =====================
// Event Handlers
// =====================

import { extractGenericContext } from "./context";
import { createGhostElement, updateGhostText } from "./ghostText";
import { getSuggestion } from "./api";
import { getElementText, setElementText } from "./domUtils";

let currentSuggestion: string | null = null;
let ghostElement: HTMLSpanElement | null = null;
let debounceTimer: number | null = null;

/**
 * Handles input events for text fields and contenteditables.
 */
export function handleInput(event: Event) {
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
    if (!text.trim()) {
      return;
    }
    const context = extractGenericContext(element);
    console.log("[AI Autocomplete] Extracted context:", context);
    console.log("context length:", context.length);

    const limitContext = context.slice(0, 1000);
    console.log("limit context length:", limitContext.length);
    const suggestion = await getSuggestion(text, limitContext);
    if (suggestion) {
      currentSuggestion = suggestion;
      if (!ghostElement) {
        ghostElement = createGhostElement();
        document.body.appendChild(ghostElement);
      }
      updateGhostText(element, suggestion, ghostElement, getElementText);
    }
  }, 1000);
}

/**
 * Handles keydown events for accepting suggestions.
 */
export function handleKeyDown(event: Event) {
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
      // @ts-ignore
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

/**
 * Handles focusout events to remove ghost suggestion when input loses focus.
 */
export function handleFocusOut(event: Event) {
  currentSuggestion = null;
  if (ghostElement) {
    ghostElement.remove();
    ghostElement = null;
  }
}
