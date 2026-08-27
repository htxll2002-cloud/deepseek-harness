# Harness Package Inventory (M0 BEFORE)

**Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Release:** `dsh-v0.1.1-rc.2`
**Source:** `packages/*/*/package.json` — **227** packages, all version `0.1.1-rc.2`.
**Record only. M0 does not delete or disable any package.**

Workspace members also include `vendor/*`, `apps/cli`, `apps/web`, `website`, `native/landlock-run`, `examples`.

PRD named `packages/skills`. On this SHA the family is **`packages/skill`**.

---

## Families required by the product contract

| Family | Packages (selected) | Splittable | M1 note |
|---|---|---|---|
| `packages/core` | `agent`, `agent-loop`, `agent-default-model`, `agent-tool-presentation`, `session`, `tools`, `system-prompt`, `scope` | Yes | Keep. Do not replace. |
| `packages/session` | `session-persistence`, `session-persistence-jsonl` (default), `session-persistence-sqlite`, projection/cache/title/telemetry | Yes | Keep JSONL default until product persistence is designed. |
| `packages/client` | connection, runtime, modules, hmr, locale, `ui-*` | Yes | Keep slot/object layer. Brand package is official. |
| `packages/host` | `webserver`, `apiproxy`, directory-picker*, `plugin-inventory`, `frontend-static` | Yes | No auth. Trust fence only. |
| `packages/jobs` | `jobs`, `jobs-local`, `tool-jobs` | Yes | In-process only. Not product Job Truth. |
| `packages/attachment` | `attachment`, `attachment-local` | Yes | Local store; uses sharp. |
| `packages/bundle` | `base`, `web-app`, `headless` | Yes | Official default is coding. M1 replaces composition, not this package family. |
| `packages/shell` | `shell`, `shell-env`, bash/pwsh local+sandbox, `tool-bash`, `tool-pwsh`, persistent variants | Yes | Dangerous for public SaaS. Record; do not delete in M0. |
| `packages/fs` | `fs`, `fs-local`, `fs-sandbox`, `tool-fs`, `tool-fs-search`, `tool-str-replace-editor` | Yes | Same. |
| `packages/terminal` | `terminal`, `terminal-bash`, `tool-terminal` | Yes | Not in `dsh-base` / `dsh-web-app`. Mounted by `minimal`. |
| `packages/code-runtime` | seam + `code-runtime-worker-thread` + python | Yes | Web-app / headless insert. |
| `packages/skill` | `skill`, `skill-filesystem`, `tool-skill`, `skill-badge` | Yes | Host registry + preset tools. |
| `packages/extensions` | `tool-cordis`, host/client runners, `ui-cordis` | Yes | Runners are in web-app; `tool-cordis` is not default web-app. |

---

## Other families present on this SHA

| Family | Why it matters |
|---|---|
| `packages/identity` | `anonymous-user-id` only. Not auth. |
| `packages/credentials` | Local BYOK store + authorization flows. |
| `packages/preset` | `agent-presets`, `persona`. |
| `packages/workspace` | Persistent workspace entity + host directory RPC. |
| `packages/web` | `tool-web`, fetch/search providers. |
| `packages/mcp` | External MCP tools onto `ctx.tools`. |
| `packages/storage` | Non-session KV (JSON / SQLite). |
| `packages/llm` | `llm`, `llm-deepseek`, `llm-pi-ai`, retry, token-meter. |
| `packages/subagent` | spawn/fork + optional Codex / Claude Code providers. |
| `packages/workflow` | `workflow`, `tool-workflow`, `tool-ralph`. |
| `packages/plan` | `plan-mode` / `exit_plan_mode`. |
| `packages/guard` | timeout / repeat-tool reminder. |
| `packages/sandbox` | sandbox + policy + windows ACL. |
| `packages/compaction` | basic compaction + tool-result pruner. |
| `packages/interaction` | commands, approvals, ask-user, permission presets. |
| `packages/hooks` | Claude Code / Codex hook adapters. |
| `packages/e2b` | Optional remote sandbox. |
| `packages/experimental` | agent-team. Not a product default. |
| `packages/test-support` | mock LLM, replay, client test runtime. |
| `apps/cli` | `dsh` launcher, shipped presets. |
| `apps/web` | Vite frontend (`@deepseek-ai/dsh-web-frontend`). |

Full name list is 227 rows; regenerate with:

```text
python3 -c "import json,pathlib; root=pathlib.Path('packages');
print('\n'.join(sorted(json.loads(p.read_text())['name']+'  '+str(p.parent) for p in root.glob('*/*/package.json'))))"
```

M1 must keep this file as the BEFORE snapshot and produce an AFTER bundle list. Do not delete packages from the monorepo in M0.
