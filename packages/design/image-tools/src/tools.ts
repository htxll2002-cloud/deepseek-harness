/**
 * generate_image and edit_image definitions. Provider-free; mock only.
 * @module @deepseek-ai/dsh-image-tools/tools
 */

import type { AttachmentStore, ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { JsonValue } from '@deepseek-ai/dsh-session'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import { defineTool, type ToolDefinition, type ToolResult } from '@deepseek-ai/dsh-tools'
import { generateMockImages, waitMockDelay } from './mock-generator.ts'
import { findExplicitImageAttachment } from './source.ts'
import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_EDIT_COUNT,
  DEFAULT_IMAGE_COUNT,
  EDIT_IMAGE_NAME,
  GENERATE_IMAGE_NAME,
  IMAGE_COUNTS,
  type AspectRatio,
  type DesignImagePresentationMeta,
  type DesignImageResultItem,
  type EditImageValue,
  type GenerateImageValue,
} from './types.ts'
import { rejectFailToken, requirePrompt, resolveAspectRatio, resolveCount } from './validate.ts'

/** Services the tool bodies read. */
export interface ImageToolServices {
  attachments: AttachmentStore
}

const ATTACHMENT_SCHEMA = {
  type: 'object',
  required: true,
  additionalProperties: false,
  properties: {
    attachmentId: { type: 'string', required: true },
    mediaType: { type: 'string', required: true },
    bytes: { type: 'integer', required: true },
    width: { type: 'integer', required: true },
    height: { type: 'integer', required: true },
    name: { type: 'string' },
    originalDimensions: {
      type: 'object',
      additionalProperties: false,
      properties: {
        width: { type: 'integer', required: true },
        height: { type: 'integer', required: true },
      },
    },
  },
} as const

const IMAGE_ITEM_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    attachment: ATTACHMENT_SCHEMA,
    variant_index: { type: 'integer', required: true },
  },
} as const

/**
 * Register generate_image against the current tool scope.
 * @param services - official attachment store used to persist mock PNGs.
 * @returns a registry-ready tool definition.
 */
export function defineGenerateImageTool(services: ImageToolServices): ToolDefinition {
  return defineTool({
    name: GENERATE_IMAGE_NAME,
    description:
      'Generate 1-4 new images from a prompt. Use when the user asks to create, draw, or generate images. '
      + 'Do not choose a provider or model. count defaults to 2. aspect_ratio defaults to 1:1. '
      + 'Allowed aspect ratios: 1:1, 4:3, 3:4, 16:9, 9:16.',
    parameters: {
      prompt: {
        type: 'string',
        required: true,
        description: 'Complete visual description of the images to generate.',
      },
      count: {
        type: 'integer',
        enum: IMAGE_COUNTS,
        description: 'How many variants to return in this one tool call. Default 2.',
      },
      aspect_ratio: {
        type: 'string',
        enum: ASPECT_RATIOS,
        description: 'Output aspect ratio. Default 1:1.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', required: true },
          images: { type: 'array', items: IMAGE_ITEM_SCHEMA },
          prompt: { type: 'string', required: true },
          count: { type: 'integer', required: true },
          aspect_ratio: { type: 'string', required: true },
        },
      },
      render: (_args, value: GenerateImageValue) => renderImages(value.images, `Generated ${String(value.count)} image(s) for: ${value.prompt}`),
      presentationMeta: (_args, value: GenerateImageValue): JsonValue => jsonMeta({
        kind: 'design-image',
        operation: 'generate',
        status: 'completed',
        images: value.images,
        prompt: value.prompt,
        count: value.count,
        aspect_ratio: value.aspect_ratio,
      }),
    },
    presentCall: args => ({
      card: 'generic',
      title: `Generate ${String(args.count ?? DEFAULT_IMAGE_COUNT)} image(s)`,
    }),
    presentResult: (_args, result) => imagePresentation(result, 'Generated images'),
    async execute(args, exec): Promise<GenerateImageValue> {
      const prompt = requirePrompt(args.prompt, 'prompt')
      rejectFailToken(prompt)
      const count = resolveCount(args.count, DEFAULT_IMAGE_COUNT)
      const aspectRatio = resolveAspectRatio(args.aspect_ratio)
      await waitMockDelay(exec.signal)
      const images = await generateMockImages(services.attachments, {
        prompt,
        count,
        aspectRatio,
        variantLabel: 'generate',
      })
      return {
        status: 'completed',
        images,
        prompt,
        count,
        aspect_ratio: aspectRatio,
      }
    },
  })
}

