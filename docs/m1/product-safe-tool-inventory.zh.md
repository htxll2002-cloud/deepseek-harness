# Product-Safe Tool Inventory

[English](product-safe-tool-inventory.md) | 中文

**BEFORE:** [docs/baseline/harness-tool-inventory.md](../baseline/harness-tool-inventory.zh.md)（M0，`standard` / `code` / `minimal`）
**AFTER:** `product/m1-safe-harness` 上的 product-safe profile

下面的计数是 product-safe 会话组合后的 **模型可见 / 可执行线路名**。宿主全局 `ctx.tools.schemas()` 没有模型工具；echo 限定在 preset 范围内。

## BEFORE (M0 default Web `standard`)

默认 coding agent 中存在的危险或 coding 相邻线路名（完整表见 M0 清单）：

| Class | Count (approx.) | Names |
|---|---|---|
| Shell | 1 (POSIX) / 1 (win32) | `bash` / `pwsh` |
| Filesystem arbitrary | 6 | `read`, `read_image`, `write`, `edit`, `grep`, `glob` |
| Terminal | 0 on `standard`; 6+ on `minimal` | `terminal_*` on `minimal` |
| Code runtime | 1 on `code` | `run_code` |
| Skills / jobs / goals / plan / subagent / workflow / ralph / web | many | see M0 |
| Dynamic extension | `cordis` preset | `cordis_define` / `cordis_run` / … |

`minimal` 也会挂载 Terminal。M1 不复用 `minimal`。

## AFTER (M1 product-safe)

| Class | Count | Names |
|---|---|---|
| Total model-facing tools | 1 | `product_safe_echo` |
| Shell / bash / exec / command | 0 | — |
| Filesystem arbitrary | 0 | — |
| Terminal | 0 | — |
| Code runtime / `run_code` | 0 | — |
| Dynamic extension / install plugin | 0 | — |
| Workspace file ops | 0 | — |
| Browser automation | 0 | — |
| MCP | 0 | — |

对历史别名（`shell`、`exec`、`command`、`fs_read`、`workspace_read`、`install_plugin`、`extension`，以及 M0 线路名）执行敌意 `ctx.tools.execute({ name })` 会返回 `isError` / `UNKNOWN_TOOL`。这是注册缺失，不是系统提示词请求。

## Difference

Product-safe 从产品运行时图中移除每一个 M0 默认 coding 工具。它增加一个夹具工具，仅用于证明静态平台插件仍能加载。M2 可以替换或删除该夹具。
