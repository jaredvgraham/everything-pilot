import { createClerkClient } from "@clerk/chrome-extension/background"

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error(
    "Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env.development file"
  )
}

async function getToken() {
  const clerk = await createClerkClient({
    publishableKey
  })

  if (!clerk.session) {
    return null
  }

  return await clerk.session?.getToken()
}

function openLoginPopup() {
  console.log("Opening login popup...")
  chrome.windows.create(
    {
      url: "https://everything-pilot.vercel.app/sign-in",
      type: "popup",
      width: 800,
      height: 800,
      left: Math.round((screen.width - 800) / 2),
      top: Math.round((screen.height - 800) / 2)
    },
    (window) => {
      if (chrome.runtime.lastError) {
        console.error("Error opening popup:", chrome.runtime.lastError)
      } else {
        console.log("Popup opened successfully:", window)
      }
    }
  )
}

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started")
  openLoginPopup()
})

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed/updated:", details.reason)
  if (details.reason === "install") {
    openLoginPopup()
  }
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message)
  if (message.type === "OPEN_LOGIN") {
    openLoginPopup()
  }
})

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
