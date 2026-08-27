# G0 Final Decision

**Milestone:** `G0_OSS_AUDIT_AND_VERSION_FREEZE`
**Date:** 2026-08-27
**STOPPED AFTER G0:** YES
**Next milestone (recommended, not started):** `M0_OFFICIAL_HARNESS_BASELINE`

No product code was created or modified. No official Fork. No Product-Safe Bundle. No Design Agent. No database / auth / queue / provider wiring.

---

## Adopt Matrix (G0 freeze)

| Project | Status | Confidence | Source | Test | Runtime | Required PoC |
|---|---|---|---|---|---|---|
| `deepseek-ai/deepseek-harness` | `FOUNDATION` | 92 | YES | typecheck PASS; 14465/14609 unit tests; lint blocked by missing oxlint native | install + typecheck | M0 fork baseline |
| `shanliuling/dsh-image-gen` | `SOURCE_DONOR` | 88 | YES | 43/43 PASS | NO | M2 Tool View fixture (not this plugin) |
| `ysr666/dsh-vision-router` | `SOURCE_DONOR` | 84 | YES | core/contract/resources PASS | NO | `inspect_image` later; not this plugin |
| `better-auth/better-auth` | `APPROVED_CANDIDATE` | 78 | YES | NO | NO | M3 Auth × BFF × WS |
| `triggerdotdev/trigger.dev` | `APPROVED_CANDIDATE` | 70 | YES | NO | NO | M4 job infra + UI bridge |
| `timgit/pg-boss` | `APPROVED_CANDIDATE` | 72 | YES | NO | NO | M4 alternative only |
| `transloadit/uppy` | `APPROVED_CANDIDATE` | 75 | YES | NO | NO | M3 upload |
| `drizzle-team/drizzle-orm` | `APPROVED_CANDIDATE` | 86 | YES | NO | NO | M3 schema |
| `lovell/sharp` | `APPROVED_CANDIDATE` | 88 | YES | NO | NO | M3 isolated worker |
| `sindresorhus/file-type` | `APPROVED_CANDIDATE` | 90 | YES | NO | NO | M3 MIME gate |

### Removed from the formal reuse matrix

| Project | Status | Why |
|---|---|---|
| `Devin-AXIS/deepseek-design` | `BLOCKED_BY_LICENSE` | iPolloWork Source Available forbids hosted SaaS |
| `Nagi-ovo/dsh-visualize` | `REFERENCE_ONLY` | Not a donor this phase |
| `ZSeven-W/dsh-openpencil` | `REFERENCE_ONLY` | Phase 3 |
| `invoke-ai/InvokeAI` | `REFERENCE_ONLY` | UX only |
| `tldraw/tldraw` | `REJECTED` | MVP infinite canvas |
| BullMQ | `REJECTED` | Second queue stack |

README stars, marketplace Issues, and unmerged PRs are **not** treated as production capability.

---

## Q1 — Harness M0 baseline commit?

```text
b150a551b8d465e31e418e1b2eaf5e79bbb7d28e
tag: dsh-v0.1.1-rc.2
version: 0.1.1-rc.2
```

It is the current official RC, the current `master` HEAD, and the existing research baseline. No GA release exists. Do not follow floating `master`.

## Q2 — `dsh-image-gen` modules that can be reused?

- `defineTool` wiring for `generate_image` / `edit_image` (`FORK_AND_ADAPT`)
- Provider request/response adapters (`SOURCE_DONOR_ONLY`)
- Conversation Tool View keyed on `tool.call.toolview` (`FORK_AND_ADAPT`)
- Adapter / reference / containment **tests** (`FORK_AND_ADAPT`)
- Attachment-id parsing and magic-number sniff as study material (`SOURCE_DONOR_ONLY`)

## Q3 — `dsh-image-gen` personal-Harness-only?

- BYOK Settings API keys
- User-defined endpoints / 中转站 URLs
- Workspace save and `source_path`
- Synchronous tool→provider wait
- IndexedDB gallery as truth
- Implicit “newest conversation image”
- Install Skill / `dsh plugin add`
- Unauthenticated Host image route

## Q4 — Fork `dsh-image-gen` or selective transplant?

**Selective transplant only.** Do not fork the donor as the product plugin. Do not install it.

## Q5 — Vision tools for Artifact-based `inspect_image`?

**Adapt:** describe, ground/detect, crop, pixel-diff, palette/colors, local OCR, foreground, checksum cache, sharp pipeline — after stripping paths/URLs/network.

**Delete:** desktop screenshot, HTML/puppeteer screenshot, anonymous public vision, arbitrary URL/path, workspace materialize, self-update, doctor, free-cloud-first router.

## Q6 — Better Auth?

**Yes, as `APPROVED_CANDIDATE`.** PostgreSQL + Drizzle + Google OAuth + cookie CSRF are documented. Harness Host still has no auth. M3 must prove BFF + Session ownership + WS/SSE.

## Q7 — Trigger.dev?

**Yes, as `APPROVED_CANDIDATE`, not a decision.** Apache-2.0/MIT; Cloud and self-host exist. Job Truth stays in PostgreSQL. Only alternative compared: **pg-boss**. M4 picks exactly one.

## Q8 — Any license that blocks the commercial model?

**Yes.** `Devin-AXIS/deepseek-design` (iPolloWork Source Available) forbids hosted/SaaS commercial use. DeepSeek trademark rules forbid official-looking product naming. MIT/Apache candidates in the matrix do not block SaaS if notices are kept.

## Q9 — Delete from the formal reuse matrix?

- `deepseek-design`
- `tldraw` (MVP)
- `InvokeAI` / `dsh-visualize` / `dsh-openpencil` as code donors
- BullMQ
- Whole-repo adopt of `dsh-image-gen` or `dsh-vision-router`

## Q10 — Unknowns before M0?

1. Will official `master` move past `b150a551` before M0 starts? Re-check; do not silently retarget.
2. RC API stability through 0.1.x GA.
3. Whether a clean CI-like install (Node 24 + complete optional natives: sharp/libvips, oxlint darwin-arm64, Claude/Codex optional bins) is fully green. This machine: typecheck PASS; lint FAIL (missing oxlint binding); tests 14465 passed / 27 failed.
4. External Job → Harness UI Bridge (PRD §24) — architecture unknown until M4 PoC.
5. Auth cookie → Harness Session ownership (M3).
6. Cloud vs self-host vs pg-boss (M4) including data region and budget.
7. Provider ToS / data retention / 中转站 (before M6).
8. Whether Google Interactions API remains the correct Gemini image surface.
9. SVG / image-bomb policy details (M3).
10. Official brand replacement package (product name not chosen in G0).

---

## Pins

```text
Harness:          b150a551b8d465e31e418e1b2eaf5e79bbb7d28e
dsh-image-gen:    629a44c17922e7241546931c872dd8f0447e7cce
dsh-vision-router:44039c95aea0a4a6b2c9e96b1b9fe360ae9dcc0d
better-auth:      1.7.2 / ba12fcdfa774ca27d417079dbac0b1b5894ccaf2
trigger.dev:      4.5.12 / ce40d0259fead12ac2bad8fc6f8ca574b221228a
pg-boss:          12.28.0
uppy:             6.0.0
drizzle-orm:      0.45.2
sharp:            0.35.4
file-type:        22.0.2
```

---

## Compliance checklist

- [x] No `@latest` install
- [x] No real API keys
- [x] No paid provider calls
- [x] No product code modified
- [x] No Product-Safe Bundle
- [x] No M0 Fork
- [x] Isolated clones only under `audit/`
- [x] Required docs written
- [x] Stop after G0
