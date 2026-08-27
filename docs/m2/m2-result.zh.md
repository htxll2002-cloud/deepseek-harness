# M2 结果

[English](m2-result.md) | 中文

**Milestone:** `M2_DESIGN_TOOL_VIEW_SPIKE`

**Base commit:** `c4dc6a10866b77c42b8ad5f15f27640ce5773ee6`

**Branch:** `product/m2-design-tool-view-spike`

## 已交付

product-safe 现在挂载 Design Image Spike Agent。preset 目录是 `generate_image` 与 `edit_image`。确定性 mock PNG 生成器写入官方 Harness attachment。官方 `tool.call.toolview` 空洞渲染 1–4 个 variant。Continue Editing 写入显式 `[source:<attachmentId>]` token，作为 `TEMPORARY_M2_ONLY` spike 传输。刷新会话时，已完成图片从持久化 tool result 和 `session.attachment` 恢复。

`product_safe_echo` 仍是可重新挂载的测试夹具，不出现在 Design preset 用户体验里。

## 不变量

- 真实 provider 调用：0
- 外部图片 URL 拉取：0
- 新增 Host 路由：0（`session.attachment` 本来就在允许列表中）
- API key UI / provider 设置 / 工作区保存 / IndexedDB 画廊：0
- 会话组合后的危险工具：0
- 绑定：仅 `127.0.0.1`
- UPSTREAM_CORE_PATCH：仍为 1
- UPSTREAM_UI_CORE_PATCH：仍为 3
- M2 新增上游运行时补丁：0
- Source token 状态：`TEMPORARY_M2_ONLY`
- Harness `attachmentId` 不是产品 `artifact_id`

## 门禁

typecheck、lint 与 build 通过。

M2 规格：20 个文件、84 个测试，全部通过。

全量套件：14667 通过、114 跳过。14 个失败是本环境缺少可选的 Codex/Claude real-product 二进制，不是 M2 图片工具回归。

## 已知缺口

- 选择只是会话本地 spike 状态，不是产品 artifact 真相。
- `[source:<attachmentId>]` 只是 M2 spike 传输，产品 working state 建立后必须替换。
- 没有 durable job、artifact DAG、上传产品流、画廊、credits 或真实 provider。
- 正式 Design Agent prompt 仍是一行 spike 人设。

下一步建议里程碑：`M3_PRODUCT_CONTROL_PLANE_SKELETON`。