/**
 * Register edit_image against the current tool scope.
 * @param services - official attachment store used to persist mock PNGs.
 * @returns a registry-ready tool definition.
 */
export function defineEditImageTool(services: ImageToolServices): ToolDefinition {
  return defineTool({
    name: EDIT_IMAGE_NAME,
    description:
      'Edit one already-selected image. source_attachment_id is required and must be the exact '
      + 'attachment the user selected. Never infer the newest conversation image. '
      + 'instruction describes the change. count defaults to 1.',
    parameters: {
      source_attachment_id: {
        type: 'string',
        required: true,
        description: 'Exact attachment id of the selected source image.',
      },
      instruction: {
        type: 'string',
        required: true,
        description: 'The change to apply while keeping everything else.',
      },
      count: {
        type: 'integer',
        enum: IMAGE_COUNTS,
        description: 'How many edited variants to return in this one tool call. Default 1.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { type: 'string', required: true },
          source_attachment_id: { type: 'string', required: true },
          images: { type: 'array', items: IMAGE_ITEM_SCHEMA },
          instruction: { type: 'string', required: true },
          count: { type: 'integer', required: true },
        },
      },
      render: (_args, value: EditImageValue) => renderImages(
        value.images,
        `Edited ${String(value.count)} image(s) from ${value.source_attachment_id}: ${value.instruction}`,
      ),
      presentationMeta: (_args, value: EditImageValue): JsonValue => jsonMeta({
        kind: 'design-image',
        operation: 'edit',
        status: 'completed',
        images: value.images,
        prompt: value.instruction,
        count: value.count,
        source_attachment_id: value.source_attachment_id,
      }),
    },
    presentCall: args => ({
      card: 'generic',
      title: `Edit image ${args.source_attachment_id}`,
    }),
    presentResult: (_args, result) => imagePresentation(result, 'Edited images'),
    async execute(args, exec): Promise<EditImageValue> {
      const sourceAttachmentId = args.source_attachment_id.trim()
      if (sourceAttachmentId.length === 0) {
        throw new Error('source_attachment_id is required and must not be empty')
      }
      const instruction = requirePrompt(args.instruction, 'instruction')
      rejectFailToken(instruction)
      const count = resolveCount(args.count, DEFAULT_EDIT_COUNT)
      const source = findExplicitImageAttachment(exec.agent?.session, sourceAttachmentId)
      if (source === undefined) {
        throw new Error(
          `edit_image could not find source_attachment_id ${sourceAttachmentId} in the current session`,
        )
      }
      await waitMockDelay(exec.signal)
      const images = await generateMockImages(services.attachments, {
        prompt: instruction,
        count,
        aspectRatio: aspectOf(source),
        variantLabel: 'edit',
        sourceAttachmentId,
      })
      return {
        status: 'completed',
        source_attachment_id: sourceAttachmentId,
        images,
        instruction,
        count,
      }
    },
  })
}

function jsonMeta(meta: DesignImagePresentationMeta): JsonValue {
  return JSON.parse(JSON.stringify(meta)) as JsonValue
}

function renderImages(images: readonly DesignImageResultItem[], summary: string): ContentBlock[] {
  return [
    { type: 'text', text: summary },
    ...images.map((item): ContentBlock => ({ type: 'image', attachment: item.attachment })),
  ]
}

function imagePresentation(result: ToolResult, title: string) {
  if (result.isError) return { card: 'generic' as const, title: `${title} failed` }
  const images = result.content.filter((block): block is Extract<ContentBlock, { type: 'image' }> => block.type === 'image')
  if (images.length === 0) return { card: 'generic' as const, title }
  return {
    card: 'generic' as const,
    title,
    content: images,
  }
}

function aspectOf(ref: ImageAttachmentRef): AspectRatio {
  if (ref.width === ref.height) return '1:1'
  const ratio = ref.width / ref.height
  if (Math.abs(ratio - 4 / 3) < 0.05) return '4:3'
  if (Math.abs(ratio - 3 / 4) < 0.05) return '3:4'
  if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9'
  if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16'
  return DEFAULT_ASPECT_RATIO
}
