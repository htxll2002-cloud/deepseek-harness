import { afterEach, describe, expect, it, vi } from 'vitest'
import { GENERATE_IMAGE_NAME, MAX_PROMPT_CHARS } from '../src/index.ts'
import {
  closeImageToolHomes,
  executeImageTool,
  generateValue,
  setupImageTools,
} from './harness.ts'

afterEach(async () => {
  await closeImageToolHomes()
  vi.restoreAllMocks()
})

describe('generate-image-tool', () => {
  it('registers generate_image and accepts count 1-4', async () => {
    const ctx = await setupImageTools()
    const schema = ctx.tools.schemas().find(item => item.name === GENERATE_IMAGE_NAME)
    expect(schema).toBeDefined()
    for (const count of [1, 2, 3, 4] as const) {
      const result = await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
        prompt: `count ${String(count)} cafe chair`,
        count,
      })
      expect(result.isError).toBe(false)
      const value = generateValue(result)
      expect(value.status).toBe('completed')
      expect(value.count).toBe(count)
      expect(value.images).toHaveLength(count)
    }
  })

  it('defaults count to 2 and aspect_ratio to 1:1', async () => {
    const ctx = await setupImageTools()
    const value = generateValue(await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'default cafe chair',
    }))
    expect(value.count).toBe(2)
    expect(value.aspect_ratio).toBe('1:1')
    expect(value.images).toHaveLength(2)
  })

  it('rejects invalid count, invalid aspect ratio, and empty prompt', async () => {
    const ctx = await setupImageTools()
    const badCount = await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'chair',
      count: 5,
    })
    expect(badCount.isError).toBe(true)

    const badRatio = await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'chair',
      aspect_ratio: '21:9',
    })
    expect(badRatio.isError).toBe(true)

    const empty = await executeImageTool(ctx, GENERATE_IMAGE_NAME, { prompt: '   ' })
    expect(empty.isError).toBe(true)
    expect(empty.content.some(block => block.type === 'text' && block.text.includes('non-empty'))).toBe(true)

    const oversized = await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'x'.repeat(MAX_PROMPT_CHARS + 1),
    })
    expect(oversized.isError).toBe(true)
  })

  it('returns a structured error for [M2_FAIL] without crashing the registry', async () => {
    const ctx = await setupImageTools()
    const failed = await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'night cafe [M2_FAIL]',
    })
    expect(failed.isError).toBe(true)
    expect(failed.content.some(block => block.type === 'text' && block.text.includes('M2 mock generation failed'))).toBe(true)
    const recovered = await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'night cafe recovered',
      count: 1,
    })
    expect(recovered.isError).toBe(false)
  })

  it('does not call fetch or open a remote image URL', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      throw new Error('network must not run')
    })
    const ctx = await setupImageTools()
    const value = generateValue(await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'offline chair',
      count: 1,
    }))
    expect(value.images[0]?.attachment.mediaType).toBe('image/png')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('is deterministic for the same prompt, count, aspect, and variant', async () => {
    const ctx = await setupImageTools()
    const first = generateValue(await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'same cafe chair',
      count: 2,
      aspect_ratio: '4:3',
    }))
    const second = generateValue(await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'same cafe chair',
      count: 2,
      aspect_ratio: '4:3',
    }))
    expect(first.images.map(item => item.attachment.attachmentId))
      .toEqual(second.images.map(item => item.attachment.attachmentId))
  })
})
