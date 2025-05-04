// =====================
// DOM Utility Helpers
// =====================

/**
 * Gets the text value from an input, textarea, or contenteditable element.
 */
export function getElementText(element: Element): string {
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

/**
 * Sets the text value for an input, textarea, or contenteditable element.
 */
export function setElementText(element: Element, text: string) {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    element.value = text;
  } else if (element instanceof HTMLElement && element.isContentEditable) {
    element.innerText = text;
  }
}
