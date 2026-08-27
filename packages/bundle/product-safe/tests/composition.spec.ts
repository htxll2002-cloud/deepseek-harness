/**
 * Static product-safe composition: patch rows and package.json must not
 * load coding capabilities. This is capability absence, not CSS hide.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { composeEntries, loadOverlayPatches } from '@deepseek-ai/dsh-app-boot'
import { PRODUCT_SAFE_ALLOWED_METHODS } from '../src/allowed-methods.ts'
import { FORBIDDEN_CLIENT_MODULE_PACKAGES, FORBIDDEN_PACKAGE_DEPS, FORBIDDEN_ROW_IDS } from './harness.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PATCH = join(ROOT, 'cordis.patch.yml')

describe('product-safe composition', () => {
  it('does not insert coding or workspace rows', () => {
    const rows = composeEntries([loadOverlayPatches('product-safe composition', PATCH)])
    const ids = new Set(rows.map(row => row.id).filter((id): id is string => typeof id === 'string'))
    for (const id of FORBIDDEN_ROW_IDS) {
      expect(ids.has(id), id).toBe(false)
    }
    expect(ids.has('ui-conversation')).toBe(true)
    expect(ids.has('ui-sidebar')).toBe(true)
    expect(ids.has('ui-tool')).toBe(true)
    expect(ids.has('agent-loop')).toBe(true)
    expect(ids.has('session')).toBe(true)
  })

  it('keeps the HTTP allowlist identical to the exported constant', () => {
    const rows = composeEntries([loadOverlayPatches('product-safe composition', PATCH)])
    const connection = rows.find(row => row.id === 'connection')
    const allowed = (connection?.config as { allowedMethods?: string[] } | undefined)?.allowedMethods
    expect(allowed).toEqual([...PRODUCT_SAFE_ALLOWED_METHODS])
  })

  it('does not depend on coding packages in the product-safe runtime graph', () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
    }
    for (const name of FORBIDDEN_PACKAGE_DEPS) {
      expect(manifest.dependencies[name], name).toBeUndefined()
    }
  })

  it('forces loopback and cwd-less session create', () => {
    const rows = composeEntries([loadOverlayPatches('product-safe composition', PATCH)])
    const gateway = rows.find(row => row.id === 'api-gateway')
    expect((gateway?.config as { requireWorkspace?: boolean }).requireWorkspace).toBe(false)
    const runtime = rows.find(row => row.id === 'web-runtime')
    expect((runtime?.config as { surfaceContext?: boolean }).surfaceContext).toBe(false)
    const webserver = rows.find(row => row.id === 'webserver')
    expect((webserver?.config as { host?: string }).host).toBe('127.0.0.1')
  })

  it('mounts modules in production composition without coding client packages', () => {
    const rows = composeEntries([loadOverlayPatches('product-safe modules inventory', PATCH)])
    const ids = new Set(rows.map(row => row.id).filter((id): id is string => typeof id === 'string'))
    expect(ids.has('modules')).toBe(true)
    const names = rows.map(row => row.name).filter((name): name is string => typeof name === 'string')
    for (const pkg of FORBIDDEN_CLIENT_MODULE_PACKAGES) {
      expect(names.includes(pkg), pkg).toBe(false)
    }
    expect(ids.has('ui-workspace')).toBe(false)
    expect(ids.has('ui-terminal')).toBe(false)
    expect(ids.has('ui-skill')).toBe(false)
    expect(ids.has('ui-cordis')).toBe(false)
    expect(ids.has('ui-settings-plugins')).toBe(false)
    expect(ids.has('ui-directory-picker-browse')).toBe(false)
    expect(ids.has('ui-directory-picker-native')).toBe(false)
  })

  it('does not import child_process, open, or dsh-subprocess in product-safe source', () => {
    const sources = [
      'src/index.ts',
      'src/startup.ts',
      'src/bind-host.ts',
      'src/echo.ts',
      'src/llm-mock.ts',
      'src/allowed-methods.ts',
      'src/invariant.ts',
    ]
    for (const file of sources) {
      const text = readFileSync(join(ROOT, file), 'utf8')
      expect(text, file).not.toMatch(/node:child_process/)
      expect(text, file).not.toMatch(/from ['"]open['"]/)
      expect(text, file).not.toMatch(/@deepseek-ai\/dsh-subprocess/)
    }
  })
})
