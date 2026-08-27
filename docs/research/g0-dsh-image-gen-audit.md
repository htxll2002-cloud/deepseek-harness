# G0 — `shanliuling/dsh-image-gen` Audit

**Audit date:** 2026-08-27
**Isolated clone:** `audit/dsh-image-gen`
**Prior PRD status:** `SOURCE_DONOR / FORK_CANDIDATE`
**G0 status:** `SOURCE_DONOR` (do not install into product; do not fork whole repo)

---

## 1. Pin

```text
DSH_IMAGE_GEN_PINNED_COMMIT = 629a44c17922e7241546931c872dd8f0447e7cce
PACKAGE_VERSION             = 0.2.0
NEAREST_TAG                 = v0.2.0 → 23e1f5a0312a095ef3939c26649ff779c63a1b0f
```

HEAD after `v0.2.0` is documentation-only (`docs: sync English image editing description`). The last feature commit in recent history is `7fc21a8` (`feat: add multi-provider image editing`). The audited tree is HEAD.

Last push: 2026-08-26T16:39:25Z. Created 2026-08-17. Active personal plugin, not a foundation.

## 2. Basics

| Item | Finding |
|---|---|
| License | MIT, Copyright (c) 2026 dsh-image-gen contributors |
| package.json name | `dsh-image-gen@0.2.0` |
| packageManager | `pnpm@11.7.0` |
| engines | Node `^22.19.0 \|\| >=24.0.0` |
| Lockfile | `pnpm-lock.yaml` present |
| postinstall | none |
| prepare | `pnpm run build` (runs tsc+tsdown on install) |
| scripts | `typecheck`, `build`, `test`, `pack:check` |
| Runtime deps | **none** (peer-only on Harness 0.1.1-rc.2 packages + React 18) |
| Tests | `tests/*.spec.ts` (9 files) |
| Install Skill | `skills/install-dsh-image-gen/SKILL.md` — runs `dsh plugin --profile <profile> add` |

### Commands executed (isolated)

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | PASS (prepare rebuilt `lib/`) |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS — 9 files, **43 tests** |
| `pnpm pack:check` | PASS |

No real API keys. No paid provider calls. Tests are local/mocked.

### Pack contents (dry-run)

```text
cordis.patch.yml
lib/client.js
lib/client.js.map
lib/index.js
lib/types/**/*.d.ts
LICENSE
package.json
README*.md
skills/install-dsh-image-gen/SKILL.md
```

Source TypeScript is **not** in the tarball. Product transplant must copy from `src/`, not from the npm pack, if types/comments matter.

### Issues (open)

1. #11 marketplace listing on dsh.so — not a product defect.
2. #10 “连接 comfyui” — feature request.
3. #7 “文生视频” — feature request.

Do not treat Issues as verified capability.

## 3. Call chain (source-verified)

```text
Cordis plugin apply()
  src/index.ts  name='dsh-image-gen'  inject=['tools','attachments','credentials','webServer']
        │
        ├─ installSettingsSection(IMAGE_GENERATION_NAMESPACE)
        ├─ ctx.webServer.register  exact  IMAGE_ROUTE='/plugins/dsh-image-gen/image'
        │
        ├─ ctx.tools.register  generate_image
        │     resolveProvider(config)          src/config.ts
        │     credentials.resolve(apiKeyEnv)   BYOK Settings
        │     generateGoogleImage              src/google.ts
        │     generateDashScopeImage           src/dashscope.ts
        │     generateOpenAICompatibleImage    src/openai-compatible.ts  (openai + seedream t2i)
        │     attachments.saveImage
        │     saveImageToWorkspace             src/workspace-save.ts   (optional, default on)
        │     ToolResult: attachment + presentResult card
        │
        └─ ctx.tools.register  edit_image
              resolveReferenceImage            src/reference-image.ts
                source_attachment_id
                OR source_path (workspace file)
                OR newest conversation image   ← implicit "previous image"
              editGoogleImage / editOpenAICompatibleImage
              editSeedreamImage / editDashScopeImage
              same save + ToolResult path

Client
  src/client/index.tsx
    settings.plugin.item  → ImageGenerationSettingsCard  (API key + endpoint UI)
    tool.call.toolview    key=generate_image | edit_image → GeneratedImageCard
    conversation.view     id=gallery → GalleryViewTab
    saveGalleryItem()     src/client/gallery-store.ts  IndexedDB `dsh_image_gen_db`

Browser fetch
  POST /plugins/dsh-image-gen/image
    origin check + parseImageAttachmentRef
    attachments.readImage
    raw bytes back to <img>
```

## 4. File map

| Concern | Path |
|---|---|
| Tool registration | `src/index.ts` `apply()` |
| `generate_image` | `src/index.ts` lines ~43–73 |
| `edit_image` | `src/index.ts` lines ~75–120 |
| Reference image | `src/reference-image.ts` |
| Gemini adapter | `src/google.ts` |
| OpenAI / compatible adapter | `src/openai-compatible.ts` |
| Seedream adapter | `src/seedream.ts` (edit); t2i via openai-compatible |
| DashScope adapter | `src/dashscope.ts` |
| Image route | `src/image-route.ts` + `IMAGE_ROUTE` in `src/shared.ts` |
| Workspace save | `src/workspace-save.ts` |
| Config / Settings | `src/config.ts` + client settings card |
| Gallery store | `src/client/gallery-store.ts` |
| Gallery view | `src/client/gallery-view.tsx` |
| Client Tool View | `src/client/index.tsx` `GeneratedImageCard` |
| Tests | `tests/{index,config,google,openai-compatible,seedream,dashscope,dashscope-edit,reference-image,workspace-save}.spec.ts` |
| Cordis patch | `cordis.patch.yml` (insert `image-gen` / `dsh-image-gen`, default provider google) |
| Dynamic install Skill | `skills/install-dsh-image-gen/SKILL.md` |

