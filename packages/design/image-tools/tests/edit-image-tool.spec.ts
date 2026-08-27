import { afterEach, describe, expect, it } from 'vitest'
import { EDIT_IMAGE_NAME, GENERATE_IMAGE_NAME } from '../src/index.ts'
import {
  agentWithSession,
  closeImageToolHomes,
  editValue,
  executeImageTool,
  generateValue,
  recordGeneratedImages,
  setupImageTools,
} from './harness.ts'

afterEach(async () => {
  await closeImageToolHomes()
})

describe('edit-image-tool', () => {
  it('requires an explicit source_attachment_id that already exists', async () => {
    const ctx = await setupImageTools()
    const agent = agentWithSession()
    const generated = generateValue(await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'two cafe chairs',
      count: 2,
    }, agent))
    recordGeneratedImages(agent, generated)

    const missingField = await executeImageTool(ctx, EDIT_IMAGE_NAME, {
      instruction: 'make it night',
    }, agent)
    expect(missingField.isError).toBe(true)

    const empty = await executeImageTool(ctx, EDIT_IMAGE_NAME, {
      source_attachment_id: '   ',
      instruction: 'make it night',
    }, agent)
    expect(empty.isError).toBe(true)

    const unknown = await executeImageTool(ctx, EDIT_IMAGE_NAME, {
      source_attachment_id: 'not-a-real-attachment',
      instruction: 'make it night',
    }, agent)
    expect(unknown.isError).toBe(true)
    expect(unknown.content.some(block => block.type === 'text' && block.text.includes('could not find'))).toBe(true)
  })

  it('records the exact source and rejects a missing session', async () => {
    const ctx = await setupImageTools()
    const agent = agentWithSession()
    const generated = generateValue(await executeImageTool(ctx, GENERATE_IMAGE_NAME, {
      prompt: 'source chair',
      count: 2,
    }, agent))
    recordGeneratedImages(agent, generated)
    const source = generated.images[1]
    expect(source).toBeDefined()
    if (source === undefined) throw new Error('expected variant 2')

    const edited = await executeImageTool(ctx, EDIT_IMAGE_NAME, {
      source_attachment_id: String(source.attachment.attachmentId),
      instruction: 'turn the background into night',
    }, agent)
    expect(edited.isError).toBe(false)
    const value = editValue(edited)
    expect(value.source_attachment_id).toBe(String(source.attachment.attachmentId))
    expect(value.instruction).toBe('turn the background into night')
    expect(value.images).toHaveLength(1)
    expect(value.images[0]?.attachment.attachmentId).not.toBe(source.attachment.attachmentId)

    const noSession = await executeImageTool(ctx, EDIT_IMAGE_NAME, {
      source_attachment_id: String(source.attachment.attachmentId),
      instruction: 'turn the background into night',
    })
    expect(noSession.isError).toBe(true)
  })
})
