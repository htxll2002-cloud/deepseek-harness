# G0 — Infrastructure Candidates

**Audit date:** 2026-08-27
**Not installed into any product tree.** Versions taken from `npm view <name> version` (current registry latest at audit time, **not** installed via `@latest`).

Queue alternatives: **only `pg-boss`** was compared with Trigger.dev. BullMQ was not audited.

---

## 1. Auth — `better-auth/better-auth`

| Field | Value |
|---|---|
| npm | `better-auth@1.7.2` |
| Git tag | `v1.7.2` |
| Pinned commit | `ba12fcdfa774ca27d417079dbac0b1b5894ccaf2` |
| License | MIT (GitHub SPDX + npm) |
| Activity | Release 2026-08-26; default branch active |

### Source-verified capabilities (docs + release notes, not a Harness PoC)

- PostgreSQL via built-in Kysely adapter **or** `drizzleAdapter(db, { provider: "pg" })`.
- Google OAuth is a first-class social provider in the product docs.
- Session cookies: httpOnly/secure knobs; optional cookie cache (JWT/JWE/JWKS in 1.7).
- CSRF: origin check + Fetch Metadata; `disableCSRFCheck` / `disableOriginCheck` exist and are marked dangerous.
- Self-host: library, not a SaaS. Runs in the product Node process.

### Harness / BFF fit

Harness Host (`dsh-host-webserver`) has **no auth**. Integration must be a **Product BFF** in front of (or wrapping) Host routes:

```text
Browser → Better Auth cookie/session → Product BFF → Internal Harness Host
```

WebSocket / SSE: Better Auth can read the session from the handshake cookie if the BFF terminates the upgrade. This is **not verified against Harness `dsh-client-connection`**. Status: `REQUIRES_POC`.

### Decision

```text
APPROVED_CANDIDATE
Confidence: 78
Source Verified: YES (docs/releases/license)
Test Verified: NO
Runtime Verified: NO
Unknown: cookie → Harness Session ownership mapping; CSRF on Host-registered plugin routes; SSE/WS identity on dsh-client-connection
Required PoC: M3 Auth × Host / BFF / WS
```

---

## 2. Durable Job — `triggerdotdev/trigger.dev` vs `timgit/pg-boss`

### Trigger.dev

| Field | Value |
|---|---|
| GitHub license | **Apache-2.0** (repo SPDX) |
| npm `trigger.dev` / `@trigger.dev/sdk` | 4.5.12, npm `license` field **MIT** |
| Git tag | `v4.5.12` |
| Pinned commit | `ce40d0259fead12ac2bad8fc6f8ca574b221228a` |
| Cloud / Self-host | Both. Official self-host docs (Docker Compose / Kubernetes). Self-host is same core codebase with Cloud-only extras (warm starts, some RBAC/SSO, checkpoints — per vendor docs). |
| Data region | Cloud region **Unknown** (account/docs not executed). Self-host = operator region. |
| Worker | Separate worker processes; tasks in `trigger/` folders |
| Retry / idempotency / cancel / realtime / callback | First-class in the product; **not runtime-verified here** |
| Pricing | Cloud usage-based; Enterprise custom. Self-host: infra cost + ops |
| Vendor lock-in | Task SDK + dashboard + queue semantics. Self-host reduces data lock-in but not API lock-in |
| vs PostgreSQL Job Truth | Trigger Run is an **execution reference only**. Business Job rows stay in PostgreSQL |

**Do not** let Trigger.dev become a second Agent / Workflow runtime. Use it only to run deterministic Worker tasks (`submit provider`, persist result).

### pg-boss (the one low-level alternative)

| Field | Value |
|---|---|
| npm | `pg-boss@12.28.0` |
| License | MIT |
| engines | Node `>=22.12.0` |
| Storage | PostgreSQL (same database as Job Truth is possible) |
| Extra control plane | None |
| Realtime / dashboard | Minimal compared with Trigger |
| Self-host | Library; no vendor cloud |

Fits “Queue is not the truth” better: jobs and queue rows can live in one Postgres. Weaker operational UX (no official multi-region control plane, weaker first-party realtime).

BullMQ was **not** evaluated (would add Redis).

### Decision

