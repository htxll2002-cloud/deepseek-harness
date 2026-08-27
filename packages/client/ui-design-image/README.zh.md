# `@deepseek-ai/dsh-client-ui-design-image`

[English](README.md) | 中文

product-safe Design 图片 spike 的浏览器半边。包名只为兼容 monorepo 约束而沿用。清单为 `private: true`，不得发布，也不得冒充 DeepSeek 官方包。

该插件以 `generate_image` 与 `edit_image` 为 key 占用官方 `tool.call.toolview` 空洞，并以 Continue Editing chip 占用 `conversation.input.dock`。卡片从持久化 tool result 读取已完成图片，并通过 `session.readAttachment` 解析字节。没有 IndexedDB 画廊、provider 设置页、API key 字段或工作区保存。

选择与当前编辑源存在于会话作用域、且不持久化的 store。刷新会从 session tool result 恢复图片卡；不会恢复当时选中了哪个 variant。

## 模型体验

无，因为本包只渲染 generate_image 与 edit_image 的 Tool View 以及 Continue Editing chip，不改变模型请求、工具执行或会话事件。

#### KV Cache 影响

无。本包只负责 Client 展示。

## 已知限制与延后工作

- **选择只是 spike 状态** — selected / editing attachment id 只存在于 UI 本地，不是产品 artifact working state。
- **没有 durable job UI** — 长时间运行的 provider job 属于 M4。
- **没有画廊** — 产品资产真相属于后续存储，而不是客户端 IndexedDB。
