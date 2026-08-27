# `@deepseek-ai/dsh-product-safe`

English | [中文](README.zh.md)

Standalone product-safe DeepSeek Harness profile. [`cordis.patch.yml`](cordis.patch.yml) is a complete insert over the empty profile root — it does not layer [`dsh-base`](../base/README.md) and then disable coding rows. Official coding packages stay in the monorepo; this profile does not load, register, route, or display them.

The bundle mounts Core / Agent Loop / Session / Conversation / Tool Protocol / streaming / Tool View / attachment infrastructure, binds the Host to `127.0.0.1`, and serves the official conversation shell. It does not mount Shell, filesystem tools, Terminal, Code Runtime, Workspace, directory picker, Skills, credentials, paid LLM adapters, model-written Extensions, or user plugin management.

`dsh --profile product-safe` (alias `dsh product-safe`) owns the same flag family as `dsh web` (`--host`, `--port`, `--trusted-host`, `--no-open`). `--host 0.0.0.0` is rejected. The ordinary startup provider publishes `webStartup`; flag-configured rows inject that service, so `dsh product-safe --help` starts no server.

Session create uses `requireWorkspace: false`. A product session exists with `cwd` unset. The profile does not invent a `/tmp` project directory.

The `product-safe` preset (shipped beside the CLI at `apps/cli/config/product-safe-presets/product-safe`) is a Safe Generic Product Agent. Its only model-facing tool is the M1 fixture `product_safe_echo`. The host-plane mock route `product-safe-mock` answers without a paid key: user text starting with `echo:` becomes that tool call; otherwise it replies with a short safe sentence.

`/api/<method>` is an allowlist (`src/allowed-methods.ts`). Methods outside the list receive HTTP 404 before the API gateway. `host.describe` stays because the browser handshake requires it; with `requireWorkspace: false` it returns empty path strings and `canOpenPath: false`.

## Model Experience

### Deployment persona

#### What the model sees

The product-safe preset persona is the complete system prompt (`complete: true`). Runtime context snapshots, including a working directory, are suppressed.

##### Verbatim text for this field, when needed

```markdown
Safe Generic Product Agent
```

#### Token effect

One short constant persona string per session.

#### KV Cache effect

Prefix-stable for the life of the session. The persona does not change across turns.

### Echo fixture tool

#### What the model sees

When the `product-safe` preset is mounted, the catalog contains only `product_safe_echo` (`{text}` → `{text}`). No shell, filesystem, terminal, or code-execution tool is listed. See the generated [tool catalog](../../../docs/tool-catalog.md) after a later harvest if this name is added there; this package owns the fixture description:

##### Verbatim text for this field, when needed

```markdown
Echo the supplied text. Fixture tool for the product-safe profile.
```

#### Token effect

One tool schema while the preset is mounted. Zero tools on the host-global catalog.

#### KV Cache effect

The catalog is fixed for the preset mount. It does not grow from user plugin install.

## Known Limitations and Deferred Work

- **Sidebar session list is empty** — official session browsing occupies `sidebar.workspaces` via `ui-workspace`. Product-safe omits that plugin so the directory picker cannot appear. New Session and conversation auto-create still open a cwd-less session. M2 can add a product session-list occupant.
- **Client runtime still constructs WorkspaceRuntime** — official `client-runtime` always provides `ctx.workspaces`. Product-safe does not mount workspace or directory-picker Host plugins; those RPCs 404. Removing the runtime object would rewrite client global state (M1 stop line).
- **`host.describe` remains callable** — the connection handshake throws if it 404s. The method is allowlisted and must not leak host paths.
- **`product_safe_echo` is a fixture** — not a Design tool. M2 introduces the Design Agent preset.
