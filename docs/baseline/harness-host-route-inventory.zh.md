# Harness Host Route Inventory (M0 BEFORE)

[English](harness-host-route-inventory.md) | 中文

**Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Default bind:** `127.0.0.1:3080`
**Auth:** 无。仅 Host/Origin 信任围栏。
**Record only.**

---

## HTTP / upgrade routes

| Path | Kind | Owner | Notes |
|---|---|---|---|
| `/` and SPA files | fallback | `@deepseek-ai/dsh-host-frontend-static` | 构建后的 `apps/web` dist。穿越 → 403。 |
| `/api` | prefix | `@deepseek-ai/dsh-client-connection` | RPC 桥。先过信任围栏。 |
| `/api/<method>` | POST under `/api` | same + `@deepseek-ai/dsh-host-apiproxy` | 方法名是 RPC 键，例如 `POST /api/session.create`。 |
| `/api/events.mux` | WebSocket upgrade | connection | 会话事件 mux。无 upgrade 的 GET → 426。 |
| `/api/events.host` | WebSocket upgrade | connection | Host 事件流。 |
| `/api/session.export` | GET/HEAD | apiproxy `fetch/handler.ts` | 会话日志 ZIP 下载。 |
| `/plugins/<id>/client.js` | prefix `/plugins/` | `@deepseek-ai/dsh-client-modules` | 浏览器插件包 + source maps。 |
| `/plugins/events` | HMR (when mounted) | `@deepseek-ai/dsh-client-hmr` | 除非 `pnpm run dev:web` 重建，否则空闲。 |

在存在认证层之前，`dsh web --host 0.0.0.0` 被有意不支持。

---

## RPC methods (`packages/host/apiproxy/src/api/rpc-map.ts`)

线路路径 = `POST /api/<key>`。

| Domain | Methods |
|---|---|
| Session | `session.list`, `session.search`, `session.create`, `session.history`, `session.models`, `session.selectModel`, `session.rename`, `session.fork`, `session.prompt`, `session.attachment`, `session.updateQueue`, `session.cancel` |
| Subagent | `subagent.list`, `subagent.history`, `subagent.prompt`, `subagent.interrupt` |
| Host FS | `host.describe`, `host.pickDirectory`, `host.listDirectory`, `host.createDirectory`, `host.openPath` |
| Workspace | `workspace.list`, `workspace.create`, `workspace.rename`, `workspace.delete`, `workspace.insertBefore`, `workspace.insertSessionBefore`, `workspace.archiveSession` |
| Skills | `skill.list` |
| Presets | `agentPreset.list`, `agentPreset.select`, `agentPreset.read`, `agentPreset.copy`, `agentPreset.openDocument`, `agentPreset.remove` |
| Goals | `goal.create`, `goal.edit`, `goal.pause`, `goal.resume`, `goal.complete`, `goal.clear` |
| Settings | `settings.describe`, `settings.openDocument`, `settings.update`, `settings.replace`, `settings.mutate` |
| Credentials | `credentials.describe`, `credentials.set`, `credentials.unset` |
| LLM | `llm.providers`, `llm.models`, `llm.discoverModels` |

---

## Privileged RPC (loopback-only even with `trustedHosts`)

来自 `packages/client/connection/src/index.ts` 的 `PRIVILEGED_METHODS`：

- `agentPreset.read` / `copy` / `openDocument` / `remove`
- `host.pickDirectory` / `host.openPath`
- `settings.describe` / `openDocument` / `update` / `replace` / `mutate`
- `credentials.describe` / `set` / `unset`
- `llm.discoverModels`

这**不是**身份认证。任何 loopback 客户端都可以调用它们。

---

## Plugin install surface

`plugin-inventory` 在 HTTP 上只读。它不能启用、禁用、添加或移除插件。安装走 CLI（`dsh plugin`）/ 文件系统 / pnpm。
