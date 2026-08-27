# M2 Design Tool View 架构

[English](design-tool-view-architecture.md) | 中文

**Milestone:** `M2_DESIGN_TOOL_VIEW_SPIKE`

本 spike 证明官方 Harness 的 Tool Registry、Tool Call、Session、Conversation、Attachment、Tool Result、Tool View 与 Client Slot 链，能在不改核心协议的情况下承载 AI 图片产品闭环。

## 垂直切片

```text
Product-Safe Harness
  → generate_image / edit_image
  → deterministic mock PNG
  → ctx.attachments.saveImage
  → Tool Result + presentation meta
  → Session JSONL
  → tool.call.toolview
  → image card (1–4 variants)
  → Select / Continue Editing
  → [source:<attachmentId>] in composer
  → edit_image(source_attachment_id, instruction)
  → new Attachment
```

`generate_image` 接受 `{ prompt, count?, aspect_ratio? }`。一次工具调用返回 1–4 个唯一 attachment id。`edit_image` 必须带显式 `source_attachment_id`，从不推断会话里最新的一张图。

Mock 编码器写入带标签的 PNG 字节。相同 prompt、宽高比和 variant index 会通过官方本地 attachment store 得到相同 digest id。prompt 含 `[M2_FAIL]` 时返回结构化工具错误。

## Slot 与重放

`@deepseek-ai/dsh-client-ui-design-image` 在 `tool.call.toolview` 上注册 `generate_image` 与 `edit_image`，并在 `conversation.input.dock` 上放 Continue Editing chip。卡片从持久化 `ToolCallBlock` 重建。字节通过 `session.attachment`（`session.readAttachment`）加载。没有第二套渲染器，也没有新增 Host 文件读取路由。

## 仅 spike 状态

当前 source / selection 状态是 **SPIKE ONLY**。它存在于会话作用域、且不持久化的 store，以及 composer 的 `[source:<attachmentId>]` token 中。它不是产品 artifact 真相。

外部 durable job：**未实现**。

Artifact DAG：**未实现**。

Gallery、provider 设置、API key、工作区保存、IndexedDB、真实 provider、上传产品流、credits 和 canvas 都不在范围内。

## 包

| Package | Role |
|---|---|
| `@deepseek-ai/dsh-image-tools` | 宿主工具 + mock 生成器。`private: true`。从 product-safe preset 挂载。 |
| `@deepseek-ai/dsh-client-ui-design-image` | Tool View + editing chip。`private: true`。占用官方 slot。 |
| `@deepseek-ai/dsh-product-safe` | 组合 + 无密钥 mock LLM 路由。不是越来越大的业务包。 |

workspace 名仍使用 `@deepseek-ai/dsh-*`，因为 monorepo 约束要求该前缀。两个新包都是 private，不是官方 DeepSeek 发布目标。
