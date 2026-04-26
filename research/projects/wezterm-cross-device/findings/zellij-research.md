# Zellij Research & Test Plan

**Date:** 2025-12-30
**Status:** SUCCESS - OpenCode works in Zellij!
**Goal:** Determine if OpenCode works in Zellij (where it fails in tmux)

---

## Test Results (2025-12-30)

### Desktop Tests (WSL)

| Test | Result |
|------|--------|
| Basic launch | PASS |
| Bottom bar visible | PASS |
| Cursor position | PASS |
| Keybindings (Shift+Arrow, Ctrl+V, etc.) | PASS |
| Detach & reattach | PASS |
| OpenCode state preserved | PASS |

### Mobile Tests (Termux SSH)

| Test | Result |
|------|--------|
| SSH → Zellij attach | PASS |
| OpenCode renders correctly | PASS |
| Keybindings over SSH | PASS |

**Conclusion:** Full success! Zellij replaces tmux for OpenCode with cross-device support.

---

## Why Zellij Might Work

Zellij is architecturally different from tmux:

| Aspect | tmux | Zellij |
|--------|------|--------|
| **Language** | C (2007) | Rust (modern) |
| **Terminal handling** | Traditional | Modern protocols (Kitty keyboard) |
| **Keybinding approach** | Prefix key (Ctrl+B) | Modal + "Unlock-First" option |
| **Plugin system** | External scripts | WebAssembly native |

OpenCode's tmux issues are likely related to:
- Keybinding interception
- Terminal escape sequence handling
- Display rendering quirks

Zellij's different architecture **might** not trigger the same bugs.

---

## Known Zellij Issues (to watch for)

