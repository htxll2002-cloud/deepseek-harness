/**
 * Completed generate_image results survive session.history + session.attachment.
 * Replay uses the durable session, not React memory.
 */

import { afterEach, describe, expect, it } from 'vitest'
import {
  hostRpc,
  imageAttachmentIdsFromContent,
  launchProductSafe,
  rpcValue,
  sessionImageAttachmentIds,
  type ProductSafeWorld,
} from './harness.ts'

describe('replay', () => {
  let world: ProductSafeWorld | undefined
  afterEach(async () => {
    await world?.close()
    world = undefined
  })

  it('reloads completed images from session history and the official attachment RPC', async () => {
    world = await launchProductSafe()
    const created = await hostRpc(world.baseUrl, 'session.create', {})
    const { sessionId } = rpcValue(created.body) as { sessionId: string }
    const agent = world.ctx.agents.get(sessionId as never)
    expect(agent).toBeDefined()

    const prompted = await hostRpc(world.baseUrl, 'session.prompt', {
      sessionId,
      mode: 'queue',
      content: [{ type: 'text', text: '生成两张咖啡厅里的椅子' }],
    })
    expect(prompted.status).toBe(200)
    await agent?.whenIdle()

    const ids = sessionImageAttachmentIds(agent!.session)
    expect(ids).toHaveLength(2)

    const history = await hostRpc(world.baseUrl, 'session.history', { sessionId })
    expect(history.status).toBe(200)
    const page = rpcValue(history.body) as {
      events: { event: { type: string; data?: { message?: { content?: unknown } } } }[]
    }
    const resultItems = page.events.filter(entry => entry.event.type === 'tool/result')
    expect(resultItems.length).toBeGreaterThan(0)
    const historyIds = resultItems.flatMap(entry => imageAttachmentIdsFromContent(entry.event.data?.message?.content))
    expect(historyIds).toEqual(ids)

    for (const attachmentId of ids) {
      const attachment = await hostRpc(world.baseUrl, 'session.attachment', {
        sessionId,
        attachmentId,
      })
      expect(attachment.status).toBe(200)
      const value = rpcValue(attachment.body) as {
        attachment: { attachmentId: string; mediaType: string }
        data: string
      }
      expect(value.attachment.attachmentId).toBe(attachmentId)
      expect(value.attachment.mediaType).toBe('image/png')
      expect(value.data.length).toBeGreaterThan(0)
      expect(value.data.startsWith('http')).toBe(false)
    }
  })
})
