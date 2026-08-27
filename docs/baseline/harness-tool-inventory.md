# Harness Tool Inventory (M0 BEFORE)

English | [中文](harness-tool-inventory.zh.md)

**Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Source:** `defineTool({ name })` in `packages/**/src` plus preset wiring.
**Record only. M0 does not remove tools.**

Wire names are what `tool.call.toolview` keys on.

---

## Default Web coding agent (`standard` / `code` presets)

These are the model-facing tools a default `dsh web` session can get.

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
| `exit_plan_mode` | `@deepseek-ai/dsh-plan-mode` | Plan mode exit (`/plan` also registers a `plan` command, not a default mutate tool) |
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
| `web_fetch` | `@deepseek-ai/dsh-tool-web` | Network fetch (`fetch: false` in standard preset) |

`code` preset adds Code Mode presentation (`run_code` via `@deepseek-ai/dsh-agent-tool-presentation` `mode: code`). Native tool names remain in the registry.

`standard` / `code` ship `tool-subagent-codex` and `tool-subagent-claude-code` **disabled**. Official CI treats those real-product tests as optional external products.

---

## `minimal` preset (not default Web)

| Wire name | Package | Danger |
|---|---|---|
| `bash` (persistent) | `@deepseek-ai/dsh-tool-bash-persistent` | Persistent PTY + unsandboxed posture |
| `pwsh` (persistent) | `@deepseek-ai/dsh-tool-pwsh-persistent` | Same on win32 |
| `str_replace_editor` | `@deepseek-ai/dsh-tool-str-replace-editor` | Absolute-path editor over `dsh-fs-local` |
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

The preset README states this is equivalent to shell access.

---

## Present in the monorepo but not default Web

| Wire name | Package | Loaded by |
|---|---|---|
| `session_search` / `session_event_search` / `session_trace` / `session_event_trace` / `session_event_read` | `@deepseek-ai/dsh-tool-session-query` | Host/query composition, not standard preset |
| `lsp` | `@deepseek-ai/dsh-tool-lsp` | When LSP bundle is mounted |
| `report` | `@deepseek-ai/dsh-tool-subagent-report` | Child setup on host plane |
| schedule tools | `@deepseek-ai/dsh-schedule` | When schedule plugin is mounted |
| experimental team tools | `@deepseek-ai/dsh-experimental-tool-agent-team` | Experimental only |

---

## Dangerous capability inventory (record, do not delete)

| Capability | Where it is on this SHA |
|---|---|
| Host shell | `dsh-base` + `standard`/`code` (`bash`/`pwsh`) |
| Workspace filesystem | `tool-fs`, `tool-fs-search`; `minimal` uses unsandboxed `dsh-fs-local` |
| Persistent PTY | `minimal` only (`dsh-terminal` + persistent bash/pwsh) |
| Code runtime / `run_code` | `dsh-web-app` / `dsh-headless` + `code` preset |
| Directory picker / host FS browse | web-app `directory-picker`, RPC `host.listDirectory` / `host.createDirectory` / `host.openPath` |
| Dynamic Cordis | web-app mounts runners; model tools only on `cordis` preset |
| Plugin inventory UI | read-only HTTP; add/remove is CLI |
| Credentials / settings | loopback-privileged RPC; local YAML |
| Optional Codex / Claude Code | disabled rows; optional native binaries |
| Anonymous identity | `dsh-anonymous-user-id` — no login |
| In-process jobs | `dsh-jobs-local` — die with the process |

M1 Product-Safe Bundle compares this file as BEFORE.
