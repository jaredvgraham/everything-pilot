// =====================
// Context Extraction Utilities
// =====================

/**
 * Traverses up from the input to find a likely container with more context.
 */
export function findContextContainer(inputElement: Element): Element {
  let container: Element = inputElement;
  for (let i = 0; i < 6; i++) {
    if (!container.parentElement) break;
    container = container.parentElement;
    // Heuristic: stop if container has a lot of text or many children
    if (
      (container as HTMLElement).innerText &&
      (container as HTMLElement).innerText.length > 200
    )
      break;
    if (container.children.length > 5) break;
  }
  return container;
}

/**
 * Returns all visible text from common text elements within the given container.
 */
export function getAllVisibleTextElements(container: Element): string {
  const elements = container.querySelectorAll("p,span,div,li,blockquote");
  const context: string[] = [];
  elements.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (
      (el as HTMLElement).innerText &&
      (el as HTMLElement).innerText.trim().length > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    ) {
      context.push((el as HTMLElement).innerText.trim());
    }
  });
  return context.join("\n").slice(-2000);
}

/**
 * Extracts generic context for the input element by finding a likely container and gathering visible text.
 */
export function extractGenericContext(inputElement: Element): string {
  const contextContainer = findContextContainer(inputElement);
  const context = getAllVisibleTextElements(contextContainer);
  return context;
}
