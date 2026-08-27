/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-product-safe`.
 * @module @deepseek-ai/dsh-product-safe/invariant
 */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-product-safe'

/** Cordis companion plugin name. */
export const name = 'product-safe-bundle-invariant'
/** Service required before the companion can register. */
export const inject = ['invariants']

const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
