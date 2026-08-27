# M1 Lockfile Review

English | [中文](m1-lockfile-review.zh.md)

Reference for the `pnpm-lock.yaml` change that lands with M1. Compare:

```text
git diff 405d845f5f60724f48fb7b0a883174f34a1c695d -- pnpm-lock.yaml
```

M1 ran `CI=true pnpm install --no-optional --no-frozen-lockfile` once so the new workspace package could be recorded. Closeout requires a later frozen install against the same lockfile.

## Expected changes

The diff is **+184 / −0**. It touches only `importers:`:

1. `apps/cli` gains `@deepseek-ai/dsh-product-safe` with `specifier: workspace:^` and `version: link:../../packages/bundle/product-safe`.
2. A new importer `packages/bundle/product-safe` lists that package's `dependencies` and `devDependencies`.

Every workspace specifier is `workspace:^` (or the existing vendored `schemastery` `link:`). The only non-workspace specifiers are `commander: ^15.0.0` and `open: ^11.0.0`, already used by other startup bundles and already snapshotted as `commander@15.0.0` and `open@11.0.0`. No new `packages:` snapshot rows appear.

Those additions are required lockfile metadata for a new workspace package and its CLI importer.

## Unexpected changes

None.

The review looked for and did not find:

- Unrelated package version drift
- Unrelated dependency upgrades
- Deleted optional-dependency snapshots from `--no-optional`
- Foundation / official Harness dependency upgrades
- Floating `@latest` specifiers
- New resolved versions that were not already in the M0 lockfile

## Final decision

**PASS.** Keep the lockfile as generated. Do not rewrite M1 runtime design to avoid a lockfile change.

`CI=true pnpm install --no-optional --frozen-lockfile` completes with the lockfile up to date. M1 does not need `--no-frozen-lockfile` to reinstall.

Unexpected dependency drift: **0**.
