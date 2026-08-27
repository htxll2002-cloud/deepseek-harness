/**
 * Keyless mock LLM for the product-safe profile. Never calls a paid provider.
 * @module @deepseek-ai/dsh-product-safe/llm-mock
 */

import type { Context } from '@deepseek-ai/cordis'
import { CallId, LlmAdapter } from '@deepseek-ai/dsh-llm'
import type {
  GenerateOptions, LlmModelInfo, LlmProviderInfo, LlmResolvedModelInfo, StreamChunk,
} from '@deepseek-ai/dsh-llm'
import { PRODUCT_SAFE_ECHO_NAME } from './echo.ts'

/** Stable Cordis plugin name. */
export const name = 'product-safe-llm-mock'

/** Services required before the mock route can register. */
export const inject = ['llm']

/** Provider route this fixture owns. */
export const PRODUCT_SAFE_MOCK_PROVIDER = 'product-safe-mock'

/** Model id this fixture advertises. */
export const PRODUCT_SAFE_MOCK_MODEL = 'product-safe-mock'

function textChunks(text: string): StreamChunk[] {
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text },
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'usage', usage: { inputTokens: 8, outputTokens: text.length } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

function echoToolChunks(text: string): StreamChunk[] {
  const callId = CallId('product-safe-echo')
  const argumentsJson = JSON.stringify({ text })
  return [
    { type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id: callId, name: PRODUCT_SAFE_ECHO_NAME, argumentsDelta: argumentsJson },
    {
      type: 'block-end',
      index: 0,
      block: { type: 'tool-call', id: callId, name: PRODUCT_SAFE_ECHO_NAME, arguments: argumentsJson },
    },
    { type: 'usage', usage: { inputTokens: 8, outputTokens: 8 } },
    { type: 'finish', reason: { kind: 'tool-calls' } },
  ]
}

function lastUserText(options: GenerateOptions): string {
  for (let index = options.messages.length - 1; index >= 0; index -= 1) {
    const message = options.messages[index]
    if (message === undefined || message.source.kind === 'tool') continue
    if (message.role !== 'user') continue
    const text = message.content
      .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
      .map(block => block.text)
      .join('')
    if (text !== '') return text
  }
  return ''
}

function lastIsToolResult(options: GenerateOptions): boolean {
  const last = options.messages.at(-1)
  return last?.source.kind === 'tool'
}

/** Keyless adapter: echo tool when asked, otherwise a fixed safe reply. */
class ProductSafeMockAdapter extends LlmAdapter {
  override providerInfo(provider: string): LlmProviderInfo {
    return { id: provider, name: 'Product-Safe Mock' }
  }

  override listModels(provider: string): Promise<readonly LlmModelInfo[]> {
    return Promise.resolve([{ provider, id: PRODUCT_SAFE_MOCK_MODEL, name: 'Product-Safe Mock' }])
  }

  override resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo> {
    return Promise.resolve({ provider, id: model, name: 'Product-Safe Mock' })
  }

  async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    await Promise.resolve()
    const chunks = lastIsToolResult(options)
      ? textChunks('product-safe echo complete')
      : lastUserText(options).startsWith('echo:')
        ? echoToolChunks(lastUserText(options).slice('echo:'.length).trim())
        : textChunks('Safe Generic Product Agent.')
    for (const chunk of chunks) {
      if (options.signal?.aborted) throw new Error('aborted')
      yield chunk
    }
  }
}

/**
 * Register the keyless product-safe mock route.
 * @param ctx - plugin context carrying the LLM runtime.
 */
export function apply(ctx: Context): void {
  ctx.llm.registerAdapter([PRODUCT_SAFE_MOCK_PROVIDER], new ProductSafeMockAdapter())
}
