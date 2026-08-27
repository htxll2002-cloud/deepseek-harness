import { afterEach, describe, expect, it } from 'vitest'
import { GENERATE_IMAGE_NAME } from '../src/index.ts'
import { closeImageToolHomes, executeImageTool, generateValue, setupImageTools } from './harness.ts'

afterEach(async () => {
  await closeImageToolHomes()
})

describe('multi-variant', () => {
  it('returns N unique attachment ids from one generate_image tool call', async () => {
    const ctx = await setupImageTools()
    const value = generateValue(await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'four cafe chairs in one call',
      count: 4,
    }))
    expect(value.images).toHaveLength(4)
    const ids = value.images.map(item => String(item.attachment.attachmentId))
    expect(new Set(ids).size).toBe(4)
    expect(value.images.map(item => item.variant_index)).toEqual([0, 1, 2, 3])
    expect(value.images.every(item => item.attachment.mediaType === 'image/png')).toBe(true)
    expect(value.images.every(item => item.attachment.name !== undefined)).toBe(true)
  })
})
