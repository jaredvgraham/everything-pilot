export function extractChatGPTContext(): string | null {
  const host = window.location.hostname
  if (!host.includes("chat.openai.com")) {
    return null
  }

  const messages = document.querySelectorAll("[data-message-author-role]")
  if (!messages.length) {
    return null
  }

  const context = Array.from(messages)
    .map((message) => {
      const role = message.getAttribute("data-message-author-role")
      const content = message.querySelector(
        "[data-message-content]"
      )?.textContent
      return `${role}: ${content}`
    })
    .join("\n")

  return context
}
