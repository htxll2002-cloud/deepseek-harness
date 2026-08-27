/**
 * Keyless mock LLM for the product-safe Design spike. Never calls a paid provider.
 * @module @deepseek-ai/dsh-product-safe/llm-mock
 */

import type { Context } from '@deepseek-ai/cordis'
import {
  EDIT_IMAGE_NAME,
  GENERATE_IMAGE_NAME,
  parseEditSourceToken,
  stripEditSourceToken,
} from '@deepseek-ai/dsh-image-tools'
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

function toolChunks(name: string, args: unknown, callId: string): StreamChunk[] {
  const argumentsJson = JSON.stringify(args)
  const id = CallId(callId)
  return [
    { type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id, name, argumentsDelta: argumentsJson },
    {
      type: 'block-end',
      index: 0,
      block: { type: 'tool-call', id, name, arguments: argumentsJson },
    },
    { type: 'usage', usage: { inputTokens: 8, outputTokens: 8 } },
    { type: 'finish', reason: { kind: 'tool-calls' } },
  ]
}

/**
 * Last non-tool user text in the request.
 * @param options - the mock generate request.
 * @returns concatenated user text, or an empty string.
 */
export function lastUserText(options: GenerateOptions): string {
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

function toolNames(options: GenerateOptions): Set<string> {
  return new Set((options.tools ?? []).map(tool => tool.name))
}

/**
 * Parse an explicit 1–4 count from the user text; default 2.
 * @param text - latest user prompt.
 * @returns requested variant count.
 */
export function parseRequestedCount(text: string): 1 | 2 | 3 | 4 {
  if (/(四张|4\s*(张|images?)|four)/i.test(text)) return 4
  if (/(三张|3\s*(张|images?)|three)/i.test(text)) return 3
  if (/(两张|2\s*(张|images?)|two)/i.test(text)) return 2
  if (/(一[张幅]|1\s*(张|images?)|one)/i.test(text)) return 1
  return 2
}

/**
 * Whether the user asked to create images.
 * @param text - latest user prompt.
 * @returns true when the text looks like a generate request.
 */
export function wantsGenerateImage(text: string): boolean {
  return /(生成|generate|画|draw|图片|image|椅子|chair|咖啡)/i.test(text)
}

/**
 * Deterministic Design-spike routing. Emits generate_image / edit_image only
 * when those tools are in the request catalog. Echo stays available when remounted.
 * @param options - the mock generate request.
 * @param seq - monotonic id used in fake tool-call ids.
 * @returns stream chunks for one mock turn.
 */
export function planProductSafeMock(options: GenerateOptions, seq: number): StreamChunk[] {
  if (lastIsToolResult(options)) return textChunks('Design image spike complete')
  const text = lastUserText(options)
  const names = toolNames(options)
  const source = parseEditSourceToken(text)
  if (source !== undefined && names.has(EDIT_IMAGE_NAME)) {
    const instruction = stripEditSourceToken(text)
    return toolChunks(EDIT_IMAGE_NAME, {
      source_attachment_id: source,
      instruction: instruction.length > 0 ? instruction : text,
    }, `m2-edit-${String(seq)}`)
  }
  if (text.startsWith('echo:') && names.has(PRODUCT_SAFE_ECHO_NAME)) {
    return toolChunks(PRODUCT_SAFE_ECHO_NAME, {
      text: text.slice('echo:'.length).trim(),
    }, `m2-echo-${String(seq)}`)
  }
  if (wantsGenerateImage(text) && names.has(GENERATE_IMAGE_NAME)) {
    return toolChunks(GENERATE_IMAGE_NAME, {
      prompt: text,
      count: parseRequestedCount(text),
    }, `m2-generate-${String(seq)}`)
  }
  return textChunks('Design Image Spike Agent.')
}

/** Keyless adapter: generate/edit when asked, otherwise a fixed design-spike reply. */
class ProductSafeMockAdapter extends LlmAdapter {
  private seq = 0

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
    this.seq += 1
    const chunks = planProductSafeMock(options, this.seq)
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
