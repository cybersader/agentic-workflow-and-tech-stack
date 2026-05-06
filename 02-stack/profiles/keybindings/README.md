---
title: Keybinding profiles
description: Per-tool keybinding configs — Claude Code, OpenCode+Zellij, WezTerm. Symlink from your home dotfiles for instant consistent keys across machines.
stratum: 4
status: stable
tags:
  - stack
  - keybindings
  - terminal
date: 2026-04-18
branches: [agentic]
---

One directory per tool. Each holds the actual config file(s) you can symlink from your home directory.

| Profile | Target tool | What it ships |
|---|---|---|
| [`claude-code/`](./claude-code/) | Claude Code CLI | Custom keybindings for the Claude Code TUI |
| [`opencode-zellij/`](./opencode-zellij/) | OpenCode + Zellij + VS Code | KDL config for Zellij, VS Code `settings.json` + `keybindings.json` |
| [`wezterm/`](./wezterm/) | WezTerm emulator | `wezterm.lua` with fast tab switch, SSH bootstrap, clone-at-cwd |

## See also

- [Hotkey reference](../../02-terminal/hotkey-reference/) — defaults for every tool + onboarding path
- [Layer-precedence model](../../../agent-context/zz-research/2026-04-18-terminal-emulator-stack/) — how keys flow across emulator → mux → shell
