import { getSuggestion } from "./api"
import { extractGenericContext } from "./context"
import { getElementText, setElementText } from "./domUtils"
import { createGhostElement, updateGhostText } from "./ghostText"

let currentSuggestion: string | null = null
let ghostElement: HTMLSpanElement | null = null
let debounceTimer: number | null = null
let pauseSuggestions = false
let pauseTimeout: number | null = null
// TODO: Add sensitive fields to the list
// const sensitiveFields = new Set([
//   "password",
//   "email",
//   "phone",
//   "credit card",
//   "social security number",
//   "bank account number",
//   "address",
//   "name",
//   "username",
//   "sign in",
//   "login",
//   "logout",
//   "forgot password",
//   "reset password",
//   "change password",
//   "verify email",
//   "verify phone",
//   "verify address",
//   "verify name",
//   "verify username",
//   "verify password",
//   "log in",
//   "sign up",
//   "register"
// ])

// Robust sensitive field detection
export function isSensitiveField(element: Element): boolean {
  console.log("checking sensitive field", element)

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    // Check by type
    const sensitiveTypes = ["password"]
    if (sensitiveTypes.includes(element.type)) return true

    // Check by name, id, placeholder, aria-label, autocomplete
    const sensitivePatterns = [
      /password/i,
      /credit.*card/i,
      /cc[-_]?num/i,
      /card[-_]?num/i,
      /card[-_]?number/i,
      /cc[-_]?number/i,
      /cc[-_]?code/i,
      /cvv/i,
      /cvc/i,
      /security[-_]?code/i,
      /ssn/i,
      /social.*security/i,
      /bank.*account/i,
      /iban/i,
      /routing/i
    ]

    const attributes = [
      element.name,
      element.id,
      element.placeholder,
      element.getAttribute("aria-label"),
      element.getAttribute("autocomplete")
    ]
      .filter(Boolean)
      .join(" ")

    if (sensitivePatterns.some((pattern) => pattern.test(attributes)))
      return true
  }

  // For contenteditable or generic elements
  if (element instanceof HTMLElement && element.isContentEditable) {
    const label = element.getAttribute("aria-label") || ""
    if (label && /password|credit.*card|ssn|email|phone/i.test(label))
      return true
  }

  return false
}

export async function handleInput(event: Event) {
  console.log("handleInput")
  if (pauseSuggestions) {
    return
  }
  const element = event.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLElement

  // Check if this is a sensitive field
  if (isSensitiveField(element)) {
    console.log(
      "[AI Autocomplete] Skipping suggestions for sensitive field",
      element
    )
    if (ghostElement) {
      ghostElement.remove()
      ghostElement = null
    }
    return
  }

  const text = getElementText(element)

  // Remove ghost text if input is empty
  if (!text.trim()) {
    if (ghostElement) {
      ghostElement.remove()
      ghostElement = null
    }
    return
  }

  console.log("[AI Autocomplete] Input event detected:", text)
  console.log("[AI Autocomplete] Input event detected 2:", text)

  // Immediately clear current suggestion and ghost text
  currentSuggestion = null
  if (ghostElement && ghostElement.parentElement) {
    console.log("[AI Autocomplete] Removing ghost element")
    ghostElement.remove()
    ghostElement = null
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = window.setTimeout(async () => {
    // Check if element is still in the document and active
    if (
      !text.trim() ||
      document.activeElement !== element ||
      !document.body.contains(element)
    ) {
      if (ghostElement) {
        ghostElement.remove()
        ghostElement = null
      }
      return
    }

    const context = extractGenericContext(element)
    console.log("[AI Autocomplete] Extracted context:", context)
    console.log("context length:", context.length)

    // Check if any sensitive field is in the context
    // if ([...sensitiveFields].some((field) => context.includes(field))) {
    //   console.log("[AI Autocomplete] Skipping suggestions for sensitive field")
    //   return
    // }

    const limitContext = context.slice(0, 4000)
    console.log("limit context length:", limitContext.length)

    try {
      if (pauseSuggestions) return
      const suggestion = await getSuggestion(text, limitContext)
      if (!suggestion) {
        if (ghostElement) {
          ghostElement.remove()
          ghostElement = null
        }
        return
      }

      // Final check to ensure input is still in document and active
      if (
        !text.trim() ||
        document.activeElement !== element ||
        !document.body.contains(element)
      ) {
        if (ghostElement) {
          ghostElement.remove()
          ghostElement = null
        }
        return
      }

      currentSuggestion = suggestion
      if (!ghostElement) {
        ghostElement = createGhostElement()

        document.body.appendChild(ghostElement)
      }
      updateGhostText(element, suggestion, ghostElement, getElementText)
    } catch (error) {
      console.error("[AI Autocomplete] Error handling input:", error)
      if (ghostElement) {
        ghostElement.remove()
        ghostElement = null
      }
    }
  }, 1000)
}

export function handleKeyDown(event: Event) {
  console.log("handleKeyDown")

  const keyboardEvent = event as KeyboardEvent
  const element = keyboardEvent.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLElement

  if (keyboardEvent.key === "Enter" || keyboardEvent.key === "Return") {
    pauseSuggestions = true
    if (pauseTimeout) {
      clearTimeout(pauseTimeout)
    }
    pauseTimeout = window.setTimeout(() => {
      pauseSuggestions = false
    }, 4500)
    console.log("[AI Autocomplete] Enter key pressed")
    if (element instanceof HTMLElement && element.isContentEditable) {
      element.focus()
    }
  }

  if (
    (keyboardEvent.key === "Tab" || keyboardEvent.key === "ArrowRight") &&
    currentSuggestion
  ) {
    console.log(
      "[AI Autocomplete] Accepting suggestion with key:",
      keyboardEvent.key
    )
    keyboardEvent.preventDefault()
    if (element instanceof HTMLTextAreaElement) {
      // Insert at caret position for textarea
      const start = element.selectionStart
      const end = element.selectionEnd
      const value = element.value
      const newValue =
        value.slice(0, start) + currentSuggestion + value.slice(end)
      setElementText(element, newValue)
      // Move cursor to after inserted suggestion
      element.selectionStart = element.selectionEnd =
        start + currentSuggestion.length
      element.focus()
    } else if (element instanceof HTMLElement && element.isContentEditable) {
      // Insert at caret position for contenteditable, move caret after, and dispatch input event
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        const textNode = document.createTextNode(currentSuggestion)
        range.insertNode(textNode)
        // Move caret after inserted text
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        sel.removeAllRanges()
        sel.addRange(range)
        element.focus()
        // Trigger input event for React/other listeners (e.g., Twitter/X)
        element.dispatchEvent(new Event("input", { bubbles: true }))
      }
    } else {
      // Always append at the end for input
      const text = getElementText(element) + currentSuggestion
      setElementText(element, text)
      // Move cursor to end
      if (element instanceof HTMLInputElement) {
        element.selectionStart = element.selectionEnd = text.length
        element.focus()
      }
    }
    currentSuggestion = null
    if (ghostElement) {
      ghostElement.remove()
      ghostElement = null
    }
  }
}

export function handleFocusOut() {
  // Always remove ghost text when focus is lost
  currentSuggestion = null
  if (ghostElement) {
    ghostElement.remove()
    ghostElement = null
  }
}
