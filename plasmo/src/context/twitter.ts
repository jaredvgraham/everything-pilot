// =====================
// Twitter/X Context Extraction
// =====================

/**
 * Site-specific: Twitter/X context extraction (tweet being replied to)
 */
export function extractTwitterContext(inputElement: Element): string | null {
  // Walk up to find the nearest tweet article
  let el: Element | null = inputElement
  while (el && el !== document.body) {
    if (
      el.getAttribute("role") === "article" &&
      el.getAttribute("data-testid") === "tweet"
    ) {
      const tweetTextEl = el.querySelector('[data-testid="tweetText"]')
      if (tweetTextEl) {
        return (tweetTextEl as HTMLElement).innerText.trim()
      }
    }
    el = el.parentElement
  }
  // Fallback: try previous siblings
  el = inputElement.previousElementSibling
  while (el) {
    if (
      el.getAttribute("role") === "article" &&
      el.getAttribute("data-testid") === "tweet"
    ) {
      const tweetTextEl = el.querySelector('[data-testid="tweetText"]')
      if (tweetTextEl) {
        return (tweetTextEl as HTMLElement).innerText.trim()
      }
    }
    el = el.previousElementSibling
  }
  return null
}
