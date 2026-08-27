/**
 * Rebuild the image card from a durable ToolCallBlock.
 * Replay must not need React memory.
 */

import type { ToolCallBlock } from '@deepseek-ai/dsh-client-runtime/client'

/** One durable image variant the Tool View can render after reload. */
export interface DesignImageVariant {
  attachmentId: string
  variantIndex: number
  name?: string
  mediaType?: string
}

/** Replay-stable view model. */
export interface DesignImageViewModel {
  operation: 'generate' | 'edit'
  status: 'running' | 'completed' | 'error'
  prompt: string
  sourceAttachmentId?: string
  images: DesignImageVariant[]
  errorText?: string
}

/**
 * Derive the card from the frozen running or settled tool block.
 * @param toolName - generate_image or edit_image.
 * @param block - durable tool-call or tool-result block.
 * @returns a replay-stable view model.
 */
export function parseDesignImageBlock(
  toolName: string,
  block: ToolCallBlock,
): DesignImageViewModel {
  const operation = toolName === 'edit_image' ? 'edit' : 'generate'
  if (!('kind' in block)) {
    return {
      operation,
      status: 'running',
      prompt: promptFromArgs(block.argsRaw),
      images: [],
    }
  }
  if (block.isError) {
    return {
      operation,
      status: 'error',
      prompt: promptFromArgs(block.call?.argsRaw ?? ''),
      images: [],
      errorText: errorText(block),
    }
  }
  const meta = asMeta(block.meta) ?? asMeta((block.resultView as { meta?: unknown } | null)?.meta)
  const fromMeta = metaImages(meta)
  const fromContent = contentImages(block)
  const images = fromMeta.length > 0 ? fromMeta : fromContent
  return {
    operation,
    status: 'completed',
    prompt: typeof meta?.prompt === 'string' ? meta.prompt : promptFromArgs(block.call?.argsRaw ?? ''),
    ...typeof meta?.source_attachment_id === 'string'
      ? { sourceAttachmentId: meta.source_attachment_id }
      : {},
    images,
  }
}

function promptFromArgs(argsRaw: string): string {
  try {
    const parsed = JSON.parse(argsRaw) as { prompt?: unknown; instruction?: unknown }
    if (typeof parsed.prompt === 'string') return parsed.prompt
    if (typeof parsed.instruction === 'string') return parsed.instruction
  } catch {
    // Streaming args may be a truncated prefix.
  }
  return ''
}

function errorText(block: Extract<ToolCallBlock, { kind: 'tool-result' }>): string {
  const parts: string[] = []
  for (const item of block.content) {
    if (item.type === 'text') parts.push(item.text)
  }
  if (parts.length === 0 && block.error !== undefined) {
    parts.push(`${block.error.name}: ${block.error.code}`)
  }
  return parts.join('\n') || 'Image generation failed'
}

function asMeta(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function metaImages(meta: Record<string, unknown> | undefined): DesignImageVariant[] {
  if (!Array.isArray(meta?.images)) return []
  const images: DesignImageVariant[] = []
  for (const item of meta.images) {
    if (typeof item !== 'object' || item === null) continue
    const record = item as { attachment?: { attachmentId?: unknown; name?: unknown; mediaType?: unknown }; variant_index?: unknown }
    const attachmentId = record.attachment?.attachmentId
    if (typeof attachmentId !== 'string' || attachmentId.length === 0) continue
    images.push({
      attachmentId,
      variantIndex: typeof record.variant_index === 'number' ? record.variant_index : images.length,
      ...typeof record.attachment?.name === 'string' ? { name: record.attachment.name } : {},
      ...typeof record.attachment?.mediaType === 'string' ? { mediaType: record.attachment.mediaType } : {},
    })
  }
  return images
}

function contentImages(block: Extract<ToolCallBlock, { kind: 'tool-result' }>): DesignImageVariant[] {
  const images: DesignImageVariant[] = []
  const scan = (content: readonly unknown[]): void => {
    for (const value of content) {
      if (typeof value !== 'object' || value === null) continue
      const item = value as {
        type?: unknown
        attachment?: { attachmentId?: unknown; name?: unknown; mediaType?: unknown }
      }
      if (item.type === 'image' && typeof item.attachment?.attachmentId === 'string') {
        images.push({
          attachmentId: item.attachment.attachmentId,
          variantIndex: images.length,
          ...typeof item.attachment.name === 'string' ? { name: item.attachment.name } : {},
          ...typeof item.attachment.mediaType === 'string' ? { mediaType: item.attachment.mediaType } : {},
        })
      }
    }
  }
  scan(block.content)
  if (block.resultView?.card === 'generic' && Array.isArray(block.resultView.content)) {
    scan(block.resultView.content)
  }
  return images
}
