---
title: Terminal Emulator Stack — The Triple Layer Portagenty Has to Deal With
description: Terminal emulator vs multiplexer vs launcher — three distinct layers, each with their own escape codes, protocols, and opinions. Portagenty (my launcher) has to bridge multiplexers cleanly, which means I've started needing to actually understand what emulators/muxes expose. Capture of the questions + candidate answers; not canonical yet.
stratum: 5
status: research
date: 2026-04-18
tags:
  - terminal
  - portagenty
  - zellij
  - tmux
  - wezterm
  - ghostty
  - research
---

## Why this is captured

Portagenty (my launcher — `github.com/cybersader/portagenty`) started out as "define sessions in TOML, launch over tmux or Zellij." That was simple. What's made it less simple: to reliably control sessions across multiplexers and survive over SSH + cross-device, I've had to actually understand the triple layer — terminal emulator, multiplexer, launcher — and how they talk to each other.

Stamping questions + partial answers so the thinking is retrievable when I next iterate on portagenty or when the stack docs get filled out.

## The three layers

> **Keystrokes flow top → bottom. First layer that matches a binding eats the key; lower layers never see it.** That's why hotkey conventions per layer matter.

<div style="border: 2px solid currentColor; padding: 1em; margin: 1em 0; background: rgba(128,128,128,0.04); border-radius: 6px;">
  <strong>Terminal Emulator</strong> &nbsp;·&nbsp; <small><strong>Hotkeys:</strong> <code>Ctrl+Shift+*</code>, <code>Super/Cmd+*</code>, <code>Alt+N</code></small><br/>
  <em>e.g. <a href="https://wezterm.org">WezTerm</a>, <a href="https://ghostty.org">Ghostty</a>, <a href="https://alacritty.org">Alacritty</a>, <a href="https://sw.kovidgoyal.net/kitty/">Kitty</a>, <a href="https://github.com/microsoft/terminal">Windows Terminal</a>, <a href="https://iterm2.com">iTerm2</a></em>
  <ul style="margin: 0.5em 0 1em 0;">
    <li>Owns the window, font rendering, GPU, input handling</li>
    <li>Speaks: ANSI/VT, OSC sequences, Sixel/Kitty graphics, OSC 52 clipboard, OSC 8 hyperlinks</li>
    <li>Local process on the box in front of your face</li>
    <li><strong>Claims keys first.</strong> Unhandled keys get encoded as escape sequences and forwarded ↓</li>
  </ul>
  <div style="border: 2px solid currentColor; padding: 1em; margin: 0.5em 0; background: rgba(128,128,128,0.08); border-radius: 6px;">
    <strong>Multiplexer</strong> &nbsp;·&nbsp; <small><strong>Hotkeys:</strong> prefix key (<code>Ctrl+B</code> tmux, <code>Ctrl+P</code> Zellij) + letter</small><br/>
    <em>e.g. <a href="https://zellij.dev">Zellij</a>, <a href="https://github.com/tmux/tmux">tmux</a>, <a href="https://www.gnu.org/software/screen/">GNU screen</a></em>
    <ul style="margin: 0.5em 0 1em 0;">
      <li>Owns sessions, panes, tabs, scrollback, detach</li>
      <li>Speaks: ANSI subset + control protocol (tmux control mode, Zellij actions)</li>
      <li>Runs on the remote (or local) box where the work lives</li>
      <li><strong>Sees what the emulator forwards.</strong> Matches a prefix combo? Handles it. Else forwards to the focused pane ↓</li>
    </ul>
    <div style="border: 2px solid currentColor; padding: 1em; margin: 0.5em 0; background: rgba(128,128,128,0.12); border-radius: 6px;">
      <strong>Launcher / Session Manager</strong> &nbsp;·&nbsp; <small><strong>Hotkeys:</strong> none at runtime (spawn-and-exit, not interactive)</small><br/>
      <em>e.g. <a href="https://github.com/cybersader/portagenty">Portagenty</a>, <a href="https://github.com/joshmedeski/sesh">sesh</a>, <a href="https://github.com/tmuxinator/tmuxinator">tmuxinator</a>, <a href="https://github.com/ivaaaan/smug">smug</a>, <a href="https://github.com/ajeetdsouza/zoxide">zoxide</a> (adjacent)</em>
      <ul style="margin: 0.5em 0 1em 0;">
        <li>Owns session inventory + session intent</li>
        <li>Speaks: shells out to multiplexer CLI OR uses its control protocol</li>
        <li>"take me to project X" as one verb</li>
      </ul>
      <div style="border: 2px solid currentColor; padding: 0.8em 1em; margin: 0.5em 0 0 0; background: rgba(128,128,128,0.18); border-radius: 6px;">
        <strong>Shell / App</strong> &nbsp;·&nbsp; <small><strong>Hotkeys:</strong> <code>Ctrl+letter</code> (readline/emacs), <code>Alt+letter</code>, single-mod combos</small><br/>
        <em>e.g. <a href="https://www.gnu.org/software/bash/">bash</a>, <a href="https://www.zsh.org/">zsh</a>, <a href="https://fishshell.com/">fish</a>, <a href="https://claude.com/claude-code">Claude Code</a>, <a href="https://opencode.ai">OpenCode</a>, <a href="https://neovim.io/">Neovim</a></em>
      </div>
    </div>
  </div>
