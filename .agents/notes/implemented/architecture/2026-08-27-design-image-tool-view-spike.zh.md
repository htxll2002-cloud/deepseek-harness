# Agent Note: Design 图片 Tool View spike

Status: implemented

[English](2026-08-27-design-image-tool-view-spike.md) | 中文

## 问题

M1 证明 product-safe Harness 可以在没有 coding 能力的情况下启动。它没有证明官方 Tool Call、Attachment、Tool Result 和 `tool.call.toolview` 能承载 AI 图片闭环：生成 1–4 个 variant、选中一张、用显式 source 继续编辑，以及刷新后重放已完成卡片。

整份复制 `dsh-image-gen` 会带入 BYOK 设置、未认证图片路由、IndexedDB 画廊、工作区保存和 provider 适配器。这些与后续产品控制面和 M1 安全边界冲突。

## 决策

M2 新增两个 private 第一方包，而不是把 `@deepseek-ai/dsh-product-safe` 做成越来越大的业务包。

`@deepseek-ai/dsh-image-tools` 从 product-safe preset 挂载 `generate_image` 与 `edit_image`。工具体调用确定性 mock PNG 编码器，并通过 `ctx.attachments.saveImage` 持久化 variant。`edit_image` 在当前 session 中查找调用方提供的 `source_attachment_id`，找不到就拒绝。目录从不出现 provider 工具名。

`@deepseek-ai/dsh-client-ui-design-image` 用这两个 key 占用 `tool.call.toolview`，并用 Continue Editing chip 占用 `conversation.input.dock`。Continue Editing 把 `[source:<attachmentId>]` 写入 composer 草稿。mock LLM 解析该 token。选择存在于会话作用域 store，没有 persist key。

图片通过已有的 `session.attachment` RPC 加载。没有新增 Host 路由。没有 IndexedDB 画廊、provider 设置 UI 或工作区保存。

workspace 包名仍使用 `@deepseek-ai/dsh-*`，因为 monorepo 约束要求该前缀。两个包都是 `private: true`，不是官方 DeepSeek 发布目标。

## 测试

宿主单元测试覆盖 count/aspect/prompt 校验、`[M2_FAIL]`、唯一 attachment id，以及显式 source 查找。客户端测试覆盖 keyed Tool View 注册、对 variant 2 的 Continue Editing，以及持久化 block 重放。product-safe 真实组合测试覆盖 generate → select → edit 会话链、`session.history` + `session.attachment` 重载，以及 M1 安全边界。

## 考虑过的替代

**把图片工具放进 `@deepseek-ai/dsh-product-safe`。** 否决：M2 不能把安全组合包做成越来越大的业务包。

**把 `dsh-image-gen` 当插件整份复制。** 否决：设置、画廊、IMAGE_ROUTE 和 provider 适配器超出范围，且对本 profile 不安全。

**编辑时推断会话最后一张图。** 否决：Continue Editing 从第一天就必须携带 `source_attachment_id`。

**改 ConversationRoot 或 Tool Protocol。** 否决：官方 slot 已经接受 keyed Tool View 和 dock chip。

## 后果

在 M3/M5 引入 artifact working state 之前，选择只是 spike 状态。真实 provider 和 durable job 等到 M4。
