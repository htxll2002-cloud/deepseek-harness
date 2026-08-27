# Third-Party Adoptions

Living register required by PRD §11. G0 freeze: 2026-08-27.
No package in this file is installed into a product tree in G0.

Status vocabulary: `FOUNDATION` | `APPROVED_CANDIDATE` | `SOURCE_DONOR` | `REFERENCE_ONLY` | `BLOCKED_BY_LICENSE` | `REJECTED`.

---

## 1. `deepseek-ai/deepseek-harness`

| Field | Value |
|---|---|
| Repository | https://github.com/deepseek-ai/deepseek-harness |
| Pinned Commit / Version | `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` / `dsh-v0.1.1-rc.2` / `0.1.1-rc.2` |
| License | MIT + Brand Guidelines + `THIRD_PARTY_NOTICES.md` |
| Activity | Official; last push 2026-08-21; RC only |
| Adoption Status | `FOUNDATION` |
| Permitted Use | Official Fork as the only Agent Runtime / Session / Tool / Streaming / Web UI base |
| Forbidden Use | Empty-repo rewrite; npm-only consume; dropping Git history; following floating `master`; using DeepSeek branding as the product |
| Security Boundary | Default bundles include Shell, FS, Code Runtime, directory picker, plugin inventory, anonymous-only identity, no Host auth |
| Required Adaptations | M0 official fork; M1 Product-Safe Bundle; own brand; BFF auth |
| Update Policy | Pin SHA. `upstream/master` tracked. Manual review for core/session/tools/host/persistence/bundle/extensions |
| Removal Strategy | Not removable; project does not exist without it |

---

## 2. `shanliuling/dsh-image-gen`

| Field | Value |
|---|---|
| Repository | https://github.com/shanliuling/dsh-image-gen |
| Pinned Commit / Version | `629a44c17922e7241546931c872dd8f0447e7cce` / `0.2.0` |
| License | MIT |
| Activity | Active personal plugin (2026-08-26) |
| Adoption Status | `SOURCE_DONOR` |
| Permitted Use | Read and selectively transplant adapter / tool-schema / Tool View / tests |
| Forbidden Use | `pnpm add` / `dsh plugin add` / `@latest`; production BYOK; user endpoints; workspace save; IndexedDB gallery as truth |
| Security Boundary | BYOK credentials, arbitrary provider URLs, workspace FS, sync provider I/O, Host image route without user auth |
| Required Adaptations | Server secrets; allowlisted endpoints; Artifact + Job; no implicit previous image |
| Update Policy | Re-audit before any later transplant. Do not auto-merge donor main |
| Removal Strategy | Stop copying; product plugin is first-party after transplant |

---

## 3. `ysr666/dsh-vision-router`

| Field | Value |
|---|---|
| Repository | https://github.com/ysr666/dsh-vision-router |
| Pinned Commit / Version | `44039c95aea0a4a6b2c9e96b1b9fe360ae9dcc0d` / `2.0.1` (HEAD after tag `v2.0.1`) |
| License | MIT |
| Activity | Very high; 2.x routing refactor in progress |
| Adoption Status | `SOURCE_DONOR` |
| Permitted Use | Transplant deterministic inspect algorithms (crop, palette, pixel-diff, local OCR ideas) and describe/ground schemas |
| Forbidden Use | Install as production plugin; puppeteer; desktop/HTML screenshot; anonymous public vision; arbitrary paths/URLs; workspace materialize |
| Security Boundary | FS paths, `puppeteer-core`, free-cloud-first HTTP, undici to user endpoints, self-update |
| Required Adaptations | `inspect_image(artifact_id, inspection_profile)` only |
| Update Policy | Pin SHA. Donor main is too fast to follow |
| Removal Strategy | First-party `inspect_image`; no runtime dependency |

---

## 4. `better-auth/better-auth`

| Field | Value |
|---|---|
| Repository | https://github.com/better-auth/better-auth |
| Pinned Commit / Version | `ba12fcdfa774ca27d417079dbac0b1b5894ccaf2` / `1.7.2` |
| License | MIT |
| Activity | Stable 1.7.x (2026-08-26) |
| Adoption Status | `APPROVED_CANDIDATE` |
| Permitted Use | Product Auth after M3 PoC |
| Forbidden Use | Trusting client-supplied `user_id`; disabling CSRF/origin checks; putting auth only in the browser |
| Security Boundary | Cookie/session must terminate at Product BFF, not raw Harness Host |
| Required Adaptations | Google OAuth; Personal Tenant; WS/SSE identity; Harness Session ownership |
| Update Policy | Pin exact npm version. No `@latest` |
| Removal Strategy | Swap adapter behind Auth Context interface |

---

## 5. `triggerdotdev/trigger.dev`

