/**
 * Direct Host HTTP bypass: coding / workspace / plugin-management routes
 * must 404 before the API gateway.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { PRODUCT_SAFE_ALLOWED_METHODS } from '../src/allowed-methods.ts'
import {
  DENIED_HOST_METHODS,
  hostRpc,
  launchProductSafe,
  rpcValue,
  type ProductSafeWorld,
} from './harness.ts'

describe('product-safe-host-deny', () => {
  let world: ProductSafeWorld | undefined
  afterEach(async () => {
    await world?.close()
    world = undefined
  })

  it('404s dangerous methods and still serves the allowlist', async () => {
    world = await launchProductSafe()
    const listed = await hostRpc(world.baseUrl, 'session.list', {})
    expect(listed.status).toBe(200)
    expect((rpcValue(listed.body) as { items: unknown[] }).items).toEqual([])

    const described = await hostRpc(world.baseUrl, 'host.describe', {})
    expect(described.status).toBe(200)
    const host = rpcValue(described.body) as { cwd: string; home: string; canOpenPath: boolean }
    expect(host.cwd).toBe('')
    expect(host.home).toBe('')
    expect(host.canOpenPath).toBe(false)

    for (const method of DENIED_HOST_METHODS) {
      const denied = await hostRpc(world.baseUrl, method, {})
      expect(denied.status, method).toBe(404)
    }

    for (const method of PRODUCT_SAFE_ALLOWED_METHODS) {
      expect(DENIED_HOST_METHODS.includes(method as typeof DENIED_HOST_METHODS[number])).toBe(false)
    }
  })
})
