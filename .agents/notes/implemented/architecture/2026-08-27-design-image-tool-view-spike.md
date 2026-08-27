# Agent Note: Design image Tool View spike

Status: implemented

English | [中文](2026-08-27-design-image-tool-view-spike.zh.md)

## Problem

M1 proved a product-safe Harness can boot without coding capabilities. It did not prove that official Tool Call, Attachment, Tool Result, and `tool.call.toolview` can carry the AI image loop: generate 1–4 variants, select one, continue editing with an explicit source, and replay the completed cards after refresh.

Copying `dsh-image-gen` whole would import BYOK settings, an unauthenticated image route, IndexedDB gallery, workspace save, and provider adapters. Those fight the later product control plane and the M1 security boundary.

## Decision

M2 adds two private first-party packages instead of growing `@deepseek-ai/dsh-product-safe` into a business bag.

`@deepseek-ai/dsh-image-tools` mounts `generate_image` and `edit_image` from the product-safe preset. The bodies call a deterministic mock PNG encoder and persist variants through `ctx.attachments.saveImage`. `edit_image` looks up the caller-supplied `source_attachment_id` in the current session and refuses a missing source. The catalog never names a provider tool.

`@deepseek-ai/dsh-client-ui-design-image` occupies `tool.call.toolview` with those two keys and occupies `conversation.input.dock` with a Continue Editing chip. Continue Editing writes `[source:<attachmentId>]` into the composer draft. The mock LLM parses that token. Selection lives in a session-scoped store with no persist key.

Images load through the existing `session.attachment` RPC. There is no new Host route. There is no IndexedDB gallery, provider settings UI, or workspace save.

Workspace package names stay `@deepseek-ai/dsh-*` because the monorepo constraint requires that prefix. Both packages are `private: true` and are not official DeepSeek publish targets.

## Testing

Host unit specs cover count/aspect/prompt validation, `[M2_FAIL]`, unique attachment ids, and explicit source lookup. Client specs cover keyed Tool View registration, variant-2 Continue Editing, and durable-block replay. Product-safe REAL composition specs cover the generate → select → edit session chain, `session.history` + `session.attachment` reload, and the M1 security boundary.

## Alternatives considered

**Put image tools inside `@deepseek-ai/dsh-product-safe`.** Rejected: M2 must not turn the safety bundle into a growing business package.

**Copy `dsh-image-gen` as a plugin.** Rejected: settings, gallery, IMAGE_ROUTE, and provider adapters are out of scope and unsafe for this profile.

**Infer the last conversation image for edit.** Rejected: Continue Editing must carry `source_attachment_id` from day one.

**Change ConversationRoot or Tool Protocol.** Rejected: official slots already accept a keyed Tool View and a dock chip.

## Consequences

Selection is spike state until M3/M5 introduce artifact working state. Real providers and durable jobs wait for M4.
