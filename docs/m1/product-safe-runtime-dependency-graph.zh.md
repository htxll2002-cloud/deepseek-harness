# Product-Safe Runtime Dependency Graph

[English](product-safe-runtime-dependency-graph.md) | 中文

区分 **monorepo 源码存在** 与 **产品运行时加载**。

官方包 `packages/shell`、`packages/fs`、`packages/terminal`、`packages/code-runtime`、`packages/extensions`、`packages/skills` 仍在磁盘上。它们不是 `@deepseek-ai/dsh-product-safe` 的依赖，也不是 `packages/bundle/product-safe/cordis.patch.yml` 中的行。

`apps/cli` 仍依赖官方 coding 包，因为 `dsh web` / 官方 presets 仍在本仓库中。那是 coding profile 的安装面，不是 product-safe profile 的加载集合。

## Direct runtime import (product-safe package)

来自 `packages/bundle/product-safe/src`：

- `@deepseek-ai/cordis`、`@deepseek-ai/schemastery`
- `@deepseek-ai/dsh-host-frontend-static`、`@deepseek-ai/dsh-host-webserver`（类型）
- `@deepseek-ai/dsh-launch-environment`、`@deepseek-ai/dsh-subprocess`（浏览器交接环境清理）
- `@deepseek-ai/dsh-cmdline`、`commander`、`open`
- `@deepseek-ai/dsh-tools`（echo）
- `@deepseek-ai/dsh-llm`（mock 适配器）
- `@deepseek-ai/dsh-invariants`（companion）

没有导入 shell、fs、terminal、code-runtime、skill 或 workspace 包。

## Transitive runtime import (Loader rows)

product-safe patch 中的每个 `name:` 都是运行时加载。KEEP 列表见 [product-safe-architecture.md](product-safe-architecture.zh.md)。它包括 session、agent、tools、apiproxy、webserver、client-runtime、conversation UI，以及 subagent **registry**（没有 spawn 工具）。

它**不**包括 `@deepseek-ai/dsh-tool-bash`、`dsh-tool-fs`、`dsh-terminal`、`dsh-code-runtime-worker-thread`、`dsh-skill`、`dsh-workspace`、directory-picker 或 plugin-inventory。

## Client bundle import

insert 列表中的 `dsh.client` 包是 `client-modules` 会扫描进 `window.__DSH_BOOT__` 的内容：

theme、locale、layout、renderer、sidebar、settings（仅外壳）、conversation、brand-official、attachment、tool、user-questions。

缺失：ui-workspace、ui-skill、ui-subagent、ui-jobs、ui-plan、ui-goal、ui-agent-preset、ui-settings-models / plugins / plugin-inventory / general、ui-cordis、ui-commands、ui-input-trigger、directory-picker UI。

## Host capability registration

| Capability | Product-safe |
|---|---|
| `ctx.tools` | Yes；preset 挂载后只有 echo |
| `ctx.workspaceRegistry` | No |
| `ctx.directoryPicker` | No |
| `ctx.credentials` | No |
| `ctx.skills` | No |
| `ctx.subagents` | 仅 registry |
| `ctx.shellEnv` | No |
| Code runtime | No |

测试辅助的 DevDependencies（`cordis-plugin-include`、`dsh-app-boot`）不是生产加载。
