---
date: 2024-12-28
type: insight
target: installation, opencode, oh-my-opencode
priority: high
status: stable
tags:
  - opencode
  - oh-my-opencode
  - installation
  - troubleshooting
  - wsl
source: testing session
---

# Insight: OpenCode Installation Gotchas

## Discovery

While testing the workflow quick start, encountered multiple installation issues with OpenCode and oh-my-opencode.

## Issue 1: Two Different OpenCode Projects

There are TWO separate projects both called "OpenCode":

| Project | Versions | Repository | Status |
|---------|----------|------------|--------|
| `sst/opencode` | v1.x | github.com/sst/opencode | Current, required |
| `opencode-ai/opencode` | v0.x | github.com/opencode-ai/opencode | Legacy, won't work |

**Problem:** The old install command `curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | bash` installs v0.x which is incompatible with oh-my-opencode.

**Solution:** Use `curl -fsSL https://opencode.ai/install | bash` which installs sst/opencode v1.x.

## Issue 2: bunx vs bun x

On Linux/WSL, `bunx` command fails with "Script not found" but `bun x` (with space) works.

```bash
bunx oh-my-opencode install      # FAILS
bun x oh-my-opencode install     # WORKS
```

**Cause:** Known bun bug on Linux: https://github.com/oven-sh/bun/issues/21583

## Issue 3: oh-my-opencode PATH Detection

Even with OpenCode v1.x properly installed and in PATH, `bun x oh-my-opencode install` says "OpenCode is not installed."

**Cause:** oh-my-opencode's installer runs in a sandboxed bun environment that doesn't inherit the full shell PATH.

**Workaround:** Install from INSIDE OpenCode:

```bash
cd ~
opencode
# Then paste:
# Install and configure by following the instructions here https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/refs/heads/master/README.md
```

This lets OpenCode's agent handle the installation, bypassing PATH issues.

## Issue 4: notify-send on WSL

oh-my-opencode tries to send desktop notifications using `notify-send`, which doesn't exist in WSL.

**Fix:** Disable in `.opencode/oh-my-opencode.json`:
```json
{
  "notifications": false
}
```

## Documentation Updates

- Updated README.md Quick Start with clearer one-time vs per-project distinction
- Updated docs/01-initial-setup.md with Prerequisites and OpenCode sections
- Added troubleshooting entries for all issues above

## Related

- [oh-my-opencode GitHub](https://github.com/code-yeongyu/oh-my-opencode)
- [sst/opencode GitHub](https://github.com/sst/opencode)
- [bun bunx bug](https://github.com/oven-sh/bun/issues/21583)
