/**
 * generate_image and edit_image occupy the official tool.call.toolview hole.
 */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { DesignImageToolView } from '../src/client/DesignImageToolView.tsx'
import { EditingChip } from '../src/client/EditingChip.tsx'
import { apply, inject } from '../src/client/index.ts'

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  ctx.slots.register({
    name: 'root',
    children: {
      'tool.call.toolview': { kind: 'keyed', scope: 'session' },
      'conversation.input.dock': { kind: 'list', scope: 'session' },
    },
  } as never, (() => null) as never)
  ctx.provide('locale', new LocaleRuntime(ctx))
  ctx.provide('sessions', {
    binding: () => ({
      session: {
        readAttachment: () => Promise.resolve({
          ok: false,
          error: { code: 'no-session', message: 'unused', details: {} },
        }),
      },
    }),
  })
  return { ctx }
}

describe('image-tool-view', () => {
  it('declares the services it binds', () => {
    expect(inject).toEqual(['slots', 'locale', 'sessions'])
  })

  it('registers generate_image and edit_image keyed Tool Views', async () => {
    const { ctx } = await bench()
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const views = ctx.slots.entries('tool.call.toolview')
    expect(views.map(entry => entry.options.key)).toEqual(['generate_image', 'edit_image'])
    expect(views.every(entry => entry.component === DesignImageToolView)).toBe(true)
    expect(views.every(entry => entry.locale === 'designImage')).toBe(true)
    expect(views[0]?.store).toBe(views[1]?.store)
  })

  it('registers the Continue Editing chip on conversation.input.dock', async () => {
    const { ctx } = await bench()
    await ctx.plugin({ inject: [...inject], apply }).await()
    const dock = ctx.slots.entries('conversation.input.dock')
    expect(dock).toHaveLength(1)
    expect(dock[0]?.options).toMatchObject({
      id: 'design-image-editing',
      order: 15,
    })
    expect(dock[0]?.component).toBe(EditingChip)
    expect(dock[0]?.locale).toBe('designImage')
  })

  it('teardown unregisters the slot entries', async () => {
    const { ctx } = await bench()
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(ctx.slots.entries('tool.call.toolview')).toHaveLength(2)
    expect(ctx.slots.entries('conversation.input.dock')).toHaveLength(1)
    await fiber.dispose()
    expect(ctx.slots.entries('tool.call.toolview')).toHaveLength(0)
    expect(ctx.slots.entries('conversation.input.dock')).toHaveLength(0)
  })
})
