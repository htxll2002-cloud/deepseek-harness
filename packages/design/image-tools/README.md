# `@deepseek-ai/dsh-image-tools`

English | [中文](README.zh.md)

First-party `generate_image` and `edit_image` tools for the product-safe Design spike. The package name is inherited for monorepo compatibility. The manifest is `private: true` and must not be published or represented as an official DeepSeek package.

Mount the plugin from a preset so the tools stay off the host-global catalog. The bodies call a deterministic mock PNG generator and persist each variant through the official `ctx.attachments.saveImage` seam. There is no provider, API key, endpoint, workspace save, or gallery.

`generate_image` accepts `{ prompt, count?, aspect_ratio? }`. `count` defaults to 2 and must be 1–4. `aspect_ratio` defaults to `1:1` and must be one of `1:1`, `4:3`, `3:4`, `16:9`, `9:16`. One tool call returns 1–4 unique attachment ids.

`edit_image` accepts `{ source_attachment_id, instruction, count? }`. `source_attachment_id` is required and must already appear as an image attachment in the current session. The tool never infers the newest conversation image.

A prompt or instruction that contains `[M2_FAIL]` returns a structured tool error. Mock work waits 80 ms so the Tool View can show a loading state.

## Model Experience

### generate_image tool

#### What the model sees

The product-safe Design preset catalogs `generate_image` with `{ prompt, count?, aspect_ratio? }`. See the generated [tool catalog](../../../docs/tool-catalog.md) after harvest; this package owns the description:

##### Verbatim text for this field, when needed

```markdown
Generate 1-4 new images from a prompt. Use when the user asks to create, draw, or generate images. Do not choose a provider or model. count defaults to 2. aspect_ratio defaults to 1:1. Allowed aspect ratios: 1:1, 4:3, 3:4, 16:9, 9:16.
```

#### Token effect

One tool schema while the preset is mounted. Zero tools on the host-global catalog.

#### KV Cache effect

The catalog is fixed for the preset mount. It does not grow from user plugin install.

### edit_image tool

#### What the model sees

The same preset catalogs `edit_image` with `{ source_attachment_id, instruction, count? }`. This package owns the description:

##### Verbatim text for this field, when needed

```markdown
Edit one already-selected image. source_attachment_id is required and must be the exact attachment the user selected. Never infer the newest conversation image. instruction describes the change. count defaults to 1.
```

#### Token effect

One tool schema while the preset is mounted. Zero tools on the host-global catalog.

#### KV Cache effect

The catalog is fixed for the preset mount. It does not grow from user plugin install.

## Known Limitations and Deferred Work

- **Mock generator only** — no paid provider, durable job, or artifact DAG. M4 owns real generation.
- **Selection is not product truth** — Continue Editing writes an explicit `[source:<attachmentId>]` token. Session-local UI selection is a spike, not a PostgreSQL working state.
- **SVG fixtures are not used** — official `ImageMediaType` admits PNG/JPEG/WebP/GIF only, so the mock encodes PNG bytes.
