/**
 * Fixture static platform tool for M1: echo text. Not a Design tool.
 * @module @deepseek-ai/dsh-product-safe/echo
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

/** Stable Cordis plugin name. */
export const name = 'product-safe-echo'

/** Services required before the fixture tool can register. */
export const inject = ['tools']

/** Wire name the hostile-tool tests and the mock LLM share. */
export const PRODUCT_SAFE_ECHO_NAME = 'product_safe_echo'

/**
 * Register the echo fixture on the current tool scope (host or preset).
 * @param ctx - plugin context carrying the tool registry.
 */
export function apply(ctx: Context): void {
  ctx.tools.register(defineTool({
    name: PRODUCT_SAFE_ECHO_NAME,
    description: 'Echo the supplied text. Fixture tool for the product-safe profile.',
    parameters: {
      text: {
        type: 'string',
        required: true,
        description: 'Text to echo back unchanged.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          text: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.text }],
    },
    presentCall: args => ({ card: 'generic', title: `echo ${args.text}` }),
    presentResult: (_args, result) => ({
      card: 'generic',
      title: result.isError ? 'echo failed' : 'echo',
    }),
    execute(args) {
      return Promise.resolve({ text: args.text })
    },
  }))
}
