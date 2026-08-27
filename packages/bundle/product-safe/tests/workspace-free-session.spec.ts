/**
 * Product-safe session create must not require a local directory.
 */

import { readdir } from 'node:fs/promises'
import { afterEach, describe, expect, it } from 'vitest'
import { hostRpc, launchProductSafe, rpcValue, type ProductSafeWorld } from './harness.ts'

describe('workspace-free session', () => {
  let world: ProductSafeWorld | undefined
  afterEach(async () => {
    await world?.close()
    world = undefined
  })

  it('creates, opens, appends, and persists a session with no cwd', async () => {
    world = await launchProductSafe()
    const created = await hostRpc(world.baseUrl, 'session.create', {})
    expect(created.status).toBe(200)
    const createdValue = rpcValue(created.body) as { sessionId: string }
    const { sessionId } = createdValue
    const session = world.ctx.sessions.get(sessionId as never)
    expect(session).toBeDefined()
    expect(session?.header.cwd).toBeUndefined()

    const listed = await hostRpc(world.baseUrl, 'session.list', {})
    const items = (rpcValue(listed.body) as { items: { sessionId: string; cwd?: string }[] }).items
    expect(items.some(item => item.sessionId === sessionId)).toBe(true)
    expect(items.find(item => item.sessionId === sessionId)?.cwd).toBeUndefined()

    const prompted = await hostRpc(world.baseUrl, 'session.prompt', {
      sessionId,
      mode: 'queue',
      content: [{ type: 'text', text: 'hello product-safe' }],
    })
    expect(prompted.status).toBe(200)
    expect((rpcValue(prompted.body) as { accepted: true }).accepted).toBe(true)
    await world.ctx.agents.get(sessionId as never)?.whenIdle()

    const files = await readdir(world.persistenceRoot)
    expect(files.length).toBeGreaterThan(0)
  })
})