| Field | Value |
|---|---|
| Repository | https://github.com/triggerdotdev/trigger.dev |
| Pinned Commit / Version | `ce40d0259fead12ac2bad8fc6f8ca574b221228a` / `4.5.12` |
| License | Apache-2.0 (repo) / MIT (npm SDK field) — keep both notices |
| Activity | 4.5.x (2026-08-20) |
| Adoption Status | `APPROVED_CANDIDATE` |
| Permitted Use | Durable Worker execution after M4 pick |
| Forbidden Use | Second Agent/Workflow runtime; Job Truth; billing truth |
| Security Boundary | Worker egress allowlist; callback verify; no secrets in Trigger payloads/logs |
| Required Adaptations | PostgreSQL Job Truth remains canonical; Cloud vs self-host decision |
| Update Policy | Pin CLI + SDK + self-host image tags together |
| Removal Strategy | Replace worker runner; keep Job/Attempt tables |

---

## 6. `timgit/pg-boss`

| Field | Value |
|---|---|
| Repository | https://github.com/timgit/pg-boss |
| Pinned Commit / Version | npm `12.28.0` (release 2026-08-24) |
| License | MIT |
| Activity | Maintained |
| Adoption Status | `APPROVED_CANDIDATE` (only low-level Trigger alternative) |
| Permitted Use | Postgres-backed queue if M4 rejects Trigger |
| Forbidden Use | Installing together with Trigger or BullMQ |
| Security Boundary | Same DB credentials as Job Truth — schema isolation required |
| Required Adaptations | Realtime/callback must be built on Product events |
| Update Policy | Pin exact npm version |
| Removal Strategy | Drop queue schema; Job table remains |

---

## 7. `transloadit/uppy`

| Field | Value |
|---|---|
| Repository | https://github.com/transloadit/uppy |
| Pinned Commit / Version | npm `6.0.0` |
| License | MIT |
| Activity | Maintained |
| Adoption Status | `APPROVED_CANDIDATE` |
| Permitted Use | Browser upload UX after M3 |
| Forbidden Use | Client-chosen storage keys; treating Uppy as the virus scanner |
| Security Boundary | Browser → BFF only |
| Required Adaptations | Auth, size/pixel caps, file-type + Sharp on server |
| Update Policy | Pin exact npm version + plugins used |
| Removal Strategy | Replace composer upload control |

---

## 8. `drizzle-team/drizzle-orm`

| Field | Value |
|---|---|
| Repository | https://github.com/drizzle-team/drizzle-orm |
| Pinned Commit / Version | npm `0.45.2` |
| License | Apache-2.0 |
| Activity | Maintained |
| Adoption Status | `APPROVED_CANDIDATE` |
| Permitted Use | Product PostgreSQL schema after M3 |
| Forbidden Use | Storing session event logs as a second conversation protocol |
| Security Boundary | Server-only |
| Required Adaptations | Better Auth drizzle adapter alignment |
| Update Policy | Pin `drizzle-orm` + `drizzle-kit` together |
| Removal Strategy | SQL schema remains; swap query layer |

---

## 9. `lovell/sharp`

| Field | Value |
|---|---|
| Repository | https://github.com/lovell/sharp |
| Pinned Commit / Version | npm `0.35.4` |
| License | Apache-2.0 |
| Activity | Maintained |
| Adoption Status | `APPROVED_CANDIDATE` |
| Permitted Use | Normalize / thumbnail / crop in isolated Worker |
| Forbidden Use | Decode untrusted images in the public Host process without caps |
| Security Boundary | Worker; pixel/byte/frame limits |
| Required Adaptations | Align with Harness `attachment-local` pin (`sharp@0.35.3` in the audited tree) or later audited 0.35.x; image-bomb policy; SVG policy (Sharp is not an SVG sanitizer) |
| Update Policy | Pin version; review native addon allowBuilds |
| Removal Strategy | Swap worker image library; keep Artifact rows |

---

## 10. `sindresorhus/file-type`

| Field | Value |
|---|---|
| Repository | https://github.com/sindresorhus/file-type |
| Pinned Commit / Version | npm `22.0.2` |
| License | MIT |
| Activity | Maintained (Node >=22) |
| Adoption Status | `APPROVED_CANDIDATE` |
| Permitted Use | Server magic-number MIME |
| Forbidden Use | Only client-side MIME |
| Security Boundary | Worker / BFF |
| Required Adaptations | Combine with Sharp decode, not MIME alone |
| Update Policy | Pin exact npm version |
| Removal Strategy | Replace detector; keep reject-on-mismatch policy |

---

## 11. Explicitly not in the Adopt Matrix

| Project | Status | Reason |
|---|---|---|
| `Devin-AXIS/deepseek-design` | `BLOCKED_BY_LICENSE` | iPolloWork Source Available — no commercial SaaS copy |
| `Nagi-ovo/dsh-visualize` | `REFERENCE_ONLY` | Tool UI pattern only; not cloned |
| `ZSeven-W/dsh-openpencil` | `REFERENCE_ONLY` | Phase 3; not cloned |
| `invoke-ai/InvokeAI` | `REFERENCE_ONLY` | UX reference; unaudited code |
| `tldraw/tldraw` | `REJECTED` (MVP) | Infinite canvas out of scope |
| `konvajs/react-konva` | Phase 2 only | Not adopted in G0 |
| BullMQ | `REJECTED` for this gate | Second queue framework not allowed; pg-boss is the alternative |

---

## Copied / modified files

None in G0.
