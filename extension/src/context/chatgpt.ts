// =====================
// ChatGPT Context Extraction
// =====================

/**
 * Site-specific: ChatGPT context extraction (last message only)
 */
export function extractChatGPTContext(): string | null {
  const turns = Array.from(
    document.querySelectorAll('article[data-testid^="conversation-turn-"]')
  );
  if (turns.length > 0) {
    const lastTurn = turns[turns.length - 1];
    return (lastTurn as HTMLElement).innerText.trim();
  }
  return null;
}
