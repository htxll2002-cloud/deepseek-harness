# G0 — `ysr666/dsh-vision-router` Audit

**Audit date:** 2026-08-27
**Isolated clone:** `audit/dsh-vision-router`
**Prior PRD status:** `SOURCE_DONOR`
**G0 status:** `SOURCE_DONOR`

---

## 1. Pin

```text
DSH_VISION_ROUTER_PINNED_COMMIT = 44039c95aea0a4a6b2c9e96b1b9fe360ae9dcc0d
PACKAGE_VERSION                 = 2.0.1
NEAREST_TAG                     = v2.0.1 → 39c8f2b2d69aa398418fd6c8ab40b691a92a1a3d
```

HEAD is **after** the `v2.0.1` tag. Recent commits are a 2.x P1 routing refactor (`refactor/2x-p1-*`). The audited tree is HEAD, not the tag.

Last push: 2026-08-27T04:11:38Z. High commit velocity. Do not treat main as stable.

packageManager in manifest is `pnpm@11.20.0` (Corepack downloaded that exact version during install; not `@latest`).

## 2. License and install surface

| Item | Finding |
|---|---|
| License | MIT, Copyright (c) 2026 dsh-vision-router contributors |
| Lockfile | `pnpm-lock.yaml` present |
| Runtime deps | `@deepseek-ai/schemastery`, `potrace`, `puppeteer-core`, `undici` |
| Optional peers | `sharp`, `@deepseek-ai/dsh-anonymous-user-id`, `@deepseek-ai/dsh-llm-deepseek` |
| postinstall | none; `pnpm.onlyBuiltDependencies: ["sharp"]` (pnpm 11.20 warned this key is ignored in package.json) |
| Tests | large `node --test` suite |

### Commands executed

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm test:core` | PASS |
| `pnpm test:contract` | PASS |
| `pnpm test:resources` | PASS (includes `artifact-path-security.test.js`, pixel-diff, resource governor) |

Full `pnpm test` (100+ files) was **not** required after the scoped suites passed. Not claimed as 100% suite green.

No API keys. No public vision endpoint called.

Open issues (not treated as capability): #315 marketplace listing; #138 clipboard screenshot MIME.

## 3. Tool inventory (source: `index.js`)

Registered names when `toolEnabled()`:

| Tool | Inputs (as shipped) | Network? | Adapt to `inspect_image(artifact_id, inspection_profile)`? |
|---|---|---|---|
| `vision_describe` | `paths[]` and/or `attachmentIds[]` + `question` | Yes — vision chain / HTTP providers | **Yes**, if paths/URLs removed and only `artifact_id` remains |
| `vision_bootstrap` | session/bootstrap | Mixed | **No** — personal Harness session repair |
| `vision_materialize` | attachment id → local file | FS | **Delete** |
| `vision_ground` | image path/id + query | Vision model | **Yes** (grounding profile) |
| `vision_detect` | image path/id | Vision model | Partial; fold into grounding/detect profile |
| `vision_crop` | image + box | Local (sharp) | **Yes** (crop profile) |
| `vision_present` | presentation | Local | Reference only |
| `vision_pixel_diff` | two images | Local (sharp) | **Yes** (diff profile) |
| `vision_colors` | image path/id | Local sharp quantize | **Yes** (palette profile) |
| `vision_ocr` | image; tesseract then vision fallback | Local and/or network | **Yes** with local-only or approved-provider policy |
| `vision_long_screenshot_ocr` | screenshot-oriented | Mixed | **Delete** |
| `vision_trace` | image → SVG via `potrace` | Local | Optional later; not MVP |
| `vision_extract_foreground` | image | Local/model | **Yes** with isolation |
| `vision_html_screenshot` | local `.html` + **puppeteer-core** | Browser automation | **Delete** |
| `vision_screenshot` | desktop capture (opt-in setting) | OS screenshot | **Delete** |
| `vision_activate` | enablement | Settings | **Delete** |

`vision_describe` schema explicitly asks for **absolute local image file paths**. `readImageBytes` accepts filesystem paths *or* `sha256:…` attachment ids. It does **not** fetch image HTTP URLs; URL risk is outbound vision backends (`httpProviders`, proxy, anonymous OVH), not image ingest.

## 4. Must-delete for public SaaS

| Capability | Why |
|---|---|
| Arbitrary local paths | `paths`, `image` string, `source` HTML path, workspace-relative resolution via `ctx.fs` |
| Browser / HTML screenshot | `vision_html_screenshot` + `puppeteer-core`; Chrome launch `--no-sandbox` |
| Desktop screenshot | `vision_screenshot` (screencapture / PowerShell / ImageMagick) |
| Anonymous public vision endpoint | `DEFAULT_HTTP_PROVIDERS` → `https://oai.endpoints.kepler.ai.cloud.ovh.net/v1` (keyless OVH); `freeCloudFirst` / OpenRouter-style fallbacks (`tests/free-cloud-first.test.js`) |
| Arbitrary URL / user endpoint | HTTP provider directory, live model discovery, user-editable baseURL |
| Workspace access | `saveArtifact` into workspace; `vision_materialize`; `ctx.fs` |
| Self-update / doctor CLI | `bin.dsh-vision-router`, `tests/self-update.test.js` |
| Session mutation / native-image coexistence hacks | issue-276/289 tests; not a product Control Plane |
| Dynamic plugin install | one-command personal install story in README (not executed here) |

