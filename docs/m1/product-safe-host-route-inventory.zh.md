# Product-Safe Host Route Inventory

[English](product-safe-host-route-inventory.md) | 中文

**BEFORE:** [docs/baseline/harness-host-route-inventory.md](../baseline/harness-host-route-inventory.zh.md)
**AFTER:** product-safe Host 仅在 `127.0.0.1`

M1 不增加 Auth。Host 不得绑定 `0.0.0.0`。

## M0 BEFORE

HTTP：`/`、`/api`、`/api/<method>`、`/api/events.mux`、`/api/events.host`、`/api/session.export`、`/plugins/<id>/client.js`。

RPC 域包括 Workspace、Host 目录选择器、Skills、Goals、Subagent prompt、Credentials、Settings mutate、Preset 编写、`llm.discoverModels`。没有 HTTP 插件安装路由；安装走 CLI / 文件系统。

## M1 AFTER — still served

| Path / method | Result |
|---|---|
| `/` (frontend-static) | 官方会话外壳 HTML |
| `/api/events.mux`, `/api/events.host` | Streaming 基础设施（当 modules/UI 连接时） |
| `session.list` / `search` / `create` / `history` / `models` / `selectModel` / `rename` / `fork` / `prompt` / `attachment` / `updateQueue` / `cancel` | 载荷有效时为 200 |
| `llm.providers` / `llm.models` | 仅 mock 目录 |
| `agentPreset.list` / `agentPreset.select` | 随附 `product-safe` 名录（`includeUserRoot: false`） |
| `settings.describe` | `ui-settings` 需要 |
| `host.describe` | 握手。`cwd=''`，`home=''`，`canOpenPath=false` |

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

纵深防御：若 workspace/directory 方法在没有服务的情况下进入网关内部，apiproxy 返回 `internal` 或 `directory-picker-unavailable`，且不泄漏路径。Product-safe 测试断言允许列表 404，而不是该回退。

product-safe 客户端可用的 workspace/directory host 路由：**0**。
