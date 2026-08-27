/**
 * Product-safe startup rejects a non-loopback bind before publishing webStartup.
 */

import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { internals, provideCmdline } from '@deepseek-ai/dsh-cmdline'
import { afterEach, describe, expect, it } from 'vitest'
import { PRODUCT_SAFE_BIND_HOST_ERROR } from '../src/bind-host.ts'
import { apply, WEB_STARTUP_SERVICE } from '../src/startup.ts'

const disposers: (() => Promise<void>)[] = []

afterEach(async () => {
  for (const dispose of disposers.splice(0)) await dispose()
  internals.stdout = process.stdout
  internals.stderr = process.stderr
})

describe('product-safe startup', () => {
  it('rejects --host 0.0.0.0 before publishing webStartup', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-product-safe-startup-'))
    writeFileSync(join(dir, 'provider.mjs'), `
export const name = 'product-safe-startup'
export const inject = ['cmdlineArgs']
export const apply = ctx => globalThis.__productSafeStartupApply(ctx)
`)
    writeFileSync(join(dir, 'cordis.yml'), [
      '- id: provider',
      `  name: ${pathToFileURL(join(dir, 'provider.mjs')).href}`,
      '',
    ].join('\n'))
    const observed = { exits: [] as number[], out: '' }
    internals.stdout = { write: (chunk: string) => { observed.out += chunk; return true } }
    internals.stderr = internals.stdout
    ;(globalThis as unknown as { __productSafeStartupApply: typeof apply })
      .__productSafeStartupApply = apply
    const ctx = new Context()
    await ctx.plugin(Loader)
    ctx.loader.builtins.include = Include
    provideCmdline(ctx, { args: ['--host', '0.0.0.0'], exit: code => void observed.exits.push(code) })
    await ctx.loader.create({
      name: 'cordis:include',
      config: { path: pathToFileURL(join(dir, 'cordis.yml')).href },
    })
    await ctx.loader.await()
    disposers.push(async () => { await ctx.fiber.dispose() })
    expect(ctx.get(WEB_STARTUP_SERVICE)).toBeUndefined()
    expect(observed.exits.length).toBeGreaterThan(0)
    expect(observed.out).toContain(PRODUCT_SAFE_BIND_HOST_ERROR)
  })

  it('rejects a non-numeric --port before publishing webStartup', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-product-safe-startup-port-'))
    writeFileSync(join(dir, 'provider.mjs'), `
export const name = 'product-safe-startup'
export const inject = ['cmdlineArgs']
export const apply = ctx => globalThis.__productSafeStartupApply(ctx)
`)
    writeFileSync(join(dir, 'cordis.yml'), [
      '- id: provider',
      `  name: ${pathToFileURL(join(dir, 'provider.mjs')).href}`,
      '',
    ].join('\n'))
    const observed = { exits: [] as number[], out: '' }
    internals.stdout = { write: (chunk: string) => { observed.out += chunk; return true } }
    internals.stderr = internals.stdout
    ;(globalThis as unknown as { __productSafeStartupApply: typeof apply })
      .__productSafeStartupApply = apply
    const ctx = new Context()
    await ctx.plugin(Loader)
    ctx.loader.builtins.include = Include
    provideCmdline(ctx, { args: ['--port', 'nope'], exit: code => void observed.exits.push(code) })
    await ctx.loader.create({
      name: 'cordis:include',
      config: { path: pathToFileURL(join(dir, 'cordis.yml')).href },
    })
    await ctx.loader.await()
    disposers.push(async () => { await ctx.fiber.dispose() })
    expect(ctx.get(WEB_STARTUP_SERVICE)).toBeUndefined()
    expect(observed.out).toContain('--port must be a number')
  })
})
