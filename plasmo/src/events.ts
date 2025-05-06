import { getSuggestion } from "./api"
import { extractGenericContext } from "./context"
import { getElementText, setElementText } from "./domUtils"
import { createGhostElement, updateGhostText } from "./ghostText"

let currentSuggestion: string | null = null
let ghostElement: HTMLSpanElement | null = null
let debounceTimer: number | null = null

export async function handleInput(event: Event) {
  const element = event.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLElement
  const text = getElementText(element)

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
    if (!text.trim()) {
      return
    }

    const context = extractGenericContext(element)
    console.log("[AI Autocomplete] Extracted context:", context)
    console.log("context length:", context.length)

    const limitContext = context.slice(0, 1000)
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
  currentSuggestion = null
  if (ghostElement) {
    ghostElement.remove()
    ghostElement = null
  }
}
