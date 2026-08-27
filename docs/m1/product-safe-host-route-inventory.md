# Product-Safe Host Route Inventory

English | [中文](product-safe-host-route-inventory.zh.md)

**BEFORE:** [docs/baseline/harness-host-route-inventory.md](../baseline/harness-host-route-inventory.md)
**AFTER:** product-safe Host on `127.0.0.1` only

M1 does not add Auth. The Host must not bind `0.0.0.0`.

## M0 BEFORE

HTTP: `/`, `/api`, `/api/<method>`, `/api/events.mux`, `/api/events.host`, `/api/session.export`, `/plugins/<id>/client.js`.

RPC domains included Workspace, Host directory picker, Skills, Goals, Subagent prompt, Credentials, Settings mutate, Preset authoring, `llm.discoverModels`. No HTTP plugin-install route; install was CLI / filesystem.

## M1 AFTER — still served

| Path / method | Result |
|---|---|
| `/` (frontend-static) | Official conversation shell HTML |
| `/api/events.mux`, `/api/events.host` | Streaming infrastructure (when modules/UI connect) |
| `session.list` / `search` / `create` / `history` / `models` / `selectModel` / `rename` / `fork` / `prompt` / `attachment` / `updateQueue` / `cancel` | 200 when payload is valid |
| `llm.providers` / `llm.models` | Mock catalog only |
| `agentPreset.list` / `agentPreset.select` | Shipped `product-safe` roster (`includeUserRoot: false`) |
| `settings.describe` | Required by `ui-settings` |
| `host.describe` | Handshake. `cwd=''`, `home=''`, `canOpenPath=false` |

## M1 AFTER — unavailable (HTTP 404 before gateway)

| Domain | Methods |
|---|---|
| Workspace | `workspace.list` / `create` / `rename` / `delete` / `insertBefore` / `insertSessionBefore` / `archiveSession` |
| Directory picker / host FS | `host.pickDirectory` / `listDirectory` / `createDirectory` / `openPath` |
| Skills | `skill.list` |
| Goals | `goal.*` |
| Subagent RPC | `subagent.*` |
| Credentials / secrets | `credentials.*` |
| Settings mutate | `settings.update` / `replace` / `mutate` / `openDocument` |
| Preset authoring | `agentPreset.read` / `copy` / `remove` / `openDocument` |
| Model discovery | `llm.discoverModels` |
| Plugin management (no official HTTP install; still denied) | `plugin.install` / `uninstall` / `enable` / `disable` |

Defense in depth: if a workspace/directory method were ever invoked inside the gateway without the service, apiproxy returns `internal` or `directory-picker-unavailable` without leaking paths. Product-safe tests assert the allowlist 404, not that fallback.

Workspace/directory host routes available to a product-safe client: **0**.
