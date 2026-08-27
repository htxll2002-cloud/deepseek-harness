# M1 Result

English | [中文](m1-result.zh.md)

Durable copy of the M1 acceptance record. Work lives on `product/m1-safe-harness`. `stable-base` is unchanged at `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`.

**Status:** PASS

**M0 closeout commit:** `405d845f5f60724f48fb7b0a883174f34a1c695d`

## Profile

- Product-safe profile: `@deepseek-ai/dsh-product-safe` / `dsh --profile product-safe` / `dsh product-safe` (internal workspace name; `private: true`; not an official DeepSeek publish target)
- Product-safe preset: `product-safe` (Safe Generic Product Agent)
- Session without workspace: PASS (`requireWorkspace: false`, no `/tmp` project)
- Tool registry after session compose: total 1 (`product_safe_echo`); dangerous 0
- Shell / FS arbitrary / Terminal / Code runtime: 0
- Dynamic plugin install / model-written extension: UNAVAILABLE
- Workspace / directory Host routes: 404
- Dangerous API bypass: 0
- Coding UI: ABSENT from composition
- Conversation / streaming / Tool View: PRESERVED
- Bind: `127.0.0.1` ONLY
- Browser auto-open: REMOVED
- Product-safe direct `node:child_process`: 0
- Product-safe direct `dsh-subprocess` / `dsh-subprocess-local` / `open`: 0

## Gates

| Gate | Result |
|---|---|
| `CI=true pnpm install --no-optional --no-frozen-lockfile` | PASS (lockfile gained the new bundle; optional Codex/Claude natives skipped) |
| `CI=true pnpm install --no-optional --frozen-lockfile` | PASS (lockfile up to date; no Foundation upgrade) |
| `pnpm typecheck` | PASS |
| `pnpm lint` / `lint:contracts-ready` | PASS |
| `pnpm test` | 14638 passed, 114 skipped, **14 failed** — 2 M0 files |
| `pnpm build` | PASS |

Known optional failures (did **not** install `@latest`):

- `packages/subagent/subagent-claude-code/tests/real-product.spec.ts` (8)
- `packages/subagent/subagent-codex/tests/real-product.spec.ts` (6)

## Patches

- UPSTREAM_CORE_PATCH: 1 (apiproxy `requireWorkspace` + optional workspace/directory inject; not a protocol rewrite)
- UPSTREAM_UI_CORE_PATCH: conversation occupancy, sidebar New Session, `ISessions.create` face
- `packages/core` / Agent Loop / Session wire / Tool protocol: unmodified
- Old project / Pi / CopilotKit / AG-UI / dsh-image-gen: 0
- Real paid provider calls: 0
- `@latest`: NO

## Known gaps

- Sidebar session list is empty because `ui-workspace` is omitted.
- Host security tests disable the `modules` row so `pnpm test` does not need client.js. Production still mounts `modules`. Coding UI absence is proven by patch composition.
- `client-runtime` still constructs `WorkspaceRuntime`. Host workspace/directory RPCs 404.
- `product_safe_echo` is an M1 fixture, not a Design tool.

## Architecture blockers

None.

Next recommended milestone: `M2_DESIGN_TOOL_VIEW_SPIKE`. Stop after M1.
