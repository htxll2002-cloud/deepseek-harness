import { describe, expect, it } from 'vitest'
import type { GenerateOptions, Message } from '@deepseek-ai/dsh-llm'
import { parseRequestedCount, planProductSafeMock, wantsGenerateImage } from '../src/llm-mock.ts'

function options(text: string, tools: string[], extra: Message[] = []): GenerateOptions {
  return {
    provider: 'product-safe-mock',
    model: 'product-safe-mock',
    messages: [
      ...extra,
      {
        id: 'u1' as never,
        role: 'user',
        source: { kind: 'user' },
        content: [{ type: 'text', text }],
      },
    ],
    tools: tools.map(name => ({ name, description: name, parameters: { type: 'object', properties: {} } })),
  }
}

describe('product-safe mock routing', () => {
  it('parses Chinese and English counts', () => {
    expect(parseRequestedCount('生成两张咖啡厅里的椅子')).toBe(2)
    expect(parseRequestedCount('generate four chairs')).toBe(4)
    expect(parseRequestedCount('画一张海报')).toBe(1)
    expect(wantsGenerateImage('生成两张咖啡厅里的椅子')).toBe(true)
  })

  it('emits generate_image only when that tool is catalogued', () => {
    const chunks = planProductSafeMock(options('生成两张咖啡厅里的椅子', ['generate_image', 'edit_image']), 1)
    const call = chunks.find(chunk => chunk.type === 'block-end' && 'block' in chunk)
    expect(call).toMatchObject({
      block: {
        type: 'tool-call',
        name: 'generate_image',
        arguments: JSON.stringify({ prompt: '生成两张咖啡厅里的椅子', count: 2 }),
      },
    })
    const silent = planProductSafeMock(options('生成两张咖啡厅里的椅子', []), 1)
    expect(silent.some(chunk => chunk.type === 'finish' && chunk.reason.kind === 'stop')).toBe(true)
  })

  it('emits edit_image with the explicit source token and never infers the last image', () => {
    const chunks = planProductSafeMock(options('[source:sha256:variant-2] 把背景改成夜景', ['generate_image', 'edit_image']), 2)
    const call = chunks.find(chunk => chunk.type === 'block-end' && 'block' in chunk)
    expect(call).toMatchObject({
      block: {
        type: 'tool-call',
        name: 'edit_image',
        arguments: JSON.stringify({
          source_attachment_id: 'sha256:variant-2',
          instruction: '把背景改成夜景',
        }),
      },
    })
  })

  it('keeps echo only when the fixture is remounted', () => {
    const withEcho = planProductSafeMock(options('echo: ping', ['product_safe_echo']), 3)
    expect(withEcho.some(chunk => chunk.type === 'block-end' && 'block' in chunk && chunk.block.type === 'tool-call' && chunk.block.name === 'product_safe_echo')).toBe(true)
    const without = planProductSafeMock(options('echo: ping', ['generate_image']), 3)
    expect(without.some(chunk => chunk.type === 'finish' && chunk.reason.kind === 'stop')).toBe(true)
  })
})
