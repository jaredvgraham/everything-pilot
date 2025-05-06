declare module "./context" {
  export function getContext(
    input: HTMLInputElement | HTMLTextAreaElement
  ): string
}

declare module "./ghostText" {
  export function createGhostText(
    input: HTMLInputElement | HTMLTextAreaElement,
    suggestion: string
  ): void
  export function removeGhostText(): void
}
