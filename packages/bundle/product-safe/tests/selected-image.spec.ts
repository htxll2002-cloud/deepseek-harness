/**
 * Variant 2 → Continue Editing → edit_image source is exactly Variant 2.
 */

import { afterEach, describe, expect, it } from 'vitest'
import {
  hostRpc,
  launchProductSafe,
  rpcValue,
  sessionImageAttachmentIds,
  sessionToolCallArgs,
  type ProductSafeWorld,
} from './harness.ts'

describe('selected-image', () => {
  let world: ProductSafeWorld | undefined
  afterEach(async () => {
    await world?.close()
    world = undefined
  })

  it('edits the explicit Variant 2 attachment, not Variant 1 or the last image', async () => {
    world = await launchProductSafe()
    const created = await hostRpc(world.baseUrl, 'session.create', {})
    const { sessionId } = rpcValue(created.body) as { sessionId: string }
    const agent = world.ctx.agents.get(sessionId as never)
    expect(agent).toBeDefined()

    const generated = await hostRpc(world.baseUrl, 'session.prompt', {
      sessionId,
      mode: 'queue',
      content: [{ type: 'text', text: '生成两张咖啡厅里的椅子' }],
    })
    expect(generated.status).toBe(200)
    await agent?.whenIdle()

    const generateArgs = sessionToolCallArgs(agent!.session, 'generate_image')
    expect(generateArgs).toHaveLength(1)
    expect(generateArgs[0]).toMatchObject({ count: 2 })

    const ids = sessionImageAttachmentIds(agent!.session)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    const variant1 = ids[0]!
    const variant2 = ids[1]!

    const edited = await hostRpc(world.baseUrl, 'session.prompt', {
      sessionId,
      mode: 'queue',
      content: [{ type: 'text', text: `[source:${variant2}] 把背景改成夜景` }],
    })
    expect(edited.status).toBe(200)
    await agent?.whenIdle()

    const editArgs = sessionToolCallArgs(agent!.session, 'edit_image')
    expect(editArgs).toHaveLength(1)
    expect(editArgs[0]).toEqual({
      source_attachment_id: variant2,
      instruction: '把背景改成夜景',
    })
    expect((editArgs[0] as { source_attachment_id: string }).source_attachment_id).not.toBe(variant1)

    const after = sessionImageAttachmentIds(agent!.session)
    expect(after.length).toBeGreaterThan(2)
    expect(after.at(-1)).not.toBe(variant2)
  })
})
