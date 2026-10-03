---
title: WezTerm config — agentic workflows
description: Fast tab switching, one-key SSH bootstrap, clone-tab-at-remote-cwd. Emulator-layer config for the stratum-2 terminal stack.
stratum: 2
status: stable
tags:
  - wezterm
  - keybindings
  - terminal
  - ssh
date: 2026-04-18
branches: [agentic]
---

Emulator-layer Lua config tuned for **SSH'd-into-desktop agentic workflows**.

## What it gives you

| Key | Action |
|---|---|
| `Alt+1..9` | Jump to tab N instantly |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Next / prev tab |
| `Ctrl+Shift+Space` | Fuzzy tab picker |
| `Ctrl+Shift+D` | **New tab → `ssh -t desktop pa`** (one-key bootstrap) |
| `Ctrl+Shift+Enter` | **Clone this tab at the current cwd** — works over SSH via OSC 7 |
| `Ctrl+Shift+L` | Launcher menu (pre-configured workspace entries) |
| `Ctrl+Shift+P` | Command palette (searchable, shows every binding) |
| `Ctrl+Shift+T` / `Ctrl+Shift+W` | New / close tab |
| `Ctrl+Shift+C` / `Ctrl+Shift+V` | Copy / paste |
| `Ctrl+Shift+X` | Copy mode (vim-like scrollback selection) |
| `Ctrl+Shift+F` | Search scrollback |
| `Ctrl+Shift+R` | Reload this config |

## Install

### Windows

```powershell
# Option A: symlink (recommended — future edits propagate)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.wezterm.lua" `
  -Target "C:\path\to\agentic-workflow-and-tech-stack\02-stack\profiles\keybindings\wezterm\wezterm.lua"

# Option B: plain copy
Copy-Item ".\wezterm.lua" "$env:USERPROFILE\.wezterm.lua"
```

### WSL / Linux / Mac

```bash
ln -sf "/path/to/agentic-workflow-and-tech-stack/02-stack/profiles/keybindings/wezterm/wezterm.lua" \
  ~/.wezterm.lua
```

## Prerequisites (for the clone-tab trick to work)

### 1. OSC 7 in your remote shell

The "clone tab at current cwd" binding reads the remote shell's reported working directory via the OSC 7 escape sequence. Without this, cloning falls back to a default-shell tab.

Add the snippet from [`../../bashrc-snippets/osc7-cwd.sh`](../../bashrc-snippets/osc7-cwd.sh) to your `~/.bashrc` on the **remote** machine (your desktop).

### 2. SSH ControlMaster (so every new tab is instant)

Without this, every `Ctrl+Shift+D` re-authenticates — slow. With it, the first SSH authenticates and subsequent ones reuse the connection.

Add to `~/.ssh/config` on your **laptop**:

```
Host desktop
  HostName <your-desktop-tailscale-or-lan>
  User <your-user>
  ControlMaster auto
  ControlPath ~/.ssh/cm-%r@%h:%p
  ControlPersist 10m
```

Make sure `~/.ssh/` exists and has sane perms (`chmod 700 ~/.ssh`).

### 3. Update the SSH host alias

Replace `desktop` in `wezterm.lua` with your actual SSH alias. Search for `'desktop'` in the file.

## Customize for your workspaces

In `wezterm.lua`, find `config.launch_menu` and add one entry per workspace:

```lua
config.launch_menu = {
  { label = 'desktop → pa (TUI)',  args = { 'ssh', '-t', 'desktop', 'pa' } },
  { label = 'agentic-workflow',    args = { 'ssh', '-t', 'desktop', 'pa', 'launch', 'agentic-workflow' } },
  { label = 'cynario',             args = { 'ssh', '-t', 'desktop', 'pa', 'launch', 'cynario' } },
  { label = 'portagenty',          args = { 'ssh', '-t', 'desktop', 'pa', 'launch', 'portagenty' } },
}
```

Then `Ctrl+Shift+L` opens the picker.

## Why these specific bindings

See [02-stack / 02-terminal / hotkey-reference.md](../../../02-terminal/hotkey-reference.md) for the layer-precedence model. Short version:

- Emulator claims `Ctrl+Shift+*` and `Alt+N` — Zellij and shells don't use these patterns, so no conflicts.
- `Ctrl+Shift+Enter` is unusual; deliberately so (nothing else wants it).
- Tab jumps use `Alt+N` not `Ctrl+N` — `Ctrl+N` conflicts with bash readline.

## Conflict notes

- `Ctrl+Tab` is claimed by the emulator; editors (vim, nvim) won't see it.
- `Alt+B` / `Alt+F` (bash word-nav) are NOT bound here — reserved for the shell.
- If you use Zellij with its default `Ctrl+P` pane mode, be aware WezTerm doesn't bind `Ctrl+P` — Zellij gets it.

## See also

- [Hotkey reference](../../../02-terminal/hotkey-reference.md) — all layers, all tools
- [Terminal emulator stack research](../../../../agent-context/zz-research/2026-04-18-terminal-emulator-stack.md) — why this layering matters
- [opencode-zellij profile](../opencode-zellij/) — multiplexer-layer companion config
- [Portagenty](https://github.com/cybersader/portagenty) — the launcher that `Ctrl+Shift+D` invokes
