/**
 * Product-safe runtime glue: URL print only. No browser spawn.
 */

import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import type { WebServer as WebServerService } from '@deepseek-ai/dsh-host-webserver'
import {
  apply,
  Config,
  internals,
  PRODUCT_SAFE_BIND_HOST,
  resolveLoopbackTrust,
} from '../src/index.ts'

const originalResolve = internals.resolveDistIndex
const disposers: (() => Promise<void>)[] = []

afterEach(async () => {
  for (const dispose of disposers.splice(0)) await dispose()
  vi.restoreAllMocks()
  internals.resolveDistIndex = originalResolve
})

/** Wait until the Vitest invariant host has finished mounting this root. */
async function whenInvariantReady(ctx: Context): Promise<void> {
  for (let i = 0; i < 100; i++) {
    if (ctx.get('testInvariantReady') === true) return
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 10)
    })
  }
}

/** Stage a dist fixture and point the bundle's resolver at it. */
function stageDist(): void {
  const dist = mkdtempSync(join(tmpdir(), 'dsh-product-safe-runtime-'))
  const index = join(dist, 'index.html')
  writeFileSync(index, '<!doctype html>')
  internals.resolveDistIndex = () => index
}

/** A fake webServer with the product-safe bind host. */
function fakeHttpServer(port = 4567): WebServerService {
  return {
    host: PRODUCT_SAFE_BIND_HOST,
    port,
    registerFallback: () => () => {},
    renderIndex: (html: string) => html,
  } as unknown as WebServerService
}

describe('product-safe runtime', () => {
  it('never samples LAN addresses', () => {
    expect(resolveLoopbackTrust(['lab.internal'])).toEqual({
      lanAddresses: [],
      trustedHosts: ['lab.internal'],
    })
  })

  it('prints the loopback URL and does not spawn a browser', async () => {
    stageDist()
    const ctx = new Context()
    ctx.provide('webServer', fakeHttpServer())
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    apply(ctx, new Config({
      printUrl: true,
      surfaceContext: false,
      trustedHosts: [],
    }))
    expect(ctx.get('webRuntime')).toEqual({ lanAddresses: [], trustedHosts: [] })
    expect(log).toHaveBeenCalledWith('dsh product-safe: http://127.0.0.1:4567')
    await whenInvariantReady(ctx)
    disposers.push(async () => { await ctx.fiber.dispose() })
  })

  it('prints the URL after a real Loader settles', async () => {
    stageDist()
    const ctx = new Context()
    await ctx.plugin(Loader)
    ctx.provide('webServer', fakeHttpServer())
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    apply(ctx, new Config({
      printUrl: true,
      surfaceContext: false,
      trustedHosts: [],
    }))
    await ctx.loader.await()
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0)
    })
    expect(log).toHaveBeenCalledWith('dsh product-safe: http://127.0.0.1:4567')
    await whenInvariantReady(ctx)
    disposers.push(async () => { await ctx.fiber.dispose() })
  })

  it('prints nothing when printUrl is off', async () => {
    stageDist()
    const ctx = new Context()
    ctx.provide('webServer', fakeHttpServer())
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    apply(ctx, new Config({
      printUrl: false,
      surfaceContext: false,
      trustedHosts: ['lab.internal'],
    }))
    expect(ctx.get('webRuntime')).toEqual({
      lanAddresses: [],
      trustedHosts: ['lab.internal'],
    })
    expect(log).not.toHaveBeenCalled()
    await whenInvariantReady(ctx)
    disposers.push(async () => { await ctx.fiber.dispose() })
  })

  it('fails loud when printing a URL against a portless webserver', async () => {
    stageDist()
    const ctx = new Context()
    const server = fakeHttpServer()
    Object.defineProperty(server, 'port', { get: () => undefined })
    ctx.provide('webServer', server)
    expect(() => {
      apply(ctx, new Config({
        printUrl: true,
        surfaceContext: false,
        trustedHosts: [],
      }))
    }).toThrow('webServer service missing')
    await whenInvariantReady(ctx)
    disposers.push(async () => { await ctx.fiber.dispose() })
  })

  it('resolves the real built frontend dist through the package exports, failing loud unbuilt', () => {
    try {
      expect(originalResolve()).toMatch(/dist[/\\]index\.html$/)
    } catch (error) {
      expect((error as Error).message).toContain('frontend dist not built')
    }
  })
})
