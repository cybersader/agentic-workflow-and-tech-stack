---
title: 02 · Terminal & Session Management
description: Zellij (primary) + tmux (fallback) + Portagenty (my launcher) — the terminal substrate that makes agentic coding sessions survive disconnects and span devices.
stratum: 2
status: research
sidebar:
  order: 1
tags:
  - stack
  - terminal
  - zellij
  - tmux
  - portagenty
date: 2026-04-17
branches: [agentic]
---

> **Looking for the quick answer?** Jump to [stack.md](./stack.md) — one-page summary of the picks at every layer (emulator through shell) with the layer diagram. This page is the deeper "why" for the mux + launcher layers.
>
> **Looking for keybindings?** See [hotkey-reference.md](./hotkey-reference.md) — full keymaps for every tool.

## The pattern (stratum 2)

An AI coding session can last hours. It should survive:

- **Network drops** — momentary disconnect shouldn't kill the conversation
- **Device switches** — start on desktop, continue on phone via SSH
- **Multiple projects** — jump between projects without losing any session
- **Pane arrangements** — editor, terminal with Claude, logs, all visible

A terminal multiplexer is how this happens. It decouples "the session" from "the current shell process." Pick one, standardize it, build muscle memory around its keybindings, and the rest of the stack composes onto it.

## My current picks

### Primary: Zellij

- **Why primary:** modern Rust implementation, discoverable keybindings (status bar shows shortcuts), floating panes, tabs with native visuals, works cleanly over SSH with Termux, works with OpenCode and Claude Code alike.
- **Tradeoff:** less universal installed-base than tmux; configs don't transfer.
- **Install:** `cargo install zellij` or prebuilt binary from GitHub releases.
- **Config:** `~/.config/zellij/config.kdl`.

### Fallback: tmux

- **Why fallback:** universally installed, battle-tested, works anywhere. Some tools (OpenCode in particular) have historically had quirks inside tmux — worth noting if you go that route.
- **Install:** `apt install tmux` or equivalent.
- **Config:** `~/.tmux.conf`.

### Launcher on top: Portagenty

