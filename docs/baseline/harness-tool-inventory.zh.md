# Harness Tool Inventory (M0 BEFORE)

[English](harness-tool-inventory.md) | 中文

**Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Source:** `packages/**/src` 中的 `defineTool({ name })` 加上 preset 接线。
**Record only. M0 does not remove tools.**

线路名是 `tool.call.toolview` 用来键控的值。

---

## Default Web coding agent (`standard` / `code` presets)

这些是默认 `dsh web` 会话可以获得的面向模型的工具。

| Wire name | Package | Danger |
|---|---|---|
| `bash` | `@deepseek-ai/dsh-tool-bash` | Host shell (POSIX) |
| `pwsh` | `@deepseek-ai/dsh-tool-pwsh` | Host shell (win32) |
| `read` | `@deepseek-ai/dsh-tool-fs` | Workspace FS read |
| `read_image` | `@deepseek-ai/dsh-tool-fs` | Workspace image read |
| `write` | `@deepseek-ai/dsh-tool-fs` | Workspace FS write |
| `edit` | `@deepseek-ai/dsh-tool-fs` | Workspace FS edit |
| `grep` | `@deepseek-ai/dsh-tool-fs-search` | Workspace search |
| `glob` | `@deepseek-ai/dsh-tool-fs-search` | Workspace glob |
| `job_output` | `@deepseek-ai/dsh-tool-jobs` | In-process job read |
| `job_list` | `@deepseek-ai/dsh-tool-jobs` | In-process job list |
| `job_kill` | `@deepseek-ai/dsh-tool-jobs` | In-process job kill |
| `skill` | `@deepseek-ai/dsh-tool-skill` | Load local skills |
| `get_goal` / `create_goal` / `update_goal` | `@deepseek-ai/dsh-tool-goal` | Goal loop |
| `exit_plan_mode` | `@deepseek-ai/dsh-plan-mode` | Plan mode 退出（`/plan` 也会注册 `plan` 命令，不是默认 mutate 工具） |
| `subagent` | `@deepseek-ai/dsh-tool-subagent` (spawn) | Nested agent |
| `subagent_fork` | `@deepseek-ai/dsh-tool-subagent` (fork) | Nested agent |
| `send_message` | `@deepseek-ai/dsh-tool-subagent-control` | Talk to child |
| `interrupt_agent` | `@deepseek-ai/dsh-tool-subagent-control` | Stop child |
| `list_agents` | `@deepseek-ai/dsh-tool-subagent-control/list-agents` | List children |
| `workflow` | `@deepseek-ai/dsh-tool-workflow` | Multi-agent script |
| `ralph` | `@deepseek-ai/dsh-tool-ralph` | Bounded multi-round worker |
| `ask_user_question` | `@deepseek-ai/dsh-tool-ask-user` | User interrupt |
| `todo_write` | `@deepseek-ai/dsh-tool-todo` | Todo list |
| `web_search` | `@deepseek-ai/dsh-tool-web` | Network search |
| `web_fetch` | `@deepseek-ai/dsh-tool-web` | Network fetch（standard preset 中 `fetch: false`） |

`code` preset 增加 Code Mode 展示（通过 `@deepseek-ai/dsh-agent-tool-presentation` 的 `mode: code` 得到 `run_code`）。原生工具名仍留在注册表中。

`standard` / `code` 随附 `tool-subagent-codex` 与 `tool-subagent-claude-code` 且为 **disabled**。官方 CI 把这些 real-product 测试当作可选外部产品。

---

## `minimal` preset (not default Web)

| Wire name | Package | Danger |
|---|---|---|
| `bash` (persistent) | `@deepseek-ai/dsh-tool-bash-persistent` | Persistent PTY + unsandboxed posture |
| `pwsh` (persistent) | `@deepseek-ai/dsh-tool-pwsh-persistent` | Same on win32 |
| `str_replace_editor` | `@deepseek-ai/dsh-tool-str-replace-editor` | 覆盖 `dsh-fs-local` 的绝对路径编辑器 |
| `terminal_*` | `@deepseek-ai/dsh-tool-terminal` | `terminal_open/send/read/signal/close/list` — persistent PTY |

---

## `cordis` preset extras

| Wire name | Package | Danger |
|---|---|---|
| `cordis_inspect_list` | `@deepseek-ai/dsh-tool-cordis` | Runtime inspection |
| `cordis_inspect_query` | same | Runtime inspection |
| `cordis_inspect_self` | same | Runtime inspection |
| `cordis_define` | same | Write live plugins |
| `cordis_run` | same | Evaluate model JS against live runtime |
| `cordis_stop` | same | Stop dynamic run |
| `cordis_undefine` | same | Remove dynamic plugin |

该 preset README 写明这等价于 shell 访问。

---

## Present in the monorepo but not default Web

| Wire name | Package | Loaded by |
|---|---|---|
| `session_search` / `session_event_search` / `session_trace` / `session_event_trace` / `session_event_read` | `@deepseek-ai/dsh-tool-session-query` | Host/query 组合，不是 standard preset |
| `lsp` | `@deepseek-ai/dsh-tool-lsp` | 当挂载 LSP 组合包时 |
| `report` | `@deepseek-ai/dsh-tool-subagent-report` | 宿主平面上的子级 setup |
| schedule tools | `@deepseek-ai/dsh-schedule` | 当挂载 schedule 插件时 |
| experimental team tools | `@deepseek-ai/dsh-experimental-tool-agent-team` | 仅实验 |

---

## Dangerous capability inventory (record, do not delete)

| Capability | Where it is on this SHA |
|---|---|
| Host shell | `dsh-base` + `standard`/`code` (`bash`/`pwsh`) |
| Workspace filesystem | `tool-fs`、`tool-fs-search`；`minimal` 使用未沙箱的 `dsh-fs-local` |
| Persistent PTY | 仅 `minimal`（`dsh-terminal` + persistent bash/pwsh） |
| Code runtime / `run_code` | `dsh-web-app` / `dsh-headless` + `code` preset |
| Directory picker / host FS browse | web-app `directory-picker`，RPC `host.listDirectory` / `host.createDirectory` / `host.openPath` |
| Dynamic Cordis | web-app 挂载 runner；仅 `cordis` preset 上有模型工具 |
| Plugin inventory UI | HTTP 只读；增删走 CLI |
| Credentials / settings | loopback 特权 RPC；本地 YAML |
| Optional Codex / Claude Code | 禁用行；可选 native 二进制 |
| Anonymous identity | `dsh-anonymous-user-id` — 无登录 |
| In-process jobs | `dsh-jobs-local` — 随进程结束 |

M1 Product-Safe Bundle 把本文件当作 BEFORE 来比较。
