export function extractTwitterContext(): string | null {
  const host = window.location.hostname
  if (!host.includes("twitter.com") && !host.includes("x.com")) {
    return null
  }

  const tweetText = document.querySelector(
    "[data-testid='tweetText']"
  )?.textContent
  if (!tweetText) {
    return null
  }

  return tweetText
}
