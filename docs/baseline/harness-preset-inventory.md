# Harness Preset and Bundle Inventory (M0 BEFORE)

**Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Shipped presets:** `apps/cli/config/agent-presets/`
**Default preset:** `standard`
**Record only. M0 does not create a Product-Safe Bundle.**

---

## Host bundles

| Bundle | Path | What it loads |
|---|---|---|
| `@deepseek-ai/dsh-base` | `packages/bundle/base/cordis.patch.yml` | Session, agent, tools registry, sandbox, bash/pwsh sandbox, fs-sandbox, `tool-fs` / `tool-fs-search` / `tool-bash` / `tool-pwsh` / `tool-jobs` / `tool-str-replace-editor` (host plane), skills, jobs-local, JSONL persistence, web search service (fetch often disabled later) |
| `@deepseek-ai/dsh-web-app` | `packages/bundle/web-app/cordis.patch.yml` | Coding persona overlay, `code-runtime-worker-thread`, webserver `:3080`, apiproxy, workspace, directory-picker, plugin-inventory, official brand UI, connection `/api`, modules `/plugins`, cordis host/client runners, `ui-cordis`, `DSH_TOOLS_MODE` |
| `@deepseek-ai/dsh-headless` | `packages/bundle/headless/cordis.patch.yml` | Coding persona + code-runtime; no web host |

Shipped Web profile = `dsh-base` + `dsh-web-app`.

`tool-cordis` (model-facing define/run) is **not** in the default web-app patch. The runners and UI are.

---

## Agent presets

| Preset | Path | Role |
|---|---|---|
| `standard` | `apps/cli/config/agent-presets/standard/agent.cordis.yml` | Default. Full coding agent. |
| `code` | `apps/cli/config/agent-presets/code/agent.cordis.yml` | Same tools + Code Mode presentation. |
| `minimal` | `apps/cli/config/agent-presets/minimal/agent.cordis.yml` | Persistent shell + unsandboxed `dsh-fs-local` + `str_replace_editor`. Mounts `dsh-terminal`. |
| `cordis` | `apps/cli/config/agent-presets/cordis/agent.cordis.yml` | `standard` + live Cordis authoring tools. Documented as shell-equivalent trust. |

### `standard` / `code` tool rows

`tool-bash`, `tool-pwsh`, `tool-fs`, `tool-fs-search`, `tool-jobs`, `skill-filesystem`, `tool-skill`, `tool-goal`, `plan-mode`, compaction group, `tool-subagent-control`, `tool-subagent` (spawn), `tool-subagent-fork`, **disabled** `tool-subagent-codex` / `tool-subagent-claude-code`, `tool-workflow`, `tool-ralph`, `tool-ask-user`, `tool-todo`, `tool-web` (`fetch: false`).

`code` adds `dsh-agent-tool-presentation` with `mode: code`.

### `minimal` differences

- Persona is `complete: true` (no extra prompt sections).
- Persistent bash/pwsh + `dsh-terminal` / `dsh-terminal-bash`.
- Isolated `dsh-fs-local` (dangerous).
- `str_replace_editor`.
- No web / subagent / workflow / skill / goal rows in the file.

---

## Identity / jobs / session defaults (host, not a preset)

| Fact | Value on this SHA |
|---|---|
| User identity | `anonymous-user-id` |
| Session persist | `dsh-session-persistence-jsonl` under `dshHomePath('sessions')` |
| Jobs | `dsh-jobs-local` (in-process) |
| Default model row | `deepseek-official` / `deepseek-v4-flash` (needs real key to chat) |

---

## M1 comparison hook

BEFORE (this file): official coding default.

AFTER (M1, not started): Product-Safe Bundle must not load `standard` / `code` / `minimal` as the public product default, and must not mount host coding tools for that product profile.

M0 leaves every row in place.
