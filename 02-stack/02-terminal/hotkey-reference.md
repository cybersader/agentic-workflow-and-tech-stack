---
title: Hotkey Reference — Emulators, Multiplexers, Shells
description: Default and recommended keybindings for Windows Terminal, WezTerm, Kitty, Ghostty, Zellij, tmux — plus how to internalize them without feeling lost.
stratum: 2
status: stable
sidebar:
  order: 2
tags:
  - stack
  - terminal
  - hotkeys
  - wezterm
  - windows-terminal
  - zellij
  - tmux
date: 2026-04-18
branches: [agentic]
---

Keybindings for each layer of the terminal stack, plus an onboarding path that doesn't require memorizing everything day one.

> **Layer precedence:** keystrokes flow **emulator → multiplexer → shell/app**, first-claim-wins. See [terminal emulator stack research](../../agent-context/zz-research/2026-04-18-terminal-emulator-stack.md) for the full layer model.

---

## Emulator: Windows Terminal (defaults)

Free, pre-installed on modern Windows. Reconfigure in Settings → Actions or `settings.json`.

### Tabs

| Action | Key |
|---|---|
| New tab (default profile) | `Ctrl+Shift+T` |
| New tab from profile 1–9 | `Ctrl+Shift+1..9` |
| Close tab / pane | `Ctrl+Shift+W` |
| Next / prev tab | `Ctrl+Tab` / `Ctrl+Shift+Tab` |
| Jump to tab N | `Ctrl+Alt+1..9` |

### Panes (built-in, Windows-native)

| Action | Key |
|---|---|
| Split horizontal | `Alt+Shift+-` (minus) |
| Split vertical | `Alt+Shift+=` (plus) |
| Move between panes | `Alt+Arrow` |
| Resize pane | `Alt+Shift+Arrow` |

### Window / UI

| Action | Key |
|---|---|
| New window | `Ctrl+Shift+N` |
| **Command palette** (searchable) | `Ctrl+Shift+P` |
| Settings (GUI) | `Ctrl+,` |
| Settings (JSON file) | `Ctrl+Shift+,` |
| Zoom in / out | `Ctrl++` / `Ctrl+-` |
| Fullscreen | `F11` |

### Clipboard / find

| Action | Key |
|---|---|
| Copy / paste | `Ctrl+Shift+C` / `Ctrl+Shift+V` |
| Find in scrollback | `Ctrl+Shift+F` |

**Limitations for agentic work:**
- No "clone tab at current remote SSH cwd" equivalent.
- OSC 52 clipboard bridge from WSL → Windows is limited.
- Keybinding customization is JSON-only; no scripting.

---

## Emulator: WezTerm (defaults)

Highly configurable via `~/.wezterm.lua` (or `%USERPROFILE%\.wezterm.lua` on Windows). See [profiles/wezterm/](../profiles/keybindings/wezterm/) in this repo for my config.

### Tabs

| Action | Default key | Notes |
|---|---|---|
| New tab | `Ctrl+Shift+T` | |
| Close tab | `Ctrl+Shift+W` | |
| Next / prev tab | `Ctrl+Tab` / `Ctrl+Shift+Tab` | |
| Jump to tab N | `Ctrl+Shift+1..9` | Slower than my custom `Alt+1..9` |
| **Show tab navigator** (fuzzy pick) | `Ctrl+Shift+Space` (custom) | Very handy when you have many tabs |

### Panes (built-in, but most people use a multiplexer instead)

| Action | Default key |
|---|---|
| Split horizontal | `Ctrl+Shift+Alt+"` |
| Split vertical | `Ctrl+Shift+Alt+%` |
| Move between panes | `Ctrl+Shift+Arrow` |
| Close pane | `Ctrl+Shift+W` |

### Window / UI

