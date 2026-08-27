/**
 * Product-safe bind is 127.0.0.1 only. Startup, runtime, and the live
 * webserver share one rule. These cases exercise the bound server, not
 * only the parser.
 */

import { createConnection } from 'node:net'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { networkInterfaces, tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { internals as cmdlineInternals, provideCmdline } from '@deepseek-ai/dsh-cmdline'
import WebServer from '@deepseek-ai/dsh-host-webserver'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  apply as applyRuntime,
  Config,
  internals,
  PRODUCT_SAFE_BIND_HOST,
  PRODUCT_SAFE_BIND_HOST_ERROR,
  assertProductSafeBindHost,
} from '../src/index.ts'
import { apply as applyStartup, WEB_STARTUP_SERVICE } from '../src/startup.ts'
import { launchProductSafe } from './harness.ts'

const REJECTED_HOSTS = [
  '0.0.0.0',
  '::',
  '::0',
  '::ffff:0.0.0.0',
  '192.168.1.1',
  '10.0.0.1',
  '172.16.0.1',
  '8.8.8.8',
  'localhost',
  'example.com',
  '',
  ' 127.0.0.1',
  '127.0.0.1 ',
  '127.0.0.2',
] as const

const disposers: (() => Promise<void>)[] = []

afterEach(async () => {
  for (const dispose of disposers.splice(0)) await dispose()
  vi.restoreAllMocks()
  cmdlineInternals.stdout = process.stdout
  cmdlineInternals.stderr = process.stderr
  internals.resolveDistIndex = originalResolve
})

const originalResolve = internals.resolveDistIndex

/** First non-internal IPv4 literal, if this machine has one. */
function lanIpv4(): string | undefined {
  for (const group of Object.values(networkInterfaces())) {
    for (const iface of group ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return undefined
}

/** Connect to host:port; true when the handshake completes. */
function tcpReachable(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port })
    const finish = (ok: boolean): void => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(ok)
    }
    socket.once('connect', () => { finish(true) })
    socket.once('error', () => { finish(false) })
    socket.setTimeout(250, () => { finish(false) })
  })
}

/**
 * Run product-safe startup against one argv and return whether webStartup published.
 * @param args - command-line tokens after the binary.
 */
async function runStartup(args: string[]): Promise<{ published: boolean; out: string; host: string | undefined }> {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-product-safe-bind-'))
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
  cmdlineInternals.stdout = { write: (chunk: string) => { observed.out += chunk; return true } }
  cmdlineInternals.stderr = cmdlineInternals.stdout
  ;(globalThis as unknown as { __productSafeStartupApply: typeof applyStartup })
    .__productSafeStartupApply = applyStartup
  const ctx = new Context()
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  provideCmdline(ctx, { args, exit: code => void observed.exits.push(code) })
  await ctx.loader.create({
    name: 'cordis:include',
    config: { path: pathToFileURL(join(dir, 'cordis.yml')).href },
  })
  await ctx.loader.await()
  disposers.push(async () => { await ctx.fiber.dispose() })
  const values = ctx.get(WEB_STARTUP_SERVICE) as { host?: string } | undefined
  return { published: values !== undefined, out: observed.out, host: values?.host }
}

describe('assertProductSafeBindHost', () => {
  it('accepts omitted host and 127.0.0.1', () => {
    expect(assertProductSafeBindHost(undefined)).toBe(PRODUCT_SAFE_BIND_HOST)
    expect(assertProductSafeBindHost('127.0.0.1')).toBe(PRODUCT_SAFE_BIND_HOST)
  })

  it.each(REJECTED_HOSTS)('rejects %j', (host) => {
    expect(() => assertProductSafeBindHost(host)).toThrow(PRODUCT_SAFE_BIND_HOST_ERROR)
  })
})

describe('product-safe startup bind', () => {
  it('publishes 127.0.0.1 when --host is omitted', async () => {
    const result = await runStartup([])
    expect(result.published).toBe(true)
    expect(result.host).toBe(PRODUCT_SAFE_BIND_HOST)
  })

  it('publishes 127.0.0.1 when --host names that literal', async () => {
    const result = await runStartup(['--host', '127.0.0.1'])
    expect(result.published).toBe(true)
    expect(result.host).toBe(PRODUCT_SAFE_BIND_HOST)
  })

  it('publishes an explicit --port', async () => {
    const result = await runStartup(['--port', '0'])
    expect(result.published).toBe(true)
    expect(result.host).toBe(PRODUCT_SAFE_BIND_HOST)
  })

  it('publishes explicit --trusted-host authorities', async () => {
    const result = await runStartup(['--trusted-host', 'lab.internal'])
    expect(result.published).toBe(true)
    expect(result.host).toBe(PRODUCT_SAFE_BIND_HOST)
  })

  it.each(REJECTED_HOSTS)('does not publish webStartup for --host %j', async (host) => {
    const result = await runStartup(['--host', host])
    expect(result.published).toBe(false)
    expect(result.out).toContain(PRODUCT_SAFE_BIND_HOST_ERROR)
  })
})

describe('product-safe webserver listen', () => {
  it('listens only on 127.0.0.1 after a real product-safe boot', async () => {
    const logs: string[] = []
    const log = vi.spyOn(console, 'log').mockImplementation((message) => {
      logs.push(String(message))
    })
    const world = await launchProductSafe({
      extraPatches: [{
        id: 'web-runtime',
        config: { printUrl: true, surfaceContext: false, trustedHosts: [] },
      }],
    })
    disposers.push(async () => {
      log.mockRestore()
      await world.close()
    })
    expect(world.ctx.webServer.host).toBe(PRODUCT_SAFE_BIND_HOST)
    const port = world.ctx.webServer.port
    expect(await tcpReachable('127.0.0.1', port)).toBe(true)
    const lan = lanIpv4()
    if (lan !== undefined) {
      expect(await tcpReachable(lan, port)).toBe(false)
    }
    const page = await fetch(`${world.baseUrl}/`)
    expect(page.ok).toBe(true)
    expect(logs).toContain(`dsh product-safe: ${world.baseUrl}`)
  })

  it('refuses to mount product-safe on an all-interfaces webserver', async () => {
    const dist = mkdtempSync(join(tmpdir(), 'dsh-product-safe-bind-dist-'))
    const index = join(dist, 'index.html')
    writeFileSync(index, '<!doctype html>')
    internals.resolveDistIndex = () => index
    const ctx = new Context()
    await ctx.plugin(WebServer, { host: '0.0.0.0', port: 0 })
    const port = ctx.webServer.port
    expect(ctx.webServer.host).toBe('0.0.0.0')
    expect(() => {
      applyRuntime(ctx, new Config({
        printUrl: false,
        surfaceContext: false,
        trustedHosts: [],
      }))
    }).toThrow(PRODUCT_SAFE_BIND_HOST_ERROR)
    expect(ctx.get('webRuntime')).toBeUndefined()
    await ctx.fiber.dispose()
    expect(await tcpReachable('127.0.0.1', port)).toBe(false)
    expect(await tcpReachable('0.0.0.0', port)).toBe(false)
  })

  it('fails closed when a composition overlay sets webserver.host to 0.0.0.0', async () => {
    await expect(launchProductSafe({
      extraPatches: [{ id: 'webserver', config: { host: '0.0.0.0', port: 0 } }],
    })).rejects.toThrow(PRODUCT_SAFE_BIND_HOST_ERROR)
  })
})
