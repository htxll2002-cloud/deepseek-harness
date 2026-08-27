/**
 * Composer token Continue Editing writes so the next edit_image call is explicit.
 * @module @deepseek-ai/dsh-image-tools/edit-source
 */

import { EDIT_SOURCE_TOKEN_PREFIX } from './types.ts'

const SOURCE_TOKEN = /\[source:([^\]]+)\]/

/**
 * Parse the first explicit `[source:<attachmentId>]` token from user text.
 * @param text - composer or user message text.
 * @returns the attachment id, or undefined when no token is present.
 */
export function parseEditSourceToken(text: string): string | undefined {
  const match = SOURCE_TOKEN.exec(text)
  const id = match?.[1]?.trim()
  return id !== undefined && id.length > 0 ? id : undefined
}

/**
 * Build the composer token for one attachment id.
 * @param attachmentId - selected image attachment id.
 * @returns `[source:<attachmentId>]`.
 */
export function editSourceToken(attachmentId: string): string {
  return `${EDIT_SOURCE_TOKEN_PREFIX}${attachmentId}]`
}

/**
 * Strip every source token from a draft, leaving the user's instruction.
 * @param text - composer or user message text.
 * @returns text with source tokens removed.
 */
export function stripEditSourceToken(text: string): string {
  return text.replace(/\s*\[source:[^\]]+\]\s*/g, ' ').trim()
}
