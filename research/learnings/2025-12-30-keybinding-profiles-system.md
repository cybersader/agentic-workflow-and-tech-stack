---
date: 2025-12-30
tags:
  - keybindings
  - profiles
  - zellij
  - vscode
  - terminal
  - opencode
---

# Keybinding Profiles System

## Discovery

When using TUI apps (OpenCode, vim) inside terminal multiplexers (Zellij, tmux) inside VS Code, keybinding conflicts are inevitable. Each layer intercepts keys before the next layer sees them.

## The Problem

```
Keystroke Journey:
Keyboard → OS → VS Code → Terminal Emulator → Multiplexer → Shell → Application
                  ↑              ↑               ↑
              Intercepts     Intercepts      Intercepts
              Ctrl+G, Q, S   Ctrl+O, B       Ctrl+G (in normal mode)
```

Common conflicts:
- **Ctrl+S** — VS Code save vs shell XOFF (freezes terminal)
- **Ctrl+Q** — VS Code quit vs shell XON
- **Ctrl+G** — VS Code "Go to Line" vs Zellij unlock

## Solution: Layered Profile System

Created `profiles/` directory with pre-configured settings for each layer:

### Layer 1: Shell (bashrc)
```bash
stty -ixon  # Disable flow control, frees Ctrl+S/Q
```

### Layer 2: Multiplexer (Zellij)
```kdl
default_mode "locked"  # Keys pass to app by default
keybinds {
    locked { bind "Ctrl g" { SwitchToMode "Normal"; } }
}
```

### Layer 3: VS Code
```json
{
  "terminal.integrated.sendKeybindingsToShell": true,
  "terminal.integrated.allowChords": false
}
```

Plus keybindings to unbind Ctrl+G/Q/S when terminal focused.

## Key Insight: Locked Mode by Default

The breakthrough was configuring Zellij in **locked mode by default**:
- All keys pass through to the application (OpenCode)
- Press Ctrl+G to "unlock" for Zellij commands
- Press Esc or Ctrl+G again to re-lock

This eliminates most conflicts without needing the autolock plugin.

## OpenCode Smart Session Matcher

### The Problem
OpenCode's `-c` (continue) flag continues the **global last session**, not per-directory. See [GitHub #4378](https://github.com/sst/opencode/issues/4378). This breaks multi-project workflows.

### Our Solution
Sessions are stored at `~/.local/share/opencode/storage/session/global/*.json` with `directory` metadata. We built smart helpers that match sessions to `$PWD`:

| Command | Behavior |
|---------|----------|
| `o` | **Smart picker** — lists sessions for current directory, uses fzf if available |
| `oc` | **Quick continue** — continues most recent session for current directory |
| `on` | Start fresh (skip picker) |

**Picker keybindings (with fzf):**

| Key | Action |
|-----|--------|
| `Enter` | Continue selected session |
| `Ctrl-N` | New session (prompts for task description) |
| `ESC` | Cancel (do nothing) |

When starting a new session, you can optionally describe your task - this becomes the session title.

### Dependencies
- **jq** (required) — JSON parsing for session metadata
- **fzf** (optional) — prettier fuzzy picker UI

### How It Works
```bash
# Finds sessions matching current directory
grep -l "\"directory\": \"$cwd\"" ~/.local/share/opencode/storage/session/global/*.json

# Extracts timestamp, id, title for display
jq -r '[.time.updated, .id, .title] | @tsv' session.json
```

### Future Considerations
**This workaround may become unnecessary** if OpenCode fixes the per-directory session issue:
- Watch [GitHub #4378](https://github.com/sst/opencode/issues/4378) for updates
- If OpenCode adds native per-directory sessions, `oc` could simplify to just `opencode -c`
- The `o` picker would still be useful for browsing multiple sessions

**Potential Breaking Changes:**
- If OpenCode changes session storage location or format, these helpers will break
- Session JSON structure (`id`, `directory`, `time.updated`, `title`) is undocumented and may change

## Files Created

| File | Purpose |
|------|---------|
| `profiles/README.md` | Profile system overview |
| `profiles/bashrc-snippets/*.sh` | Shell helpers (z, t, o, flow control) |
| `profiles/keybindings/opencode-zellij/` | Complete profile for OpenCode+Zellij |
| `docs/keybinding-layers.md` | Comprehensive conflict guide |

## Why Not Use Autolock Plugin?

With locked-mode-by-default, autolock is unnecessary:
- Already in locked mode = keys pass through
- Manual unlock is one keypress (Ctrl+G)
- Re-lock is one keypress (Esc)
- Simpler = fewer failure modes

## See Also

- [profiles/](../../profiles/) — The profile system
- [docs/keybinding-layers.md](../../docs/keybinding-layers.md) — Full conflict documentation
- [docs/terminal-setup.md](../../docs/terminal-setup.md) — Terminal setup guide
