/**
 * Product-safe bind-host rule. Shared by startup and the runtime plugin so
 * both fail closed on the same predicate.
 * @module
 */

/** The only bind host product-safe may listen on before authenticated ingress. */
export const PRODUCT_SAFE_BIND_HOST = '127.0.0.1'

/** Fail-closed message for any host other than {@link PRODUCT_SAFE_BIND_HOST}. */
export const PRODUCT_SAFE_BIND_HOST_ERROR
  = 'product-safe only supports loopback bind 127.0.0.1 before authenticated product ingress exists'

/**
 * Resolve the product-safe listen host. Omitted means loopback. Any other
 * value, including whitespace, hostnames, LAN literals, and all-interfaces,
 * is rejected.
 * @param host - `--host` or the already-bound webserver host.
 * @returns {@link PRODUCT_SAFE_BIND_HOST}.
 */
export function assertProductSafeBindHost(host: string | undefined): typeof PRODUCT_SAFE_BIND_HOST {
  if (host === undefined || host === PRODUCT_SAFE_BIND_HOST) return PRODUCT_SAFE_BIND_HOST
  throw new Error(PRODUCT_SAFE_BIND_HOST_ERROR)
}
