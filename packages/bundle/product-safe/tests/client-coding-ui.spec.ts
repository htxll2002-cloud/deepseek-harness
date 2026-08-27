/**
 * Coding UI plugins are absent from the product-safe composition.
 * Conversation, session, streaming, and tool-view infrastructure remain.
 */

import { describe, expect, it } from 'vitest'
import { composeEntries, loadOverlayPatches } from '@deepseek-ai/dsh-app-boot'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { FORBIDDEN_ROW_IDS } from './harness.ts'

const PATCH = join(fileURLToPath(new URL('..', import.meta.url)), 'cordis.patch.yml')

describe('client coding UI absence', () => {
  it('omits coding UI rows while keeping conversation infrastructure', () => {
    const rows = composeEntries([loadOverlayPatches('product-safe client inventory', PATCH)])
    const ids = new Set(rows.map(row => row.id).filter((id): id is string => typeof id === 'string'))
    for (const id of FORBIDDEN_ROW_IDS.filter(name => name.startsWith('ui-'))) {
      expect(ids.has(id), id).toBe(false)
    }
    expect(ids.has('ui-conversation')).toBe(true)
    expect(ids.has('ui-sidebar')).toBe(true)
    expect(ids.has('ui-tool')).toBe(true)
    expect(ids.has('ui-layout')).toBe(true)
    expect(ids.has('ui-renderer')).toBe(true)
    expect(ids.has('client-runtime')).toBe(true)
    expect(ids.has('connection')).toBe(true)
  })
})
