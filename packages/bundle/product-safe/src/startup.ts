/**
 * Product-safe command-line provider: the same `--port` / `--trusted-host`
 * family as `dsh web`, bound to the product-safe profile. The only accepted
 * `--host` is `127.0.0.1` (omitted means that literal). Does not open a browser.
 * @module @deepseek-ai/dsh-product-safe/startup
 */

import { Command } from 'commander'
import type { Context } from '@deepseek-ai/cordis'
import { parseCmdline } from '@deepseek-ai/dsh-cmdline'
import {
  assertProductSafeBindHost,
  PRODUCT_SAFE_BIND_HOST,
  PRODUCT_SAFE_BIND_HOST_ERROR,
} from './bind-host.ts'

/** Stable Cordis plugin name. */
export const name = 'product-safe-startup'

/** Services required before the flags can be resolved. */
export const inject = ['cmdlineArgs']

/** Service provided by this ordinary plugin and injected by flag-configured rows. */
export const WEB_STARTUP_SERVICE = 'webStartup'

/** What the web rows read from {@link WEB_STARTUP_SERVICE}. */
export interface WebStartupValues {
  /** Always {@link PRODUCT_SAFE_BIND_HOST} after validation. */
  host: typeof PRODUCT_SAFE_BIND_HOST
  /** `--port`, absent when the invocation did not name one. */
  port?: number
  /** Explicit `--trusted-host` authorities, in argument order. */
  trustedHosts: string[]
}

/** The product-safe flag family, as commander parsed it. */
interface ProductSafeOptions {
  host?: string
  port?: string
  trustedHost?: string[]
}

/**
 * This app's command: its flags, its description, and its help text.
 * @returns a fresh program, so one process can parse more than once (tests).
 */
function productSafeCommand(): Command {
  return new Command()
    .name('dsh --profile product-safe')
    .description('Serve the product-safe DeepSeek Harness browser UI (127.0.0.1 only).')
    .helpOption('-h, --help', 'show this help')
    .option('--host <host>', `bind host (must be ${PRODUCT_SAFE_BIND_HOST})`)
    .option('--port <port>', 'listen port; pass 0 to let the OS pick a free one')
    .option('--trusted-host <authority...>', 'extra authority the /api browser-trust fence accepts (host or host:port; repeatable)')
    .addHelpText('after', `
Examples:
  dsh --profile product-safe                 serve on ${PRODUCT_SAFE_BIND_HOST} and the composed port
  dsh --profile product-safe --port 8080     serve on another port
`)
}

/**
 * Parse and provide the product-safe invocation as an ordinary Cordis service.
 * Any `--host` other than `127.0.0.1` is a usage error.
 * @param ctx - plugin context carrying the command line.
 */
export function apply(ctx: Context): void {
  const program = productSafeCommand()
  program.action(() => {
    const options = program.opts<ProductSafeOptions>()
    try {
      assertProductSafeBindHost(options.host)
    } catch {
      // assertProductSafeBindHost throws only PRODUCT_SAFE_BIND_HOST_ERROR.
      program.error(`error: ${PRODUCT_SAFE_BIND_HOST_ERROR}`)
    }
    if (options.port !== undefined && !/^\d+$/.test(options.port)) {
      program.error(`error: --port must be a number, got ${JSON.stringify(options.port)}`)
    }
    ctx.provide(WEB_STARTUP_SERVICE, {
      host: PRODUCT_SAFE_BIND_HOST,
      ...options.port !== undefined && { port: Number(options.port) },
      trustedHosts: options.trustedHost ?? [],
    } satisfies WebStartupValues)
  })
  parseCmdline(ctx, program)
}
