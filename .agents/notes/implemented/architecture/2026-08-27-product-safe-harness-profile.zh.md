# Agent Note: Product-safe Harness profile

Status: implemented

[English](2026-08-27-product-safe-harness-profile.md) | 中文

## Problem

官方 DeepSeek Harness 默认是 Coding Agent。默认 Web 组合会加载 Shell、文件系统工具、Terminal（在 `minimal` 上）、Code Runtime、Workspace、目录选择器、Skills 以及插件编写表面。面向公网的 AI Design SaaS 不能暴露这些宿主能力，但仍需要同一套 Core、Agent Loop、Session、Conversation、Tool Protocol、streaming 和 Tool View 基础设施。

删除官方包会破坏与上游的对比和升级。复用 `minimal` 没有帮助：该 preset 仍会挂载 Terminal。用 CSS 隐藏 coding UI 会留下仍可调用的 Host RPC。伪造 `/tmp` 项目会伪装成 coding workspace，并掩盖 Session 协议问题。

## Decision

Product-safe 是**独立**的 profile 组合包 `@deepseek-ai/dsh-product-safe`，而不是 `dsh-base` 再加禁用。该包名是为兼容 monorepo 而沿用的；清单为 `private: true`，不得发布，也不得被表述为官方 DeepSeek 包。`PROFILE_TEMPLATES['product-safe']` 只点名该组合包。CLI 别名 `dsh product-safe` 与 `dsh web` 对称。随附名录是 `apps/cli/config/product-safe-presets/`，其中只有一个 `product-safe` preset（Safe Generic Product Agent）。`includeUserRoot` 为 false。

Coding 包仍留在 monorepo 中，也仍在官方 `dsh web` 的安装图上。它们不出现在 product-safe 的 patch insert 列表中，也不出现在 product-safe 包的 `dependencies` 里。

会话创建可以没有 cwd。Core session 本来就允许可选 `cwd`。API 网关默认仍是 `requireWorkspace: true`（官方 `mkdir` + `process.cwd()`）。Product-safe 设为 `requireWorkspace: false`。不会创建虚拟项目目录。

Host HTTP 使用 `connection.allowedMethods`。官方 web 省略该键。Product-safe 只允许 session/llm/preset list-select/`settings.describe`/`host.describe`。其他方法在网关前返回 HTTP 404。`host.describe` 保留，因为浏览器握手需要它；在不要求 workspace 时会剥离路径。进程只绑定 `127.0.0.1`（`assertProductSafeBindHost` 由 startup 与 runtime 共用）。它打印 URL，不打开浏览器。

Conversation 与侧栏 New Session 读取 slot 占用情况。空的 `conversation.hero.workspace` / `sidebar.workspaces` 空洞会执行 `sessions.create({})`，而不是打开 coding 选择器。官方 web 仍占用这些 slot，因此其首次运行流程不变。

唯一面向模型的工具是夹具 `product_safe_echo`。宿主平面适配器 `product-safe-mock` 从不调用付费提供方。用户 HTTP 不能安装插件，也不能扩大工具注册表。

`client-runtime` 仍会提供 `WorkspaceRuntime`。Product-safe 不挂载 workspace 或 directory-picker Host 插件；这些 RPC 返回 404。官方会话列表 UI 位于 `ui-workspace` 中并被省略，因此侧栏列表为空。

## Testing

`packages/bundle/product-safe/tests/` 在临时 `$DSH_HOME` 上启动真实 patch：组合行缺失、敌意 `tools.execute`、HTTP 允许列表 404、无 cwd 会话持久化、echo + mock LLM、bind-host 拒绝、真实 `127.0.0.1` 监听。Apiproxy、connection、conversation 和 sidebar 包带有能力开关单元测试。见 [docs/m1/product-safe-security-tests.md](../../../../docs/m1/product-safe-security-tests.zh.md)。

## Alternatives considered

**叠加 `dsh-base` 并禁用 coding 行。** 否决：被禁用的行仍会点名这些包；product-safe 的安装/运行时图仍会保留 Shell/FS/Terminal。

**把 `minimal` 当作公开 preset。** 否决：G0/M0 已确认 `minimal` 会挂载 Terminal。

**删除官方 coding 目录。** 否决：与上游对比和升级要求这些包留在 monorepo 中。

**用 CSS 隐藏 coding UI。** 否决：Host RPC 和客户端能力仍会存在。M1 将此视为 FAIL。

**伪造 `/tmp` workspace，让 Session 创建继续走官方网关默认值。** 否决：这会掩盖 Session 是否是核心硬依赖。它不是；`cwd` 本来就可选。

**让 `workspaces` 在 `client-runtime` 上可选，或省略 `WorkspaceRuntime`。** M1 否决：`ui-sidebar` 注入 `workspaces`，且 `renderSlot('root')` 需要该服务。移除它等于改写客户端全局状态（停止线）。占用情况加 Host 404 才是组合答案。

**对 `host.describe` 返回 404。** 否决：若 describe 失败，连接握手会抛错。

**把 `allowedMethods` 默认成 `[]`。** 否决：官方 web 省略该键，必须保持全部允许。

**全局修改 `WorkspaceRuntime.startSession`。** 否决：官方首次运行在 workspace 列表为空时仍必须进入选择器。

## Consequences

在 `web` 和 `headless` 之外多了一个 profile。官方 coding profile 不变。Product-safe 可以在没有本地目录、没有付费密钥的情况下启动会话。在组成产品占用者之前，侧栏会话浏览不可用。`WorkspaceRuntime` 仍作为惰性官方对象存在。M2 可以增加 Design 工具和会话列表占用者；不得为了填满侧栏而重新挂载 coding Host 行。
