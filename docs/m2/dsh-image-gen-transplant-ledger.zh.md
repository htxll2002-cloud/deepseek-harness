# dsh-image-gen Donor 复用台账

[English](dsh-image-gen-transplant-ledger.md) | 中文

**SOURCE_DONOR:** `shanliuling/dsh-image-gen` @ `629a44c17922e7241546931c872dd8f0447e7cce`

这是选择性移植，不是整插件采纳。没有安装 donor（没有 `dsh plugin add` / npm install / 复制插件树）。

| Donor file | Donor function / component | Decision | Notes |
|---|---|---|---|
| `src/index.ts` | `generate_image` / `edit_image` `defineTool` 接线 | ADAPTED | 保留工具名和以 attachment 为结果。为 1–4 variants 重写 schema，去掉 provider/model/size/endpoint。未复制任何 provider execute 体。 |
| `src/index.ts` | `saveGenerated` + `ctx.attachments.saveImage` | ADAPTED | Mock PNG → 官方 `saveImage`。Tool result 引用 `ImageAttachmentRef`，从不用 data URL。 |
| `src/index.ts` | Settings / `installSettingsSection` / credentials | REJECTED | 没有 BYOK，没有 Settings → Image Generation。 |
| `src/index.ts` | `IMAGE_ROUTE` + `ctx.webServer.register` | REJECTED | 图片通过已允许的 `session.attachment` 加载。 |
| `src/client/index.tsx` | `tool.call.toolview` keyed 注册 | ADAPTED | 同一官方 slot 与 key。两个工具共用 `DesignImageToolView`。 |
| `src/client/index.tsx` | `GeneratedImageCard` | ADAPTED | 重写为 1–4 宫格，含 loading / completed / error、预览、下载、Select、Continue Editing。没有复制/删除/画廊/计费重试。 |
| `src/client/index.tsx` | Settings 卡片 | REJECTED | Provider Settings = 0。API Key UI = 0。Endpoint UI = 0。 |
| `src/client/gallery-store.ts` | IndexedDB 画廊自动保存 | REJECTED | 产品资产真相不是客户端数据库。 |
| `src/client/gallery-view.tsx` | 画廊页 | REJECTED | Gallery 等到产品 artifact store。 |
| `src/workspace-save.ts` | 保存到工作区 | REJECTED | product-safe 没有 workspace。 |
| `src/google.ts` / `openai-compatible.ts` / `seedream.ts` / `dashscope.ts` | Provider 适配器 | REJECTED | 真实 provider 调用 = 0。 |
| `src/config.ts` | Provider / endpoint / model 配置 | REJECTED | 这些字段不是模型控制参数。 |
| `src/image-route.ts` | 未认证图片 HTTP 路由 | REJECTED | 会接受路径式读取。官方 attachment RPC 已足够。 |
| `src/reference-image.ts` | 回退到会话最新图 | REJECTED | M2 要求显式 `source_attachment_id`。 |
| `src/shared.ts` | 共享常量 / IMAGE_ROUTE | REFERENCE_ONLY | 用来列出不该复制的内容。 |
| `tests/index.spec.ts` | 工具注册测试 | REFERENCE_ONLY | 启发 generate/edit 单元测试；未复制。 |

## 复制行 / 重写区域

没有整文件复制 donor。适配过的部分是：

- 工具名 `generate_image` 与 `edit_image`。
- 官方 `defineTool` + image `ContentBlock` attachment 形状。
- 官方 `tool.call.toolview` keyed 占用。
- 卡片状态：generating、loading、error、download、preview。

重写：

- 多图结果 `{ images: [{ attachment, variant_index }] }`。
- 确定性 mock PNG 编码器（`packages/design/image-tools/src/mock-png.ts`）。
- 显式 source 查找（`findExplicitImageAttachment`）。
- composer `[source:<attachmentId>]` token，而不是隐式编辑最后一张图。
- 会话本地 selection store，没有 persist key。
