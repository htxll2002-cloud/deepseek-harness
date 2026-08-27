/**
 * Product-safe Host HTTP allowlist. Methods not listed receive HTTP 404
 * before the API gateway. `host.describe` stays because the browser
 * connection handshake requires it; it does not advertise a project path.
 */

/** `/api/<method>` names the product-safe Host will serve. */
export const PRODUCT_SAFE_ALLOWED_METHODS = [
  'session.list',
  'session.search',
  'session.create',
  'session.history',
  'session.models',
  'session.selectModel',
  'session.rename',
  'session.fork',
  'session.prompt',
  'session.attachment',
  'session.updateQueue',
  'session.cancel',
  'llm.providers',
  'llm.models',
  'agentPreset.list',
  'agentPreset.select',
  'settings.describe',
  'host.describe',
] as const
