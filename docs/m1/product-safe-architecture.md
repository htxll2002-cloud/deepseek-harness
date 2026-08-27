# M1 Product-Safe Architecture

English | [中文](product-safe-architecture.zh.md)

**Milestone:** `M1_PRODUCT_SAFE_HARNESS`
**Foundation:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Branch:** `product/m1-safe-harness`

This profile shrinks official DeepSeek Harness from the default coding agent into a safe empty product harness. It does not rewrite Core, Agent Loop, Session, Tool Protocol, or Conversation infrastructure. It does not delete official coding packages.

## Composition choice

Official profiles are patch layers. `dsh web` is `dsh-base` + `dsh-web-app`. Layering `dsh-base` and disabling coding rows would still put Shell / FS / Terminal packages on the product-safe install graph.

M1 therefore ships a **standalone** bundle:

- Profile template: `PROFILE_TEMPLATES['product-safe'] = ['@deepseek-ai/dsh-product-safe']`
- CLI alias: `dsh product-safe` (same flag family as `dsh web`)
- Preset roster: `apps/cli/config/product-safe-presets/` (not `standard` / `code` / `minimal`)
- Default preset: `product-safe`

`composeProfile` overlays `agent-presets.roots` only when the bundle left `roots` empty. Official web is unchanged.

## KEEP

Core runtime, agent loop, session, conversation, message/events, tool registry and execution protocol, streaming, client object layer, slots, tool-view infrastructure, attachment infrastructure, LLM abstraction, settings-file (describe only), empty commands registry, subagent **registry** (apiproxy still injects `subagents`), mock LLM, echo fixture.

## EXCLUDE FROM THE PUBLIC PRODUCT PROFILE

Not deleted from the monorepo. Absent from the product-safe insert list and from `@deepseek-ai/dsh-product-safe` dependencies:

Shell / bash / pwsh, arbitrary filesystem tools, terminal, code runtime, workspace, directory picker, plugin inventory, skills, credentials store, paid adapters (`llm-deepseek`, `llm-pi-ai`), model-written extensions / Cordis runners, user preset authoring, MCP, coding UI (workspace picker, file browser, terminal, code panel, preset selector, plugin install, developer plugin settings, local secret settings).

## Session without workspace

Workspace is a product/organization capability, not a core session protocol hard dependency. `SessionHeader.cwd` is already optional. Persistence already has a cwd-less bucket.

The official API gateway previously assigned `process.cwd()` and `mkdir` on create. Product-safe sets `api-gateway.requireWorkspace: false`. `session.create({})` records no cwd and does not create a `/tmp` project.

## Host bind

Product-safe Host binds `127.0.0.1` only. `assertProductSafeBindHost` is the single rule: omitted host means `127.0.0.1`; any other value fails closed. Startup and the runtime plugin share that function. The patch pins `webserver.host` to `127.0.0.1`. `localhost`, `::1`, `127.x.x.x`, LAN IPs, `0.0.0.0`, `::`, and hostnames are rejected. Public ingress is a later BFF / reverse proxy, not this runtime.

Browser auto-open is removed. Startup prints `dsh product-safe: http://127.0.0.1:<port>`. The bundle does not spawn a child process, call `open`, or depend on `dsh-subprocess`.

## HTTP allowlist

`@deepseek-ai/dsh-client-connection` accepts optional `allowedMethods`. Official web omits it (allow all). Product-safe lists session/llm/preset-list/select/`settings.describe`/`host.describe` only. Unknown methods return HTTP 404 **before** the API gateway.

`host.describe` cannot 404: the browser handshake requires it. With `requireWorkspace: false` it returns empty path strings and `canOpenPath: false`.

## UI composition

Coding UI is omitted from the patch, not hidden with CSS. Conversation / sidebar / composer / message / streaming / error / tool-view infrastructure remain.

Known gap: official session list occupies `sidebar.workspaces` via `ui-workspace`. Product-safe omits that plugin. New Session and conversation auto-create still open a cwd-less session.

Official `client-runtime` still constructs `WorkspaceRuntime`. Removing it would rewrite client global state (M1 stop line). Workspace Host RPCs 404.

## Static plugins vs dynamic plugins

The plugin system remains. Product-safe loads only the platform-reviewed echo fixture from the shipped preset. User HTTP cannot install, upload, or register a new tool.

## What M1 does not do

No Design Agent, no image tools, no Auth, no Postgres, no branding, no public deploy, no M2.
