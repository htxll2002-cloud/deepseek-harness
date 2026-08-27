# M2 测试报告

[English](m2-test-report.md) | 中文

**Milestone:** `M2_DESIGN_TOOL_VIEW_SPIKE`

## 新增测试

| Spec | Asserts |
|---|---|
| `packages/design/image-tools/tests/generate-image-tool.spec.ts` | count 1–4、默认值、非法 count/aspect/空 prompt、`[M2_FAIL]`、无 `fetch`、确定性 id |
| `packages/design/image-tools/tests/edit-image-tool.spec.ts` | 必须显式 `source_attachment_id`、source 必须存在、结果记录 source |
| `packages/design/image-tools/tests/multi-variant.spec.ts` | 一次工具调用返回 N 个唯一 attachment id |
| `packages/client/ui-design-image/tests/image-tool-view.client.spec.ts` | keyed `generate_image` / `edit_image` Tool View + dock chip |
| `packages/client/ui-design-image/tests/selected-image.client.spec.tsx` | 对 variant 2 点 Continue Editing 会写入该 id |
| `packages/client/ui-design-image/tests/replay.client.spec.ts` | 持久化 tool result 在没有 React 内存时重建卡片 |
| `packages/bundle/product-safe/tests/selected-image.spec.ts` | session prompt 链：生成 2 张 → edit source = variant 2 |
| `packages/bundle/product-safe/tests/replay.spec.ts` | `session.history` + `session.attachment` 恢复已完成图片 |
| `packages/bundle/product-safe/tests/security-regression.spec.ts` | 危险工具 = 0、允许列表不变、无画廊/设置/IMAGE_ROUTE |
| `packages/bundle/product-safe/tests/llm-mock.spec.ts` | generate/edit/echo 的 mock 路由 |
| `packages/bundle/product-safe/tests/source-transport.spec.ts` | UI `draftWithEditSource` → 宿主 `planProductSafeMock`，锁定 Variant 2 |

M1 的组合、bind-host、host-deny 和无 cwd 会话测试仍然保留。

## 命令

```text
pnpm exec vitest run packages/design/image-tools packages/client/ui-design-image packages/bundle/product-safe
pnpm run typecheck
pnpm run lint
pnpm run build
```

门禁结果记在 [m2-result.zh.md](m2-result.zh.md)。

M2 套件数量：20 个文件、84 个测试，全部通过。
