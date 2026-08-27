# G0 — DeepSeek Harness Baseline

**Audit date:** 2026-08-27
**Isolated clone:** `audit/deepseek-harness`
**Product code modified:** 0
**This document is source-verified unless marked Unknown.**

---

## 1. Official identity at freeze time

| Fact | Value | Verified |
|---|---|---|
| Repository | `deepseek-ai/deepseek-harness` | GitHub API |
| Default branch | `master` | GitHub API |
| Root package | `@deepseek-ai/dsh-root@0.1.1-rc.2` | `package.json` |
| License | MIT, Copyright (c) 2026 DeepSeek | `LICENSE` |
| Latest GitHub Release | **none stable**; latest published is prerelease `dsh-v0.1.1-rc.2` | `releases/latest` = 404 |
| Latest tag | `dsh-v0.1.1-rc.2` → `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` | `list_tags` |
| Current `master` HEAD | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` | `list_commits` + clone |
| Existing research baseline | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` | PRD + GitHub |
| Last official push | 2026-08-21T12:35:08Z | GitHub `pushed_at` |

There is **no GA / non-prerelease Release**. `get_latest_release` returns 404. All published tags in the current tag list are RCs:

- `dsh-v0.1.1-rc.2` = `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` (2026-08-21)
- `dsh-v0.1.1-rc.1` = `528c682e061696f5a160f363f236ecbf53cbd006`
- `dsh-v0.1.0-rc.8` = `141eb6fef83422698aef7a981029e843e8161534`
- `dsh-v0.1.0-rc.7` = `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca`

## 2. Three-way comparison

