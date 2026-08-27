# M0 Baseline Run

**Date:** 2026-08-27
**Tree:** `/Users/hetongxin/Downloads/deep-harness`
**HEAD:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` (`dsh-v0.1.1-rc.2`)
**Environment (owner decision):** macOS `darwin-arm64`. No Linux. No Docker.
**Commands taken from:** root `package.json` and `.github/workflows/ci.yml` (`pnpm install --frozen-lockfile`, `DSH_TELEMETRY_DISABLED=1`).
**Node:** `v22.22.1` (satisfies `engines.node`: `^22.19.0 || >=24.0.0`)
**pnpm:** `11.7.0` (matches `packageManager`)
**Used `@latest`:** NO
**Real paid provider calls:** 0
**Harness runtime source edited:** 0

Official CI primary Node is 24 on Linux. That was not run.

---

## Commands

| Command | Exit | Real time | Result |
|---|---|---|---|
| `pnpm install --frozen-lockfile` | 0 | 253.59s | PASS. Landlock linux optional packages unsupported on darwin (expected). Claude/Codex darwin optional tarballs retried/failed to download. Example bins ENOENT until build. |
| `pnpm typecheck` | 0 | 54.28s | PASS (`build:lib:host` + `tsc -b tsconfig.client.json`) |
| `pnpm lint` | 0 | 26.91s | PASS (`lint:contracts-ready` / oxlint). G0 missing-binding failure did **not** recur. |
| `pnpm test` | 1 | 121.25s | FAIL overall. **14575 passed**, **15 failed**, **117 skipped**. 872 files: 859 passed, 3 failed, 10 skipped. |
| `pnpm build` | 0 | 13.88s | PASS (includes web frontend dist) |
| `pnpm dsh web --no-open` | running then stopped | n/a | Host printed `dsh web: http://127.0.0.1:3080` |

`pnpm run check:ci:static` / `check:ci:coverage` / `check:ci:consumers` were **not** run. They are official PR aggregates (knip, docs MPA, coverage partitions, Playwright snapshots) and need the official 16-core Linux runner. Not treated as the M0 local gate.

---

## Test failure classification

| File | Failed tests | Classification | Why |
|---|---|---|---|
| `packages/subagent/subagent-claude-code/tests/real-product.spec.ts` | 8 | `OPTIONAL_EXTERNAL_PRODUCT_FAILURE` | Missing `@anthropic-ai/claude-agent-sdk-darwin-arm64` native `claude` binary. Official `standard`/`code` rows are **disabled**. Did not install `@latest`. |
| `packages/subagent/subagent-codex/tests/real-product.spec.ts` | 6 | `OPTIONAL_EXTERNAL_PRODUCT_FAILURE` | Missing `@openai/codex-darwin-arm64`. Error text suggested `npm install -g @openai/codex@latest` — **not executed**. |
| `scripts/gen-third-party-notices.spec.ts` | 1 | `OPTIONAL_EXTERNAL_PRODUCT_FAILURE` | Same missing Claude darwin-arm64 virtual manifest. |

G0 macOS failures that **did not recur** on this complete product-tree install:

- oxlint darwin binding → now lint PASS (`UPSTREAM_PASS` on this machine)
- sharp / libvips dylib → not seen
- `hmr-config.spec.ts` timeout → not seen

Those earlier G0 misses stay recorded as `ENVIRONMENT_FAILURE` of the G0 isolated clone, not of this SHA.

---

## Official Web startup

`DSH_HOME` isolated at `.m0-dsh-home` (do not commit).

| Check | Result |
|---|---|
| Host listen `http://127.0.0.1:3080` | PASS |
| `GET /` HTML 200 + `__DSH_BOOT__` | PASS |
| `GET /plugins/@deepseek-ai/dsh-client-modules/client.js` 200 | PASS |
| `GET /plugins/@deepseek-ai/dsh-client-runtime/client.js` 200 | PASS |
| `session.list` → empty then later 1 session | PASS |
| `session.create` → `session-aeb6a500-…`, preset `standard` | PASS |
| `host.describe` → `deepseek-official` / `deepseek-v4-flash` | PASS |
| Browser: preview banner, key onboarding, conversation shell | PASS (clicked 继续, then **稍后配置** — no key entered) |
| Paid LLM prompt | Not attempted |

Limitation: composer Send stays disabled until a workspace / model key is configured. That is official product behavior, not an M0 defect.

---

## Git remotes and branches (already on origin)

```text
origin    https://github.com/htxll2002-cloud/deepseek-harness.git
upstream  https://github.com/deepseek-ai/deepseek-harness.git  (push disabled)
```

| Branch | SHA |
|---|---|
| `stable-base` | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` |
| `integration/upstream` | same |
| `product/main` | same (docs are local uncommitted M0 additions) |
| `origin/master` / `upstream/master` | same at freeze time |
