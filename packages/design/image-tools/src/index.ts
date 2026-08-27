/**
 * First-party generate_image / edit_image tools for the product-safe Design spike.
 * Mount from a preset so the tools stay off the host-global catalog.
 * @module @deepseek-ai/dsh-image-tools
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineEditImageTool, defineGenerateImageTool } from './tools.ts'

export {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_EDIT_COUNT,
  DEFAULT_IMAGE_COUNT,
  EDIT_IMAGE_NAME,
  EDIT_SOURCE_TOKEN_PREFIX,
  GENERATE_IMAGE_NAME,
  IMAGE_COUNTS,
  M2_FAIL_TOKEN,
  MAX_PROMPT_CHARS,
  MOCK_DELAY_MS,
} from './types.ts'
export type {
  AspectRatio,
  DesignImagePresentationMeta,
  DesignImageResultItem,
  EditImageValue,
  GenerateImageValue,
  ImageCount,
} from './types.ts'
export { findExplicitImageAttachment } from './source.ts'
export { encodeLabeledPng, sizeForAspect } from './mock-png.ts'
export { generateMockImages, mockLines } from './mock-generator.ts'
export { editSourceToken, parseEditSourceToken, stripEditSourceToken } from './edit-source.ts'

/** Stable Cordis plugin name. */
export const name = 'design-image-tools'

/** Tools and the official attachment store. */
export const inject = ['tools', 'attachments']

/**
 * Register generate_image and edit_image on the current tool scope.
 * @param ctx - plugin context carrying tools and attachments.
 */
export function apply(ctx: Context): void {
  const services = { attachments: ctx.attachments }
  ctx.tools.register(defineGenerateImageTool(services))
  ctx.tools.register(defineEditImageTool(services))
}