## 5. Worth adapting into `inspect_image`

Production tool accepts **only**:

```text
artifact_id
inspection_profile
```

Cache key (PRD): `artifact_checksum + inspection_profile + vision_model_version`.

| Profile (proposed) | Donor | Notes |
|---|---|---|
| `describe` | `vision_describe` | Server vision adapter; no paths; no anonymous chain |
| `ground` | `vision_ground` / `vision_detect` | Structured boxes; artifact bytes only |
| `crop` | `vision_crop` | Deterministic sharp crop in isolated worker |
| `pixel_diff` | `vision_pixel_diff` | Needs two artifact ids — **schema extension later** or profile that reads Current + Reference from Product state, not tool args |
| `palette` | `vision_colors` | Local sharp; good fit |
| `ocr` | `vision_ocr` tesseract path | Only if worker has a pinned engine; no public vision fallback |
| `foreground` | `vision_extract_foreground` | Isolate; review model use |
| checksum cache | attachment ids are already `sha256:…` | Aligns with Artifact checksum |
| sharp pipeline | peer `sharp` + tests | Adopt via official `lovell/sharp`, not by installing this plugin |

`pixel_diff` comparing two artifacts should be Product-state-driven (current vs reference), not “two local paths”.

## 6. Per-module classification

| Module | Classification |
|---|---|
| `vision_describe` (attachment-id path only) | `SOURCE_DONOR_ONLY` |
| `vision_ground` / `vision_detect` | `SOURCE_DONOR_ONLY` |
| `vision_crop` | `SOURCE_DONOR_ONLY` |
| `vision_pixel_diff` | `SOURCE_DONOR_ONLY` |
| `vision_colors` | `SOURCE_DONOR_ONLY` |
| `vision_ocr` local tesseract branch | `SOURCE_DONOR_ONLY` |
| `vision_extract_foreground` | `SOURCE_DONOR_ONLY` |
| sharp / checksum / resource governor tests | `SOURCE_DONOR_ONLY` |
| `vision_trace` / potrace | `REFERENCE_ONLY` (not MVP) |
| HTTP provider router / free-cloud-first | `REJECT` |
| `vision_html_screenshot` / puppeteer | `REJECT` |
| `vision_screenshot` | `REJECT` |
| `vision_materialize` / workspace artifacts | `REJECT` |
| Settings UI / remote settings bridge | `REJECT` |
| Doctor / self-update / live model discovery | `REJECT` |
| Whole package as production plugin | `REJECT` |

**No module is `ADOPT_AS_IS`.**

## 7. Classification

```text
SOURCE_DONOR
Confidence: 84
Source Verified: YES
Test Verified: YES (core / contract / resources)
Runtime Verified: NO (no Host load, no live vision)
Unknown: tesseract binary availability on product workers; whether a later isolated render service ever justifies HTML screenshot (not this plugin)
Required PoC: inspect_image fixture in M2/M5; not this plugin
```
