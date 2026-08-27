# Product-Safe Security Tests

[English](product-safe-security-tests.md) | 中文

所有 M1 安全测试都无需密钥。它们在临时 `$DSH_HOME` 和假 frontend dist 上启动 `@deepseek-ai/dsh-product-safe`。它们不调用 OpenAI、Gemini、DeepSeek、Seedream、DashScope 或中继。

## Suites

| File | Asserts |
|---|---|
| `packages/bundle/product-safe/tests/composition.spec.ts` | Patch 没有禁止的行 id；package.json 没有 coding 依赖；允许列表匹配 `PRODUCT_SAFE_ALLOWED_METHODS`；`requireWorkspace: false` |
| `packages/bundle/product-safe/tests/client-coding-ui.spec.ts` | Coding `ui-*` 行缺失；conversation / sidebar / tool / streaming 行存在 |
| `packages/bundle/product-safe/tests/product-safe-tool-deny.spec.ts` | 对 M0 线路名与别名的敌意 `tools.execute` → 在 host 上以及会话组合后未注册 / `UNKNOWN_TOOL`；echo 仅在组合后出现 |
| `packages/bundle/product-safe/tests/product-safe-host-deny.spec.ts` | 对 workspace / directory / plugin / credentials / settings-mutate / skill / goal / subagent / discoverModels 的 HTTP POST → **404**；`session.list` 与剥离路径的 `host.describe` 成功 |
| `packages/bundle/product-safe/tests/workspace-free-session.spec.ts` | 没有目录的 `session.create`；`header.cwd` 为 undefined；prompt 持久化到临时 JSONL |
| `packages/bundle/product-safe/tests/static-plugin.spec.ts` | `product_safe_echo` 执行；mock LLM 的 `echo:` 路径发出该工具调用；`plugin.install` 为 404；注册表不增长 |
| `packages/bundle/product-safe/tests/startup.spec.ts` | `--host 0.0.0.0` 不发布 `webStartup` |
| `packages/bundle/product-safe/tests/bind-host.spec.ts` | `assertProductSafeBindHost` 只接受 `127.0.0.1`；被拒绝的 host 不发布 `webStartup`；活动服务器只监听 `127.0.0.1`；不接纳 all-interfaces 绑定 |
| `packages/bundle/product-safe/tests/runtime.spec.ts` | 只打印 URL；不采样 LAN；不 spawn 浏览器 |

上游能力测试：

| File | Asserts |
|---|---|
| `packages/host/apiproxy/tests/api-proxy-require-workspace.spec.ts` | 无 cwd 创建；剥离路径的 `host.describe`；缺少服务时拒绝 workspace/directory |
| `packages/client/connection/tests/node-half.host.spec.ts` | 允许列表在网关前返回 404 |
| `packages/client/ui-conversation/tests/skeleton.client.spec.tsx` | 未占用的 workspace 空洞 → 活动 composer + 无 workspace 创建 |
| `packages/client/ui-sidebar/tests/apply.client.spec.tsx` | 空空洞 → `sessions.create({})`；已占用空洞 → 官方 `workspaces.startSession` |

## What security does not depend on

诸如 “Please do not use shell” 的系统提示词文本。危险工具并未注册。

## Host test overlay

Loader 测试禁用 `modules` 行，因此 `pnpm test` 不需要事先构建 client-bundle。生产 product-safe 仍挂载 `modules`。`composition.spec.ts` 断言生产 patch 包含 `modules` 行，并且不点名 coding 客户端包（`ui-workspace`、`ui-skill`、`ui-cordis`、`ui-settings-plugins`、目录选择器，以及 `FORBIDDEN_CLIENT_MODULE_PACKAGES` 的其余项）。那就是 `modules` 会扫描的同一 insert 列表。该测试不启动 `client.js`。
