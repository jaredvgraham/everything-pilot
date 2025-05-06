export function getContext(
  input: HTMLInputElement | HTMLTextAreaElement
): string {
  // Get the surrounding text context
  const form = input.closest("form")
  if (!form) return ""

  const formText = Array.from(form.querySelectorAll("label, p, div"))
    .map((el) => el.textContent)
    .filter(Boolean)
    .join(" ")

  return formText
}

// Re-export for backwards compatibility. Use from './context/index' in new code.
export { extractGenericContext } from "./context/index"
