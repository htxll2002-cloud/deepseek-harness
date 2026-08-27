# Product-Safe Runtime Dependency Graph

English | [中文](product-safe-runtime-dependency-graph.zh.md)

Distinguish **monorepo source presence** from **product runtime load**.

Official packages `packages/shell`, `packages/fs`, `packages/terminal`, `packages/code-runtime`, `packages/extensions`, `packages/skills` remain on disk. They are not dependencies of `@deepseek-ai/dsh-product-safe` and are not rows in `packages/bundle/product-safe/cordis.patch.yml`.

`apps/cli` still depends on official coding packages because `dsh web` / official presets remain in this repository. That is installation surface for the coding profile, not the product-safe profile's load set.

## Direct runtime import (product-safe package)

From `packages/bundle/product-safe/src`:

- `@deepseek-ai/cordis`, `@deepseek-ai/schemastery`
- `@deepseek-ai/dsh-host-frontend-static`, `@deepseek-ai/dsh-host-webserver` (types)
- `@deepseek-ai/dsh-launch-environment`, `@deepseek-ai/dsh-subprocess` (browser handoff env scrub)
- `@deepseek-ai/dsh-cmdline`, `commander`, `open`
- `@deepseek-ai/dsh-tools` (echo)
- `@deepseek-ai/dsh-llm` (mock adapter)
- `@deepseek-ai/dsh-invariants` (companion)

No import of shell, fs, terminal, code-runtime, skill, or workspace packages.

## Transitive runtime import (Loader rows)

Every `name:` in the product-safe patch is a runtime load. KEEP list is in [product-safe-architecture.md](product-safe-architecture.md). It includes session, agent, tools, apiproxy, webserver, client-runtime, conversation UI, and the subagent **registry** (no spawn tools).

It does **not** include `@deepseek-ai/dsh-tool-bash`, `dsh-tool-fs`, `dsh-terminal`, `dsh-code-runtime-worker-thread`, `dsh-skill`, `dsh-workspace`, directory-picker, or plugin-inventory.

## Client bundle import

`dsh.client` packages in the insert list are what `client-modules` would scan into `window.__DSH_BOOT__`:

theme, locale, layout, renderer, sidebar, settings (shell only), conversation, brand-official, attachment, tool, user-questions.

Absent: ui-workspace, ui-skill, ui-subagent, ui-jobs, ui-plan, ui-goal, ui-agent-preset, ui-settings-models / plugins / plugin-inventory / general, ui-cordis, ui-commands, ui-input-trigger, directory-picker UI.

## Host capability registration

| Capability | Product-safe |
|---|---|
| `ctx.tools` | Yes; echo only after preset mount |
| `ctx.workspaceRegistry` | No |
| `ctx.directoryPicker` | No |
| `ctx.credentials` | No |
| `ctx.skills` | No |
| `ctx.subagents` | Registry only |
| `ctx.shellEnv` | No |
| Code runtime | No |

DevDependencies on test helpers (`cordis-plugin-include`, `dsh-app-boot`) are not production loads.
