/**
 * In-process product-safe composition boot for M1 security tests.
 * Uses the real bundle patch and the product-safe preset roster. Does not
 * call a paid provider and does not create a coding workspace.
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Group from '@deepseek-ai/cordis-plugin-group'
import Include, { type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import {
  assertEntriesActivated,
  healProfilesModuleFallback,
  loadOverlayPatches,
} from '@deepseek-ai/dsh-app-boot'
import { provideCmdline } from '@deepseek-ai/dsh-cmdline'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import {
  createLaunchEnvironmentSnapshot,
  DSH_LAUNCH_ENVIRONMENT_KEY,
} from '@deepseek-ai/dsh-launch-environment'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { CallId } from '@deepseek-ai/dsh-llm'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-host-apiproxy'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-tools'
import { internals } from '../src/index.ts'
import { PRODUCT_SAFE_ECHO_NAME } from '../src/echo.ts'

export { PRODUCT_SAFE_ECHO_NAME }

const REPO_ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const PATCH_PATH = join(REPO_ROOT, 'packages/bundle/product-safe/cordis.patch.yml')
const INSTALL_ANCHOR = join(REPO_ROOT, 'apps/cli/package.json')
const PRESET_ROOT = join(REPO_ROOT, 'apps/cli/config/product-safe-presets')

/** Historical and current dangerous wire names that must stay unregistered. */
export const DANGEROUS_TOOL_NAMES = [
  'bash',
  'pwsh',
  'shell',
  'exec',
  'command',
  'read',
  'write',
  'edit',
  'grep',
  'glob',
  'read_image',
  'fs_read',
  'run_code',
  'str_replace_editor',
  'terminal_open',
  'terminal_send',
  'terminal_read',
  'terminal_signal',
  'terminal_close',
  'terminal_list',
  'skill',
  'install_plugin',
  'extension',
  'cordis_define',
  'cordis_run',
  'cordis_undefine',
  'cordis_inspect_list',
  'cordis_inspect_query',
  'cordis_inspect_self',
  'cordis_stop',
  'workflow',
  'ralph',
  'web_fetch',
  'web_search',
  'workspace_read',
  'subagent',
  'subagent_fork',
  'send_message',
  'interrupt_agent',
  'list_agents',
  'todo_write',
  'get_goal',
  'create_goal',
  'update_goal',
  'exit_plan_mode',
  'job_output',
  'job_list',
  'job_kill',
] as const

/** Host methods that must 404 on the product-safe allowlist. */
export const DENIED_HOST_METHODS = [
  'workspace.list',
  'workspace.create',
  'workspace.rename',
  'workspace.delete',
  'workspace.insertBefore',
  'workspace.insertSessionBefore',
  'workspace.archiveSession',
  'host.pickDirectory',
  'host.listDirectory',
  'host.createDirectory',
  'host.openPath',
  'skill.list',
  'goal.create',
  'goal.edit',
  'goal.pause',
  'goal.resume',
  'goal.complete',
  'goal.clear',
  'subagent.list',
  'subagent.history',
  'subagent.prompt',
  'subagent.interrupt',
  'credentials.describe',
  'credentials.set',
  'credentials.unset',
  'settings.update',
  'settings.replace',
  'settings.mutate',
  'settings.openDocument',
  'agentPreset.read',
  'agentPreset.copy',
  'agentPreset.remove',
  'agentPreset.openDocument',
  'llm.discoverModels',
  'plugin.install',
  'plugin.uninstall',
  'plugin.enable',
  'plugin.disable',
] as const

/** Coding UI / capability rows that must not appear in the product-safe patch. */
export const FORBIDDEN_ROW_IDS = [
  'workspace',
  'directory-picker',
  'plugin-inventory',
  'code-runtime',
  'tool-bash',
  'tool-pwsh',
  'tool-fs',
  'tool-fs-search',
  'tool-str-replace-editor',
  'skill',
  'skill-filesystem',
  'tool-skill',
  'credentials',
  'llm-deepseek',
  'llm-pi-ai',
  'tool-web',
  'tool-ralph',
  'tool-workflow',
  'tool-subagent',
  'tool-cordis',
  'ui-workspace',
  'ui-terminal',
  'ui-skill',
  'ui-subagent',
  'ui-jobs',
  'ui-plan',
  'ui-goal',
  'ui-agent-preset',
  'ui-settings-models',
  'ui-settings-plugins',
  'ui-settings-plugin-inventory',
  'ui-settings-general',
  'ui-cordis',
  'ui-commands',
  'ui-input-trigger',
  'ui-directory-picker-browse',
  'ui-directory-picker-native',
  'ui-permission',
] as const