| Candidate | SHA | Relation |
|---|---|---|
| Existing research baseline | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` | Release merge `release: dsh@0.1.1-rc.2` |
| Current latest Release / Tag | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` | Same commit |
| Current `master` | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` | Same commit as of 2026-08-27 |

**Delta between the three: empty.** This is a coincidence of the current official tree, not a reason to treat `master` as a floating pin.

Do **not** follow `master`. Pin the SHA. Re-check before M0 if upstream moves.

## 3. Recommended M0 Fork Base

```text
HARNESS_PINNED_COMMIT = b150a551b8d465e31e418e1b2eaf5e79bbb7d28e
HARNESS_PINNED_TAG    = dsh-v0.1.1-rc.2
HARNESS_VERSION       = 0.1.1-rc.2
```

**Why this SHA:**

1. It is the current official RC tag, not an untagged mid-branch commit.
2. It is identical to the existing research baseline, so prior architecture notes remain valid.
3. It is identical to current `master`, so M0 does not miss published official work.
4. There is no newer stable Release to prefer.
5. The instruction forbids defaulting to latest `master`; pinning the RC tag SHA satisfies that even though HEAD currently matches.

**Risk recorded:** this is still an RC. Upstream may rewrite APIs before 0.1.x GA. M0 must keep `upstream` configured and must not auto-merge.

## 4. License, notices, branding

### Root LICENSE

MIT. Copyright line must be preserved on copies. Commercial use of the *code* is allowed.

### `THIRD_PARTY_NOTICES.md`

Generated file. Direct runtime dependencies include MIT, Apache-2.0, and at least one `SEE LICENSE IN README.md` (`@anthropic-ai/claude-agent-sdk`). Vendored Cordis / cosmokit / schemastery are MIT and republished under `@deepseek-ai`. The lockfile is the transitive SBOM.

### Brand Guidelines (`BRAND_GUIDELINES.md`)

Source-verified constraints for a commercial fork:

- May say “built on DeepSeek Harness” / “compatible with DeepSeek Harness”.
- Prefer the “DSH” abbreviation in a *project name*.
- Must **not** use the full “DeepSeek Harness” trademark as the product name.
- Must **not** use official brand materials in a way that implies official endorsement.
- “DeepSeek Harness” is described as a registered trademark of DeepSeek.

Product UI must ship its own name, logo, and `ui-brand-official` replacement. Official brand package `@deepseek-ai/dsh-client-ui-brand-official` is mounted in the shipped web-app bundle.

`@deepseek-ai/dsh-product-safe` is an internal workspace package name inherited for monorepo compatibility during early development. It is private and must never be published or represented as an official DeepSeek package. Product naming / package namespace will be revisited during branding/productization.

## 5. Node, pnpm, lockfile, CI

| Requirement | Value |
|---|---|
| Node | `^22.19.0 \|\| >=24.0.0` (`package.json` engines) |
| Local audit Node | v22.22.1 |
| packageManager | `pnpm@11.7.0` |
| Lockfile | `pnpm-lock.yaml` present |
| Workspace layout | `packages/*/*` (two-level package dirs) |
| postinstall | `node scripts/install-lefthook.mjs` (git hooks only) |
| `allowBuilds` | esbuild, lefthook, node-pty, koffi; `@google/genai` / protobufjs denied |
| GitHub CI primary Node | `24` (`.github/workflows/ci.yml`) |
| Install in CI | `pnpm install --frozen-lockfile` |
| GitLab CI | Python SDK / runtime wheel publish only; also uses frozen lockfile |

Audit install used `pnpm install --frozen-lockfile`. No `@latest`.

Install warnings (not failures):

- Unsupported linux landlock packages on darwin-arm64 (expected).
- Failed to create demo bins under `python/sdk-runtime` and `examples` because those packages were not built yet (`ENOENT` on `lib/bin.js`).
- Cyclic workspace dependency warnings (pre-existing).

## 6. Baseline commands executed

| Command | Cwd | Result |
|---|---|---|
| `git clone --branch dsh-v0.1.1-rc.2 --depth 1` | `audit/` | PASS → detached at `b150a551…` |
| `pnpm install --frozen-lockfile` | `audit/deepseek-harness` | PASS (exit 0). Optional native downloads were flaky. |
| `pnpm typecheck` | same | PASS (exit 0; `build:lib:host` + `tsc -b tsconfig.client.json`) |
| `pnpm lint:contracts-ready` | same | FAIL — `oxlint@1.76.0` missing `@oxlint/binding-darwin-arm64` / `oxlint.darwin-arm64.node` |
| `pnpm test` | same | FAIL overall: **14465 passed**, 27 failed, 117 skipped (872 files: 850 passed, 12 failed, 10 skipped) |

Runtime of the official `dsh` web server was **not** started (would be a product Host, not required for G0). No API keys used.

Recorded `pnpm test` failures (not treated as pin-source defects; M0 must reproduce on a complete optional-dep install):

1. **sharp / libvips incomplete** — `attachment-local` image/normalization/store tests and `tool-fs/read-image.spec.ts` fail with `Library not loaded: @rpath/libvips-cpp.8.18.3.dylib`. Official attachment pipeline **already depends on sharp**.
2. **oxlint native binding missing** — `scripts/oxlint-contract.spec.ts` (same root cause as lint).
3. **optional Claude / Codex binaries missing** — `subagent-claude-code` and `subagent-codex` `real-product.spec.ts` (ENOENT on darwin-arm64 optional packages). Codex's own error text suggested `npm install -g @openai/codex@latest`; that command was **not** run.
4. **THIRD_PARTY_NOTICES generator** — ENOENT on `@anthropic-ai/claude-agent-sdk-darwin-arm64` virtual manifest (same missing optional).
5. **one timing test** — `packages/boot/app-boot/tests/hmr-config.spec.ts` “HMR did not observe config creation” (10s timeout).

Core agent/session/tools/host tests are in the 14465 that passed.

## 7. Package boundaries still exist

PRD names `packages/skills`. On this SHA the directory is **`packages/skill`** (singular). All other named packages exist as *family directories*; actual npm packages live one level down (`packages/*/*`).

| Family | Exists | Splittable? | Notes |
|---|---|---|---|
| `packages/core` | Yes | Yes | `agent`, `agent-loop`, `agent-default-model`, `tools`, `system-prompt`, `session`, `scope` |
| `packages/session` | Yes | Yes | persistence seam + jsonl + sqlite + projection + cache |
| `packages/client` | Yes | Yes | connection, runtime, many `ui-*` slot packages |
| `packages/host` | Yes | Yes | webserver, apiproxy, directory-picker, plugin-inventory, frontend-static |
| `packages/jobs` | Yes | Yes | contract + `jobs-local` in-process provider + `tool-jobs` |
| `packages/attachment` | Yes | Yes | durable image bytes outside the session log |
| `packages/bundle` | Yes | Yes | `base`, `headless`, `web-app` |
| `packages/shell` | Yes | Yes | `shell`, `shell-env`, `tool-bash`, `tool-pwsh`, sandboxes |
| `packages/fs` | Yes | Yes | `tool-fs`, `tool-fs-search`, `fs-sandbox`, `fs-local` |
| `packages/terminal` | Yes | Yes | PTY / persistent shell tools (used by `minimal` preset) |
| `packages/code-runtime` | Yes | Yes | worker-thread runtime for Code Mode |
| `packages/skill` | Yes (not `skills`) | Yes | skill registry + filesystem discovery + tool |
| `packages/extensions` | Yes | Yes | `tool-cordis`, host/client runners, `ui-cordis` |

Also present and relevant: `packages/web`, `packages/preset` (`agent-presets`, `persona`), `packages/workspace`, `packages/identity` (anonymous only), `packages/credentials`, `packages/mcp`, `packages/storage`, `packages/guard`, `apps/cli`, `apps/web`.

## 8. Focus answers

### Coding capability — which Bundle / Preset

Coding is the **official default product**, not an optional extra.

1. **Host bundles**
   - `packages/bundle/base/cordis.patch.yml` mounts bash/pwsh, fs, fs-search, sandbox, skill, jobs-local, str-replace-editor, web search (fetch disabled).
   - `packages/bundle/web-app/cordis.patch.yml` adds `code-runtime` (`@deepseek-ai/dsh-code-runtime-worker-thread`), workspace, directory-picker, plugin-inventory, official brand UI.
   - `packages/bundle/headless/cordis.patch.yml` also inserts `code-runtime`.
   - Shipped Web profile layers: `@deepseek-ai/dsh-base` + `@deepseek-ai/dsh-web-app` (`apps/cli` tests).
2. **Agent presets** (`apps/cli/config/agent-presets/`)
   - `standard` — “the full coding agent”; default (`agent-presets` config `default: standard`).
   - `code` — same tools + `tool-presentation` `mode: code` (Code Mode / `run_code`).
   - `minimal` — persistent bash/pwsh + `str_replace_editor` + **unsandboxed** `dsh-fs-local`.
   - `cordis` — dynamic extension demo preset.
3. Web/headless system-prompt overlay still says: “You are a coding agent…”.
4. Temporary process-wide Code Mode: `DSH_TOOLS_MODE` on the `tools` row.

M1 Product-Safe Bundle must **not** load `standard` / `code` / `minimal`, and must not mount the host coding tools.

### Shell registration

- Host: `packages/bundle/base/cordis.patch.yml` rows `tool-bash` / `tool-pwsh` (`@deepseek-ai/dsh-tool-bash`, `@deepseek-ai/dsh-tool-pwsh`).
- Agent plane: same rows in `apps/cli/config/agent-presets/standard/agent.cordis.yml` and `code/agent.cordis.yml`.
- Implementation: `packages/shell/tool-bash/src/index.ts`, `packages/shell/tool-pwsh/src/index.ts`, service `@deepseek-ai/dsh-shell`.

### Filesystem registration

- `tool-fs` / `tool-fs-search` in base bundle and `standard`/`code` presets.
- Sandboxed provider: `fs-sandbox` (`@deepseek-ai/dsh-fs-sandbox`) in base.
- `minimal` preset replaces that with isolated `dsh-fs-local` (dangerous).

### Code Runtime registration

- Web: `packages/bundle/web-app/cordis.patch.yml` insert `code-runtime` → `@deepseek-ai/dsh-code-runtime-worker-thread`.
- Headless: same insert in `packages/bundle/headless/cordis.patch.yml`.
- Code Mode presentation: `apps/cli/config/agent-presets/code/agent.cordis.yml` `tool-presentation` `mode: code`.

### Workspace Host Route

- `packages/bundle/web-app/cordis.patch.yml` insert `directory-picker` → `@deepseek-ai/dsh-host-directory-picker-auto`.
- Related: `workspace`, `file-reference-local`, client `ui-workspace`, `ui-directory-picker-*`.
- Host webserver itself has no workspace semantics; it is a route table (`packages/host/webserver/README.md`).

### Dynamic Extension registration

- Model-facing tools (`cordis_inspect` / `cordis_define` / `cordis_run` / `cordis_stop` / `cordis_undefine`) live in `packages/extensions/tool-cordis`.
- **Not** in the default web-app bundle patch. Mounted in examples (`examples/web-cordis/cordis.yml`, advanced headless/ACP) and the `cordis` preset.
- Web-app *does* mount the dual-face runners: `cordis-host-runner`, `cordis-client-runner`, `ui-cordis`. That is the dynamic-package *infrastructure*, even when `tool-cordis` is absent.
- Plugin inventory UI is mounted: `plugin-inventory` + `ui-settings-plugin-inventory`. Inventory is **read-only** (cannot enable/disable/add/remove plugins over HTTP). Plugin add is CLI/`pnpm`, not an anonymous Host RPC.
- `packages/terminal` is **not** in `dsh-base` / `dsh-web-app`. It is mounted by the `minimal` preset (`dsh-terminal` + `dsh-terminal-bash`) and some examples.
- High-privilege RPCs (`settings.*`, `credentials.*`, `host.pickDirectory`, preset mutation, `llm.discoverModels`) are loopback-gated; this is a trust fence, not auth.

### Tool View by tool name

Unchanged keyed-slot pattern. Source: `packages/client/ui-tool/README.md` and `packages/client/ui-tool/src/client/contract/slots.ts`.

```text
ctx.slots.inject('tool.call.toolview', () =>
  ctx.slots.register({
    name: 'tool.call.toolview',
    key: '<wire tool name>',
  }, BusinessToolRow))
