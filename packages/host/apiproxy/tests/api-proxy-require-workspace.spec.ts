/**
 * Product-safe Host capability: cwd-less session create and no path leak when
 * `requireWorkspace` is false and the workspace/directory plugins are absent.
 */

import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import AgentRegistry, { type AgentFactory } from '@deepseek-ai/dsh-agent'
import type { Agent } from '@deepseek-ai/dsh-agent'
import SessionStore, { type Session } from '@deepseek-ai/dsh-session'
import UserQuestionService from '@deepseek-ai/dsh-user-questions'
import type { RpcRequest, RpcResponse } from '@deepseek-ai/dsh-host-apiproxy/api/rpc'
import { RpcId } from '@deepseek-ai/dsh-host-apiproxy/api/rpc'
import { createApiProxy } from '@deepseek-ai/dsh-host-apiproxy'

function stubAgent(session: Session): Agent {
  return { id: session.id, session, status: 'idle' } as unknown as Agent
}

let nextRpc = 1
function request<P>(payload: P): RpcRequest<P> {
  return { rpcId: RpcId(`require-workspace-${String(nextRpc++)}`), payload }
}

function expectOk<T>(response: RpcResponse<T>): T {
  expect(response.result.ok).toBe(true)
  if (!response.result.ok) throw new Error('unreachable')
  return response.result.value
}

function expectErr<T>(response: RpcResponse<T>): { code: string; message: string } {
  expect(response.result.ok).toBe(false)
  if (response.result.ok) throw new Error('unreachable')
  return response.result.error
}

describe('requireWorkspace: false', () => {
  it('creates a cwd-less session, hides host paths, and denies workspace/directory APIs', async () => {
    const ctx = new Context()
    await ctx.plugin(SessionStore)
    await ctx.plugin(AgentRegistry)
    await ctx.plugin(UserQuestionService)
    const factory: AgentFactory = {
      async createAgent(_ownerCtx, options) {
        const session = ctx.sessions.create(
          options.sessionId,
          options.meta === undefined ? {} : { meta: options.meta },
        )
        const agent = stubAgent(session)
        const agentCtx = ctx.extend({ agent })
        ;(agent as { ctx?: Context }).ctx = agentCtx
        await options.setup?.(agentCtx)
        const unregister = ctx.agents.register(agent)
        return { agent, dispose: () => { unregister(); return Promise.resolve() } }
      },
      async resume() {
        throw new Error('requireWorkspace harness has no persisted sessions')
      },
    }
    ctx.agents.setFactory(factory)
    const api = createApiProxy(ctx, {
      defaultModelSelection: () => ({ provider: 'product-safe-mock', model: 'product-safe-mock' }),
      cwd: '/should-not-leak',
      requireWorkspace: false,
    })

    const created = expectOk(await api.sessions.create(request({})))
    const session = ctx.sessions.get(created.sessionId)
    expect(session?.header.cwd).toBeUndefined()

    const described = expectOk(await api.host.describe(request({})))
    expect(described.cwd).toBe('')
    expect(described.home).toBe('')
    expect(described.canOpenPath).toBe(false)

    const signal = new AbortController().signal
    expect(expectErr(await api.workspace.list(request({}))).code).toBe('internal')
    expect(expectErr(await api.host.pickDirectory(request({}), signal)).code).toBe('directory-picker-unavailable')
    expect(expectErr(await api.host.listDirectory(request({}), signal)).code).toBe('directory-picker-unavailable')
    expect(expectErr(await api.host.createDirectory(request({ path: '/tmp', name: 'x' }))).code)
      .toBe('directory-picker-unavailable')
    expect(expectErr(await api.host.openPath(request({ path: '/tmp' }), signal)).code).toBe('internal')
  })
})
