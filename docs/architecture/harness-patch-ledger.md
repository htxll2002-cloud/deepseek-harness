# Harness Patch Ledger

English | [中文](harness-patch-ledger.zh.md)

**Milestone:** `M1_PRODUCT_SAFE_HARNESS`
**Foundation:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` (`dsh-v0.1.1-rc.2`)
**M0 closeout:** `405d845f5f60724f48fb7b0a883174f34a1c695d`

Compare product changes with:

```text
git diff stable-base...HEAD
```

`stable-base` must remain the official Harness baseline. M1 work lives on `product/m1-safe-harness`.

---

## Classification key

| Category | Meaning |
|---|---|
| CONFIGURATION | Profile template, CLI alias, allowlist, `requireWorkspace` config |
| NEW_BUNDLE | `@deepseek-ai/dsh-product-safe` |
| NEW_PRESET | `product-safe` |
| NEW_PRODUCT_COMPOSITION | Standalone patch + CLI preset root overlay |
| NEW_TEST | Product-safe and capability tests |
| PRODUCT_ADAPTER | Mock LLM / echo fixture owned by the bundle |
| UPSTREAM_CORE_PATCH | Small host capability flag; not Agent/Session/Tool protocol |
| UPSTREAM_UI_CORE_PATCH | Occupancy-driven session create in official UI injects |

---

## M0 documentation (already on product/main)

| file | reason | category | upstream impact | runtime behavior changed |
|---|---|---|---|---|
| `.gitignore` | Ignore isolated M0 `DSH_HOME` | git / test env | none | NO |
| `docs/architecture/*`, `docs/baseline/*`, `docs/research/g0-*.md` | G0/M0 research | docs | none | NO |

---

## M1 configuration / composition

| file | reason | category | upstream impact | runtime behavior changed |
|---|---|---|---|---|
| `packages/boot/app-boot/src/profile.ts` | `PROFILE_TEMPLATES['product-safe']` | CONFIGURATION | official templates gain one name | YES for that profile only |
| `apps/cli/src/args.ts` | `dsh product-safe` alias | CONFIGURATION | CLI help | YES for that alias |
| `apps/cli/src/profile-boot.ts` | Product-safe preset root when bundle left `roots` empty | NEW_PRODUCT_COMPOSITION | official web still uses shipped coding presets | YES for product-safe |
| `apps/cli/package.json` | Depend on the new bundle | NEW_BUNDLE | install graph | YES |
| `packages/bundle/product-safe/**` | Standalone safe bundle, echo, mock LLM, allowlist; bind `127.0.0.1` only; URL print, no browser spawn | NEW_BUNDLE / PRODUCT_ADAPTER | none (new package) | YES |
| `apps/cli/config/product-safe-presets/product-safe/**` | Safe Generic Product Agent | NEW_PRESET | none | YES |
| `scripts/check-workspace-constraints.ts` | Extra published files for echo/llm-mock/allowed-methods | CONFIGURATION | constraints | NO |
| `knip.json` | Bundle workspace ignore | CONFIGURATION | knip | NO |
| `tsconfig.host.json` | Host project reference | CONFIGURATION | typecheck | NO |
| `tsconfig.base.json` | Source-plane paths for product-safe subpath exports | CONFIGURATION | vitest / tsc paths | NO |

---

## M1 upstream capability seams (not protocol rewrites)

| file | reason | category | why not config/bundle/preset/plugin/adapter | runtime behavior changed |
|---|---|---|---|---|
| `packages/host/apiproxy/src/index.ts`, `src/api-proxy.ts` | `requireWorkspace` (default `true`); optional workspace/directory inject; cwd-less create; strip paths on `host.describe` | UPSTREAM_CORE_PATCH | Gateway always assigned `process.cwd()` + `mkdir`. A bundle cannot change that without this flag. Session/Agent/Tool **protocols** are unchanged (`cwd` was already optional). | YES when `requireWorkspace: false` |
| `packages/client/connection/src/index.ts` | Optional `allowedMethods` → HTTP 404 before gateway | CONFIGURATION | Official web omits the key (allow all). Missing must not default to `[]`. | YES when set |
| `packages/client/ui-conversation/src/client/apply.ts`, `ConversationRoot.tsx`, `contract/slots.ts` | Occupancy of `conversation.hero.workspace` drives composer + cwd-less create; unoccupied hole does not instantiate the picker or the workspace-trigger textarea | UPSTREAM_UI_CORE_PATCH | Bundle cannot replace ConversationRoot inject. CSS hide would leave Host workspace APIs. Official web still occupies the slot. | YES when the hole is empty |
| `packages/client/ui-sidebar/src/client/index.ts` | New Session: empty `sidebar.workspaces` → `sessions.create({})` | UPSTREAM_UI_CORE_PATCH | Changing `WorkspaceRuntime.startSession` globally would break official first-run (empty list → picker). Occupancy is the capability signal. | YES when the hole is empty |
| `packages/client/runtime/src/client/contract/sessions.ts`, `packages/test-support/client-runtime/src/sessions.ts` | Expose existing `SessionRuntime.create` on `ISessions` (cwd-less opts) | UPSTREAM_UI_CORE_PATCH | UI plugins type against `ISessions`. The method already existed on the concrete runtime; the public face did not. A bundle cannot widen that interface. | YES for typed feature callers |

**UPSTREAM_CORE_PATCH count:** 1 concern (apiproxy workspace flag). Not a rewrite of `packages/core`, Agent Loop, Session wire, or Tool calling.

**UPSTREAM_UI_CORE_PATCH count:** 3 seams (conversation occupancy, sidebar New Session, `ISessions.create` face). Not a protocol rewrite; occupancy is composition-driven.

---

## Why Bundle / Preset / Config cannot replace these patches

A product-safe patch can omit plugins, set `requireWorkspace: false`, and set `allowedMethods`. It cannot change TypeScript that already runs inside official packages:

| Patch | Why composition is not enough |
|---|---|
| Apiproxy `requireWorkspace` | `ensureSession` assigned `process.cwd()` and `mkdir` on every create. A YAML row cannot skip that assignment. |
| Conversation occupancy | `ConversationRoot` is the official composer inject. An empty hole still evaluated `renderSlot('conversation.hero.workspace')` and treated the textarea as a workspace trigger. CSS hide would leave Host workspace APIs. |
| Sidebar New Session | Occupied `sidebar.workspaces` must keep official `workspaces.startSession`. Changing `WorkspaceRuntime.startSession` globally would break official first-run (empty list → picker). |
| `ISessions.create` face | UI plugins type against `ISessions`. `SessionRuntime.create` already existed; the public face did not. A bundle cannot widen that interface. |

`connection.allowedMethods` is CONFIGURATION, not a core/UI protocol patch: official web omits the key and must keep allow-all.

## Why these patches do not change protocols

| Protocol | Unchanged because |
|---|---|
| Agent Loop | No edit under `packages/core/agent-loop` or loop scheduling. |
| Session Protocol | `SessionHeader.cwd` was already optional. M1 stops inventing a directory; it does not add events or bump `SESSION_FORMAT_VERSION`. |
| Tool Protocol | Echo is a normal registered tool. No schema, execute, or log-envelope change. |
| Persistence Protocol | JSONL / SQLite providers stay official. Cwd-less sessions persist the same header fields with `cwd` absent. |

Official `dsh web` keeps `requireWorkspace: true` and occupied workspace slots, so its create path still mkdirs `process.cwd()`.

## Conditions that allow deleting each patch

Delete a product-line patch only after official Harness lands the same capability and product-safe can rely on composition alone.

| Patch | Removable when |
|---|---|
| Apiproxy `requireWorkspace` | Official `ensureSession` creates cwd-less sessions when workspace/directory services are absent, without assigning `process.cwd()` or mkdir, and `host.describe` already strips paths in that case. Product-safe then omits the flag. |
| Conversation occupancy | Official `ConversationRoot` already treats an unoccupied `conversation.hero.workspace` as a live cwd-less composer (no picker instantiate, no workspace-trigger textarea). |
| Sidebar New Session | Official sidebar New Session already calls `sessions.create({})` when `sidebar.workspaces` is unoccupied, and still calls `workspaces.startSession` when occupied. |
| `ISessions.create` face | Official `ISessions` already publishes `create` with cwd-less options. Product-safe then only consumes the face. |

Do not delete a patch by faking `/tmp` cwd, CSS-hiding the picker, or changing `WorkspaceRuntime.startSession` for every profile.

---

## M1 tests

| file | category |
|---|---|
| `packages/bundle/product-safe/tests/*` | NEW_TEST |
| `packages/host/apiproxy/tests/api-proxy-require-workspace.spec.ts` | NEW_TEST |
| `packages/client/connection/tests/node-half.host.spec.ts` (allowlist case) | NEW_TEST |
| `packages/client/ui-conversation/tests/skeleton.client.spec.tsx` (workspace-free composer) | NEW_TEST |
| `packages/client/ui-sidebar/tests/apply.client.spec.tsx` (occupancy New Session) | NEW_TEST |
| `apps/cli/tests/args.spec.ts` (`product-safe` alias) | NEW_TEST |

---

## M1 documentation

`docs/m1/*` and this ledger. Runtime behavior unchanged by docs.
