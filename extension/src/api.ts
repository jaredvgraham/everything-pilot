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
  console.log("[AI Autocomplete] API Base URL:", API_BASE_URL);

  try {
    const site = window.location.hostname;

    // Step 1: Get the stored token from chrome.storage.local
    const token = await new Promise<string | null>((resolve) => {
      chrome.storage.local.get("jwt", (data) => {
        resolve(data.jwt ?? null);
      });
    });

    if (!token) {
      console.warn("[AI Autocomplete] No JWT token found");
      return null;
    }

    // Step 2: Use it in the Authorization header
    const response = await fetch(`${API_BASE_URL}/autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // <-- attach the token here
      },
      body: JSON.stringify({ input, context, site }),
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