```

A keyed hit replaces the generic row. Also used: `conversation.view`, `settings.plugin.item`, `conversation.chat.node`.

### Session persistence

- Seam: `@deepseek-ai/dsh-session-persistence` (`packages/session/session-persistence`).
- Default official backend: **JSONL** (`dsh-session-persistence-jsonl`), root `dshHomePath('sessions')`, typically `.jsonl.zstd`.
- Alternate backend: **SQLite** (`dsh-session-persistence-sqlite`) exists; not the shipped default.
- Event-sourced: the `SessionEvent` log is the conversation truth. Attachments are stored separately (`dsh-attachment-local`).
- Projection cache can persist beside `workspace.json` via `dsh-storage-json`.

### Jobs — still in-process

`packages/jobs/jobs/README.md` (Known Limitations):

> The contract is in-process — `JobStart.run()` passes callbacks and exact `Agent` objects; a durable or cross-process backend must reshape identity…

Shipped provider: `@deepseek-ai/dsh-jobs-local` (base bundle row `jobs`). This is **not** a durable Generation Job system. Product Job Truth must stay in PostgreSQL (PRD). Harness jobs remain a coding-agent background-task seam.

### Web Host authentication

**Still missing real user auth.**

- `packages/identity/README.md`: “These values do not represent an authenticated account.”
- Only identity package: `anonymous-user-id` (UUID in `$DSH_HOME/.anonymous-user-id` for telemetry).
- `packages/host/webserver/README.md` Known Limitations: **“No TLS, auth, or origin policy”**. Binding `0.0.0.0` exposes the server to that network.
- Trust model is LAN / `--trusted-host` / loopback default `127.0.0.1:3080`.

### UI Slot / Object Layer

Still the Cordis client slot + inject-face model. No second UI framework. Official occupants include conversation, sidebar, settings, tool views, workspace, brand. Extension remains non-invasive via `ctx.slots.inject`.

## 9. Security-relevant Host surface (for M1, not implemented now)

Present in shipped web-app / base and **must be removed or unreachable** in a public SaaS bundle:

- Shell / pwsh tools and sandboxes
- Filesystem tools and workspace directory picker
- Code runtime / Code Mode
- Plugin inventory + user-writable agent presets (`$DSH_HOME/.agent-presets` “same trust as shell access”)
- Dynamic Cordis runners / `tool-cordis` (examples)
- Credentials settings (BYOK Models page)
- `dsh plugin add` / Skill filesystem discovery
- Web search (DeepSeek); fetch is already disabled in shipped `tool-web`
- Optional MCP / E2B / computer-adjacent packages exist in the monorepo

## 10. Apps

- `apps/cli` — `dsh` bin, profile composition, official presets
- `apps/web` — frontend

## 11. Classification

```text
FOUNDATION
Confidence: 92
Source Verified: YES
Test Verified: typecheck PASS; unit tests 14465 passed / 27 failed (optional natives + 1 HMR timing)
Runtime Verified: install + typecheck only (web Host not started)
Unknown: whether master will move before M0; RC API stability; whether a clean CI-like install is fully green
Required PoC: none in G0; M0 is the official fork + full baseline reproduction
```
