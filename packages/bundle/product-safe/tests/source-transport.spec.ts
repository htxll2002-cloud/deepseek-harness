/**
 * UI Continue Editing helper → host mock planner must agree on Variant 2.
 * Hand-writing the composer token would let either side drift.
 */

import { describe, expect, it } from 'vitest'
import { draftWithEditSource } from '@deepseek-ai/dsh-client-ui-design-image/src/client/source-token.ts'
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
import { planProductSafeMock } from '../src/llm-mock.ts'

const VARIANT_2 = 'sha256:variant-two'
const INSTRUCTION = '把背景改成夜景'

function options(text: string): GenerateOptions {
  return {
    provider: 'product-safe-mock',
    model: 'product-safe-mock',
    messages: [
      {
        id: 'u1' as never,
        role: 'user',
        source: { kind: 'user' },
        content: [{ type: 'text', text }],
      },
    ],
    tools: ['generate_image', 'edit_image'].map(name => ({
      name,
      description: name,
      parameters: { type: 'object', properties: {} },
    })),
  }
}

function toolCall(chunks: StreamChunk[]): { name: string; arguments: string } | undefined {
  const end = chunks.find(chunk => chunk.type === 'block-end' && 'block' in chunk)
  if (end === undefined || end.type !== 'block-end' || end.block.type !== 'tool-call') return undefined
  return { name: end.block.name, arguments: end.block.arguments }
}

describe('source-transport', () => {
  it('routes a UI-produced Variant 2 draft to edit_image with that exact source', () => {
    const draft = draftWithEditSource(INSTRUCTION, VARIANT_2)
    expect(draft).toContain(VARIANT_2)
    expect(draft).toContain(INSTRUCTION)

    const call = toolCall(planProductSafeMock(options(draft), 1))
    expect(call?.name).toBe('edit_image')
    expect(JSON.parse(call?.arguments ?? '{}')).toEqual({
      source_attachment_id: VARIANT_2,
      instruction: INSTRUCTION,
    })
  })
})
