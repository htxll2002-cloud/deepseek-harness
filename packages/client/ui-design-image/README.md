# `@deepseek-ai/dsh-client-ui-design-image`

English | [中文](README.zh.md)

Browser half of the product-safe Design image spike. The package name is inherited for monorepo compatibility. The manifest is `private: true` and must not be published or represented as an official DeepSeek package.

The plugin occupies the official `tool.call.toolview` hole with keys `generate_image` and `edit_image`, and occupies `conversation.input.dock` with a Continue Editing chip. Cards read completed images from the durable tool result and resolve bytes through `session.readAttachment`. There is no IndexedDB gallery, provider settings page, API key field, or workspace save.

Selection and the current editing source live in a session-scoped, non-persisted store. Refresh restores the image cards from the session tool result; it does not restore which variant was selected.

## Model Experience

None, as this package renders generate_image and edit_image Tool Views and the Continue Editing chip without altering model requests, Tool execution, or session events.

#### KV Cache effect

None. The package is client-only presentation.

## Known Limitations and Deferred Work

- **Selection is spike state** — the selected / editing attachment id is UI-local and is not a product artifact working state.
- **No durable job UI** — long-running provider jobs belong to M4.
- **No gallery** — product asset truth belongs to a later store, not a client IndexedDB.
