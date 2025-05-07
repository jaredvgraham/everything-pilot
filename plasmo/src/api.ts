// =====================
// API Communication Helpers
// =====================

const API_BASE_URL = process.env.PLASMO_PUBLIC_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error("PLASMO_PUBLIC_API_BASE_URL is not set")
}

async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_TOKEN" }, (response) => {
      resolve(response.token)
    })
  })
}

/**
 * Calls the backend to get an AI suggestion for the given input and context.
 */
export async function getSuggestion(
  input: string,
  context: string
): Promise<string | null> {
  console.log("[AI Autocomplete] Fetching suggestion for input:", input)
  console.log("[AI Autocomplete] API Base URL:", API_BASE_URL)

  try {
    const site = window.location.hostname
    const token = await getAuthToken()

    if (!token) {
      console.error("[AI Autocomplete] No auth token available")
      return null
    }

    const response = await fetch(`${API_BASE_URL}/autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ input, context, site })
    })

    if (!response.ok) {
      throw new Error("Failed to get suggestion")
    }

    const data = await response.json()
    console.log("[AI Autocomplete] Suggestion received:", data.suggestion)
    return data.suggestion
  } catch (error) {
    console.error("[AI Autocomplete] Error getting suggestion:", error)
    return null
  }
}
