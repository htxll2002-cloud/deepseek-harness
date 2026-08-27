# Harness Client Slot Inventory (M0 BEFORE)

[English](harness-client-slot-inventory.md) | 中文

**Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Source:** `packages/client/**/src` 与 `packages/extensions/ui-cordis` 中的 `ctx.slots.inject` / `slots.register`。
**Extension rule (unchanged):** 按 **线路工具名** 键控 slot `tool.call.toolview`。
**Record only.**

---

## Object / slot extension model

`@deepseek-ai/dsh-client-ui-slots` 是带类型的 slot 核心。插件调用：

```text
ctx.slots.inject('<slot>', () =>
  ctx.slots.register({ name: '<slot>', key?: '<wire name>' }, Component))
```

产品图像 Tool Views 必须使用 `tool.call.toolview`，键为 `generate_image` / `edit_image`。M0 不添加它们。

---

## Shell / conversation slots

| Slot | Owner package | Role |
|---|---|---|
| `root` | ui-slots / ui-renderer | 先验根 |
| `sidebar.workspaces` | ui-workspace | Workspace 列表 |
| `sidebar.settings` | ui-settings-general | Settings 入口 |
| `sidebar.brand.mark` / `sidebar.brand.name` | ui-brand-official | 官方品牌 |
| `conversation.hero.workspace` | ui-workspace | Hero workspace |
| `conversation.hero.workspace.directoryFlow` | ui-directory-picker-* | 选择文件夹 |
| `sidebar.workspaces.directoryFlow` | ui-directory-picker-* | 侧栏选择文件夹 |
| `conversation.hero.brand.mark` | ui-brand-official | 官方品牌 |
| `conversation.view` | ui-trajectory | 备用会话视图 |
| `conversation.composer` | ui-user-questions | Composer 附加内容 |
| `conversation.chat.node` | ui-conversation, ui-tool, ui-goal, ui-workflow-run | Message / node 渲染器 |
| `conversation.details.tool` | ui-tool | 工具详情 |
| `conversation.input.plan` | ui-plan | Plan mode 输入 |
| `conversation.input.model` | ui-model-selection | 模型选择器 |
| `conversation.input.overlay` | ui-input-trigger, ui-commands | Command / mention overlay |
| `conversation.input.dock` | ui-goal, ui-conversation queue/todo | Docks |
| `conversation.input.attachments` | ui-attachment | Composer 附件 |
| `conversation.message.images` | ui-attachment | 行内图片 |
| `conversation.chat.assistant-actions` | ui-message-feedback | 反馈操作 |

---

## Tool View keys (`tool.call.toolview`)

| Key | Owner |
|---|---|
| `bash` | ui-tool `bash-sample.tsx` |
| `web_search` / `web_fetch` | ui-tool `web-row.tsx` |
| `todo_write` | ui-tool `todo-row.tsx` |
| `grep` / `glob` | ui-tool `search-row.tsx` |
| `read` | ui-tool `read-row.tsx` |
| `edit` / `write` | ui-tool `file-mutation-row.tsx` |
| `ask_user_question` | ui-tool `ask-question-row.tsx` |
| `skill` | ui-skill |
| (generic fallback) | ui-tool 未命名的 `tool.call.toolview` |

Cordis 动态 UI 在 `packages/extensions/ui-cordis` 中使用另一套键控族（`tool.view.cordis`）。

---

## Settings slots

| Slot | Owner |
|---|---|
| `settings.section` | ui-settings-general, ui-settings-models, ui-settings-plugins, ui-agent-preset |
| `settings.general.item` | ui-theme, ui-permission-presets, ui-conversation, ui-agent-preset, locale |
| `settings.plugins.tab` | ui-settings-plugins, ui-settings-plugin-inventory |
| `settings.plugin.item` | ui-settings-plugins |
| `settings.onboarding` | ui-settings-models |
| `settings.trigger` / `settings.header` / `settings.action` / `settings.close` | ui-settings-general |

M1/M2 不得发明第二套 slot 系统。通过在这些名字上注册来添加产品视图。