| Action | Key |
|---|---|
| **Command palette** (searchable, all bindings) | `Ctrl+Shift+P` |
| **Launcher menu** (profiles + custom entries) | `Ctrl+Shift+L` |
| Show debug overlay | `Ctrl+Shift+L` + debug mode |
| Copy mode (vim-like selection) | `Ctrl+Shift+X` |
| Quick select (grab URLs / hashes with one keystroke) | `Ctrl+Shift+Space` |
| Reload config | `Ctrl+Shift+R` |

### Clipboard

| Action | Key |
|---|---|
| Copy / paste | `Ctrl+Shift+C` / `Ctrl+Shift+V` |

### Agentic-workflow value-adds (via Lua config)

These aren't defaults — they require config, but they're why WezTerm wins for this use case:

| Action | Suggested binding | What it does |
|---|---|---|
| Bootstrap SSH + `pa` | `Ctrl+Shift+D` | `ssh -t desktop pa` in a new tab |
| Clone tab at remote cwd | `Ctrl+Shift+Enter` | Re-SSHes and `cd`s to the pane's OSC-7 reported path |
| Named workspace launch | `Ctrl+Shift+L` → pick | Launch menu entry per workspace |

See the `profiles/wezterm/wezterm.lua` config for implementations.

---

## Emulator: Kitty (defaults)

Best keyboard-first emulator, but Windows/WSL story is weaker. Configuration via `~/.config/kitty/kitty.conf`.

### Tabs

| Action | Key |
|---|---|
| New tab | `Ctrl+Shift+T` |
| Close tab | `Ctrl+Shift+Q` |
| Next / prev tab | `Ctrl+Shift+]` / `Ctrl+Shift+[` |
| Jump to tab N | `Ctrl+Shift+1..9` |
| Rename tab | `Ctrl+Shift+Alt+T` |

### Windows (Kitty's term for splits within a tab)

| Action | Key |
|---|---|
| New window | `Ctrl+Shift+Enter` |
| Close window | `Ctrl+Shift+W` |
| Next / prev window | `Ctrl+Shift+.` / `Ctrl+Shift+,` |
| Jump to window N | `Ctrl+Shift+N+1..9` |

### Killer feature: remote control

```bash
# From any kitty-hosted shell:
kitty @ new-tab --cwd=current   # clones tab at the CURRENT directory, even over SSH
kitty @ launch --type=tab vim   # opens vim in a new tab
kitty @ ls                      # lists all tabs/windows as JSON
```

Set `allow_remote_control yes` in `kitty.conf`. Over SSH, Kitty multiplexes its control protocol through the same connection — no extra SSH needed.

### Command palette / search

| Action | Key |
|---|---|
| Show actions (searchable) | `Ctrl+Shift+F2` |
| Search scrollback | `Ctrl+Shift+F` |
| Copy mode | `Ctrl+Shift+H` |

---

## Emulator: Ghostty (defaults)

Newest of the bunch. Opinionated, minimal config. Configuration via `~/.config/ghostty/config`.

### Tabs

| Action | Key (macOS / Linux) |
|---|---|
| New tab | `Cmd+T` / `Ctrl+Shift+T` |
| Close tab | `Cmd+W` / `Ctrl+Shift+W` |
| Next / prev tab | `Cmd+Shift+]` / `Cmd+Shift+[` |
| Jump to tab N | `Cmd+1..9` / `Ctrl+1..9` |

### Splits

| Action | Key |
|---|---|
| Split right / down | `Cmd+D` / `Cmd+Shift+D` |
| Navigate between splits | `Cmd+Alt+Arrow` |
| Resize split | `Cmd+Shift+Arrow` |

### Window / UI

| Action | Key |
|---|---|
| New window | `Cmd+N` / `Ctrl+Shift+N` |
| Fullscreen | `Cmd+Ctrl+F` |
| Quick terminal (drop-down) | `Cmd+Shift+Space` |

### Status

- Windows support still nascent; Mac + Linux solid.
- No Lua. Config is a flat `key = value` file. Simpler, less flexible than WezTerm.

---

## Multiplexer: Zellij (defaults)