- **Repo:** [github.com/cybersader/portagenty](https://github.com/cybersader/portagenty)
- **What it is:** a terminal-native TUI launcher I built for agent workspaces. Define sessions in TOML, launch over tmux or Zellij, hop between devices with `pa claim`. Single static Rust binary.
- **Why built:** the default flow — manually spawning Zellij sessions, remembering project paths, reattaching by session name — didn't scale when I had many projects. Portagenty makes "get me back to project X" a one-key action.
- **Status:** active personal tool, used daily.

## Tradeoffs

| Dimension | Zellij | tmux | WezTerm |
|---|---|---|---|
| Install ubiquity | Newer, requires install | Pre-installed everywhere | Must install |
| Modifier conventions | Ctrl + letter (status bar shown) | Ctrl+B prefix (hidden) | Native macOS-like shortcuts |
| Plugin ecosystem | Growing | Huge, stable | Tied to WezTerm itself |
| OpenCode compatibility | Works well | Historical issues | Works |
| Keybinding editing | KDL config | tmux.conf | Lua config |
| Over-SSH behavior | Good | Excellent (oldest) | N/A (terminal, not mux) |
| Cross-device session | Yes (zellij attach) | Yes (tmux attach) | No (local only) |

**Default pick if you're starting fresh:** Zellij. The discoverability alone saves hours of keybinding reference lookups.

**Keep using tmux if:** you already have years of tmux muscle memory. No reason to switch for its own sake.

## Why not WezTerm for session-mux?

WezTerm is a great terminal emulator (my preferred one on Windows/Linux). Its native multiplexer is **local-only** — not designed for cross-device SSH reattach. Zellij/tmux sit *inside* WezTerm (or any terminal) and handle the session layer; WezTerm handles the emulator layer.

## Key bashrc / shell helpers

These live in [`../profiles/bashrc-snippets/zellij-helpers.sh`](../profiles/bashrc-snippets/zellij-helpers.sh) and related files. Short names; long type-savings:

| Helper | What it does |
|---|---|
| `z <name>` | cd into project + attach to its Zellij session (or create) |
| `zk <name>` | kill session |
| `zl` | list sessions |
| `zr <name>` | resurrect a dead session |
| `zd` | detach current |
| `zfix` | reset a broken session |
| `cc` | `claude` with permission prompts (default) |
| `ccy` | `claude --dangerously-skip-permissions` (quick iteration on trusted tasks) |
| `ccr` | resume the most recent Claude session |
| `ccp` | `claude --continue` with parent project detection |

These assume Zellij + Claude Code are both installed. Copy the snippets into `~/.bashrc` (the [rebuild flow](#private-reference) does this during setup).

## Portagenty in detail

Portagenty's core model:

```toml
# ~/.portagenty/workspaces.toml

[[workspace]]
name = "agentic-workflow"
path = "/path/to/agentic-workflow-and-tech-stack"   # wherever you checked out this repo
launcher = "zellij"
session_name = "agentic-workflow"
on_attach = ["claude --continue"]

[[workspace]]
name = "cynario"
path = "/path/to/cynario"
launcher = "zellij"
```

Running `pa` → select workspace → lands me in the right directory with the right session ready. `pa claim` transfers session ownership between devices when I SSH in.

### `pa convos` — Claude Code session bridge across path changes

Portagenty ships a sibling `pa convos` shim that forwards to the standalone
[`pconv`](https://github.com/cybersader/portaconv) binary with the current
workspace TOML auto-injected. Claude Code keys conversation history to the
absolute cwd path at launch, so `/resume` goes blind whenever that path
changes: moving or renaming a project folder, checking it out at a new path,
or switching between WSL (`/mnt/c/…`) and PowerShell (`C:\…`) all produce
separate encoded buckets under `~/.claude/projects/`. Session bodies also bake
in OS-specific absolute paths, so file-level copy/symlink merges storage but
not content. `pconv` reads every bucket and can rewrite paths
(`/mnt/c/…` ↔ `C:\…`) so a dump from the old cwd pastes cleanly into a fresh
session at the new one. Deep dive in [01 · AI Coding — Session recovery across path changes](../01-ai-coding/#session-recovery-across-path-changes-portaconv).

## Install pointers

| Tool | Command |
|---|---|
| Zellij | `cargo install zellij` or [release binary](https://github.com/zellij-org/zellij/releases) |
| tmux | `apt install tmux` / `brew install tmux` |
| Portagenty | See [portagenty README](https://github.com/cybersader/portagenty) |
| portaconv (`pconv`) | `cargo install --git https://github.com/cybersader/portaconv` — see [portaconv README](https://github.com/cybersader/portaconv) |
| WezTerm | [wezterm.org/install/](https://wezterm.org/install/linux.html) |

## Integration with the rest of the stack

| Serves | With |
|---|---|
| [01 · AI Coding CLIs](../01-ai-coding/) | Survives the long sessions these CLIs run |
| [03 · Cross-Device](../03-cross-device/) | Zellij session survives SSH disconnect; Termux reattaches |

## Deep dives

- [Recommended terminal stack](./stack.md) — the full layer-stack picks on one page with a diagram
- [Hotkey reference](./hotkey-reference.md) — defaults + recommended keys across every tool
- [Terminal emulator stack research](../../agent-context/zz-research/2026-04-18-terminal-emulator-stack.md) — the layer model, protocols, and Windows/WSL wrinkles
- [Zellij + OpenCode profile](../profiles/keybindings/opencode-zellij/) — mux-layer config
- [WezTerm profile (upgrade path)](../profiles/keybindings/wezterm/) — emulator-layer config with `Ctrl+Shift+D` SSH bootstrap and clone-tab-at-cwd
- [OSC 7 bashrc snippet](../profiles/bashrc-snippets/osc7-cwd.sh) — remote shell reports cwd so the emulator can clone tabs at the right path
- Portagenty docs: [github.com/cybersader/portagenty](https://github.com/cybersader/portagenty)
