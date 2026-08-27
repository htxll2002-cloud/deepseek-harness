# M1 Lockfile Review

[English](m1-lockfile-review.md) | 中文

随 M1 落地的 `pnpm-lock.yaml` 变更参考。比较：

```text
git diff 405d845f5f60724f48fb7b0a883174f34a1c695d -- pnpm-lock.yaml
```

M1 曾执行一次 `CI=true pnpm install --no-optional --no-frozen-lockfile`，以便记录新的 workspace 包。Closeout 要求随后对同一 lockfile 做 frozen install。

## Expected changes

diff 为 **+184 / −0**。它只改动 `importers:`：

1. `apps/cli` 增加 `@deepseek-ai/dsh-product-safe`，`specifier: workspace:^`，`version: link:../../packages/bundle/product-safe`。
2. 新 importer `packages/bundle/product-safe` 列出该包的 `dependencies` 与 `devDependencies`。

每个 workspace specifier 都是 `workspace:^`（或已有的 vendored `schemastery` `link:`）。唯一的非 workspace specifier 是 `commander: ^15.0.0` 与 `open: ^11.0.0`，其他 startup 组合包已经使用它们，并且已经快照为 `commander@15.0.0` 与 `open@11.0.0`。没有出现新的 `packages:` 快照行。

这些新增是新 workspace 包及其 CLI importer 所需的 lockfile 元数据。

## Unexpected changes

无。

审查查找且未发现：

- 无关包版本漂移
- 无关依赖升级
- 因 `--no-optional` 删除 optional-dependency 快照
- Foundation / 官方 Harness 依赖升级
- 浮动的 `@latest` specifier
- M0 lockfile 中尚不存在的新解析版本

## Final decision

**PASS.** 保留生成的 lockfile。不要为了回避 lockfile 变更而改写已验证的 M1 Runtime 设计。

`CI=true pnpm install --no-optional --frozen-lockfile` 在 lockfile 已是最新时完成。M1 重新安装不需要 `--no-frozen-lockfile`。

无关依赖漂移：**0**。