## 5. Security and product gaps (must replace)

| Personal-Harness assumption | Code | Product replacement |
|---|---|---|
| BYOK | `credentials.resolve(credentialRef(active.apiKeyEnv))` | Server-side provider secret |
| Settings API Key | client password field → `credentials.set` | No user-entered provider keys |
| User-defined endpoint | `googleEndpoint`, `openaiBaseURL`, `seedreamBaseURL`, `dashscopeEndpoint` as free URL inputs | Platform allowlist |
| Local workspace save | `saveToWorkspace` default **true**; writes under `session.header.cwd` | Artifact Service + object storage |
| Workspace path input | `edit_image.source_path` | Reject; `artifact_id` only |
| Tool waits on provider | `async execute` awaits `fetch` to Google/OpenAI/Ark/DashScope | Durable Job + Worker |
| Client local gallery | IndexedDB `dsh_image_gen_db` | PostgreSQL Artifact truth |
| Implicit previous image | `findReferenceImage` walks newest conversation image when both ids omitted | Explicit Current Artifact + Reference Snapshot |
| Dynamic plugin install | Skill runs `dsh plugin add` | Static plugin in product bundle |
| Sync image route on Host | `ctx.webServer.register` | Authenticated BFF / signed URL |
| Default official endpoints | Google / OpenAI / Ark Beijing / DashScope | Capability matrix + region policy |

Workspace path handling **does** lexical + realpath containment (`containsPath` + `realpath`). That is good for a personal Harness plugin and still **REJECT** for public SaaS (any workspace access).

Image route origin check is same-origin only and has no user auth. Acceptable on loopback Harness; not acceptable on a public Host.

`redirect: 'error'` on provider POSTs is good. Image URL downloads in `openai-compatible.ts` / `seedream.ts` / `dashscope.ts` use `redirect: 'follow'` after the authenticated provider response — extra SSRF surface if a provider returns an attacker URL. Endpoints remain user-controlled → SSRF risk if transplanted as-is.

`SECURITY.md` documents Google / OpenAI / Ark only; DashScope is implemented and tested but omitted there. README “OpenAI Compatible” is not a fifth provider enum — it is `openai` plus a user `openaiBaseURL`. `docs/assets/` screenshots referenced by README are not in the repo.

## 6. Per-module classification

| Module | Classification | Reason |
|---|---|---|
| `generate_image` / `edit_image` tool schema + Cordis `defineTool` wiring | `FORK_AND_ADAPT` | Keep Harness tool names and `defineTool` shape; change I/O to job accept + artifact ids |
| Provider adapters (`google.ts`, `openai-compatible.ts`, `seedream.ts`, `dashscope.ts`) | `SOURCE_DONOR_ONLY` | Request/response parsing is reusable; must drop user endpoints, sync wait, and live in Worker |
| `reference-image.ts` conversation attachment walk | `SOURCE_DONOR_ONLY` | Useful for understanding DSH attachment refs; product must not infer “latest image” or read workspace paths |
| Magic-number sniff in `reference-image.ts` | `SOURCE_DONOR_ONLY` | Small, clear; product should prefer `file-type` + Sharp decode |
| `image-route.ts` | `REFERENCE_ONLY` | Same-origin Host POST is personal-Harness; product uses BFF + signed URLs |
| `workspace-save.ts` | `REJECT` | Local workspace persistence is forbidden in public SaaS |
| `config.ts` + Settings card (BYOK / endpoints) | `REJECT` | Personal Harness settings surface |
| `gallery-store.ts` IndexedDB | `REJECT` | Browser is not Artifact truth |
| `gallery-view.tsx` UX | `REFERENCE_ONLY` | Layout/lightbox ideas only; new view must bind PostgreSQL Artifacts |
| `GeneratedImageCard` Tool View | `FORK_AND_ADAPT` | Official `tool.call.toolview` keyed registration is the correct extension point |
| `cordis.patch.yml` | `SOURCE_DONOR_ONLY` | Shows how to insert a bundle row; product patch must not default Google BYOK |
| Tests | `FORK_AND_ADAPT` | Strong fixture coverage of adapters, reference resolution, workspace containment — rewrite assertions for product contracts |
| Install Skill | `REJECT` | Dynamic plugin install |
| README marketing | `REFERENCE_ONLY` | Not verified capability |

**No module is `ADOPT_AS_IS` for the product.** A later isolated source pass classified some adapters / `config.ts` / `workspace-save.ts` as drop-in libraries. That is a personal-Harness reuse lens. G0 keeps the product-SaaS lens: those files still assume BYOK, user endpoints, workspace paths, or sync provider I/O, so they stay `SOURCE_DONOR_ONLY` / `REJECT` / `FORK_AND_ADAPT` as in the table.

## 7. Fork whole repo?

**No.** Selective transplant only.

Forking `dsh-image-gen` as the product plugin would keep BYOK, custom endpoints, workspace save, IndexedDB gallery, install Skill, and synchronous provider calls. That is the opposite of the PRD replacement list.

Build a **new static product plugin** inside the official Harness fork. Copy only adapter/test/Tool-View ideas under MIT, with copyright retained.

## 8. Classification

```text
SOURCE_DONOR
Confidence: 88
Source Verified: YES
Test Verified: YES (43/43)
Runtime Verified: NO (no live provider, no Host plugin load)
Unknown: provider ToS / 中转站 authorization; whether Google Interactions API remains the right Gemini surface at M6
Required PoC: M2 Tool View spike using fixture results, not this plugin installed
```
