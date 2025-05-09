// =====================
// ChatGPT Context Extraction
// =====================

/**
 * Site-specific: ChatGPT context extraction
 * @param numMessages Number of recent messages to include (default: 3)
 * @returns Concatenated recent messages or null if no messages found
 */
export function extractChatGPTContext(numMessages: number = 3): string | null {
  const turns = Array.from(
    document.querySelectorAll('article[data-testid^="conversation-turn-"]')
  )

  if (turns.length === 0) {
    return null
  }

  // Get the most recent messages, up to numMessages
  const recentTurns = turns.slice(-numMessages)

  // Join the messages with a separator
  return recentTurns
    .map((turn) => (turn as HTMLElement).innerText.trim())
    .filter((text) => text.length > 0) // Remove any empty messages
    .join("\n\n---\n\n") // Separate messages with a clear divider
}
