/** Shared contracts for the M2 design image tools. @module @deepseek-ai/dsh-image-tools/types */

import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'

/** Allowed generate/edit counts. */
export const IMAGE_COUNTS = [1, 2, 3, 4] as const

/** One allowed variant count. */
export type ImageCount = typeof IMAGE_COUNTS[number]

/** Allowed aspect-ratio strings. */
export const ASPECT_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16'] as const

/** One allowed aspect-ratio string. */
export type AspectRatio = typeof ASPECT_RATIOS[number]

/** Default generate count. */
export const DEFAULT_IMAGE_COUNT: ImageCount = 2

/** Default generate aspect ratio. */
export const DEFAULT_ASPECT_RATIO: AspectRatio = '1:1'

/** Default edit count. */
export const DEFAULT_EDIT_COUNT: ImageCount = 1

/** Prompt character cap applied in execute, not in the JSON Schema subset. */
export const MAX_PROMPT_CHARS = 2000

/** Deterministic mock delay used only to exercise the Tool View loading state. */
export const MOCK_DELAY_MS = 80

/** Token that forces a structured generate_image failure. */
export const M2_FAIL_TOKEN = '[M2_FAIL]'

/** Wire name for generate. */
export const GENERATE_IMAGE_NAME = 'generate_image'

/** Wire name for edit. */
export const EDIT_IMAGE_NAME = 'edit_image'

/** Composer token that Continue Editing writes so the next edit is explicit. */
export const EDIT_SOURCE_TOKEN_PREFIX = '[source:'

/** One image inside a completed tool result. */
export interface DesignImageResultItem {
  attachment: ImageAttachmentRef
  variant_index: number
}

/** Durable generate_image value stored in the tool result. */
export interface GenerateImageValue {
  status: 'completed'
  images: DesignImageResultItem[]
  prompt: string
  count: ImageCount
  aspect_ratio: AspectRatio
}

/** Durable edit_image value stored in the tool result. */
export interface EditImageValue {
  status: 'completed'
  source_attachment_id: string
  images: DesignImageResultItem[]
  instruction: string
  count: ImageCount
}

/** Presentation meta written beside the tool result for Tool View replay. */
export interface DesignImagePresentationMeta {
  kind: 'design-image'
  operation: 'generate' | 'edit'
  status: 'completed'
  images: DesignImageResultItem[]
  prompt: string
  count: ImageCount
  aspect_ratio?: AspectRatio
  source_attachment_id?: string
}
