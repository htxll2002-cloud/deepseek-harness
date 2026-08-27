# `@deepseek-ai/dsh-product-safe`

[English](README.md) | 中文

独立的产品安全 DeepSeek Harness 配置组合。[`cordis.patch.yml`](cordis.patch.yml) 是覆盖空 profile 根的完整 insert —— 它不会先叠加 [`dsh-base`](../base/README.zh.md) 再禁用 coding 行。官方 coding 包仍留在 monorepo 中；本 profile 不加载、不注册、不路由、不展示它们。

本组合包挂载 Core / Agent Loop / Session / Conversation / Tool Protocol / streaming / Tool View / attachment 基础设施，将 Host 仅绑定到 `127.0.0.1`，并提供官方会话外壳。它不挂载 Shell、文件系统工具、Terminal、Code Runtime、Workspace、目录选择器、Skills、凭据、付费 LLM 适配器、由模型编写的 Extension，以及用户插件管理。

`dsh --profile product-safe`（别名 `dsh product-safe`）接受 `--host`、`--port` 和 `--trusted-host`。唯一允许的 `--host` 是 `127.0.0.1`（省略即该字面量）。Startup 打印 URL，不打开浏览器。普通 startup 提供方发布 `webStartup`；由 flag 配置的行会注入该服务，因此 `dsh product-safe --help` 不会启动服务器。

会话创建使用 `requireWorkspace: false`。产品会话可以在未设置 `cwd` 的情况下存在。本 profile 不会伪造 `/tmp` 项目目录。

`product-safe` preset（随 CLI 放在 `apps/cli/config/product-safe-presets/product-safe`）是 Safe Generic Product Agent。其唯一面向模型的工具是 M1 夹具 `product_safe_echo`。宿主平面的 mock 路由 `product-safe-mock` 无需付费密钥即可应答：以 `echo:` 开头的用户文本会变成该工具调用；否则回复一句简短的安全句子。

`/api/<method>` 是允许列表（`src/allowed-methods.ts`）。列表外的方法在到达 API 网关前会收到 HTTP 404。`host.describe` 保留，因为浏览器握手需要它；在 `requireWorkspace: false` 时，它返回空路径字符串且 `canOpenPath: false`。

## 模型体验

### 部署人设

#### 模型看到的内容

product-safe preset 人设是完整系统提示词（`complete: true`）。运行时上下文快照（包括工作目录）被抑制。

##### 需要时，该字段的原文

```markdown
Safe Generic Product Agent
```

#### Token 影响

每个会话一段固定的短人设字符串。

#### KV Cache 影响

在会话生命周期内前缀稳定。人设不会跨轮次变化。

### Echo 夹具工具

#### 模型看到的内容

挂载 `product-safe` preset 时，目录里只有 `product_safe_echo`（`{text}` → `{text}`）。不会列出 shell、文件系统、终端或代码执行工具。若后续收录，见生成的 [工具目录](../../../docs/tool-catalog.zh.md)；本包持有夹具描述：

##### 需要时，该字段的原文

```markdown
Echo the supplied text. Fixture tool for the product-safe profile.
```

#### Token 影响

preset 挂载期间一个工具 schema。宿主全局目录为零个工具。

#### KV Cache 影响

目录对 preset 挂载固定。它不会因为用户安装插件而增长。

## 已知限制与延后工作

- **侧栏会话列表为空** — 官方会话浏览通过 `ui-workspace` 占用 `sidebar.workspaces`。product-safe 省略该插件，因此目录选择器不会出现。New Session 与会话自动创建仍会打开无 cwd 的会话。M2 可以增加产品会话列表占用者。
- **客户端运行时仍会构造 WorkspaceRuntime** — 官方 `client-runtime` 始终提供 `ctx.workspaces`。product-safe 不挂载 workspace 或 directory-picker Host 插件；这些 RPC 返回 404。移除该运行时对象需要改写客户端全局状态（M1 停止线）。
- **`host.describe` 仍可调用** — 若它返回 404，连接握手会抛错。该方法在允许列表中，且不得泄漏宿主路径。
- **`product_safe_echo` 是夹具** — 不是 Design 工具。M2 才会引入 Design Agent preset。
