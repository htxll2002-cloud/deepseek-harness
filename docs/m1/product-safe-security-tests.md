# Product-Safe Security Tests

English | [中文](product-safe-security-tests.zh.md)

All M1 security tests are keyless. They boot `@deepseek-ai/dsh-product-safe` over a temp `$DSH_HOME` and a fake frontend dist. They do not call OpenAI, Gemini, DeepSeek, Seedream, DashScope, or a relay.

## Suites

| File | Asserts |
|---|---|
| `packages/bundle/product-safe/tests/composition.spec.ts` | Patch has no forbidden row ids; package.json has no coding deps; allowlist matches `PRODUCT_SAFE_ALLOWED_METHODS`; `requireWorkspace: false` |
| `packages/bundle/product-safe/tests/client-coding-ui.spec.ts` | Coding `ui-*` rows absent; conversation / sidebar / tool / streaming rows present |
| `packages/bundle/product-safe/tests/product-safe-tool-deny.spec.ts` | Hostile `tools.execute` for M0 wire names and aliases → unregistered / `UNKNOWN_TOOL` on host and after session compose; echo present only after compose |
| `packages/bundle/product-safe/tests/product-safe-host-deny.spec.ts` | HTTP POST of workspace / directory / plugin / credentials / settings-mutate / skill / goal / subagent / discoverModels → **404**; `session.list` and stripped `host.describe` succeed |
| `packages/bundle/product-safe/tests/workspace-free-session.spec.ts` | `session.create` with no directory; `header.cwd` undefined; prompt persists under temp JSONL |
| `packages/bundle/product-safe/tests/static-plugin.spec.ts` | `product_safe_echo` executes; mock LLM `echo:` path emits the tool call; `plugin.install` 404; registry does not grow |
| `packages/bundle/product-safe/tests/startup.spec.ts` | `--host 0.0.0.0` does not publish `webStartup` |
| `packages/bundle/product-safe/tests/bind-host.spec.ts` | `assertProductSafeBindHost` accepts only `127.0.0.1`; rejected hosts do not publish `webStartup`; live server listens on `127.0.0.1` only; all-interfaces bind is not adopted |
| `packages/bundle/product-safe/tests/runtime.spec.ts` | URL print only; no LAN sample; no browser spawn |

Upstream capability tests:

| File | Asserts |
|---|---|
| `packages/host/apiproxy/tests/api-proxy-require-workspace.spec.ts` | Cwd-less create; path-stripped `host.describe`; workspace/directory deny when services absent |
| `packages/client/connection/tests/node-half.host.spec.ts` | Allowlist 404s before the gateway |
| `packages/client/ui-conversation/tests/skeleton.client.spec.tsx` | Unoccupied workspace hole → live composer + workspace-free create |
| `packages/client/ui-sidebar/tests/apply.client.spec.tsx` | Empty holes → `sessions.create({})`; occupied holes → official `workspaces.startSession` |

## What security does not depend on

System prompt text such as “Please do not use shell”. The dangerous tools are not registered.

## Host test overlay

Loader tests disable the `modules` row so `pnpm test` does not require a prior client-bundle build. Production product-safe still mounts `modules`. `composition.spec.ts` asserts the production patch contains the `modules` row and does not name coding client packages (`ui-workspace`, `ui-skill`, `ui-cordis`, `ui-settings-plugins`, directory pickers, and the rest of `FORBIDDEN_CLIENT_MODULE_PACKAGES`). That is the same insert list `modules` would scan. This test does not boot `client.js`.
