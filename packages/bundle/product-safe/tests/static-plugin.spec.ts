/**
 * Static platform plugin: generate_image is loadable from the Design preset.
 * Users cannot add a new tool through Host HTTP.
 */

import { afterEach, describe, expect, it } from 'vitest'
import {
  executeNamedTool,
  hostRpc,
  launchProductSafe,
  type ProductSafeWorld,
} from './harness.ts'

const GENERATE = 'generate_image'
const EDIT = 'edit_image'

describe('static platform plugin', () => {
  let world: ProductSafeWorld | undefined
  afterEach(async () => {
    await world?.close()
    world = undefined
  })

  it('runs generate_image through the mock LLM and denies dynamic install', async () => {
    world = await launchProductSafe()
    const created = await hostRpc(world.baseUrl, 'session.create', {})
    const { sessionId } = (created.body as { result: { value: { sessionId: string } } }).result.value
    const agent = world.ctx.agents.get(sessionId as never)
    expect(agent).toBeDefined()

    const generated = await executeNamedTool(world.ctx, GENERATE, {
      prompt: 'ping chair',
      count: 1,
    }, agent)
    expect(generated.isError).toBe(false)

    const prompted = await hostRpc(world.baseUrl, 'session.prompt', {
      sessionId,
      mode: 'queue',
      content: [{ type: 'text', text: '生成两张咖啡厅里的椅子' }],
    })
    expect(prompted.status).toBe(200)
    await agent?.whenIdle()
    const events = [...(agent?.session.events ?? [])]
    const names = events
      .filter(event => event.type === 'tool/call' || event.type === 'tool/result')
      .map(event => (event.data as { name?: string }).name)
    expect(names).toContain(GENERATE)

    const install = await hostRpc(world.baseUrl, 'plugin.install', {
      package: 'malicious-shell-plugin',
    })
    expect(install.status).toBe(404)
    const after = new Set(world.ctx.tools.schemas(agent).map(schema => schema.name))
    expect(after.size).toBe(2)
    expect(after.has(GENERATE)).toBe(true)
    expect(after.has(EDIT)).toBe(true)
    expect(after.has('product_safe_echo')).toBe(false)
    expect([...after].some(name => name.includes('malicious'))).toBe(false)
  })
})
