---
title: bashrc snippets
description: Sourceable shell helpers — Claude Code aliases, Zellij session shortcuts, OSC 7 cwd reporting, flow-control, tmux helpers.
stratum: 4
status: stable
tags:
  - stack
  - bash
  - shell
  - helpers
date: 2026-04-18
branches: [agentic]
---

Modular bashrc additions. Each file is a drop-in — source it from `~/.bashrc` to get its helpers.

| File | What it provides |
|---|---|
| [`claude-code-helpers.sh`](https://github.com/cybersader/agentic-workflow-and-tech-stack/blob/main/02-stack/profiles/bashrc-snippets/claude-code-helpers.sh) | `cc`, `ccy`, `ccr`, `ccry` — Claude CLI shortcuts with resume + skip-permissions variants |
| [`zellij-helpers.sh`](https://github.com/cybersader/agentic-workflow-and-tech-stack/blob/main/02-stack/profiles/bashrc-snippets/zellij-helpers.sh) | `z <name>`, `zk`, `zl`, `zd`, `zfix` — Zellij session management |
| [`tmux-helpers.sh`](https://github.com/cybersader/agentic-workflow-and-tech-stack/blob/main/02-stack/profiles/bashrc-snippets/tmux-helpers.sh) | tmux equivalents for when Zellij isn't available |
| [`opencode-helpers.sh`](https://github.com/cybersader/agentic-workflow-and-tech-stack/blob/main/02-stack/profiles/bashrc-snippets/opencode-helpers.sh) | OpenCode CLI shortcuts |
| [`osc7-cwd.sh`](https://github.com/cybersader/agentic-workflow-and-tech-stack/blob/main/02-stack/profiles/bashrc-snippets/osc7-cwd.sh) | OSC 7 working-directory reporting for clone-tab-at-cwd in terminal emulators |
| [`flow-control.sh`](https://github.com/cybersader/agentic-workflow-and-tech-stack/blob/main/02-stack/profiles/bashrc-snippets/flow-control.sh) | Flow-control tweaks — disable Ctrl+S/Ctrl+Q freeze |

## Install

```bash
# Add to ~/.bashrc on a machine that has this repo checked out:
REPO=/path/to/agentic-workflow-and-tech-stack   # wherever you checked it out
source "$REPO/02-stack/profiles/bashrc-snippets/claude-code-helpers.sh"
source "$REPO/02-stack/profiles/bashrc-snippets/zellij-helpers.sh"
source "$REPO/02-stack/profiles/bashrc-snippets/osc7-cwd.sh"
```

Or curl to a hostless machine:

```bash
curl -o ~/.claude-helpers.sh https://raw.githubusercontent.com/cybersader/agentic-workflow-and-tech-stack/main/02-stack/profiles/bashrc-snippets/claude-code-helpers.sh
echo 'source ~/.claude-helpers.sh' >> ~/.bashrc
```

## See also

- [My terminal stack](../../02-terminal/stack/) — where these aliases get used
- [Rebuild flow → 03 Shell Helpers](#private-reference) — full install walkthrough
