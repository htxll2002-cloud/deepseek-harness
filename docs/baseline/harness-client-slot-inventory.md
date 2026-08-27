# Harness Client Slot Inventory (M0 BEFORE)

English | [中文](harness-client-slot-inventory.zh.md)

**Commit:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
**Source:** `ctx.slots.inject` / `slots.register` in `packages/client/**/src` and `packages/extensions/ui-cordis`.
**Extension rule (unchanged):** keyed slot `tool.call.toolview` by **wire tool name**.
**Record only.**

---

## Object / slot extension model

`@deepseek-ai/dsh-client-ui-slots` is the typed slot core. Plugins call:

```text
ctx.slots.inject('<slot>', () =>
  ctx.slots.register({ name: '<slot>', key?: '<wire name>' }, Component))
```

Product image Tool Views must use `tool.call.toolview` with keys `generate_image` / `edit_image`. M0 does not add those.

---

## Shell / conversation slots

| Slot | Owner package | Role |
|---|---|---|
| `root` | ui-slots / ui-renderer | A-priori root |
| `sidebar.workspaces` | ui-workspace | Workspace list |
| `sidebar.settings` | ui-settings-general | Settings entry |
| `sidebar.brand.mark` / `sidebar.brand.name` | ui-brand-official | Official brand |
| `conversation.hero.workspace` | ui-workspace | Hero workspace |
| `conversation.hero.workspace.directoryFlow` | ui-directory-picker-* | Pick folder |
| `sidebar.workspaces.directoryFlow` | ui-directory-picker-* | Sidebar pick folder |
| `conversation.hero.brand.mark` | ui-brand-official | Official brand |
| `conversation.view` | ui-trajectory | Alternate conversation views |
| `conversation.composer` | ui-user-questions | Composer extras |
| `conversation.chat.node` | ui-conversation, ui-tool, ui-goal, ui-workflow-run | Message / node renderers |
| `conversation.details.tool` | ui-tool | Tool details |
| `conversation.input.plan` | ui-plan | Plan mode input |
| `conversation.input.model` | ui-model-selection | Model picker |
| `conversation.input.overlay` | ui-input-trigger, ui-commands | Command / mention overlay |
| `conversation.input.dock` | ui-goal, ui-conversation queue/todo | Docks |
| `conversation.input.attachments` | ui-attachment | Composer attachments |
| `conversation.message.images` | ui-attachment | Inline images |
| `conversation.chat.assistant-actions` | ui-message-feedback | Feedback actions |

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
| (generic fallback) | ui-tool unnamed `tool.call.toolview` |

Cordis dynamic UI uses a separate keyed family (`tool.view.cordis`) in `packages/extensions/ui-cordis`.

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

M1/M2 must not invent a second slot system. Add product views by registering on these names.
