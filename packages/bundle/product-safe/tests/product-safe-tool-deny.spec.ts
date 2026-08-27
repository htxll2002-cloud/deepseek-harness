/**
 * Hostile tool calls against the product-safe registry. Security is
 * registration absence, not a system-prompt request to avoid shell.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { DANGEROUS_TOOL_NAMES, executeNamedTool, launchProductSafe, PRODUCT_SAFE_ECHO_NAME, type ProductSafeWorld } from './harness.ts'

describe('product-safe-tool-deny', () => {
  let world: ProductSafeWorld | undefined
  afterEach(async () => {
    await world?.close()
    world = undefined
  })

  it('keeps dangerous tools unregistered on the host and after session compose', async () => {
    world = await launchProductSafe()
    const { ctx } = world
    const hostNames = new Set(ctx.tools.schemas().map(schema => schema.name))
    expect(hostNames.has(PRODUCT_SAFE_ECHO_NAME)).toBe(false)
    for (const name of DANGEROUS_TOOL_NAMES) {
      expect(hostNames.has(name), `host registry ${name}`).toBe(false)
      const denied = await executeNamedTool(ctx, name, {})
      expect(denied.isError, name).toBe(true)
    }

    const created = await ctx.apiProxy.sessions.create({
      rpcId: 'product-safe-create' as never,
      payload: {},
    })
    expect(created.result.ok).toBe(true)
    if (!created.result.ok) throw new Error('unreachable')
    const sessionId = created.result.value.sessionId
    const agent = ctx.agents.get(sessionId)
    expect(agent).toBeDefined()
    const scoped = new Set(ctx.tools.schemas(agent).map(schema => schema.name))
    expect(scoped.has(PRODUCT_SAFE_ECHO_NAME)).toBe(true)
    for (const name of DANGEROUS_TOOL_NAMES) {
      expect(scoped.has(name), `session registry ${name}`).toBe(false)
      const denied = await executeNamedTool(ctx, name, {}, agent)
      expect(denied.isError, name).toBe(true)
    }
  })
})
