/**
 * M1 security boundary must not regress because M2 added image tools.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { PRODUCT_SAFE_ALLOWED_METHODS } from '../src/allowed-methods.ts'
import {
  DANGEROUS_TOOL_NAMES,
  DENIED_HOST_METHODS,
  executeNamedTool,
  hostRpc,
  launchProductSafe,
  type ProductSafeWorld,
} from './harness.ts'

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const IMAGE_TOOLS = join(ROOT, 'packages/design/image-tools/src')
const UI_DESIGN = join(ROOT, 'packages/client/ui-design-image/src')
const PRODUCT_SAFE = join(ROOT, 'packages/bundle/product-safe/src')

describe('security-regression', () => {
  let world: ProductSafeWorld | undefined
  afterEach(async () => {
    await world?.close()
    world = undefined
  })

  it('keeps dangerous tools at zero and image tools off the host catalog', async () => {
    world = await launchProductSafe()
    const hostNames = new Set(world.ctx.tools.schemas().map(schema => schema.name))
    expect(hostNames.size).toBe(0)
    for (const name of DANGEROUS_TOOL_NAMES) {
      expect(hostNames.has(name), name).toBe(false)
      const denied = await executeNamedTool(world.ctx, name, {})
      expect(denied.isError, name).toBe(true)
    }

    const created = await world.ctx.apiProxy.sessions.create({
      rpcId: 'security-regression-create' as never,
      payload: {},
    })
    expect(created.result.ok).toBe(true)
    if (!created.result.ok) throw new Error('unreachable')
    const agent = world.ctx.agents.get(created.result.value.sessionId)
    const scoped = new Set(world.ctx.tools.schemas(agent).map(schema => schema.name))
    expect([...scoped].sort()).toEqual(['edit_image', 'generate_image'])
    for (const name of DANGEROUS_TOOL_NAMES) {
      expect(scoped.has(name), name).toBe(false)
    }
    expect(world.ctx.webServer.host).toBe('127.0.0.1')
  })

  it('does not add Host routes beyond the M1 allowlist', async () => {
    world = await launchProductSafe()
    for (const method of DENIED_HOST_METHODS) {
      const denied = await hostRpc(world.baseUrl, method, {})
      expect(denied.status, method).toBe(404)
    }
    expect([...PRODUCT_SAFE_ALLOWED_METHODS]).toContain('session.attachment')
    expect([...PRODUCT_SAFE_ALLOWED_METHODS]).not.toContain('plugin.install')
  })

  it('does not copy donor settings, gallery, IMAGE_ROUTE, or child_process', () => {
    const sources = [
      join(IMAGE_TOOLS, 'index.ts'),
      join(IMAGE_TOOLS, 'tools.ts'),
      join(IMAGE_TOOLS, 'mock-generator.ts'),
      join(UI_DESIGN, 'client/index.ts'),
      join(UI_DESIGN, 'client/DesignImageToolView.tsx'),
      join(UI_DESIGN, 'client/store.ts'),
      join(PRODUCT_SAFE, 'llm-mock.ts'),
      join(PRODUCT_SAFE, 'index.ts'),
    ]
    for (const file of sources) {
      const text = readFileSync(file, 'utf8')
      expect(text, file).not.toMatch(/node:child_process/)
      expect(text, file).not.toMatch(/indexedDB|IDBDatabase|gallery-store/)
      expect(text, file).not.toMatch(/IMAGE_ROUTE|\/api\/image/)
      expect(text, file).not.toMatch(/GEMINI_API_KEY|OPENAI_API_KEY|DASHSCOPE_API_KEY|ARK_API_KEY/)
      expect(text, file).not.toMatch(/saveToWorkspace|workspace-save/)
      expect(text, file).not.toMatch(/localStorage/)
    }
  })
})
