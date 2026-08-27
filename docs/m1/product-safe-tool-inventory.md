# Product-Safe Tool Inventory

English | [中文](product-safe-tool-inventory.zh.md)

**BEFORE:** [docs/baseline/harness-tool-inventory.md](../baseline/harness-tool-inventory.md) (M0, `standard` / `code` / `minimal`)
**AFTER:** product-safe profile on `product/m1-safe-harness`

Counts below are **model-visible / executable wire names** after a product-safe session is composed. Host-global `ctx.tools.schemas()` is empty of model tools; echo is preset-scoped.

## BEFORE (M0 default Web `standard`)

Dangerous or coding-adjacent wire names present in the default coding agent (see M0 inventory for the full table):

| Class | Count (approx.) | Names |
|---|---|---|
| Shell | 1 (POSIX) / 1 (win32) | `bash` / `pwsh` |
| Filesystem arbitrary | 6 | `read`, `read_image`, `write`, `edit`, `grep`, `glob` |
| Terminal | 0 on `standard`; 6+ on `minimal` | `terminal_*` on `minimal` |
| Code runtime | 1 on `code` | `run_code` |
| Skills / jobs / goals / plan / subagent / workflow / ralph / web | many | see M0 |
| Dynamic extension | `cordis` preset | `cordis_define` / `cordis_run` / … |

`minimal` also mounts Terminal. M1 does not reuse `minimal`.

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

Hostile `ctx.tools.execute({ name })` for historical aliases (`shell`, `exec`, `command`, `fs_read`, `workspace_read`, `install_plugin`, `extension`, plus M0 wire names) returns `isError` / `UNKNOWN_TOOL`. This is registration absence, not a system-prompt request.

## Difference

Product-safe removes every M0 default coding tool from the product runtime graph. It adds one fixture tool used only to prove static platform plugins still load. M2 may replace or delete that fixture.
