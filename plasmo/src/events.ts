import { getSuggestion } from "./api"
import { extractGenericContext } from "./context"
import { getElementText, setElementText } from "./domUtils"
import { createGhostElement, updateGhostText } from "./ghostText"

let currentSuggestion: string | null = null
let ghostElement: HTMLSpanElement | null = null
let debounceTimer: number | null = null
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

// TODO: Add sensitive field check
// function isSensitiveField(
//   element: HTMLInputElement | HTMLTextAreaElement | HTMLElement
// ): boolean {
//   if (element instanceof HTMLInputElement) {
//     // Check for password fields
//     if (element.type === "password") {
//       return true
//     }

//     // Check for credit card fields
//     const creditCardPatterns = [
//       /credit.*card/i,
//       /cc[-_]?num/i,
//       /card[-_]?num/i,
//       /card[-_]?number/i,
//       /cc[-_]?number/i,
//       /cc[-_]?code/i,
//       /cvv/i,
//       /cvc/i,
//       /security[-_]?code/i
//     ]

//     const fieldName = element.name?.toLowerCase() || ""
//     const fieldId = element.id?.toLowerCase() || ""
//     const fieldPlaceholder = element.placeholder?.toLowerCase() || ""

//     return creditCardPatterns.some(
//       (pattern) =>
//         pattern.test(fieldName) ||
//         pattern.test(fieldId) ||
//         pattern.test(fieldPlaceholder)
//     )
//   }

//   return false
// }

export async function handleInput(event: Event) {
  const element = event.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLElement

  // Check if this is a sensitive field

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
  if (
    (keyboardEvent.key === "Tab" || keyboardEvent.key === "ArrowRight") &&
    currentSuggestion
  ) {
    console.log(
      "[AI Autocomplete] Accepting suggestion with key:",
      keyboardEvent.key
    )
    keyboardEvent.preventDefault()
    if (element instanceof HTMLElement && element.isContentEditable) {
      element.focus()
      // @ts-ignore
      const success = document.execCommand(
        "insertText",
        false,
        currentSuggestion
      )
      if (!success) {
        alert("Could not insert suggestion. Please paste manually.")
      }
    } else {
      const text = getElementText(element) + currentSuggestion
      setElementText(element, text)
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
