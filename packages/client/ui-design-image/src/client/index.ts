/**
 * Browser half: keyed generate_image / edit_image Tool Views and the
 * Continue Editing chip on conversation.input.dock.
 */
import type { ClientContext, ISession, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { DesignImageToolView, type DesignImageReadFace } from './DesignImageToolView.tsx'
import { EditingChip } from './EditingChip.tsx'
import { createDesignImageStore } from './store.ts'
import { en, NS, zh, type DesignImageKey } from './locales.ts'

export { createDesignImageStore } from './store.ts'
export type { DesignImageState, DesignImageStore } from './store.ts'
export { parseDesignImageBlock } from './parse-result.ts'
export type { DesignImageViewModel, DesignImageVariant } from './parse-result.ts'
export { draftWithEditSource, editSourceToken, parseEditSourceToken } from './source-token.ts'
export type { DesignImageReadFace } from './DesignImageToolView.tsx'
export type { DesignImageKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Design image Tool View and editing chip copy. */
    designImage: DesignImageKey
  }
}

/** Required services: slot registry, copy, and the session attachment reader. */
export const inject = ['slots', 'locale', 'sessions']

/**
 * Register the keyed Tool Views and the composer editing chip.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-design-image: dictionaries')
  const store = createDesignImageStore()

  const readFace = (sessionId: SessionId): DesignImageReadFace => ({
    readAttachment: (attachmentId: Parameters<ISession['readAttachment']>[0]) => {
      const session = ctx.sessions.binding(sessionId)?.session
      if (session === undefined) {
        return Promise.resolve({
          ok: false,
          error: { code: 'internal', message: 'session is not bound', details: {} },
        })
      }
      return session.readAttachment(attachmentId)
    },
  })

  ctx.slots.inject('tool.call.toolview', function* () {
    yield ctx.slots.register({
      name: 'tool.call.toolview',
      key: 'generate_image',
      locale: NS,
      store,
      inject: readFace,
    }, DesignImageToolView)
    yield ctx.slots.register({
      name: 'tool.call.toolview',
      key: 'edit_image',
      locale: NS,
      store,
      inject: readFace,
    }, DesignImageToolView)
  })

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'design-image-editing',
    order: 15,
    locale: NS,
    store,
  }, EditingChip))
}