</div>

Each layer has its own escape-sequence vocabulary and its own trust/permission model. An agent running inside the shell may emit an escape that only the emulator (top) can act on — e.g., OSC 52 to copy to the host clipboard — and that escape has to traverse the multiplexer cleanly without being swallowed or rewritten.

### Hotkey conflict zones

Overlaps burn people when two layers want the same key. Classic examples:

| Key | Who wants it | Typical fix |
|---|---|---|
| `Ctrl+P` | bash history-prev · Zellij pane-mode · vim fuzzy-find | Rebind Zellij's prefix, or the app |
| `Ctrl+D` | shell EOF · Zellij close-pane | Zellij confirm-on-close, or rebind |
| `Ctrl+Tab` | WezTerm tab-switch · some editors | Emulator usually wins; prefer `Alt+N` |
| `Ctrl+A` | bash start-of-line · tmux default prefix | Change tmux prefix to `Ctrl+B` or `Ctrl+Space` |

**Rule of thumb:** each layer picks a modifier pattern the layers below don't touch. Emulator = `Ctrl+Shift+*` / `Alt+N`. Multiplexer = dedicated prefix key. Shell/app = everything else.

## Tools in each layer

### Terminal emulators (layer 1)

| Tool | Link | Platform | Notable for agentic work |
|---|---|---|---|
| WezTerm | [wezterm.org](https://wezterm.org) | Win / Mac / Linux | Mature ConPTY, strong OSC 52, Lua config |
| Ghostty | [ghostty.org](https://ghostty.org) | Mac / Linux (Win coming) | Fast, Kitty keyboard protocol, modern defaults |
| Alacritty | [alacritty.org](https://alacritty.org) | Win / Mac / Linux | Minimal, GPU, no tabs/splits (rely on mux) |
| Kitty | [sw.kovidgoyal.net/kitty](https://sw.kovidgoyal.net/kitty/) | Mac / Linux | Best image protocol; defines Kitty keyboard protocol |
| Windows Terminal | [github.com/microsoft/terminal](https://github.com/microsoft/terminal) | Windows | Default WSL landing pad; improving but thin config |
| iTerm2 | [iterm2.com](https://iterm2.com) | Mac | Rich feature set; inline image protocol |
| Warp | [warp.dev](https://www.warp.dev) | Win / Mac / Linux | AI-native; vendor lock-in caveats |

### Multiplexers (layer 2)

| Tool | Link | Notes |
|---|---|---|
| Zellij | [zellij.dev](https://zellij.dev) | Rust, discoverable keybindings (status bar), KDL config — **my primary** |
| tmux | [github.com/tmux/tmux](https://github.com/tmux/tmux) | Universal, oldest stable, bidirectional control mode (`tmux -CC`) |
| GNU screen | [gnu.org/software/screen](https://www.gnu.org/software/screen/) | Oldest; pre-installed on many servers |
| abduco / dvtm | [brain-dump.org/projects/abduco](https://www.brain-dump.org/projects/abduco/) | Minimal attach-detach only; pair with dvtm for tiling |

### Launchers / session managers (layer 3)

| Tool | Link | Notes |
|---|---|---|
| Portagenty | [github.com/cybersader/portagenty](https://github.com/cybersader/portagenty) | **Mine.** TOML-defined workspaces, multi-backend, `pa claim` cross-device |
| sesh | [github.com/joshmedeski/sesh](https://github.com/joshmedeski/sesh) | Popular tmux-first smart session picker |
| tmuxinator | [github.com/tmuxinator/tmuxinator](https://github.com/tmuxinator/tmuxinator) | Ruby; YAML layouts for tmux |
| smug | [github.com/ivaaaan/smug](https://github.com/ivaaaan/smug) | Go; tmuxinator-like without Ruby |
| tmuxifier | [github.com/jimeh/tmuxifier](https://github.com/jimeh/tmuxifier) | Shell-based; layout templates |
| zoxide | [github.com/ajeetdsouza/zoxide](https://github.com/ajeetdsouza/zoxide) | Adjacent: directory jumper, not a session manager, but often chained in |

### Shells and apps (layer 4)

| Tool | Link | Role |
|---|---|---|
| bash | [gnu.org/software/bash](https://www.gnu.org/software/bash/) | Default shell almost everywhere |
| zsh | [zsh.org](https://www.zsh.org/) | Feature-rich alt; default on macOS |
| fish | [fishshell.com](https://fishshell.com/) | User-friendly; non-POSIX defaults |
| Claude Code | [claude.com/claude-code](https://claude.com/claude-code) | Anthropic's CLI coding agent (lives in the shell) |
| OpenCode | [opencode.ai](https://opencode.ai) | Open-source agent CLI with recursive sub-agents |
| Neovim | [neovim.io](https://neovim.io/) | Editor; typical target of mux pane arrangements |

## The escape-sequence surface area that actually matters

For an agentic setup, the escapes/protocols that carry load:

| Protocol | What it does | Who must support | Who breaks it |
|---|---|---|---|
| **OSC 52** | Copy text from remote shell → local clipboard | Emulator (WezTerm ✓, Ghostty ✓, Alacritty ✓, WT ✓); mux must pass-through | tmux disables by default (needs `set -g set-clipboard on`); some emulators gate it |
| **OSC 8** | Clickable hyperlinks in terminal | Emulator (most modern ✓); mux must pass-through | Zellij historically swallowed; tmux 3.x passes through |
| **Sixel / Kitty graphics / iTerm2 images** | Inline images | Emulator-specific; protocol fragmentation | Multiplexers strip or mangle; Kitty protocol is cleanest |
| **Synchronized output (OSC 2026)** | Batch frame updates, no flicker | New-ish; emulator + app must both know | Few muxes relay it; emulators increasingly support |
| **Undercurl / styled underlines** | Richer diagnostics in editors | Modern emulators ✓ | Older tmux eats it |
| **True color (24-bit)** | Non-palette colors | All modern emulators ✓ | Some older tmux builds |
| **Bracketed paste** | Distinguish user-paste from typing | Universal-ish | Flaky in nested mux sessions |
| **Kitty keyboard protocol** | Unambiguous key reporting (Ctrl+Shift+letters, etc.) | Kitty, WezTerm (partial), Ghostty ✓; others no | Most mux + many emulators ignore it |
| **ConPTY nuances** | Windows' Conhost pseudoterminal | Windows Terminal, WSL shells | Anything assuming pure Unix PTY |

**Takeaway:** the "terminal emulator" choice is NOT cosmetic. It determines which agent-relevant features (image paste, clickable URLs, clipboard integration) actually work end-to-end.

## The Windows / WSL wrinkle

My primary setup: **Windows + WSL2**. That adds a layer:

<div style="display: flex; flex-direction: column; align-items: center; gap: 0.3em; margin: 1em 0;">
  <div style="border: 2px solid currentColor; padding: 0.7em 1.2em; border-radius: 6px; background: rgba(128,128,128,0.06); min-width: 55%; text-align: center;">
    <strong>Windows emulator</strong> <em>(WezTerm / Windows Terminal)</em>
  </div>
  <div style="font-size: 1.3em; line-height: 1;">↓ <em style="font-size: 0.65em;">(ConPTY)</em></div>
  <div style="border: 2px solid currentColor; padding: 0.7em 1.2em; border-radius: 6px; background: rgba(128,128,128,0.06); min-width: 55%; text-align: center;">
    <strong>WSL2 Linux shell</strong>
  </div>
  <div style="font-size: 1.3em; line-height: 1;">↓</div>
  <div style="border: 2px solid currentColor; padding: 0.7em 1.2em; border-radius: 6px; background: rgba(128,128,128,0.06); min-width: 55%; text-align: center;">
    <strong>Multiplexer</strong> <em>(Zellij / tmux inside WSL)</em>
  </div>
  <div style="font-size: 1.3em; line-height: 1;">↓</div>
  <div style="border: 2px solid currentColor; padding: 0.7em 1.2em; border-radius: 6px; background: rgba(128,128,128,0.06); min-width: 55%; text-align: center;">
    <strong>Shell + agent</strong> <em>(bash + Claude Code)</em>
  </div>
</div>

ConPTY has improved a lot but still has edges around:
- VT sequence translation (some emulator-native escapes get rewritten)
- Clipboard integration (OSC 52 from WSL → Windows clipboard is emulator-dependent)
- Title/tab updates (who owns the window title string?)
- Image protocols (Sixel via ConPTY is finicky)

**Portagenty lives in the WSL side** (Linux binary), but the user's keystroke first hits the Windows emulator. That's why WezTerm pairs well — mature ConPTY, good OSC 52, Lua config that lets me tune edge cases.

## What portagenty has to care about

The reason portagenty started needing to "get into" terminals/muxes:

1. **Session inventory that survives** — find running sessions across muxes. Zellij: `zellij list-sessions`; tmux: `tmux ls`. Abstraction layer needed.
2. **Attach across machines** — `pa claim` over SSH. Requires the mux to be running on the remote *and* the SSH client to forward what's needed (agent socket for ssh-forwarded clipboard, TERM value sanity, etc.).
3. **Spawn-with-intent** — "open a session for project X with these panes." Zellij has `zellij action new-pane ...` and layouts (KDL); tmux has `new-session -d` + `send-keys`. Fundamentally different APIs, same intent.
4. **Control protocol vs CLI** — tmux control mode (`tmux -CC`) is a real bidirectional protocol; Zellij's action CLI is fire-and-forget. Cross-compat requires choosing the lowest common denominator (CLI) OR specializing per backend.
5. **Clipboard bridging** — if portagenty spawns a session over SSH, ensuring OSC 52 round-trips requires coordinated emulator + mux config.

Each of these leaks abstraction: portagenty can't just "launch a session" — it has to know *which* mux, *which* version, *which* emulator's on the other end.

## Open questions

- **Should portagenty own a session manifest that describes the whole stack?** Not just "zellij session `agentic-workflow`" but "zellij ≥ 0.40 inside WezTerm on Windows, over SSH to WSL host X, with clipboard-bridge expected." Too verbose? Or the honest description?
- **Is terminal multiplexing on its way out for agent workflows?** OpenCode's (former) background agents + Claude Code's task tool + git worktrees do some of what "many panes in a mux" does. Parallel agents may not need visible panes at all — just filesystem results.
- **Ghostty is rapidly maturing.** When does it eclipse WezTerm on Windows (if ever — currently WezTerm wins there)?
- **What's the right pane layout for agentic work?** One agent + editor + logs? Two agents side-by-side? Persistent vs ephemeral panes? Probably a pattern worth capturing once I've iterated.

## Candidate destinations

- `02-stack/02-terminal/` — the tier-2 stack section already exists; could gain:
  - `emulator-comparison.md` — the feature matrix table above, trimmed + concrete
  - `mux-over-ssh.md` — the clipboard / TERM / ConPTY path
  - `portagenty-on-this-stack.md` — how portagenty composes on top
- `02-stack/patterns/` — cross-device SSH pattern already exists; could extend with "terminal protocol pass-through checklist."
- **Portagenty repo itself** — some of this is really portagenty's concern (the "what does this launcher abstract over" discussion). An ADR in `cybersader/portagenty` covering "mux backends as plugins" might be the honest home.

## See also

- [`02-stack/02-terminal/index.md`](/agentic-workflow-and-tech-stack/stack/02-terminal/) — the current stack-level terminal page (Zellij / tmux / Portagenty picks + tradeoffs table)
- [`02-stack/patterns/cross-device-ssh.md`](/agentic-workflow-and-tech-stack/stack/patterns/cross-device-ssh/) — adjacent pattern
- Portagenty repo: `github.com/cybersader/portagenty`
- WezTerm docs on OSC 52 + ConPTY behavior
- Kitty keyboard protocol spec (sw.kovidgoyal.net/kitty/keyboard-protocol/)
- Sixel vs Kitty graphics vs iTerm2 inline images — fragmentation worth a post of its own
