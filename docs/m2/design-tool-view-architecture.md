# M2 Design Tool View Architecture

English | [中文](design-tool-view-architecture.zh.md)

**Milestone:** `M2_DESIGN_TOOL_VIEW_SPIKE`

This spike proves the official Harness Tool Registry, Tool Call, Session, Conversation, Attachment, Tool Result, Tool View, and Client Slot chain can carry an AI image product loop without changing core protocols.

## Vertical slice

```text
Product-Safe Harness
  → generate_image / edit_image
  → deterministic mock PNG
  → ctx.attachments.saveImage
  → Tool Result + presentation meta
  → Session JSONL
  → tool.call.toolview
  → image card (1–4 variants)
  → Select / Continue Editing
  → [source:<attachmentId>] in composer
  → edit_image(source_attachment_id, instruction)
  → new Attachment
```

`generate_image` accepts `{ prompt, count?, aspect_ratio? }`. One tool call returns 1–4 unique attachment ids. `edit_image` requires an explicit `source_attachment_id` and never infers the newest conversation image.

The mock encoder writes labeled PNG bytes. Same prompt, aspect ratio, and variant index produce the same digest id through the official local attachment store. A prompt containing `[M2_FAIL]` returns a structured tool error.

## Slots and replay

`@deepseek-ai/dsh-client-ui-design-image` registers `generate_image` and `edit_image` on `tool.call.toolview` and a Continue Editing chip on `conversation.input.dock`. Cards rebuild from the durable `ToolCallBlock`. Bytes load through `session.attachment` (`session.readAttachment`). There is no second renderer and no new Host file-read route.

## Spike-only state

Current source / selection state is **SPIKE ONLY**. It lives in a session-scoped, non-persisted store and in the composer `[source:<attachmentId>]` token. It is not product artifact truth.

External durable job: **NOT IMPLEMENTED**.

Artifact DAG: **NOT IMPLEMENTED**.

Gallery, provider settings, API keys, workspace save, IndexedDB, real providers, upload product flow, credits, and canvas are out of scope.

## Packages

| Package | Role |
|---|---|
| `@deepseek-ai/dsh-image-tools` | Host tools + mock generator. `private: true`. Mounted from the product-safe preset. |
| `@deepseek-ai/dsh-client-ui-design-image` | Tool Views + editing chip. `private: true`. Occupies official slots. |
| `@deepseek-ai/dsh-product-safe` | Composition + keyless mock LLM routing. Not a growing business bag. |

Workspace names stay on `@deepseek-ai/dsh-*` because the monorepo constraint requires that prefix. Both new packages are private and are not official DeepSeek publish targets.