**Discoverable keybindings** — the status bar at the bottom always shows available keys for the current mode. Configuration in `~/.config/zellij/config.kdl`.

### Modes (Zellij-specific concept)

Zellij groups keybindings by mode. You enter a mode, then press a single-letter action, then Enter/Esc.

| Mode | Enter with | What it does |
|---|---|---|
| Normal | (default) | Type into the shell |
| Pane | `Ctrl+P` | Split / move / close panes |
| Tab | `Ctrl+T` | Create / navigate tabs |
| Resize | `Ctrl+N` | Resize panes |
| Scroll | `Ctrl+S` | Page up/down scrollback |
| Session | `Ctrl+O` | Session list / detach / quit |
| Move | `Ctrl+H` | Move panes/tabs around |
| Search | `Ctrl+F` | Search scrollback |

### Common actions (from Normal mode)

| Action | Key | Notes |
|---|---|---|
| Detach (keep session alive) | `Ctrl+O` → `d` | Survives SSH disconnect |
| Kill session | `Ctrl+O` → `w` → select | Nuke it |
| Split horizontal / vertical | `Ctrl+P` → `d` / `r` | |
| New tab | `Ctrl+T` → `n` | |
| Next / prev tab | `Ctrl+T` → `l` / `h` | Vim-like |
| Zoom pane (full screen) | `Ctrl+P` → `f` | |

### Shortcuts (bypass the mode dance)

Zellij also has direct combos for very common actions:

| Action | Key |
|---|---|
| Detach | `Ctrl+O` `d` |
| Close focused pane | `Ctrl+P` `x` |
| Toggle zoom | `Alt+F` |
| Next pane | `Alt+[`/`]` (configurable) |

### Session attach-detach

```bash
zellij ls                    # list sessions
zellij attach <name>         # attach existing
zellij attach -c <name>      # attach or create
zellij kill-session <name>   # kill
```

---

## Multiplexer: tmux (defaults)

**Prefix-key-based.** Press `Ctrl+B` (the prefix), let go, then press the action key. Configuration in `~/.tmux.conf`.

### Tabs (called "windows" in tmux)

| Action | Key |
|---|---|
| New window | `Ctrl+B` `c` |
| Close window | `Ctrl+B` `&` (prompt) |
| Next / prev window | `Ctrl+B` `n` / `p` |
| Jump to window N | `Ctrl+B` `1..9` |
| List windows | `Ctrl+B` `w` |
| Rename window | `Ctrl+B` `,` |

### Panes

| Action | Key |
|---|---|
| Split vertical | `Ctrl+B` `%` |
| Split horizontal | `Ctrl+B` `"` |
| Navigate panes | `Ctrl+B` Arrow |
| Close pane | `Ctrl+B` `x` |
| Toggle zoom | `Ctrl+B` `z` |
| Show pane numbers | `Ctrl+B` `q` |

### Session

| Action | Key / command |
|---|---|
| Detach | `Ctrl+B` `d` |
| List sessions | `Ctrl+B` `s` or `tmux ls` |
| Attach | `tmux attach -t <name>` |
| New session | `tmux new -s <name>` |

### Copy mode (scrollback + selection)

| Action | Key |
|---|---|
| Enter copy mode | `Ctrl+B` `[` |
| Exit | `q` |
| Search | `Ctrl+S` (forward) / `Ctrl+R` (back) |

**Common reconfiguration:** most people rebind prefix from `Ctrl+B` to `Ctrl+A` or `Ctrl+Space` for speed. Add to `~/.tmux.conf`:

```
unbind C-b
set -g prefix C-a
bind C-a send-prefix
```

---

## Shell: bash / zsh readline bindings

Shell-level bindings that survive through emulator + multiplexer. These conflict easily with multiplexer bindings if you're not careful.

