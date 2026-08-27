# dsh-image-gen Donor Reuse Ledger

English | [中文](dsh-image-gen-transplant-ledger.zh.md)

**SOURCE_DONOR:** `shanliuling/dsh-image-gen` @ `629a44c17922e7241546931c872dd8f0447e7cce`

This is selective transplant, not whole-plugin adoption. The donor was not installed (`dsh plugin add` / npm install / copy of the plugin tree).

| Donor file | Donor function / component | Decision | Notes |
|---|---|---|---|
| `src/index.ts` | `generate_image` / `edit_image` `defineTool` wiring | ADAPTED | Kept tool names and attachment-backed results. Rewrote schemas for 1–4 variants, dropped provider/model/size/endpoint. Copied no provider execute bodies. |
| `src/index.ts` | `saveGenerated` + `ctx.attachments.saveImage` | ADAPTED | Mock PNG → official `saveImage`. Tool result references `ImageAttachmentRef`, never a data URL. |
| `src/index.ts` | Settings / `installSettingsSection` / credentials | REJECTED | No BYOK, no Settings → Image Generation. |
| `src/index.ts` | `IMAGE_ROUTE` + `ctx.webServer.register` | REJECTED | Images load through allowlisted `session.attachment`. |
| `src/client/index.tsx` | `tool.call.toolview` keyed registration | ADAPTED | Same official slot and keys. Shared `DesignImageToolView` for both tools. |
| `src/client/index.tsx` | `GeneratedImageCard` | ADAPTED | Rewrote as a 1–4 grid with loading / completed / error, preview, download, Select, Continue Editing. No copy/delete/gallery/retry-billing. |
| `src/client/index.tsx` | Settings card | REJECTED | Provider Settings = 0. API Key UI = 0. Endpoint UI = 0. |
| `src/client/gallery-store.ts` | IndexedDB gallery auto-save | REJECTED | Product asset truth is not a client database. |
| `src/client/gallery-view.tsx` | Gallery tab | REJECTED | Gallery waits for the product artifact store. |
| `src/workspace-save.ts` | Save to workspace | REJECTED | Product-safe has no workspace. |
| `src/google.ts` / `openai-compatible.ts` / `seedream.ts` / `dashscope.ts` | Provider adapters | REJECTED | Real provider calls = 0. |
| `src/config.ts` | Provider / endpoint / model config | REJECTED | Those fields are not model-control parameters. |
| `src/image-route.ts` | Unauthenticated image HTTP route | REJECTED | Would accept path-like reads. Official attachment RPC is enough. |
| `src/reference-image.ts` | Newest-conversation-image fallback | REJECTED | M2 requires explicit `source_attachment_id`. |
| `src/shared.ts` | Shared constants / IMAGE_ROUTE | REFERENCE_ONLY | Used to list what not to copy. |
| `tests/index.spec.ts` | Tool registration tests | REFERENCE_ONLY | Informed generate/edit unit specs; not copied. |

## Copied lines / rewritten areas

No donor file was copied wholesale. The adapted areas are:

- Tool names `generate_image` and `edit_image`.
- Official `defineTool` + image `ContentBlock` attachment shape.
- Official `tool.call.toolview` keyed occupancy.
- Card states: generating, loading, error, download, preview.

Rewritten:

- Multi-variant result `{ images: [{ attachment, variant_index }] }`.
- Deterministic mock PNG encoder (`packages/design/image-tools/src/mock-png.ts`).
- Explicit source lookup (`findExplicitImageAttachment`).
- Composer `[source:<attachmentId>]` token instead of implicit last-image edit.
- Session-local selection store with no persist key.
