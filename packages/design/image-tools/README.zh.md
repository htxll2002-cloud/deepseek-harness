# `@deepseek-ai/dsh-image-tools`

[English](README.md) | 中文

面向 product-safe Design spike 的第一方 `generate_image` 与 `edit_image` 工具。包名只为兼容 monorepo 约束而沿用。清单为 `private: true`，不得发布，也不得冒充 DeepSeek 官方包。

从 preset 挂载该插件，使工具留在 agent 作用域，而不是宿主全局目录。工具体调用确定性 mock PNG 生成器，并通过官方 `ctx.attachments.saveImage` 持久化每个 variant。没有 provider、API key、endpoint、工作区保存或画廊。

`generate_image` 接受 `{ prompt, count?, aspect_ratio? }`。`count` 默认 2，且必须是 1–4。`aspect_ratio` 默认 `1:1`，且必须是 `1:1`、`4:3`、`3:4`、`16:9`、`9:16` 之一。一次工具调用返回 1–4 个唯一 attachment id。

`edit_image` 接受 `{ source_attachment_id, instruction, count? }`。`source_attachment_id` 必填，且必须已经作为图片附件出现在当前 session 中。该工具从不推断会话里最新的一张图。

prompt 或 instruction 含 `[M2_FAIL]` 时返回结构化工具错误。Mock 工作等待 80 ms，以便 Tool View 展示加载态。

## Model Experience

### generate_image tool

#### What the model sees

product-safe Design preset 把 `generate_image` 编入目录，参数为 `{ prompt, count?, aspect_ratio? }`。收录后见生成的 [工具目录](../../../docs/tool-catalog.zh.md)；本包持有描述：

##### Verbatim text for this field, when needed

```markdown
Generate 1-4 new images from a prompt. Use when the user asks to create, draw, or generate images. Do not choose a provider or model. count defaults to 2. aspect_ratio defaults to 1:1. Allowed aspect ratios: 1:1, 4:3, 3:4, 16:9, 9:16.
```

#### Token effect

preset 挂载期间有一份工具 schema。宿主全局目录为零。

#### KV Cache effect

目录在 preset 挂载期内固定。不会因用户安装插件而增长。

### edit_image tool

#### What the model sees

同一 preset 把 `edit_image` 编入目录，参数为 `{ source_attachment_id, instruction, count? }`。本包持有描述：

##### Verbatim text for this field, when needed

```markdown
Edit one already-selected image. source_attachment_id is required and must be the exact attachment the user selected. Never infer the newest conversation image. instruction describes the change. count defaults to 1.
```

#### Token effect

preset 挂载期间有一份工具 schema。宿主全局目录为零。

#### KV Cache effect

目录在 preset 挂载期内固定。不会因用户安装插件而增长。

## Known Limitations and Deferred Work

- **仅 mock 生成器** — 没有付费 provider、durable job 或 artifact DAG。真实生成属于 M4。
- **选择不是产品真相** — Continue Editing 写入显式 `[source:<attachmentId>]` token。会话内 UI 选择只是 spike，不是 PostgreSQL working state。
- **不使用 SVG fixture** — 官方 `ImageMediaType` 只接受 PNG/JPEG/WebP/GIF，因此 mock 编码 PNG 字节。