| Action | Key |
|---|---|
| Start / end of line | `Ctrl+A` / `Ctrl+E` |
| Kill to end / start of line | `Ctrl+K` / `Ctrl+U` |
| Kill word backward / forward | `Ctrl+W` / `Alt+D` |
| Search history | `Ctrl+R` |
| History prev / next | `Ctrl+P` / `Ctrl+N` (or arrows) |
| Move by word | `Alt+B` / `Alt+F` |
| Clear screen | `Ctrl+L` |
| Paste yanked | `Ctrl+Y` |
| Undo | `Ctrl+_` |
| Cancel line | `Ctrl+C` |
| EOF / exit | `Ctrl+D` |

---

## How to get used to it (onboarding path)

You don't need to memorize 150 keybindings. Learn in layers, expand as friction points appear.

### Day 1 — five keys per tool

Emulator:
- `Ctrl+Shift+T` — new tab
- `Ctrl+Tab` — next tab
- `Ctrl+Shift+P` — **command palette** (your cheat sheet is always here)
- `Ctrl+Shift+C` / `Ctrl+Shift+V` — copy / paste

Multiplexer (Zellij specifically — it literally tells you the keys):
- `Ctrl+P` — enter pane mode, then the status bar shows you what each key does
- `Ctrl+O` `d` — detach (crucial for SSH workflows)
- `Ctrl+T` `n` — new tab

Shell:
- `Ctrl+R` — search history (life-changing)
- `Ctrl+A` / `Ctrl+E` — line nav
- `Ctrl+L` — clear screen

That's twelve keys. Drive with just these for a week.

### Day 3 — add the navigation accelerators

- `Alt+1..9` in emulator (if configured) — jump to tab by number
- `Ctrl+Shift+Space` (WezTerm) — fuzzy tab picker
- `Ctrl+W` (bash) — delete last word
- Zellij: learn `Alt+F` (toggle zoom pane) and `Alt+[` / `]` (cycle panes)

### Week 1 — add your workflow shortcuts

The big ergonomic wins are **custom**, not defaults:
- `Ctrl+Shift+D` → `ssh -t desktop pa` (bootstrap in one key)
- `Ctrl+Shift+Enter` → clone tab at current remote cwd
- Launch menu entries per workspace

See [profiles/wezterm/wezterm.lua](../profiles/keybindings/wezterm/) for reference implementations.

### Ongoing — use the command palette as your cheat sheet

Every modern emulator has one (`Ctrl+Shift+P` in WezTerm, Windows Terminal, most editors). **Type what you want to do, it shows you the binding.** You learn keys by encountering them in context, not by memorizing tables.

---

## Tips for not getting lost

| Symptom | Fix |
|---|---|
| "Which layer is eating my keys?" | Remember: emulator → mux → shell. First claim wins. Unbind from the wrong layer. |
| "I forgot the key for X" | Command palette (`Ctrl+Shift+P`). Or look up this page. |
| "Same key does different things depending on mode" | Zellij modes. Check the status bar; it shows the current mode's keys. |
| "Nothing works when I'm in Claude / vim" | The app is claiming the key. Send through with an escape layer key, or use the emulator's escape-passthrough config. |
| "My bindings vanish over SSH" | The emulator only sees local keys. Anything inside SSH is handled by the remote mux + shell. |

---

## See also

- [02-stack / 02-terminal / index.md](./index.md) — the stratum-2 terminal picks (Zellij + tmux + Portagenty)
- [03-work / agent-context / terminal emulator stack research](../../agent-context/zz-research/2026-04-18-terminal-emulator-stack.md) — the layer model
- [profiles / keybindings / opencode-zellij](../profiles/keybindings/opencode-zellij/) — my Zellij + OpenCode config
- [profiles / wezterm](../profiles/keybindings/wezterm/) — WezTerm Lua config (once written)
- Official docs: [WezTerm](https://wezterm.org/config/keys.html) · [Windows Terminal](https://learn.microsoft.com/en-us/windows/terminal/customize-settings/actions) · [Zellij](https://zellij.dev/documentation/keybindings) · [tmux](https://github.com/tmux/tmux/wiki/Getting-Started)
