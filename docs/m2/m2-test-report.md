# M2 Test Report

English | [中文](m2-test-report.zh.md)

**Milestone:** `M2_DESIGN_TOOL_VIEW_SPIKE`

## New tests

| Spec | Asserts |
|---|---|
| `packages/design/image-tools/tests/generate-image-tool.spec.ts` | count 1–4, defaults, invalid count/aspect/empty prompt, `[M2_FAIL]`, no `fetch`, deterministic ids |
| `packages/design/image-tools/tests/edit-image-tool.spec.ts` | explicit `source_attachment_id` required, source must exist, result records source |
| `packages/design/image-tools/tests/multi-variant.spec.ts` | one tool call returns N unique attachment ids |
| `packages/client/ui-design-image/tests/image-tool-view.client.spec.ts` | keyed `generate_image` / `edit_image` Tool Views + dock chip |
| `packages/client/ui-design-image/tests/selected-image.client.spec.tsx` | Continue Editing on variant 2 writes that id |
| `packages/client/ui-design-image/tests/replay.client.spec.ts` | durable tool result rebuilds the card without React memory |
| `packages/bundle/product-safe/tests/selected-image.spec.ts` | session prompt chain: generate 2 → edit source = variant 2 |
| `packages/bundle/product-safe/tests/replay.spec.ts` | `session.history` + `session.attachment` restore completed images |
| `packages/bundle/product-safe/tests/security-regression.spec.ts` | dangerous tools = 0, allowlist unchanged, no gallery/settings/IMAGE_ROUTE |
| `packages/bundle/product-safe/tests/llm-mock.spec.ts` | mock routing for generate/edit/echo |

M1 composition, bind-host, host-deny, and cwd-less session tests remain.

## Commands

```text
pnpm exec vitest run packages/design/image-tools packages/client/ui-design-image packages/bundle/product-safe
pnpm run typecheck
pnpm run lint
pnpm run build
```

Results are recorded in [m2-result.md](m2-result.md) after the gate run.

M2 suite count: 19 files, 83 tests, all passed.
