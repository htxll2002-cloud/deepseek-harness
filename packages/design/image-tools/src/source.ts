/**
 * Explicit source lookup for edit_image. Never infers the newest conversation image.
 * @module @deepseek-ai/dsh-image-tools/source
 */

import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'

/**
 * Find the image whose attachmentId exactly matches the caller-supplied id.
 * @param session - current session, or undefined before compose.
 * @param sourceAttachmentId - explicit source the caller must supply.
 * @returns the matching image attachment, or undefined when it is absent.
 */
export function findExplicitImageAttachment(
  session: Session | undefined,
  sourceAttachmentId: string,
): ImageAttachmentRef | undefined {
  if (session === undefined) return undefined
  const wanted = sourceAttachmentId.trim()
  if (wanted.length === 0) return undefined
  for (const event of session.events) {
    const found = imageInEvent(event, ref => String(ref.attachmentId) === wanted)
    if (found !== undefined) return found
  }
  return undefined
}

function imageInEvent(
  event: SessionEvent,
  match: (ref: ImageAttachmentRef) => boolean,
): ImageAttachmentRef | undefined {
  const data = event.data as {
    content?: unknown
    message?: { content?: unknown }
    inserted?: Array<{ content?: unknown }>
    chunk?: { type?: unknown; block?: unknown }
  }
  const direct = imageBlockIn(data.content, match)
  if (direct !== undefined) return direct
  if (data.message !== undefined) {
    const wrapped = imageBlockIn(data.message.content, match)
    if (wrapped !== undefined) return wrapped
  }
  if (data.inserted !== undefined) {
    for (const message of data.inserted) {
      const inserted = imageBlockIn(message.content, match)
      if (inserted !== undefined) return inserted
    }
  }
  if (event.type === 'assistant/chunk' && data.chunk?.type === 'block-end') {
    return imageBlockIn([data.chunk.block], match)
  }
  return undefined
}

function imageBlockIn(
  content: unknown,
  match: (ref: ImageAttachmentRef) => boolean,
): ImageAttachmentRef | undefined {
  if (!Array.isArray(content)) return undefined
  for (const value of content) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) continue
    const block = value as { type?: unknown; attachment?: unknown; content?: unknown }
    if (block.type === 'image' && typeof block.attachment === 'object' && block.attachment !== null) {
      const ref = block.attachment as ImageAttachmentRef
      if (match(ref)) return ref
    }
    if (block.type === 'tool-result') {
      const nested = imageBlockIn(block.content, match)
      if (nested !== undefined) return nested
    }
  }
  return undefined
}
