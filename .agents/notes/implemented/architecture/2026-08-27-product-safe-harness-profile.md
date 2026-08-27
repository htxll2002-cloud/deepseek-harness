# Agent Note: Product-safe Harness profile

Status: implemented

English | [中文](2026-08-27-product-safe-harness-profile.zh.md)

## Problem

Official DeepSeek Harness ships as a coding agent. The default Web composition loads Shell, filesystem tools, Terminal (on `minimal`), Code Runtime, Workspace, directory picker, Skills, and plugin-authoring surfaces. A public AI Design SaaS cannot expose those host capabilities, but it still needs the same Core, Agent Loop, Session, Conversation, Tool Protocol, streaming, and Tool View infrastructure.

Deleting official packages would break upstream compare and upgrade. Reusing `minimal` does not help: that preset still mounts Terminal. Hiding coding UI with CSS would leave Host RPCs callable. Inventing a `/tmp` project would fake a coding workspace and hide a session-protocol question.

## Decision

Product-safe is a **standalone** profile bundle, `@deepseek-ai/dsh-product-safe`, not `dsh-base` plus disables. `PROFILE_TEMPLATES['product-safe']` names only that bundle. The CLI alias `dsh product-safe` mirrors `dsh web`. The shipped roster is `apps/cli/config/product-safe-presets/` with a single `product-safe` preset (Safe Generic Product Agent). `includeUserRoot` is false.

Coding packages remain in the monorepo and on the official `dsh web` install graph. They are absent from the product-safe patch insert list and from the product-safe package's `dependencies`.

Session create is cwd-less. Core session already allows optional `cwd`. The API gateway default remains `requireWorkspace: true` (official `mkdir` + `process.cwd()`). Product-safe sets `requireWorkspace: false`. No virtual project directory is created.

Host HTTP uses `connection.allowedMethods`. Official web omits the key. Product-safe allowlists session/llm/preset list-select/`settings.describe`/`host.describe`. Other methods return HTTP 404 before the gateway. `host.describe` stays because the browser handshake requires it; paths are stripped when workspace is not required. The process binds `127.0.0.1` and rejects `0.0.0.0`.

Conversation and sidebar New Session read slot occupancy. An empty `conversation.hero.workspace` / `sidebar.workspaces` hole creates `sessions.create({})` instead of opening the coding picker. Official web still occupies those slots, so its first-run flow is unchanged.

The only model-facing tool is the fixture `product_safe_echo`. The host-plane adapter `product-safe-mock` never calls a paid provider. User HTTP cannot install a plugin or grow the tool registry.

`client-runtime` still provides `WorkspaceRuntime`. Product-safe does not mount workspace or directory-picker Host plugins; those RPCs 404. The official session list UI lives in `ui-workspace` and is omitted, so the sidebar list is empty.

## Testing

`packages/bundle/product-safe/tests/` boots the real patch over a temp `$DSH_HOME`: composition row absence, hostile `tools.execute`, HTTP allowlist 404s, cwd-less session persist, echo + mock LLM, `--host 0.0.0.0` rejection. Apiproxy, connection, conversation, and sidebar packages carry the capability-flag unit tests. See [docs/m1/product-safe-security-tests.md](../../../../docs/m1/product-safe-security-tests.md).

## Alternatives considered

**Layer `dsh-base` and disable coding rows.** Rejected: disabled rows still name those packages; the product-safe install/runtime graph would keep Shell/FS/Terminal.

**Reuse `minimal` as the public preset.** Rejected: G0/M0 confirmed `minimal` mounts Terminal.

**Delete official coding directories.** Rejected: upstream compare and upgrade require the packages to remain in the monorepo.

**CSS-hide coding UI.** Rejected: Host RPCs and client capabilities would remain. M1 treats that as FAIL.

**Create a fake `/tmp` workspace so Session create keeps the official gateway default.** Rejected: that conceals whether Session is a core hard dependency. It is not; `cwd` is already optional.

**Make `workspaces` optional on `client-runtime` or omit `WorkspaceRuntime`.** Rejected for M1: `ui-sidebar` injects `workspaces`, and `renderSlot('root')` requires the service. Removing it is a client global-state rewrite (stop line). Occupancy plus Host 404 is the composition answer.

**404 `host.describe`.** Rejected: the connection handshake throws if describe fails.

**Default `allowedMethods` to `[]`.** Rejected: official web omits the key and must keep allow-all.

**Change `WorkspaceRuntime.startSession` globally.** Rejected: official first-run with an empty workspace list must still clear into the picker.

## Consequences

A second profile exists beside `web` and `headless`. Official coding profiles are unchanged. Product-safe can boot a conversation without a local directory and without a paid key. Sidebar session browsing is missing until a product occupant is composed. `WorkspaceRuntime` remains as an inert official object. M2 may add Design tools and a session-list occupant; it must not re-mount coding Host rows to fill the sidebar.
