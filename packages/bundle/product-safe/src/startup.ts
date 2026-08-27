/**
 * Product-safe command-line provider: the same flag family as `dsh web`,
 * bound to the product-safe profile. Rejects `--host 0.0.0.0`.
 * @module @deepseek-ai/dsh-product-safe/startup
 */

import { Command } from 'commander'
import type { Context } from '@deepseek-ai/cordis'
import { parseCmdline } from '@deepseek-ai/dsh-cmdline'

/** Stable Cordis plugin name. */
export const name = 'product-safe-startup'

/** Services required before the flags can be resolved. */
export const inject = ['cmdlineArgs']

/** Service provided by this ordinary plugin and injected by flag-configured rows. */
export const WEB_STARTUP_SERVICE = 'webStartup'

/** What the web rows read from {@link WEB_STARTUP_SERVICE}. */
export interface WebStartupValues {
  /** Whether this invocation opens the default browser after startup. */
  openBrowser: boolean
  /** `--host`, absent when the invocation did not name one. */
  host?: string
  /** `--port`, absent when the invocation did not name one. */
  port?: number
  /** Explicit `--trusted-host` authorities, in argument order. */
  trustedHosts: string[]
}

/** The product-safe flag family, as commander parsed it. */
interface ProductSafeOptions {
  host?: string
  open: boolean
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
    .description('Serve the product-safe DeepSeek Harness browser UI (loopback only).')
    .helpOption('-h, --help', 'show this help')
    .option('--host <host>', 'bind host')
    .option('--no-open', 'do not open the Web UI in the default browser')
    .option('--port <port>', 'listen port; pass 0 to let the OS pick a free one')
    .option('--trusted-host <authority...>', 'extra authority the /api browser-trust fence accepts (host or host:port; repeatable)')
    .addHelpText('after', `
Examples:
  dsh --profile product-safe                 serve on the composed host and port
  dsh --profile product-safe --no-open       serve without opening a browser
  dsh --profile product-safe --port 8080     serve on another port
`)
}

/**
 * Parse and provide the product-safe invocation as an ordinary Cordis service.
 * `--host 0.0.0.0` is a usage error: M1 hosts stay on loopback.
 * @param ctx - plugin context carrying the command line.
 */
export function apply(ctx: Context): void {
  const program = productSafeCommand()
  program.action(() => {
    const options = program.opts<ProductSafeOptions>()
    if (options.host === '0.0.0.0') {
      program.error('error: --host 0.0.0.0 is not supported for the product-safe profile; use 127.0.0.1')
    }
    if (options.port !== undefined && !/^\d+$/.test(options.port)) {
      program.error(`error: --port must be a number, got ${JSON.stringify(options.port)}`)
    }
    ctx.provide(WEB_STARTUP_SERVICE, {
      openBrowser: options.open,
      ...options.host !== undefined && { host: options.host },
      ...options.port !== undefined && { port: Number(options.port) },
      trustedHosts: options.trustedHost ?? [],
    } satisfies WebStartupValues)
  })
  parseCmdline(ctx, program)
}
