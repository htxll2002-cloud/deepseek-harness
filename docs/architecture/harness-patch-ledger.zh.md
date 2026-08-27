# Harness Patch Ledger

[English](harness-patch-ledger.md) | 中文

**Milestone:** `M2_DESIGN_TOOL_VIEW_SPIKE`

**Foundation:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` (`dsh-v0.1.1-rc.2`)

**M0 closeout:** `405d845f5f60724f48fb7b0a883174f34a1c695d`

**M1 closeout:** `c4dc6a10866b77c42b8ad5f15f27640ce5773ee6`

用下面的命令比较产品改动：

```text
git diff stable-base...HEAD
```

`stable-base` 必须保持官方 Harness 基线。M2 工作位于 `product/m2-design-tool-view-spike`。

---

## Classification key

| Category | Meaning |
|---|---|
| CONFIGURATION | Profile 模板、CLI 别名、允许列表、`requireWorkspace` 配置 |
| NEW_BUNDLE | `@deepseek-ai/dsh-product-safe`（private 内部 workspace 包）|
| NEW_PRESET | `product-safe` |
| NEW_PRODUCT_COMPOSITION | 独立 patch + CLI preset 根覆盖 |
| NEW_TEST | Product-safe 与能力测试 |
| PRODUCT_ADAPTER | 由第一方包持有的 mock LLM / echo 夹具 / Design 图片 mock |
| UPSTREAM_CORE_PATCH | 小型宿主能力开关；不是 Agent/Session/Tool 协议 |
| UPSTREAM_UI_CORE_PATCH | 官方 UI 注入中按占用情况创建会话 |

---

## M0 documentation (already on product/main)

| file | reason | category | upstream impact | runtime behavior changed |
|---|---|---|---|---|
| `.gitignore` | 忽略隔离的 M0 `DSH_HOME` | git / test env | none | NO |
| `docs/architecture/*`, `docs/baseline/*`, `docs/research/g0-*.md` | G0/M0 研究 | docs | none | NO |

---

## M1 configuration / composition

| file | reason | category | upstream impact | runtime behavior changed |
|---|---|---|---|---|
| `packages/boot/app-boot/src/profile.ts` | `PROFILE_TEMPLATES['product-safe']` | CONFIGURATION | 官方模板增加一个名字 | YES for that profile only |
| `apps/cli/src/args.ts` | `dsh product-safe` 别名 | CONFIGURATION | CLI 帮助 | YES for that alias |
| `apps/cli/src/profile-boot.ts` | 当组合包把 `roots` 留空时使用 product-safe preset 根 | NEW_PRODUCT_COMPOSITION | 官方 web 仍使用随附 coding presets | YES for product-safe |
| `apps/cli/package.json` | 依赖新组合包 | NEW_BUNDLE | 安装图 | YES |
| `packages/bundle/product-safe/**` | 独立安全组合包、echo、mock LLM、允许列表；只绑定 `127.0.0.1`；打印 URL，不 spawn 浏览器 | NEW_BUNDLE / PRODUCT_ADAPTER | none（新包） | YES |
| `apps/cli/config/product-safe-presets/product-safe/**` | Safe Generic Product Agent | NEW_PRESET | none | YES |
| `scripts/check-workspace-constraints.ts` | echo/llm-mock/allowed-methods 的额外发布文件 | CONFIGURATION | 约束 | NO |
| `knip.json` | 组合包 workspace ignore | CONFIGURATION | knip | NO |
| `tsconfig.host.json` | Host 工程引用 | CONFIGURATION | typecheck | NO |
| `tsconfig.base.json` | product-safe 子路径导出的源平面 paths | CONFIGURATION | vitest / tsc paths | NO |

---

## M1 upstream capability seams (not protocol rewrites)

| file | reason | category | why not config/bundle/preset/plugin/adapter | runtime behavior changed |
|---|---|---|---|---|
| `packages/host/apiproxy/src/index.ts`, `src/api-proxy.ts` | `requireWorkspace`（默认 `true`）；可选 workspace/directory 注入；无 cwd 创建；在 `host.describe` 上剥离路径 | UPSTREAM_CORE_PATCH | 网关总会赋值 `process.cwd()` + `mkdir`。没有该开关，组合包无法改变这一点。Session/Agent/Tool **协议**不变（`cwd` 本来就可选）。 | YES when `requireWorkspace: false` |
| `packages/client/connection/src/index.ts` | 可选 `allowedMethods` → 在网关前返回 HTTP 404 | CONFIGURATION | 官方 web 省略该键（全部允许）。缺失时不得默认成 `[]`。 | YES when set |
| `packages/client/ui-conversation/src/client/apply.ts`, `ConversationRoot.tsx`, `contract/slots.ts` | `conversation.hero.workspace` 的占用情况驱动 composer + 无 cwd 创建；未占用的空洞不会实例化选择器或 workspace 触发 textarea | UPSTREAM_UI_CORE_PATCH | 组合包无法替换 ConversationRoot 注入。用 CSS 隐藏会留下 Host workspace API。官方 web 仍占用该 slot。 | YES when the hole is empty |
| `packages/client/ui-sidebar/src/client/index.ts` | New Session：空的 `sidebar.workspaces` → `sessions.create({})` | UPSTREAM_UI_CORE_PATCH | 全局修改 `WorkspaceRuntime.startSession` 会破坏官方首次运行（空列表 → 选择器）。占用情况才是能力信号。 | YES when the hole is empty |
| `packages/client/runtime/src/client/contract/sessions.ts`, `packages/test-support/client-runtime/src/sessions.ts` | 在 `ISessions` 上暴露已有的 `SessionRuntime.create`（无 cwd 选项） | UPSTREAM_UI_CORE_PATCH | UI 插件按 `ISessions` 取类型。该方法已存在于具体运行时；公共面没有。组合包无法拓宽该接口。 | YES for typed feature callers |

**UPSTREAM_CORE_PATCH count:** 1 项（apiproxy workspace 开关）。不是改写 `packages/core`、Agent Loop、Session 线路或 Tool calling。

**UPSTREAM_UI_CORE_PATCH count:** 3 处（conversation 占用、sidebar New Session、`ISessions.create` 面）。不是协议改写；占用情况由组合驱动。

---

## Why Bundle / Preset / Config cannot replace these patches

product-safe patch 可以省略插件、设置 `requireWorkspace: false`，并设置 `allowedMethods`。它不能改写已经在官方包内运行的 TypeScript：

| Patch | Why composition is not enough |
|---|---|
| Apiproxy `requireWorkspace` | `ensureSession` 在每次创建时赋值 `process.cwd()` 并 `mkdir`。YAML 行无法跳过该赋值。 |
| Conversation occupancy | `ConversationRoot` 是官方 composer 注入。空空洞仍会求值 `renderSlot('conversation.hero.workspace')`，并把 textarea 当作 workspace 触发器。用 CSS 隐藏会留下 Host workspace API。 |
| Sidebar New Session | 已占用的 `sidebar.workspaces` 必须继续走官方 `workspaces.startSession`。全局修改 `WorkspaceRuntime.startSession` 会破坏官方首次运行（空列表 → 选择器）。 |
| `ISessions.create` face | UI 插件按 `ISessions` 取类型。`SessionRuntime.create` 已经存在；公共面没有。组合包无法拓宽该接口。 |

`connection.allowedMethods` 是 CONFIGURATION，不是 core/UI 协议补丁：官方 web 省略该键，必须保持全部允许。

## Why these patches do not change protocols

| Protocol | Unchanged because |
|---|---|
| Agent Loop | 没有编辑 `packages/core/agent-loop` 或循环调度。 |
| Session Protocol | `SessionHeader.cwd` 本来就可选。M1 停止伪造目录；它不新增事件，也不提升 `SESSION_FORMAT_VERSION`。 |
| Tool Protocol | Echo 是普通已注册工具。没有 schema、execute 或日志信封变更。 |
| Persistence Protocol | JSONL / SQLite 提供方仍是官方实现。无 cwd 会话持久化相同的头字段，只是没有 `cwd`。 |

官方 `dsh web` 保持 `requireWorkspace: true` 以及被占用的 workspace slots，因此其创建路径仍会对 `process.cwd()` 执行 mkdir。

## Conditions that allow deleting each patch

只有在官方 Harness 落地相同能力、且 product-safe 可以只靠组合时，才删除产品线补丁。

| Patch | Removable when |
|---|---|
| Apiproxy `requireWorkspace` | 官方 `ensureSession` 在缺少 workspace/directory 服务时创建无 cwd 会话，不再赋值 `process.cwd()` 或 mkdir，并且 `host.describe` 已在该情况下剥离路径。此后 product-safe 省略该开关。 |
| Conversation occupancy | 官方 `ConversationRoot` 已把未占用的 `conversation.hero.workspace` 当作活动的无 cwd composer（不实例化选择器，也不使用 workspace 触发 textarea）。 |
| Sidebar New Session | 官方 sidebar New Session 在 `sidebar.workspaces` 未占用时已调用 `sessions.create({})`，在占用时仍调用 `workspaces.startSession`。 |
| `ISessions.create` face | 官方 `ISessions` 已发布带无 cwd 选项的 `create`。此后 product-safe 只消费该面。 |

不得通过伪造 `/tmp` cwd、用 CSS 隐藏选择器、或为每个 profile 修改 `WorkspaceRuntime.startSession` 来删除补丁。

---

## M2 第一方图片 spike（没有新增上游协议补丁）

| file | reason | category | upstream impact | runtime behavior changed |
|---|---|---|---|---|
| `packages/design/image-tools/**` | 第一方 `generate_image` / `edit_image` + mock PNG | NEW_BUNDLE | none（新 private 包） | YES when the Design preset is mounted |
| `packages/client/ui-design-image/**` | 官方 `tool.call.toolview` + `conversation.input.dock` 占用者 | NEW_BUNDLE | none（新 private 包） | YES in product-safe UI |
| `packages/bundle/product-safe/cordis.patch.yml` | 插入 `ui-design-image`；Design 人设 | NEW_PRODUCT_COMPOSITION | 官方 web 不变 | YES for product-safe |
| `apps/cli/config/product-safe-presets/product-safe/**` | 用图片工具替换 echo | NEW_PRESET | none | YES |
| `packages/bundle/product-safe/src/llm-mock.ts` | 路由 generate/edit；仅在重新挂载时走 echo | PRODUCT_ADAPTER | none | YES |
| `tsconfig.host.json`, `tsconfig.client.json`, `tsconfig.base.json` | 注册新包 | CONFIGURATION | typecheck | NO |

**UPSTREAM_CORE_PATCH count:** 仍为 1（apiproxy workspace 开关）。M2 没有增加核心协议补丁。

**UPSTREAM_UI_CORE_PATCH count:** 仍为 3。M2 占用官方 slot，不编辑 ConversationRoot。

见 [docs/m2/design-tool-view-architecture.zh.md](../m2/design-tool-view-architecture.zh.md) 与 [docs/m2/dsh-image-gen-transplant-ledger.zh.md](../m2/dsh-image-gen-transplant-ledger.zh.md)。

## M1 tests

| file | category |
|---|---|
| `packages/bundle/product-safe/tests/*` | NEW_TEST |
| `packages/host/apiproxy/tests/api-proxy-require-workspace.spec.ts` | NEW_TEST |
| `packages/client/connection/tests/node-half.host.spec.ts` (allowlist case) | NEW_TEST |
| `packages/client/ui-conversation/tests/skeleton.client.spec.tsx` (workspace-free composer) | NEW_TEST |
| `packages/client/ui-sidebar/tests/apply.client.spec.tsx` (occupancy New Session) | NEW_TEST |
| `apps/cli/tests/args.spec.ts` (`product-safe` alias) | NEW_TEST |

---

## M1 documentation

`docs/m1/*` 与本台账。文档不改变运行时行为。