From [Zellij compatibility docs](https://zellij.dev/documentation/compatibility) and issues:

### 1. Keybinding Collisions
Zellij historically intercepted keys that apps needed. **Fixed in v0.41+** with "Unlock-First" preset.

> "In this preset, one must first 'unlock' the interface in order to access the various input modes, so the keybindings will no longer collide."

**Test:** Use `unlock-first` keybinding mode if default causes issues.

### 2. TUI Input Injection Bug
[Issue #3959](https://github.com/zellij-org/zellij/issues/3959): Some TUI apps get garbage input like `[2026;2$y` injected.

**Test:** Check if OpenCode's input fields get corrupted.

### 3. Mouse/Scroll Issues
Some TUI apps in alt-screen mode don't handle scroll events properly through Zellij.

**Test:** Check if OpenCode scrolling works.

### 4. Kitty Protocol + NumLock
[Issue #3592](https://github.com/zellij-org/zellij/issues/3592): Keybinds break with NumLock on when using Kitty protocol.

**Test:** Try with NumLock off if issues occur.

---

## Installation

### WSL/Ubuntu
```bash
# Option 1: Cargo (if Rust installed)
cargo install --locked zellij

# Option 2: Binary download
bash <(curl -L zellij.dev/launch)

# Option 3: Package manager (may be older version)
sudo apt install zellij
```

### Verify Installation
```bash
zellij --version
# Want 0.41.0 or newer for keybinding fixes
```

---

## Test Procedure

### Test 1: Basic OpenCode Launch

```bash
# Start Zellij session
zellij -s test-opencode

# Inside Zellij, run OpenCode
opencode

# Expected: OpenCode TUI renders correctly
# Check:
# - [ ] Bottom bar visible
# - [ ] Cursor position correct
# - [ ] Colors render properly
# - [ ] No garbage characters in UI
```

### Test 2: Keybindings

Inside OpenCode in Zellij, test:

| Key | Expected | Result |
|-----|----------|--------|
| Shift+Arrow | Selection/navigation | |
| Ctrl+V | Paste | |
| Ctrl+C | Cancel/copy | |
| Ctrl+L | Clear? | |
| Tab | Completion | |
| Enter | Submit | |

**If keybindings fail:** Try unlock-first mode:
```bash
zellij options --default-mode locked
```

Or edit config `~/.config/zellij/config.kdl`:
```kdl
keybinds clear-defaults=true {
    // Use unlock-first preset
}
```

### Test 3: Display Stability

- [ ] Resize terminal window — does OpenCode redraw correctly?
- [ ] Split panes in Zellij — does OpenCode still work?
- [ ] Switch tabs — does state preserve?

### Test 4: Session Persistence (Critical!)

```bash
# In Zellij with OpenCode running:
# Detach: Ctrl+O, D (or Ctrl+O, then 'd')

# From another terminal:
zellij attach test-opencode

# Check:
# - [ ] OpenCode still running
# - [ ] Can continue conversation
# - [ ] No display corruption
```

### Test 5: SSH Attachment (The Goal!)

```bash
# From Termux via SSH:
ssh desktop

# Attach to existing Zellij session:
zellij attach test-opencode

# Check:
# - [ ] Session attaches
# - [ ] OpenCode displays correctly
# - [ ] Keybindings work
# - [ ] Can interact normally
```

---

## Zellij Commands (tmux equivalents)

| tmux | Zellij | Action |
|------|--------|--------|
| `tmux new -s name` | `zellij -s name` | New session |
| `tmux ls` | `zellij list-sessions` or `zellij ls` | List sessions |
| `tmux attach -t name` | `zellij attach name` or `zellij a name` | Attach |
| `tmux kill-session -t name` | `zellij kill-session name` or `zellij k name` | Kill |
| Ctrl+B, D | Ctrl+O, D | Detach |
| Ctrl+B, C | Ctrl+O, N | New tab |
| Ctrl+B, % | Ctrl+O, \| | Split vertical |
| Ctrl+B, " | Ctrl+O, - | Split horizontal |

---

## Bash Helpers (if Zellij works)

Add to `~/.bashrc`:

```bash
# ============================================================================
# ZELLIJ SESSION HELPERS (mirrors tmux t/tk/tl)
# ============================================================================

# Attach to zellij session (or create if doesn't exist)
z() {
    if [ -n "$1" ]; then
        zellij attach "$1" 2>/dev/null || zellij -s "$1"
    else
        zellij attach 2>/dev/null || zellij
    fi
}

# Kill a zellij session
zk() {
    if [ -n "$1" ]; then
        zellij kill-session "$1"
    else
        echo "Usage: zk <session-name>"
        echo "Sessions:"
        zellij list-sessions 2>/dev/null | sed 's/^/  /'
    fi
}

# List zellij sessions
zl() {
    zellij list-sessions 2>/dev/null || echo "No zellij sessions"
}

# Autocomplete zellij session names for z, zk commands
# Note: sed strips ANSI color codes from zellij output
_zellij_complete() {
    local sessions
    sessions=$(zellij list-sessions 2>/dev/null | sed 's/\x1b\[[0-9;]*m//g' | awk '{print $1}')
    COMPREPLY=($(compgen -W "$sessions" -- "${COMP_WORDS[COMP_CWORD]}"))
}
complete -F _zellij_complete z
complete -F _zellij_complete zk
complete -F _zellij_complete zellij
```

Usage (same pattern as tmux helpers):
- `z` — attach to last session or create new
- `z myproject` — attach to "myproject" (creates if doesn't exist)
- `z my<TAB>` — autocomplete session names
- `zk myproject` — kill session
- `zl` — list sessions

---

## Expected Outcomes

### Best Case
OpenCode works perfectly in Zellij → **Problem solved!**
- Use Zellij instead of tmux
- Cross-device via SSH works
- Same UX with `z`, `zk`, `zl` helpers

### Partial Success
OpenCode works with workarounds:
- Need specific Zellij config
- Some keybindings need remapping
- Document required setup

### Worst Case
OpenCode fails in Zellij too:
- Try Screen as backup
- Accept split workflow (OpenCode desktop-only, Claude Code for mobile)

---

## Sources

- [Zellij vs Tmux Comparison](https://tmuxai.dev/tmux-vs-zellij/)
- [Zellij 0.41.0 - Colliding Keybinds Fix](https://zellij.dev/news/colliding-keybinds-plugin-manager/)
- [Zellij Compatibility Docs](https://zellij.dev/documentation/compatibility)
- [Colliding Keybindings Tutorial](https://zellij.dev/tutorials/colliding-keybindings/)
- [Zellij TUI Input Bug #3959](https://github.com/zellij-org/zellij/issues/3959)
