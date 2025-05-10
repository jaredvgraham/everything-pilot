import { createClerkClient } from "@clerk/chrome-extension/background"

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error(
    "Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env.development file"
  )
}

async function getToken() {
  const clerk = await createClerkClient({
    publishableKey,
    __experimental_syncHostListener: true
  })

  if (!clerk.session) {
    console.log("No session found")
    return null
  }

  return await clerk.session?.getToken()
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_TOKEN") {
    getToken()
      .then((token) => sendResponse({ token }))
      .catch((error) => {
        console.error(
          "[Background service worker] Error:",
          JSON.stringify(error)
        )
        sendResponse({ token: null })
      })
    return true
  }
})
