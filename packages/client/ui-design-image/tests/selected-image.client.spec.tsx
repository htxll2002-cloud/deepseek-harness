// @vitest-environment jsdom
/**
 * Continue Editing writes the exact selected variant into the composer token.
 * Selection is session-local spike state, not product artifact truth.
 */
import { useEffect, useState } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { ToolResultNode } from '@deepseek-ai/dsh-client-runtime/client'
import { DesignImageToolView } from '../src/client/DesignImageToolView.tsx'
import { createDesignImageStore } from '../src/client/store.ts'
import { parseEditSourceToken } from '../src/client/source-token.ts'
import { en } from '../src/client/locales.ts'

afterEach(cleanup)

const VARIANT_1 = 'sha256:variant-one'
const VARIANT_2 = 'sha256:variant-two'

function generateBlock(): ToolResultNode {
  return {
    kind: 'tool-result',
    seq: 3,
    time: 3000,
    callId: 'gen-1',
    call: { name: 'generate_image', argsRaw: '{"prompt":"cafe chair","count":2}' },
    callTime: 2500,
    content: [
      { type: 'text', text: 'Generated 2 image(s)' },
      {
        type: 'image',
        attachment: {
          attachmentId: VARIANT_1 as never,
          mediaType: 'image/png',
          bytes: 12,
          width: 32,
          height: 32,
          name: 'generated-variant-1.png',
        },
      },
      {
        type: 'image',
        attachment: {
          attachmentId: VARIANT_2 as never,
          mediaType: 'image/png',
          bytes: 12,
          width: 32,
          height: 32,
          name: 'generated-variant-2.png',
        },
      },
    ],
    isError: false,
    meta: {
      kind: 'design-image',
      operation: 'generate',
      status: 'completed',
      prompt: 'cafe chair',
      count: 2,
      images: [
        { attachment: { attachmentId: VARIANT_1 }, variant_index: 0 },
        { attachment: { attachmentId: VARIANT_2 }, variant_index: 1 },
      ],
    },
    callView: null,
    resultView: null,
    subCalls: [],
  }
}

describe('selected-image', () => {
  it('Continue Editing on variant 2 writes that attachment id as the next source', () => {
    const store = createDesignImageStore().create()
    const drafts: string[] = []
    function Harness() {
      const [, setTick] = useState(0)
      useEffect(() => store.subscribe(() => { setTick(value => value + 1) }), [])
      return (
        <DesignImageToolView {...{
          callId: 'gen-1',
          toolName: 'generate_image',
          block: generateBlock(),
          openFile: () => {},
          useStore: (selector: (state: ReturnType<typeof store.getSnapshot>) => unknown) => selector(store.getSnapshot()),
          actions: store.actions,
          t: (key: keyof typeof en) => en[key],
          useInput: (selector: (state: { draft: string }) => unknown) => selector({ draft: '' }),
          inputActions: { setDraft: (draft: string) => { drafts.push(draft) } },
          readAttachment: () => Promise.resolve({
            ok: false,
            error: { code: 'internal', message: 'no bytes needed', details: {} },
          }),
        } as unknown as Parameters<typeof DesignImageToolView>[0]} />
      )
    }

    const view = render(<Harness />)
    const continueButtons = view.getAllByText(en['action.continue'])
    expect(continueButtons).toHaveLength(2)
    fireEvent.click(continueButtons[1]!)

    expect(store.getSnapshot().selectedAttachmentId).toBe(VARIANT_2)
    expect(store.getSnapshot().editingAttachmentId).toBe(VARIANT_2)
    expect(drafts).toHaveLength(1)
    expect(parseEditSourceToken(drafts[0] ?? '')).toBe(VARIANT_2)
    expect(drafts[0]).not.toContain(VARIANT_1)
  })
})