/** Coding packages that must not be direct product-safe runtime dependencies. */
export const FORBIDDEN_PACKAGE_DEPS = [
  '@deepseek-ai/dsh-tool-bash',
  '@deepseek-ai/dsh-tool-pwsh',
  '@deepseek-ai/dsh-tool-fs',
  '@deepseek-ai/dsh-tool-fs-search',
  '@deepseek-ai/dsh-terminal',
  '@deepseek-ai/dsh-code-runtime-worker-thread',
  '@deepseek-ai/dsh-skill',
  '@deepseek-ai/dsh-skill-filesystem',
  '@deepseek-ai/dsh-tool-skill',
  '@deepseek-ai/dsh-workspace',
  '@deepseek-ai/dsh-host-directory-picker-auto',
  '@deepseek-ai/dsh-host-plugin-inventory',
  '@deepseek-ai/dsh-client-ui-workspace',
  '@deepseek-ai/dsh-fs-sandbox',
  '@deepseek-ai/dsh-shell-env',
  '@deepseek-ai/dsh-subprocess',
  '@deepseek-ai/dsh-subprocess-local',
  'open',
  '@deepseek-ai/dsh-client-ui-skill',
  '@deepseek-ai/dsh-client-ui-cordis',
  '@deepseek-ai/dsh-client-ui-settings-plugins',
  '@deepseek-ai/dsh-client-ui-directory-picker-browse',
  '@deepseek-ai/dsh-client-ui-directory-picker-native',
] as const

/** Coding-only client packages that production `modules` must not scan in. */
export const FORBIDDEN_CLIENT_MODULE_PACKAGES = [
  '@deepseek-ai/dsh-client-ui-workspace',
  '@deepseek-ai/dsh-client-ui-skill',
  '@deepseek-ai/dsh-client-ui-cordis',
  '@deepseek-ai/dsh-client-ui-settings-plugins',
  '@deepseek-ai/dsh-client-ui-settings-plugin-inventory',
  '@deepseek-ai/dsh-client-ui-directory-picker-browse',
  '@deepseek-ai/dsh-client-ui-directory-picker-native',
  '@deepseek-ai/dsh-client-ui-agent-preset',
  '@deepseek-ai/dsh-client-ui-commands',
  '@deepseek-ai/dsh-client-ui-input-trigger',
] as const

export interface ProductSafeWorld {
  ctx: Context
  baseUrl: string
  harnessHome: string
  persistenceRoot: string
  close(): Promise<void>
}

let rpcSeq = 0

