# `@deepseek-ai/dsh-product-safe`

English | [中文](README.zh.md)

Standalone product-safe DeepSeek Harness profile. [`cordis.patch.yml`](cordis.patch.yml) is a complete insert over the empty profile root — it does not layer [`dsh-base`](../base/README.md) and then disable coding rows. Official coding packages stay in the monorepo; this profile does not load, register, route, or display them.

`@deepseek-ai/dsh-product-safe` is an internal workspace package name inherited for monorepo compatibility during early development. It is private and must never be published or represented as an official DeepSeek package. Product naming and package namespace will be revisited during branding.

The bundle mounts Core / Agent Loop / Session / Conversation / Tool Protocol / streaming / Tool View / attachment infrastructure, binds the Host to `127.0.0.1` only, and serves the official conversation shell. It does not mount Shell, filesystem tools, Terminal, Code Runtime, Workspace, directory picker, Skills, credentials, paid LLM adapters, model-written Extensions, or user plugin management.

`dsh --profile product-safe` (alias `dsh product-safe`) accepts `--host`, `--port`, and `--trusted-host`. The only allowed `--host` is `127.0.0.1` (omitted means that literal). Startup prints the URL and does not open a browser. The ordinary startup provider publishes `webStartup`; flag-configured rows inject that service, so `dsh product-safe --help` starts no server.

Session create uses `requireWorkspace: false`. A product session exists with `cwd` unset. The profile does not invent a `/tmp` project directory.

The `product-safe` preset (shipped beside the CLI at `apps/cli/config/product-safe-presets/product-safe`) is a Design Image Spike Agent. Its model-facing tools are `generate_image` and `edit_image` from `@deepseek-ai/dsh-image-tools`. The host-plane mock route `product-safe-mock` answers without a paid key: generate/edit requests become those tool calls; otherwise it replies with a short design-spike sentence. The M1 fixture `product_safe_echo` remains remountable for tests and is not in this preset.

`/api/<method>` is an allowlist (`src/allowed-methods.ts`). Methods outside the list receive HTTP 404 before the API gateway. `host.describe` stays because the browser handshake requires it; with `requireWorkspace: false` it returns empty path strings and `canOpenPath: false`.

## Model Experience

### Deployment persona

#### What the model sees

The product-safe preset persona is the complete system prompt (`complete: true`). Runtime context snapshots, including a working directory, are suppressed.

##### Verbatim text for this field, when needed

```markdown
Design Image Spike Agent. Use generate_image to create images and edit_image with an explicit source_attachment_id to edit a selected image. Do not choose a provider.
```

#### Token effect

One short constant persona string per session.

#### KV Cache effect

Prefix-stable for the life of the session. The persona does not change across turns.

### Design image tools

#### What the model sees

When the `product-safe` preset is mounted, the catalog contains `generate_image` and `edit_image`. No shell, filesystem, terminal, or code-execution tool is listed. [`@deepseek-ai/dsh-image-tools`](../../design/image-tools/README.md) owns the verbatim tool descriptions.

#### Token effect

Two tool schemas while the preset is mounted. Zero tools on the host-global catalog.

#### KV Cache effect

The catalog is fixed for the preset mount. It does not grow from user plugin install.

## Known Limitations and Deferred Work

- **Sidebar session list is empty** — official session browsing occupies `sidebar.workspaces` via `ui-workspace`. Product-safe omits that plugin so the directory picker cannot appear. New Session and conversation auto-create still open a cwd-less session. M2 can add a product session-list occupant.
- **Client runtime still constructs WorkspaceRuntime** — official `client-runtime` always provides `ctx.workspaces`. Product-safe does not mount workspace or directory-picker Host plugins; those RPCs 404. Removing the runtime object would rewrite client global state (M1 stop line).
- **`host.describe` remains callable** — the connection handshake throws if it 404s. The method is allowlisted and must not leak host paths.
- **`product_safe_echo` is a remountable fixture** — it is not in the Design preset catalog.
- **Selection is spike state** — Continue Editing writes `[source:<attachmentId>]`. That choice is not a product artifact working state.
