/**
 * Offline deterministic mock image generator. Never fetches a remote image.
 * @module @deepseek-ai/dsh-image-tools/mock-generator
 */

import type { AttachmentStore, ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { encodeLabeledPng } from './mock-png.ts'
import {
  MOCK_DELAY_MS,
  type AspectRatio,
  type DesignImageResultItem,
  type ImageCount,
} from './types.ts'

/** One mock generate or edit request. */
export interface MockGenerateRequest {
  prompt: string
  count: ImageCount
  aspectRatio: AspectRatio
  variantLabel: 'generate' | 'edit'
  sourceAttachmentId?: string
}

/**
 * Sleep the UI-only mock delay unless the caller already aborted.
 * @param signal - abort signal from the tool execution.
 */
export async function waitMockDelay(signal: AbortSignal): Promise<void> {
  if (signal.aborted) throw abortError(signal)
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, MOCK_DELAY_MS)
    const onAbort = (): void => {
      clearTimeout(timer)
      reject(abortError(signal))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Encode and persist one batch of unique mock attachments.
 * @param attachments - official session attachment store.
 * @param request - mock prompt, count, aspect, and optional source.
 * @returns variant items with unique attachment ids.
 */
export async function generateMockImages(
  attachments: AttachmentStore,
  request: MockGenerateRequest,
): Promise<DesignImageResultItem[]> {
  const images: DesignImageResultItem[] = []
  for (let variantIndex = 0; variantIndex < request.count; variantIndex += 1) {
    const data = encodeLabeledPng({
      lines: mockLines(request, variantIndex),
      aspectRatio: request.aspectRatio,
      variantIndex,
      edit: request.variantLabel === 'edit',
    })
    const attachment = await attachments.saveImage({
      data,
      mediaType: 'image/png',
      name: mockName(request, variantIndex),
    })
    images.push({ attachment, variant_index: variantIndex })
  }
  return images
}

/**
 * Visible mock labels so a human can tell variants and lineage apart.
 * @param request - mock prompt and lineage.
 * @param variantIndex - zero-based variant.
 * @returns lines drawn onto the PNG.
 */
export function mockLines(request: MockGenerateRequest, variantIndex: number): string[] {
  const lines = [
    `VARIANT ${String(variantIndex + 1)}`,
    request.variantLabel.toUpperCase(),
    request.aspectRatio,
    request.prompt,
  ]
  if (request.sourceAttachmentId !== undefined) {
    lines.push(`SRC ${shortId(request.sourceAttachmentId)}`)
  }
  return lines
}

function mockName(request: MockGenerateRequest, variantIndex: number): string {
  const kind = request.variantLabel === 'edit' ? 'edited' : 'generated'
  return `${kind}-variant-${String(variantIndex + 1)}.png`
}

function shortId(id: string): string {
  return id.length <= 12 ? id : id.slice(0, 12)
}

function abortError(signal: AbortSignal): Error {
  return signal.reason instanceof Error ? signal.reason : new Error('aborted')
}

export type { ImageAttachmentRef }
