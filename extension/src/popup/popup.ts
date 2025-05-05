// src/popup/popup.ts

const loginBtn = document.getElementById("login-btn") as HTMLButtonElement;
const statusText = document.getElementById("status-text") as HTMLSpanElement;

loginBtn.addEventListener("click", () => {
  chrome.windows.create({
    url: "https://everything-pilot.vercel.app/extension-login", // your Clerk auth page
    type: "popup",
    width: 480,
    height: 620,
  });
});

chrome.storage.local.get("jwt", (result) => {
  if (result.jwt) {
    statusText.textContent = "✅ Logged in";
  } else {
    statusText.textContent = "🔒 Not logged in";
  }
});
