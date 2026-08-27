/**
 * Completed image cards rebuild from the durable ToolCallBlock.
 * Replay must not need React memory, IndexedDB, or a second image store.
 */
import { describe, expect, it } from 'vitest'
import type { RunningToolCall, ToolResultNode } from '@deepseek-ai/dsh-client-runtime/client'
import { parseDesignImageBlock } from '../src/client/parse-result.ts'

const VARIANT_1 = 'sha256:replay-one'
const VARIANT_2 = 'sha256:replay-two'

function completedGenerate(): ToolResultNode {
  return {
    kind: 'tool-result',
    seq: 4,
    time: 4000,
    callId: 'gen-replay',
    call: { name: 'generate_image', argsRaw: '{"prompt":"night cafe","count":2}' },
    callTime: 3500,
    content: [],
    isError: false,
    meta: {
      kind: 'design-image',
      operation: 'generate',
      status: 'completed',
      prompt: 'night cafe',
      count: 2,
      images: [
        {
          attachment: { attachmentId: VARIANT_1, name: 'generated-variant-1.png', mediaType: 'image/png' },
          variant_index: 0,
        },
        {
          attachment: { attachmentId: VARIANT_2, name: 'generated-variant-2.png', mediaType: 'image/png' },
          variant_index: 1,
        },
      ],
    },
    callView: null,
    resultView: null,
    subCalls: [],
  }
}

describe('replay', () => {
  it('rebuilds completed generate_image variants from the durable tool result', () => {
    const model = parseDesignImageBlock('generate_image', completedGenerate())
    expect(model.status).toBe('completed')
    expect(model.operation).toBe('generate')
    expect(model.prompt).toBe('night cafe')
    expect(model.images.map(image => image.attachmentId)).toEqual([VARIANT_1, VARIANT_2])
    expect(model.images.map(image => image.variantIndex)).toEqual([0, 1])
  })

  it('rebuilds edit lineage from presentation meta', () => {
    const block: ToolResultNode = {
      ...completedGenerate(),
      call: { name: 'edit_image', argsRaw: '{"source_attachment_id":"sha256:source","instruction":"night"}' },
      meta: {
        kind: 'design-image',
        operation: 'edit',
        status: 'completed',
        prompt: 'night',
        count: 1,
        source_attachment_id: 'sha256:source',
        images: [
          { attachment: { attachmentId: 'sha256:edited' }, variant_index: 0 },
        ],
      },
    }
    const model = parseDesignImageBlock('edit_image', block)
    expect(model.operation).toBe('edit')
    expect(model.sourceAttachmentId).toBe('sha256:source')
    expect(model.images).toEqual([{ attachmentId: 'sha256:edited', variantIndex: 0 }])
  })

  it('shows a running card from the in-flight call without React state', () => {
    const running: RunningToolCall = {
      callId: 'gen-running',
      name: 'generate_image',
      argsRaw: '{"prompt":"loading chair"}',
      turn: 1,
      step: 1,
      time: 1000,
      callView: null,
      subCalls: [],
    }
    const model = parseDesignImageBlock('generate_image', running)
    expect(model.status).toBe('running')
    expect(model.images).toEqual([])
    expect(model.prompt).toBe('loading chair')
  })

  it('shows a structured error without crashing', () => {
    const failed: ToolResultNode = {
      kind: 'tool-result',
      seq: 5,
      time: 5000,
      callId: 'gen-fail',
      call: { name: 'generate_image', argsRaw: '{"prompt":"night [M2_FAIL]"}' },
      callTime: 4500,
      content: [{ type: 'text', text: 'M2 mock generation failed: prompt requested a deterministic failure.' }],
      isError: true,
      error: { name: 'Error', code: 'TOOL_FAILED' },
      callView: null,
      resultView: null,
      subCalls: [],
    }
    const model = parseDesignImageBlock('generate_image', failed)
    expect(model.status).toBe('error')
    expect(model.errorText).toContain('M2 mock generation failed')
    expect(model.images).toEqual([])
  })
})
