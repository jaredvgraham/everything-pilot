import { extractChatGPTContext } from "./chatgpt"
import { extractContextGeneric } from "./generic"
import { extractTwitterContext } from "./twitter"

/**
 * Main context extraction dispatcher. Uses site-specific extractors if available, otherwise falls back to generic DOM traversal.
 */
export function extractGenericContext(inputElement: Element): string {
  const host = window.location.hostname

  // ChatGPT
  const chatgpt = extractChatGPTContext()
  if (chatgpt) {
    console.log("using chatgpt context")
    return chatgpt
  }

  // Twitter/X
  const twitter = extractTwitterContext(inputElement)
  if (twitter) {
    console.log("using twitter context")
    return twitter
  }

  console.log("using generic context")

  // Fallback: generic DOM traversal
  return extractContextGeneric(inputElement)
}
