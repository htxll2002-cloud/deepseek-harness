/** Composer token Continue Editing writes so the next edit is explicit. */

const SOURCE_TOKEN = /\[source:([^\]]+)\]/

/**
 * Build `[source:<attachmentId>]`.
 * @param attachmentId - selected image attachment id.
 * @returns the composer token.
 */
export function editSourceToken(attachmentId: string): string {
  return `[source:${attachmentId}]`
}

/**
 * Parse the first explicit source token.
 * @param text - composer or user message text.
 * @returns the attachment id, or undefined when no token is present.
 */
export function parseEditSourceToken(text: string): string | undefined {
  const match = SOURCE_TOKEN.exec(text)
  const id = match?.[1]?.trim()
  return id !== undefined && id.length > 0 ? id : undefined
}

/**
 * Remove source tokens from a draft.
 * @param text - composer or user message text.
 * @returns text with source tokens removed.
 */
export function stripEditSourceToken(text: string): string {
  return text.replace(/\s*\[source:[^\]]+\]\s*/g, ' ').trim()
}

/**
 * Next draft after Continue Editing.
 * @param draft - current composer text.
 * @param attachmentId - selected image attachment id.
 * @returns draft prefixed with the explicit source token.
 */
export function draftWithEditSource(draft: string, attachmentId: string): string {
  const instruction = stripEditSourceToken(draft)
  return instruction.length === 0
    ? `${editSourceToken(attachmentId)} `
    : `${editSourceToken(attachmentId)} ${instruction}`
}
