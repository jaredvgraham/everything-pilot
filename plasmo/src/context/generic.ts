export function extractContextGeneric(inputElement: Element): string {
  // Get the surrounding text context
  const form = inputElement.closest("form")
  if (!form) return ""

  const formText = Array.from(form.querySelectorAll("label, p, div"))
    .map((el) => el.textContent)
    .filter(Boolean)
    .join(" ")

  return formText
}
