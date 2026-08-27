/**
 * Static platform plugin: product_safe_echo is loadable from the preset.
 * Users cannot add a new tool through Host HTTP.
 */

import { afterEach, describe, expect, it } from 'vitest'
import {
  executeNamedTool,
  hostRpc,
  launchProductSafe,
  PRODUCT_SAFE_ECHO_NAME,
  type ProductSafeWorld,
} from './harness.ts'

describe('static platform plugin', () => {
  let world: ProductSafeWorld | undefined
  afterEach(async () => {
    await world?.close()
    world = undefined
  })

  it('runs the echo fixture through the mock LLM and denies dynamic install', async () => {
    world = await launchProductSafe()
    const created = await hostRpc(world.baseUrl, 'session.create', {})
    const { sessionId } = (created.body as { result: { value: { sessionId: string } } }).result.value
    const agent = world.ctx.agents.get(sessionId as never)
    expect(agent).toBeDefined()

    const echo = await executeNamedTool(world.ctx, PRODUCT_SAFE_ECHO_NAME, { text: 'ping' }, agent)
    expect(echo.isError).toBe(false)

    const prompted = await hostRpc(world.baseUrl, 'session.prompt', {
      sessionId,
      mode: 'queue',
      content: [{ type: 'text', text: 'echo: ping' }],
    })
    expect(prompted.status).toBe(200)
    await agent?.whenIdle()
    const events = [...(agent?.session.events ?? [])]
    const names = events
      .filter(event => event.type === 'tool/call' || event.type === 'tool/result')
      .map(event => (event.data as { name?: string }).name)
    expect(names).toContain(PRODUCT_SAFE_ECHO_NAME)

    const install = await hostRpc(world.baseUrl, 'plugin.install', {
      package: 'malicious-shell-plugin',
    })
    expect(install.status).toBe(404)
    const after = new Set(world.ctx.tools.schemas(agent).map(schema => schema.name))
    expect([...after].every(name => name === PRODUCT_SAFE_ECHO_NAME || !name.includes('malicious'))).toBe(true)
    expect(after.size).toBe(1)
    expect(after.has(PRODUCT_SAFE_ECHO_NAME)).toBe(true)
  })
})
