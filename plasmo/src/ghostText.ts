// =====================
// Ghost Text Overlay Utilities
// =====================

/**
 * Creates a styled ghost text element for overlay.
 */

let hideGhostText = false

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === "Return") {
    hideGhostText = true
  }
})

document.addEventListener("input", () => {
  hideGhostText = false
})

export function createGhostElement(): HTMLSpanElement {
  if (hideGhostText) return null
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
  if (hideGhostText) {
    if (ghostElement && ghostElement.parentNode) {
      ghostElement.parentNode.removeChild(ghostElement)
    }
    return
  }
  if (!suggestion) return

  // Copilot-style overlay for textarea
  if (element instanceof HTMLTextAreaElement) {
    const caret = getTextareaCaretCoordinates(element)
    ghostElement.style.position = "absolute"
    ghostElement.style.left = caret.left + "px"
    ghostElement.style.top = caret.top + "px"
    ghostElement.style.fontSize = window.getComputedStyle(element).fontSize
    ghostElement.style.fontFamily = window.getComputedStyle(element).fontFamily
    ghostElement.style.background = "transparent"
    ghostElement.style.zIndex = "999999"
    ghostElement.style.pointerEvents = "none"
    ghostElement.style.whiteSpace = "pre"
    ghostElement.style.display = "inline-block"
    ghostElement.style.opacity = "0.7"
    ghostElement.style.color = getContrastingGhostColor(element as HTMLElement)
    ghostElement.textContent = suggestion
    return
  }
  // Copilot-style overlay for contenteditable
  if (element instanceof HTMLElement && element.isContentEditable) {
    const caret = getContenteditableCaretCoordinates(element)
    if (!caret) return
    ghostElement.style.position = "absolute"
    ghostElement.style.left = caret.left + "px"
    ghostElement.style.top = caret.top + "px"
    ghostElement.style.fontSize = window.getComputedStyle(element).fontSize
    ghostElement.style.fontFamily = window.getComputedStyle(element).fontFamily
    ghostElement.style.background = "transparent"
    ghostElement.style.zIndex = "999999"
    ghostElement.style.pointerEvents = "none"
    ghostElement.style.whiteSpace = "pre"
    ghostElement.style.display = "inline-block"
    ghostElement.style.opacity = "0.7"
    ghostElement.style.color = getContrastingGhostColor(element as HTMLElement)
    ghostElement.textContent = suggestion
    return
  }
  // Default: fallback to original overlay for input
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

/**
 * Utility to get caret coordinates in a textarea.
 * Returns {top, left, height} relative to the page.
 */
export function getTextareaCaretCoordinates(textarea: HTMLTextAreaElement): {
  top: number
  left: number
  height: number
} {
  const { selectionEnd } = textarea
  const value = textarea.value.substring(0, selectionEnd)

  // Create a mirror div
  const div = document.createElement("div")
  const style = window.getComputedStyle(textarea)
  for (const prop of [
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
    "tabSize",
    "MozTabSize"
  ]) {
    // @ts-ignore
    div.style[prop] = style[prop]
  }
  div.style.position = "absolute"
  div.style.visibility = "hidden"
  div.style.whiteSpace = "pre-wrap"
  div.style.wordWrap = "break-word"
  div.style.top = textarea.offsetTop + "px"
  div.style.left = textarea.offsetLeft + "px"
  div.textContent = value

  // Create a span for the caret
  const span = document.createElement("span")
  span.textContent = "\u200b" // zero-width space
  div.appendChild(span)

  document.body.appendChild(div)
  const rect = span.getBoundingClientRect()
  const result = {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    height: rect.height
  }
  document.body.removeChild(div)
  return result
}

/**
 * Utility to get caret coordinates in a contenteditable element.
 * Returns {top, left, height} relative to the page.
 */
export function getContenteditableCaretCoordinates(
  element: HTMLElement
): { top: number; left: number; height: number } | null {
  const sel = window.getSelection()
  if (!sel.rangeCount) return null
  const range = sel.getRangeAt(0).cloneRange()
  // Insert a temporary marker
  const marker = document.createElement("span")
  marker.textContent = "\u200b"
  marker.style.display = "inline-block"
  marker.style.width = "1px"
  marker.style.height = "1em"
  marker.style.padding = "0"
  marker.style.margin = "0"
  marker.style.border = "none"
  marker.style.position = "absolute"
  range.insertNode(marker)
  const rect = marker.getBoundingClientRect()
  const result = {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    height: rect.height
  }
  marker.parentNode?.removeChild(marker)
  return result
}
