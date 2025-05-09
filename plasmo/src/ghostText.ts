// =====================
// Ghost Text Overlay Utilities
// =====================

/**
 * Creates a styled ghost text element for overlay.
 */
export function createGhostElement(): HTMLSpanElement {
  const ghost = document.createElement("span")
  ghost.style.position = "absolute"
  ghost.style.left = "0"
  ghost.style.top = "0"
  ghost.style.opacity = "0.5"
  ghost.style.color = "#666"
  ghost.style.pointerEvents = "none"
  return ghost
}

/**
 * Escapes HTML for safe rendering in ghost text.
 */
export function escapeHtml(text: string) {
  return text.replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ]!
  )
}

/**
 * Returns a ghost text color that contrasts with the input's background.
 */
function getContrastingGhostColor(element: HTMLElement) {
  const color = window.getComputedStyle(element).color
  let r = 0,
    g = 0,
    b = 0
  if (color.startsWith("rgb")) {
    ;[r, g, b] = color.match(/\d+/g)!.map(Number)
  } else if (color.startsWith("#")) {
    const hex = color.replace("#", "")
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16)
      g = parseInt(hex[1] + hex[1], 16)
      b = parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16)
      g = parseInt(hex.slice(2, 4), 16)
      b = parseInt(hex.slice(4, 6), 16)
    }
  }
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180 ? "rgba(255,255,255,0.7)" : "rgba(60,60,60,0.7)"
}

/**
 * Updates the ghost text overlay to match the target element and suggestion.
 */
export function updateGhostText(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLElement,
  suggestion: string,
  ghostElement: HTMLSpanElement,
  getElementText: (el: Element) => string
) {
  if (!suggestion) return
  const rect = element.getBoundingClientRect()
  ghostElement.style.position = "absolute"
  ghostElement.style.left = `${rect.left + window.scrollX}px`
  ghostElement.style.top = `${rect.top + window.scrollY}px`
  ghostElement.style.width = `${rect.width}px`
  ghostElement.style.height = `${rect.height}px`
  ghostElement.style.fontSize = window.getComputedStyle(element).fontSize
  ghostElement.style.fontFamily = window.getComputedStyle(element).fontFamily
  ghostElement.style.padding = window.getComputedStyle(element).padding
  ghostElement.style.border = window.getComputedStyle(element).border
  ghostElement.style.background = "transparent"
  ghostElement.style.zIndex = "999999"
  ghostElement.style.pointerEvents = "none"
  ghostElement.style.whiteSpace = "pre-wrap"
  ghostElement.style.display = "block"
  const ghostColor = getContrastingGhostColor(element as HTMLElement)

  const beforeText = getElementText(element)
  if (!beforeText) return

  ghostElement.innerHTML =
    `<span style='opacity:0; user-select:none;'>${escapeHtml(
      getElementText(element)
    )}</span>` +
    `<span style='opacity:0.7; color:${ghostColor};'>${escapeHtml(
      suggestion
    )}</span>`
}
