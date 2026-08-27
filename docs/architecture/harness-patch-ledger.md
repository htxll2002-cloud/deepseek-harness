# Harness Patch Ledger

**Milestone:** `M0_OFFICIAL_HARNESS_BASELINE`
**Foundation:** `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e` (`dsh-v0.1.1-rc.2`)
**Product Runtime Patch Count:** `0`

Compare product changes with:

```text
git diff stable-base...product/main
```

`stable-base` is the last verified official Harness commit. Anything on `product/main` that is not on `stable-base` must appear in this ledger.

---

## Runtime product patches

None.

| file | reason | category | upstream impact | runtime behavior changed |
|---|---|---|---|---|
| `.gitignore` | Ignore isolated M0 `DSH_HOME` (`.m0-dsh-home/`) so official-web settings are not committed | git / test env | none | NO |

M0 did **not** modify:

- Shell / FS / Terminal / Code Runtime / Workspace
- Auth / Jobs / Session / Tool UI / Plugins
- Official brand packages
- Bundle / preset compositions

---

## Documentation / policy files added on `product/main`

These are product research and process files. They do not change Harness runtime.

| file | reason | category | upstream impact | runtime behavior changed |
|---|---|---|---|---|
| `docs/architecture/upstream-policy.md` | M0 branch and update contract | docs | none | NO |
| `docs/architecture/harness-patch-ledger.md` | this file | docs | none | NO |
| `docs/baseline/harness-package-inventory.md` | M1 BEFORE snapshot | docs | none | NO |
| `docs/baseline/harness-tool-inventory.md` | M1 BEFORE snapshot | docs | none | NO |
| `docs/baseline/harness-host-route-inventory.md` | M1 BEFORE snapshot | docs | none | NO |
| `docs/baseline/harness-client-slot-inventory.md` | M1 BEFORE snapshot | docs | none | NO |
| `docs/baseline/harness-preset-inventory.md` | M1 BEFORE snapshot | docs | none | NO |
| `docs/baseline/m0-baseline-run.md` | command results | docs | none | NO |
| `docs/research/g0-*.md` | G0 contract copied into the product repo | docs | none | NO |
| `docs/architecture/third-party-adoptions.md` | G0 adopt register copied into the product repo | docs | none | NO |

If a later milestone changes Harness runtime, add a row **before** the commit lands on `product/main`.
