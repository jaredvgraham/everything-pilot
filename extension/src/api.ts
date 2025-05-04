// =====================
// API Communication Helpers
// =====================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Calls the backend to get an AI suggestion for the given input and context.
 */
export async function getSuggestion(
  input: string,
  context: string
): Promise<string | null> {
  console.log("[AI Autocomplete] Fetching suggestion for input:", input);
  try {
    const response = await fetch(`${API_BASE_URL}/autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input, context }),
    });

    if (!response.ok) {
      throw new Error("Failed to get suggestion");
    }

    const data = await response.json();
    console.log("[AI Autocomplete] Suggestion received:", data.suggestion);
    return data.suggestion;
  } catch (error) {
    console.error("[AI Autocomplete] Error getting suggestion:", error);
    return null;
  }
}
