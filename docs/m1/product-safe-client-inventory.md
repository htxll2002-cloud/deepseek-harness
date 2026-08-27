# Product-Safe Client Inventory

English | [中文](product-safe-client-inventory.zh.md)

**BEFORE:** [docs/baseline/harness-client-slot-inventory.md](../baseline/harness-client-slot-inventory.md)
**AFTER:** product-safe patch client roster

Absence is **row omission**, not `display:none` / `hidden=true`.

## PRESERVED

| Surface | Row | Notes |
|---|---|---|
| Conversation shell | `ui-conversation` | Composer live when `conversation.hero.workspace` is unoccupied |
| Sidebar chrome | `ui-sidebar` | New Session uses occupancy; empty holes → `sessions.create({})` |
| Layout / renderer | `ui-layout`, `ui-renderer` | Official frame |
| Streaming / mux | `connection`, `client-runtime` | Handshake still calls `host.describe` |
| Tool View infrastructure | `ui-tool` | Generic cards; echo uses `card: 'generic'` |
| Attachment infrastructure | `ui-attachment` | No local directory browser |
| Settings shell | `ui-settings` | No models / plugins / general / secrets pages |
| Theme / locale | `ui-theme`, `locale` | Inject `settingsScope` |
| Official brand occupants | `ui-brand-official` | Not a product rebrand |

## ABSENT (were M0 default Web)

| Surface | M0 owner | Product-safe |
|---|---|---|
| Workspace picker / session list | `ui-workspace` | Absent. Sidebar list empty (known gap) |
| Directory picker | `ui-directory-picker-*` | Absent |
| Terminal / code panel | terminal + code-runtime UI | Never mounted |
| Coding preset selector | `ui-agent-preset` | Absent |
| Plugin install / inventory | `ui-settings-plugins`, `ui-settings-plugin-inventory` | Absent |
| Local secret / models onboarding | `ui-settings-models`, `ui-settings-general` | Absent |
| Skills / jobs / plan / goal / cordis UI | matching `ui-*` | Absent |
| Command / mention overlay | `ui-input-trigger`, `ui-commands` | Absent |

## Occupancy as capability signal

`ConversationRoot` treats an unoccupied `conversation.hero.workspace` as “no coding workspace chip”. The composer is live; it does not wait for a directory. Official web still occupies that slot, so its first-run picker is unchanged.

## Client capability caveat

`client-runtime` still provides `ctx.workspaces`. That object is official core, not a composed coding UI. Host workspace/directory methods 404. See [product-safe-architecture.md](product-safe-architecture.md).
