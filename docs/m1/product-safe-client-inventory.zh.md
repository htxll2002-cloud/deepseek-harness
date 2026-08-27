# Product-Safe Client Inventory

[English](product-safe-client-inventory.md) | 中文

**BEFORE:** [docs/baseline/harness-client-slot-inventory.md](../baseline/harness-client-slot-inventory.zh.md)
**AFTER:** product-safe patch 客户端名录

缺失是**行省略**，不是 `display:none` / `hidden=true`。

## PRESERVED

| Surface | Row | Notes |
|---|---|---|
| Conversation shell | `ui-conversation` | 当 `conversation.hero.workspace` 未占用时 composer 可用 |
| Sidebar chrome | `ui-sidebar` | New Session 使用占用情况；空空洞 → `sessions.create({})` |
| Layout / renderer | `ui-layout`, `ui-renderer` | 官方框架 |
| Streaming / mux | `connection`, `client-runtime` | 握手仍调用 `host.describe` |
| Tool View infrastructure | `ui-tool` | Generic cards；echo 使用 `card: 'generic'` |
| Attachment infrastructure | `ui-attachment` | 没有本地目录浏览器 |
| Settings shell | `ui-settings` | 没有 models / plugins / general / secrets 页面 |
| Theme / locale | `ui-theme`, `locale` | 注入 `settingsScope` |
| Official brand occupants | `ui-brand-official` | 不是产品换肤 |

## ABSENT (were M0 default Web)

| Surface | M0 owner | Product-safe |
|---|---|---|
| Workspace picker / session list | `ui-workspace` | 缺失。侧栏列表为空（已知缺口） |
| Directory picker | `ui-directory-picker-*` | 缺失 |
| Terminal / code panel | terminal + code-runtime UI | 从未挂载 |
| Coding preset selector | `ui-agent-preset` | 缺失 |
| Plugin install / inventory | `ui-settings-plugins`, `ui-settings-plugin-inventory` | 缺失 |
| Local secret / models onboarding | `ui-settings-models`, `ui-settings-general` | 缺失 |
| Skills / jobs / plan / goal / cordis UI | matching `ui-*` | 缺失 |
| Command / mention overlay | `ui-input-trigger`, `ui-commands` | 缺失 |

## Occupancy as capability signal

`ConversationRoot` 把未占用的 `conversation.hero.workspace` 当作“没有 coding workspace 芯片”。composer 是活动的；它不等待目录。官方 web 仍占用该 slot，因此其首次运行选择器不变。

## Client capability caveat

`client-runtime` 仍提供 `ctx.workspaces`。该对象是官方核心，不是组合出来的 coding UI。Host workspace/directory 方法返回 404。见 [product-safe-architecture.md](product-safe-architecture.zh.md)。
