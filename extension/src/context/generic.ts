// =====================
// Generic DOM Traversal Context Extraction
// =====================

/**
 * Depth-first traversal to gather visible text from common tags, skipping hidden elements.
 * Returns the last 2000 characters of joined visible text.
 */
export function getAllVisibleTextElements(container: Element): string {
  const TAGS = ["p", "span", "div", "li", "blockquote", "h1", "h2", "h3"];
  const result: string[] = [];

  function isVisible(el: Element): boolean {
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  function dfs(node: Element) {
    if (!isVisible(node)) return;
    if (TAGS.includes(node.tagName.toLowerCase())) {
      const text = (node as HTMLElement).innerText;
      if (text && text.trim().length > 0) {
        result.push(text.trim());
      }
    }
    for (const child of Array.from(node.children)) {
      dfs(child);
    }
  }

  dfs(container);
  const joined = result.join("\n");
  return joined;
}

/**
 * Generic DOM traversal context extraction (fallback).
 */
export function extractContextGeneric(inputElement: Element): string {
  let container: Element | null = inputElement;
  let depth = 0;
  const MAX_DEPTH = 10;
  const MIN_CHARS = 100;
  let bestContext = "";

  while (container && container !== document.body && depth < MAX_DEPTH) {
    // Prefer ARIA roles or data attributes
    const role = container.getAttribute("role");
    const hasGoodRole = [
      "main",
      "article",
      "region",
      "dialog",
      "section",
    ].includes(role || "");
    const hasDataTestId = container.hasAttribute("data-testid");
    if (hasGoodRole || hasDataTestId) {
      const text = getAllVisibleTextElements(container);
      if (text.replace(/\s+/g, "").length >= MIN_CHARS) return text;
    }
    // Check previous siblings for content blocks
    let sibling = container.previousElementSibling;
    while (sibling) {
      const text = getAllVisibleTextElements(sibling);
      if (text.replace(/\s+/g, "").length >= MIN_CHARS) return text;
      sibling = sibling.previousElementSibling;
    }
    // Check this container
    const text = getAllVisibleTextElements(container);
    if (text.replace(/\s+/g, "").length > bestContext.length)
      bestContext = text;
    container = container.parentElement;
    depth++;
  }
  // Fallback: use the best context found, or page title/meta
  if (bestContext.replace(/\s+/g, "").length >= MIN_CHARS) return bestContext;
  return document.title || "";
}
