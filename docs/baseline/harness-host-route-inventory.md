# Harness Host Route Inventory (M0 BEFORE)

**Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Default bind:** `127.0.0.1:3080`
**Auth:** none. Host/Origin trust fence only.
**Record only.**

---

## HTTP / upgrade routes

| Path | Kind | Owner | Notes |
|---|---|---|---|
| `/` and SPA files | fallback | `@deepseek-ai/dsh-host-frontend-static` | Built `apps/web` dist. Traversal → 403. |
| `/api` | prefix | `@deepseek-ai/dsh-client-connection` | RPC bridge. Trust fence first. |
| `/api/<method>` | POST under `/api` | same + `@deepseek-ai/dsh-host-apiproxy` | Method name is the RPC key, e.g. `POST /api/session.create`. |
| `/api/events.mux` | WebSocket upgrade | connection | Session event mux. GET without upgrade → 426. |
| `/api/events.host` | WebSocket upgrade | connection | Host event stream. |
| `/api/session.export` | GET/HEAD | apiproxy `fetch/handler.ts` | Session log ZIP download. |
| `/plugins/<id>/client.js` | prefix `/plugins/` | `@deepseek-ai/dsh-client-modules` | Browser plugin bundles + source maps. |
| `/plugins/events` | HMR (when mounted) | `@deepseek-ai/dsh-client-hmr` | Idle unless `pnpm run dev:web` rebuilds. |

`dsh web --host 0.0.0.0` is intentionally unsupported until an auth layer exists.

---

## RPC methods (`packages/host/apiproxy/src/api/rpc-map.ts`)

Wire path = `POST /api/<key>`.

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

From `packages/client/connection/src/index.ts` `PRIVILEGED_METHODS`:

- `agentPreset.read` / `copy` / `openDocument` / `remove`
- `host.pickDirectory` / `host.openPath`
- `settings.describe` / `openDocument` / `update` / `replace` / `mutate`
- `credentials.describe` / `set` / `unset`
- `llm.discoverModels`

This is **not** authentication. Any loopback client can call them.

---

## Plugin install surface

`plugin-inventory` is read-only over HTTP. It cannot enable, disable, add, or remove plugins. Install is CLI (`dsh plugin`) / filesystem / pnpm.
