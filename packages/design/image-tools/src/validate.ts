/**
 * Execute-time argument checks the JSON Schema subset cannot express.
 * @module @deepseek-ai/dsh-image-tools/validate
 */

import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_EDIT_COUNT,
  DEFAULT_IMAGE_COUNT,
  IMAGE_COUNTS,
  M2_FAIL_TOKEN,
  MAX_PROMPT_CHARS,
  type AspectRatio,
  type ImageCount,
} from './types.ts'

/**
 * Normalize and reject an empty or oversized prompt/instruction.
 * @param value - raw tool argument.
 * @param field - argument name used in error text.
 * @returns trimmed prompt text.
 */
export function requirePrompt(value: string, field: 'prompt' | 'instruction'): string {
  const prompt = value.trim()
  if (prompt.length === 0) throw new Error(`${field} must be a non-empty string`)
  if (prompt.length > MAX_PROMPT_CHARS) {
    throw new Error(`${field} exceeds ${String(MAX_PROMPT_CHARS)} characters`)
  }
  return prompt
}

/**
 * Reject the deterministic failure token after the prompt is known to be non-empty.
 * @param prompt - already-trimmed prompt or instruction.
 */
export function rejectFailToken(prompt: string): void {
  if (prompt.includes(M2_FAIL_TOKEN)) {
    throw new Error('M2 mock generation failed: prompt requested a deterministic failure.')
  }
}

/**
 * Resolve count or throw when the value is outside 1–4.
 * @param value - raw tool argument.
 * @param fallback - default when the argument is omitted.
 * @returns a legal variant count.
 */
export function resolveCount(value: unknown, fallback: ImageCount): ImageCount {
  if (value === undefined) return fallback
  if (typeof value === 'number' && (IMAGE_COUNTS as readonly number[]).includes(value)) {
    return value as ImageCount
  }
  throw new Error('count must be 1, 2, 3, or 4')
}

/**
 * Resolve aspect ratio or throw when the value is outside the allowlist.
 * @param value - raw tool argument.
 * @returns a legal aspect ratio.
 */
export function resolveAspectRatio(value: unknown): AspectRatio {
  if (value === undefined) return DEFAULT_ASPECT_RATIO
  if (typeof value === 'string' && (ASPECT_RATIOS as readonly string[]).includes(value)) {
    return value as AspectRatio
  }
  throw new Error(`aspect_ratio must be one of ${ASPECT_RATIOS.join(', ')}`)
}

export { DEFAULT_EDIT_COUNT, DEFAULT_IMAGE_COUNT }
