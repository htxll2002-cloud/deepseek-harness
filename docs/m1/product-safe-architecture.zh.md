# M1 Product-Safe Architecture

[English](product-safe-architecture.md) | 中文

**Milestone:** `M1_PRODUCT_SAFE_HARNESS`
**Foundation:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Branch:** `product/m1-safe-harness`

该 profile 把官方 DeepSeek Harness 从默认 coding agent 收缩成安全的空产品 harness。它不改写 Core、Agent Loop、Session、Tool Protocol 或 Conversation 基础设施。它不删除官方 coding 包。

## Composition choice

官方 profile 是 patch 层。`dsh web` 是 `dsh-base` + `dsh-web-app`。叠加 `dsh-base` 再禁用 coding 行，仍会把 Shell / FS / Terminal 包放进 product-safe 安装图。

因此 M1 发布一个**独立**组合包：

- Profile 模板：`PROFILE_TEMPLATES['product-safe'] = ['@deepseek-ai/dsh-product-safe']`
- CLI 别名：`dsh product-safe`（与 `dsh web` 相同的 flag 族）
- Preset 名录：`apps/cli/config/product-safe-presets/`（不是 `standard` / `code` / `minimal`）
- 默认 preset：`product-safe`

`composeProfile` 仅在组合包把 `roots` 留空时覆盖 `agent-presets.roots`。官方 web 不变。

## KEEP

Core 运行时、agent loop、session、conversation、message/events、工具注册表与执行协议、streaming、客户端对象层、slots、tool-view 基础设施、attachment 基础设施、LLM 抽象、settings-file（仅 describe）、空 commands 注册表、subagent **registry**（apiproxy 仍注入 `subagents`）、mock LLM、echo 夹具。

## EXCLUDE FROM THE PUBLIC PRODUCT PROFILE

不是从 monorepo 删除。它们不出现在 product-safe 的 insert 列表中，也不出现在 `@deepseek-ai/dsh-product-safe` 的 dependencies 里：

Shell / bash / pwsh、任意文件系统工具、terminal、code runtime、workspace、目录选择器、plugin inventory、skills、凭据存储、付费适配器（`llm-deepseek`、`llm-pi-ai`）、由模型编写的 extension / Cordis runner、用户 preset 编写、MCP、coding UI（workspace 选择器、文件浏览器、terminal、代码面板、preset 选择器、插件安装、开发者插件设置、本地密钥设置）。

## Session without workspace

Workspace 是产品/组织能力，不是核心 session 协议的硬依赖。`SessionHeader.cwd` 本来就可选。持久化本来就有无 cwd 桶。

官方 API 网关此前会在创建时赋值 `process.cwd()` 并 `mkdir`。Product-safe 设置 `api-gateway.requireWorkspace: false`。`session.create({})` 不记录 cwd，也不创建 `/tmp` 项目。

## Host bind

Product-safe Host 绑定 `127.0.0.1`。Startup 拒绝 `--host 0.0.0.0`。M1 不增加 Auth，也不得监听公网。

## HTTP allowlist

`@deepseek-ai/dsh-client-connection` 接受可选 `allowedMethods`。官方 web 省略它（全部允许）。Product-safe 只列出 session/llm/preset-list/select/`settings.describe`/`host.describe`。未知方法在到达 API 网关**之前**返回 HTTP 404。

`host.describe` 不能 404：浏览器握手需要它。在 `requireWorkspace: false` 时，它返回空路径字符串且 `canOpenPath: false`。

## UI composition

Coding UI 从 patch 中省略，而不是用 CSS 隐藏。Conversation / sidebar / composer / message / streaming / error / tool-view 基础设施保留。

已知缺口：官方会话列表通过 `ui-workspace` 占用 `sidebar.workspaces`。Product-safe 省略该插件。New Session 与会话自动创建仍会打开无 cwd 会话。

官方 `client-runtime` 仍会构造 `WorkspaceRuntime`。移除它会改写客户端全局状态（M1 停止线）。Workspace Host RPC 返回 404。

## Static plugins vs dynamic plugins

插件系统仍在。Product-safe 只从随附 preset 加载经过平台审查的 echo 夹具。用户 HTTP 不能安装、上传或注册新工具。

## What M1 does not do

没有 Design Agent、没有图像工具、没有 Auth、没有 Postgres、没有 branding、没有公网部署、没有 M2。
