// =====================
// API Communication Helpers
// =====================

/**
 * Calls the backend to get an AI suggestion for the given input and context.
 */
export async function getSuggestion(
  input: string,
  context: string
): Promise<string | null> {
  console.log("[AI Autocomplete] Fetching suggestion for input:", input);
  try {
    const response = await fetch("http://localhost:3000/api/autocomplete", {
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