```text
trigger.dev  APPROVED_CANDIDATE   (M4 Job Infrastructure Gate)
pg-boss      APPROVED_CANDIDATE   (only official low-level alternative)
BullMQ       not in matrix
```

G0 does **not** pick a winner. M4 must choose exactly one.

```text
Confidence: 70
Source Verified: YES (license, versions, self-host overview)
Test Verified: NO
Runtime Verified: NO
Unknown: Cloud data residency; exact Cloud vs self-host feature list at 4.5.12; Harness UI bridge for job completion (PRD §24)
Required PoC: M4 durable job + External Job → Harness UI Bridge
```

---

## 3. Upload — `transloadit/uppy`

| Field | Value |
|---|---|
| npm | `uppy@6.0.0` |
| License | MIT |
| Role | Browser upload UI / Tus / progress |

**Boundary:** browser only. Must not choose object-storage keys. Server still does magic-number, decode, quota, and key assignment.

Harness already has attachment upload for personal use; it is not a multi-tenant upload pipeline. Uppy is still the right *product* uploader candidate.

```text
APPROVED_CANDIDATE
Confidence: 75
Required PoC: M3 upload pipeline behind authenticated BFF
```

---

## 4. ORM — `drizzle-team/drizzle-orm`

| Field | Value |
|---|---|
| npm | `drizzle-orm@0.45.2` |
| License | Apache-2.0 |
| PostgreSQL | First-class |
| Better Auth | Official `drizzleAdapter` |

Fits the Harness monorepo as a **product-layer** package (not inside `packages/core`). No Harness-native SQL ORM exists.

```text
APPROVED_CANDIDATE
Confidence: 86
Required PoC: M3 schema + ownership tests
```

---

## 5. Image processing — `lovell/sharp`

| Field | Value |
|---|---|
| npm | `sharp@0.35.4` |
| License | Apache-2.0 |
| engines | Node `>=20.9.0` |
| Native addon | Yes — needs `allowBuilds` / isolated Worker |

Official Harness `packages/attachment/attachment-local` **already imports sharp** for provider-independent normalization (`normalization.ts`). G0 tests failed to load that addon because optional libvips was incomplete on this machine — that is an install-completeness issue, not absence of a Harness-native pipeline.

Vision-router also uses sharp as an optional peer — **do not install vision-router to get sharp**. Product Sharp version should be aligned with the Harness pin (audit tree has `sharp@0.35.3`) or a later audited 0.35.x.

Must run in a low-privilege Worker. Image-bomb limits are product policy, not provided automatically.

```text
APPROVED_CANDIDATE
Confidence: 88
Required PoC: M3 isolated decode + thumbnail + pixel-cap
```

---

## 6. MIME — `sindresorhus/file-type`

| Field | Value |
|---|---|
| npm | `file-type@22.0.2` |
| License | MIT |
| engines | Node `>=22` |
| Boundary | Server / Worker. Do not use as the only browser check |

`dsh-image-gen` already has a tiny magic-number sniff (PNG/JPEG/GIF/WebP). Prefer this maintained library over copying that snippet long-term.

```text
APPROVED_CANDIDATE
Confidence: 90
Required PoC: none beyond M3 upload tests
```

---

## 7. Harness-native alternatives?

| Need | Official Harness on pin | Enough? |
|---|---|---|
| Auth | Anonymous UUID only | No |
| Durable jobs | `dsh-jobs-local` in-process | No |
| Upload UX | Attachment + composer | Partial; not multi-tenant |
| ORM | none | No |
| Image normalize | attachment limits | Partial |
| MIME | informal sniffs in plugins | No |

No candidate is replaced by an official Harness-native production equivalent.

## 8. Decision table

| Project | G0 status | Next gate |
|---|---|---|
| better-auth | `APPROVED_CANDIDATE` | M3 |
| trigger.dev | `APPROVED_CANDIDATE` | M4 |
| pg-boss | `APPROVED_CANDIDATE` | M4 (alternative only) |
| uppy | `APPROVED_CANDIDATE` | M3 |
| drizzle-orm | `APPROVED_CANDIDATE` | M3 |
| sharp | `APPROVED_CANDIDATE` | M3 |
| file-type | `APPROVED_CANDIDATE` | M3 |
