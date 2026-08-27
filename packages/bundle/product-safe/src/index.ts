/**
 * `@deepseek-ai/dsh-product-safe` — standalone product-safe browser bundle.
 * Serves the official conversation shell on 127.0.0.1 without coding host
 * capabilities. Dist serving and URL print only; no browser spawn, no bash
 * runtime variables, and no coding web-surface prompt.
 * @module @deepseek-ai/dsh-product-safe
 */

import { createRequire } from 'node:module'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import * as FrontendStatic from '@deepseek-ai/dsh-host-frontend-static'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { assertProductSafeBindHost, PRODUCT_SAFE_BIND_HOST } from './bind-host.ts'

export {
  assertProductSafeBindHost,
  PRODUCT_SAFE_BIND_HOST,
  PRODUCT_SAFE_BIND_HOST_ERROR,
} from './bind-host.ts'

/** Stable Cordis plugin name. */
export const name = 'product-safe-app'

/** Runtime service that releases Web rows after bind-dependent values resolve. */
const WEB_RUNTIME_SERVICE = 'webRuntime'

/** Services required before the product-safe runtime can mount. */
export const inject = ['webServer']

/** Plugin config: composed deployment settings plus per-invocation command-line values. */
export interface Config {
  /** Print the URL line on activation; a non-interactive layer can turn it off. */
  printUrl: boolean
  /**
   * Register model-visible surface context. Product-safe defaults this off:
   * there is no coding GUI orientation and no bash-visible URL variable.
   */
  surfaceContext: boolean
  /** Explicit `--trusted-host` authorities from this invocation. */
  trustedHosts: string[]
}

export const Config: z<Config> = z.object({
  printUrl: z.boolean().default(true),
  surfaceContext: z.boolean().default(false),
  trustedHosts: z.array(String).default([]),
})

/** Bind-dependent Web values shared by the trust fence and URL display. */
export interface WebRuntimeValues {
  /** Always empty: product-safe never binds all interfaces, so it never samples LAN. */
  lanAddresses: string[]
  /** Explicit invocation authorities only. */
  trustedHosts: string[]
}

/**
 * Resolve the trust-fence snapshot. Product-safe never samples LAN addresses.
 * @param extra - explicit `--trusted-host` values, in argument order.
 * @returns empty LAN display addresses and the invocation-derived authorities.
 */
export function resolveLoopbackTrust(extra: readonly string[]): WebRuntimeValues {
  return { lanAddresses: [], trustedHosts: [...extra] }
}

/** Resolve the canonical loopback URL from the active Web server. */
function localWebUrl(ctx: Context): string {
  const port = ctx.get('webServer')?.port
  if (port === undefined) throw new Error('product-safe: webServer service missing while resolving Web runtime')
  return `http://${PRODUCT_SAFE_BIND_HOST}:${String(port)}`
}

/** Dist location is workspace knowledge of this bundle: resolved through the frontend package exports. */
function resolveDistIndex(): string {
  const require = createRequire(import.meta.url)
  /* v8 ignore start -- the built checkout resolves; a dist-less coverage lane throws */
  try {
    return require.resolve('@deepseek-ai/dsh-web-frontend/dist/index.html')
  } catch {
    throw new Error('product-safe: frontend dist not built; run pnpm run build from the repository root first')
  }
  /* v8 ignore stop */
}

/** Test hook for the built dist; production never mutates it. */
export const internals: {
  resolveDistIndex: () => string
} = { resolveDistIndex }

/**
 * Mount the product-safe Web runtime: dist serving and the URL line.
 * Rejects any bind other than {@link PRODUCT_SAFE_BIND_HOST}. Does not spawn
 * a browser, register coding surface prompts, or publish bash-visible host
 * variables.
 * @param ctx - plugin context carrying the webServer service.
 * @param config - validated {@link Config}.
 */
export function apply(ctx: Context, config: Config): void {
  assertProductSafeBindHost(ctx.webServer.host)
  const runtime = resolveLoopbackTrust(config.trustedHosts)
  ctx.provide(WEB_RUNTIME_SERVICE, runtime)
  ctx.plugin(FrontendStatic, { distIndex: internals.resolveDistIndex() })
  if (!config.printUrl) return
  const announceReady = (): void => {
    console.log(`dsh product-safe: ${localWebUrl(ctx)}`)
  }
  const settled = ctx.get('loader')?.await()
  if (settled === undefined) announceReady()
  else {
    /* v8 ignore next -- Loader reports a failed boot; this row only stays quiet. */
    const ignoreFailedBoot = (): void => {}
    void settled.then(() => {
      // The tree can be disposed while the boot was in flight; a URL line for
      // a dead server would only mislead, and reading the torn-down port would
      // turn a clean shutdown into a crash.
      const server = ctx.get('webServer')
      /* v8 ignore next -- torn-down boot: skip the URL line */
      if (server === undefined) return
      announceReady()
    }, ignoreFailedBoot)
  }
}
