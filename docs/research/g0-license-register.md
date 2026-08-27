# G0 — License Register

**Audit date:** 2026-08-27
**Rule:** MIT / Apache-2.0 / BSD still require copyright + NOTICE preservation. `Other` / `NOASSERTION` / missing license = no code copy. Public GitHub ≠ commercial grant.

---

## 1. Projects in the G0 reuse matrix

| Repository | SPDX / text | Copyright | Obligations | Commercial SaaS? | Copy code? |
|---|---|---|---|---|---|
| `deepseek-ai/deepseek-harness` | MIT | Copyright (c) 2026 DeepSeek | Keep LICENSE + copyright; keep `THIRD_PARTY_NOTICES.md` on redistribution | Code: yes. **Trademark: no** as product name | Yes after official Fork |
| Harness `BRAND_GUIDELINES.md` | Trademark policy (not a software license) | DeepSeek | No “DeepSeek Harness” product name; no official-endorsement branding | Branding restricted | N/A |
| `shanliuling/dsh-image-gen` | MIT | Copyright (c) 2026 dsh-image-gen contributors | Keep copyright on copied files | Yes | Selective only |
| `ysr666/dsh-vision-router` | MIT | Copyright (c) 2026 dsh-vision-router contributors | Keep copyright on copied files | Yes | Selective only |
| `better-auth/better-auth` | MIT | per upstream LICENSE | Standard MIT notice | Yes | Adopt as dependency |
| `triggerdotdev/trigger.dev` | Repo **Apache-2.0**; npm SDK field **MIT** | Apache NOTICE required if using Apache-covered server code | Apache NOTICE + state changes; npm SDK MIT still needs copyright | Yes | Adopt as dependency after M4 pick |
| `timgit/pg-boss` | MIT | per upstream | Standard MIT | Yes | Adopt as dependency if chosen |
| `transloadit/uppy` | MIT | per upstream | Standard MIT; check bundled icons/fonts separately at adopt time | Yes | Adopt as dependency |
| `drizzle-team/drizzle-orm` | Apache-2.0 | per NOTICE | Apache NOTICE | Yes | Adopt as dependency |
| `lovell/sharp` | Apache-2.0 | per NOTICE | Apache NOTICE; native binary attribution | Yes | Adopt as dependency |
| `sindresorhus/file-type` | MIT | Sindre Sorhus et al. | Standard MIT | Yes | Adopt as dependency |

No matrix item is `NOASSERTION` or unlicensed.

## 2. Brand / ToS / assets (separate from SPDX)

| Subject | Status | Action |
|---|---|---|
| DeepSeek trademark / official UI brand package | Restricted | Own product name; replace `ui-brand-official` |
| `@deepseek-ai/dsh-product-safe` workspace name | Internal only; `private: true`; not an official DeepSeek package | Never publish; revisit namespace during branding |
| Provider ToS (Google Gemini, OpenAI, Ark/Seedream, DashScope) | **Unknown / not reviewed** | Required before M6 real provider |
| 中转站 / OpenAI-compatible relays | **Unknown** | Forbidden as user-defined endpoints; any official relay needs its own contract |
| `dsh-image-gen` README screenshots / preview images | Not copied | Do not reuse promotional images without checking |
| Uppy / Harness fonts and icons | Not inventory-complete | Add to this register before public launch |
| Vision-router `assets/` | Not reviewed file-by-file | Do not copy |

## 3. Projects that block commercial copy

| Repository | License | Why blocked |
|---|---|---|
| `Devin-AXIS/deepseek-design` | **iPolloWork Source Available License 1.0** (2026-07-13), Copyright (c) 2026 Different AI, Inc. | Forbids hosted/SaaS, ≥3 users, commercial incorporation, paid delivery, and removing iPolloWork brand without written authorization. Historical MIT portions exist in `LICENSES/MIT-legacy.txt` but this repo is **not** a clean MIT grant for current code. |

PRD already marked this `BLOCKED_BY_LICENSE`. G0 **confirms** and keeps it **out of the Adopt Matrix**. No clone. No copy.

## 4. Already out of the formal Adopt Matrix (licenses not used as a copy grant)

| Project | PRD / G0 status | Note |
|---|---|---|
| `Nagi-ovo/dsh-visualize` | `REFERENCE_ONLY` | Not cloned; no code copy |
| `ZSeven-W/dsh-openpencil` | `REFERENCE_ONLY` / Phase 3 | Not cloned |
| `konvajs/react-konva` | Phase 2 | Not cloned |
| `invoke-ai/InvokeAI` | `REFERENCE_ONLY` | Not cloned; do not copy unaudited code |
| `tldraw/tldraw` | `REJECTED_FOR_MVP` | License re-eval later; not cloned |
| BullMQ | Not selected as the queue alternative | Not cloned |

## 5. Transitive / special Harness notices

Harness `THIRD_PARTY_NOTICES.md` lists `@anthropic-ai/claude-agent-sdk` as `SEE LICENSE IN README.md`. That package is part of the official monorepo closure (optional coding integrations). Product-safe bundle must not ship it if unused. Full `pnpm licenses list` is the lockfile SBOM; not re-run as a committed artifact in G0.

## 6. G0 copy actions

**Copied into the product tree this milestone:** none.

Research docs quote paths and short descriptions only. Isolated clones stay under `audit/` and are not a distribution.

## 7. Q8 answer

**Yes.** `Devin-AXIS/deepseek-design` under iPolloWork Source Available **does not allow** the target commercial hosted SaaS. DeepSeek **trademark** rules also forbid presenting the product as official DeepSeek Harness. SPDX-MIT/Apache candidates do not block the commercial model if notices are kept.