/** POST one Host RPC through the loopback HTTP allowlist. */
export async function hostRpc(
  baseUrl: string,
  method: string,
  payload: unknown,
): Promise<{ status: number; body: unknown }> {
  rpcSeq += 1
  const response = await fetch(`${baseUrl}/api/${method}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: new URL(baseUrl).host,
    },
    body: JSON.stringify({
      type: 'client-request',
      rpcId: `product-safe-${String(rpcSeq)}`,
      method,
      payload,
    }),
  })
  const text = await response.text()
  let body: unknown = text
  try {
    body = JSON.parse(text) as unknown
  } catch {
    body = text
  }
  return { status: response.status, body }
}

/** Unwrap a successful Host RPC value. */
export function rpcValue(body: unknown): unknown {
  const result = (body as { result?: { ok?: boolean; value?: unknown; error?: { message: string } } }).result
  if (result?.ok !== true) {
    throw new Error(`RPC failed: ${result?.error?.message ?? JSON.stringify(body)}`)
  }
  return result.value
}

const originalResolve = internals.resolveDistIndex

/**
 * Boot the product-safe bundle over a temp harness home.
 * @param options - optional later patches that replace earlier rows.
 * @returns the settled world and a disposer.
 */
export async function launchProductSafe(options?: {
  extraPatches?: PatchOptions[]
}): Promise<ProductSafeWorld> {
  const harnessHome = await mkdtemp(join(tmpdir(), 'dsh-product-safe-'))
  const persistenceRoot = join(harnessHome, 'sessions')
  const distDir = join(harnessHome, 'dist')
  await mkdir(distDir, { recursive: true })
  await mkdir(persistenceRoot, { recursive: true })
  const distIndex = join(distDir, 'index.html')
  await writeFile(distIndex, '<!doctype html><title>product-safe</title>')
  internals.resolveDistIndex = () => distIndex

  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = harnessHome

  const patches: PatchOptions[] = [
    ...loadOverlayPatches('product-safe test', PATCH_PATH),
    {
      id: 'agent-presets',
      config: {
        default: 'product-safe',
        includeUserRoot: false,
        roots: [{ path: PRESET_ROOT, trust: 'system' }],
      },
    },
    { id: 'session-persistence-jsonl', config: { root: persistenceRoot } },
    { id: 'settings', config: { dshHome: harnessHome } },
    { id: 'webserver', config: { host: '127.0.0.1', port: 0 } },
    {
      id: 'web-runtime',
      config: { printUrl: false, surfaceContext: false, trustedHosts: [] },
    },
    // Client bundles are a separate build face. Host security tests do not
    // need `/plugins/<id>/client.js`; composition absence is asserted from
    // the patch rows themselves.
    { id: 'modules', disabled: true },
    ...options?.extraPatches ?? [],
  ]

  healProfilesModuleFallback(INSTALL_ANCHOR, harnessHome)
  const profileDir = join(harnessHome, 'profiles', 'product-safe')
  await mkdir(profileDir, { recursive: true })
  const rootConfig = join(profileDir, 'cordis.yml')
  await writeFile(rootConfig, '[]\n')

  const ctx = new Context()
  ctx.baseUrl = `${pathToFileURL(profileDir).href}/`
  ctx.provide('dshHomePath', dshHomePath)
  ctx.provide(DSH_LAUNCH_ENVIRONMENT_KEY, createLaunchEnvironmentSnapshot([
    { source: 'process', values: {} },
  ]))
  provideCmdline(ctx, {
    args: ['--port', '0'],
    exit: (code) => {
      throw new Error(`product-safe test: unexpected exit ${String(code)}`)
    },
  })
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  ctx.loader.builtins.group = Group
  try {
    await ctx.loader.create({
      name: 'cordis:include',
      config: { path: pathToFileURL(rootConfig).href, patches },
    })
    await ctx.loader.await()
    await assertEntriesActivated(ctx, 'product-safe test')
  } catch (error) {
    await ctx.fiber.dispose().catch(() => {})
    process.env.DSH_HOME = previousHome
    internals.resolveDistIndex = originalResolve
    await rm(harnessHome, { recursive: true, force: true })
    throw error
  }

  const port = ctx.get('webServer')?.port
  if (port === undefined) {
    await ctx.fiber.dispose().catch(() => {})
    throw new Error('product-safe test: webServer missing after boot')
  }

  return {
    ctx,
    baseUrl: `http://127.0.0.1:${String(port)}`,
    harnessHome,
    persistenceRoot,
    async close() {
      await ctx.fiber.dispose()
      process.env.DSH_HOME = previousHome
      internals.resolveDistIndex = originalResolve
      await rm(harnessHome, { recursive: true, force: true })
    },
  }
}

/** Execute a tool against the current registries (host and, if given, agent scope). */
export async function executeNamedTool(
  ctx: Context,
  name: string,
  args: unknown,
  agent?: Agent,
) {
  return ctx.tools.execute({
    callId: CallId(`deny-${name}`),
    name,
    arguments: args,
    signal: new AbortController().signal,
    ...agent === undefined ? {} : { agent },
  })
}

/** Wait until the session agent is idle after a prompt. */
export async function whenAgentIdle(ctx: Context, sessionId: SessionId, timeoutMs = 10_000): Promise<void> {
  const agent = ctx.agents.get(sessionId)
  if (agent === undefined) throw new Error(`no agent for ${sessionId}`)
  if (agent.status === 'idle') return
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      dispose()
      reject(new Error(`agent ${sessionId} did not idle in ${String(timeoutMs)}ms`))
    }, timeoutMs)
    const dispose = ctx.on('agent/status', ({ agent: subject, status }) => {
      if (subject === agent && status === 'idle') {
        clearTimeout(timer)
        dispose()
        resolve()
      }
    })
  })
}
