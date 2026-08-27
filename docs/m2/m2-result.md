# M2 Result

English | [中文](m2-result.zh.md)

**Milestone:** `M2_DESIGN_TOOL_VIEW_SPIKE`

**Base commit:** `c4dc6a10866b77c42b8ad5f15f27640ce5773ee6`

**Branch:** `product/m2-design-tool-view-spike`

## What shipped

Product-safe now mounts a Design Image Spike Agent. The preset catalog is `generate_image` and `edit_image`. A deterministic mock PNG generator writes official Harness attachments. The official `tool.call.toolview` hole renders 1–4 variants. Continue Editing writes an explicit `[source:<attachmentId>]` token. Session reload restores completed images from the durable tool result and `session.attachment`.

`product_safe_echo` remains a remountable test fixture and is not in the Design preset UX.

## Invariants

- Real provider calls: 0
- External image URL fetch: 0
- New Host routes: 0 (`session.attachment` already allowlisted)
- API key UI / provider settings / workspace save / IndexedDB gallery: 0
- Dangerous tools after session compose: 0
- Bind: `127.0.0.1` only
- UPSTREAM_CORE_PATCH: still 1
- UPSTREAM_UI_CORE_PATCH: still 3

## Gates

Typecheck, lint, and build passed.

M2 specs: 19 files, 83 tests, all passed.

Full suite: 14665 passed. Isolated re-run of the one oxlint-contract timeout passed. The remaining 14 failures are optional Codex/Claude real-product binaries missing in this environment, not M2 image-tool regressions.

## Known gaps

- Selection is session-local spike state, not product artifact truth.
- No durable job, artifact DAG, upload product flow, gallery, credits, or real provider.
- Formal Design Agent prompt is still a one-line spike persona.

Next recommended milestone: `M3_PRODUCT_CONTROL_PLANE_SKELETON`.
