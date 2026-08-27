# M1 Result

[English](m1-result.md) | 中文

M1 验收记录的持久副本。工作位于 `product/m1-safe-harness`。`stable-base` 仍为 `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`，未改动。

**Status:** PASS

**M0 closeout commit:** `405d845f5f60724f48fb7b0a883174f34a1c695d`

## Profile

- Product-safe profile: `@deepseek-ai/dsh-product-safe` / `dsh --profile product-safe` / `dsh product-safe`
- Product-safe preset: `product-safe` (Safe Generic Product Agent)
- Session without workspace: PASS (`requireWorkspace: false`，没有 `/tmp` 项目)
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
| `CI=true pnpm install --no-optional --no-frozen-lockfile` | PASS（lockfile 增加了新组合包；跳过可选 Codex/Claude native） |
| `CI=true pnpm install --no-optional --frozen-lockfile` | PASS（lockfile 已是最新；没有 Foundation 升级） |
| `pnpm typecheck` | PASS |
| `pnpm lint` / `lint:contracts-ready` | PASS |
| `pnpm test` | 14638 passed, 114 skipped, **14 failed** — 2 个 M0 文件 |
| `pnpm build` | PASS |

已知可选失败（**没有**安装 `@latest`）：

- `packages/subagent/subagent-claude-code/tests/real-product.spec.ts` (8)
- `packages/subagent/subagent-codex/tests/real-product.spec.ts` (6)

## Patches

- UPSTREAM_CORE_PATCH: 1（apiproxy `requireWorkspace` + 可选 workspace/directory 注入；不是协议改写）
- UPSTREAM_UI_CORE_PATCH: conversation 占用、sidebar New Session、`ISessions.create` 面
- `packages/core` / Agent Loop / Session 线路 / Tool 协议: 未修改
- Old project / Pi / CopilotKit / AG-UI / dsh-image-gen: 0
- Real paid provider calls: 0
- `@latest`: NO

## Known gaps

- 因为省略了 `ui-workspace`，侧栏会话列表为空。
- Host 安全测试禁用 `modules` 行，因此 `pnpm test` 不需要 client.js。生产环境仍挂载 `modules`。Coding UI 缺失由 patch 组合证明。
- `client-runtime` 仍会构造 `WorkspaceRuntime`。Host workspace/directory RPC 返回 404。
- `product_safe_echo` 是 M1 夹具，不是 Design 工具。

## Architecture blockers

无。

下一建议 milestone：`M2_DESIGN_TOOL_VIEW_SPIKE`。在 M1 之后停止。
