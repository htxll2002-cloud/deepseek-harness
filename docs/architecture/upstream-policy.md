# Upstream Policy

**Milestone:** `M0_OFFICIAL_HARNESS_BASELINE`
**Frozen:** 2026-08-27
**Product runtime patches:** 0

This repository is an official GitHub Fork of DeepSeek Harness. It is the only Agent Foundation for the product. Do not treat Harness as an npm dependency. Do not recreate a second Agent / Session / Tool / Streaming runtime.

---

## Foundation

| Field | Value |
|---|---|
| Foundation Commit | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` |
| Foundation Release | `dsh-v0.1.1-rc.2` (`0.1.1-rc.2`) |
| Upstream Remote | `https://github.com/deepseek-ai/deepseek-harness.git` |
| Origin (product fork) | `https://github.com/htxll2002-cloud/deepseek-harness.git` |
| Upstream push | **disabled** (`git remote set-url --push upstream DISABLE`) |

Do **not** follow floating `master`. Re-check upstream before a later integration; do not silently retarget the foundation SHA.

---

## Branches

| Branch | Role |
|---|---|
| `upstream/master` | Remote-tracking only. Official HEAD. Never develop here. |
| `integration/upstream` | Review landing zone for a future upstream SHA. Tests and compatibility review happen here. |
| `stable-base` | Last verified Harness baseline. Starts at the foundation SHA. No product features. |
| `product/main` | Product development. Default branch of origin. |

```text
upstream/master
        ↓  fetch + review (never git pull into product/main)
integration/upstream
        ↓  tests + compatibility review + human approve
stable-base
        ↓  only then
product/main
```

Rules:

1. Upstream and product work stay on different branches.
2. `stable-base` always points at a verified Harness commit (initially the foundation SHA).
3. Upstream must never merge directly into `product/main`.
4. Every upstream update must go through `integration/upstream`.
5. `git diff stable-base...product/main` is the product patch set.
6. Rollback = reset product work onto the last `stable-base` (human-approved).

---

## Update Policy

Allowed sequence when upstream publishes a new RC / commit:

1. `git fetch upstream`
2. Record the candidate SHA. Do not switch `stable-base` yet.
3. Fast-forward or reset `integration/upstream` to that SHA (or merge it there).
4. Run official `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` on `integration/upstream`.
5. Compatibility review of: `packages/core`, `packages/session`, `packages/core/tools`, `packages/host`, `packages/bundle`, `packages/extensions`, session persistence packages.
6. Human approve.
7. Move `stable-base` to the approved SHA.
8. Merge `stable-base` into `product/main` (or rebase product patches onto it) only after step 7.

Forbidden:

```text
git pull upstream master
```

then continue product work on the same branch.

---

## Review Policy

Auto-merge is forbidden for at least:

- `packages/core`
- `packages/session`
- `packages/core/tools` (tools family)
- `packages/host`
- `packages/bundle`
- `packages/extensions`
- session persistence (`packages/session/session-persistence*`)

A reviewer must state: runtime behavior change yes/no, product patch impact, and whether Product-Safe Bundle assumptions still hold.

---

## Rollback Policy

1. Stop product feature work.
2. Identify last good `stable-base` SHA (currently `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`).
3. Recreate `product/main` from that SHA plus the patch ledger, or revert the integration merge.
4. Do not “fix forward” by editing Harness core to paper over an upstream surprise during an integration.

---

## M0 environment note

M0 baseline commands were executed on the developer Mac (`darwin-arm64`, Node `v22.22.1`, `pnpm@11.7.0`). Linux / Docker was **not** used, by explicit product owner decision. Official GitHub CI uses Linux Node 24; that remains an Unknown for this machine, not a reason to retarget the foundation SHA.
