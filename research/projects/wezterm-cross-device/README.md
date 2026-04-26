# WezTerm Cross-Device Persistence Research

**Status:** Active Research
**Created:** 2025-12-30
**Goal:** Enable OpenCode usage with cross-device session persistence

---

## Problem Statement

```
┌─────────────────────────────────────────────────────────────────┐
│  CURRENT SITUATION                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Claude Code + tmux     ✓ Works great                          │
│  OpenCode + tmux        ✗ Broken (display, keys, crashes)      │
│  OpenCode + WezTerm     ✓ Works (but no persistence)           │
│  OpenCode + SSH         ? Can we get persistence somehow?      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Requirements:**
1. Run OpenCode without tmux (because tmux breaks it)
2. Have session persistence (survive disconnects, switch devices)
3. Access from phone via Tailscale SSH

**The conflict:** tmux provides persistence but breaks OpenCode. WezTerm works with OpenCode but doesn't persist across SSH.

---

## Research Tracks

### Track 1: WezTerm Multiplexer Server

WezTerm has a built-in multiplexer that might support remote attachment.

**Components to research:**
- `wezterm-mux-server` — Standalone multiplexer daemon
- `wezterm cli` — Command-line control
- `wezterm connect` — Connect to remote mux
- Unix domain sockets / TCP for mux communication

**Key questions:**
- [ ] Can `wezterm-mux-server` run headless on WSL?
- [ ] Can a remote WezTerm client attach to it?
- [ ] Can a non-WezTerm client (Termux) attach?
- [ ] Does it survive SSH disconnects?

**Docs to read:**
- https://wezfurlong.org/wezterm/multiplexing.html
- https://wezfurlong.org/wezterm/cli/cli.html

### Track 2: WezTerm SSH Integration

WezTerm has native SSH capabilities that might bypass the need for external SSH.

**Features to explore:**
- `wezterm ssh` — Built-in SSH client
- SSH domains in config
- Multiplexing over SSH tunnels

**Key questions:**
- [ ] Does WezTerm SSH provide automatic session persistence?
- [ ] Can it reconnect to existing sessions after disconnect?
- [ ] How does this work from a phone (no WezTerm)?

### Track 3: Alternative Multiplexers

Maybe another multiplexer works with OpenCode where tmux doesn't.

| Multiplexer | Status | Notes |
|-------------|--------|-------|
| **Zellij** | To test | Rust-based, modern, different architecture |
| **Screen** | To test | Older, different key handling than tmux |
| **Byobu** | To test | Wrapper around tmux/screen with different defaults |
| **Abduco** | To test | Minimal session management, pairs with dvtm |

**Test matrix:**
```
For each multiplexer:
- [ ] Install in WSL
- [ ] Run OpenCode inside it
- [ ] Test keybindings (Shift+arrows, Ctrl+V, etc)
- [ ] Test display (bottom bar, cursor position)
- [ ] Test for crashes
- [ ] If works: test SSH attachment
```

### Track 4: Ghostty

Ghostty is a newer terminal with potential multiplexing.

**Questions:**
- [ ] Does Ghostty have multiplexing?
- [ ] Does it support remote/SSH scenarios?
- [ ] Is there a server mode?

---

## Test Environment

### Desktop (Windows + WSL)
- Windows 11 with WSL2 Ubuntu
- WezTerm installed on Windows
- Tailscale in WSL
- SSH server on port 2222

### Mobile (Android)
- Termux
- Tailscale app
- SSH to WSL

### Test Procedure Template

```markdown
## Test: [Name]

**Date:** YYYY-MM-DD
**Multiplexer/Tool:** [name + version]

### Setup
[Steps to install/configure]

### Test 1: Basic OpenCode Launch
- [ ] Start multiplexer session
- [ ] Run `opencode`
- [ ] Result: [works/broken]
- [ ] Notes: [any issues]

### Test 2: Keybindings
- [ ] Shift+Arrow keys: [works/broken]
- [ ] Ctrl+V paste: [works/broken]
- [ ] Ctrl+C cancel: [works/broken]
- [ ] Notes: [any issues]

### Test 3: Display
- [ ] Bottom bar visible: [yes/no]
- [ ] Cursor position correct: [yes/no]
- [ ] Colors render: [yes/no]
- [ ] Notes: [any issues]

### Test 4: Persistence (if tests 1-3 pass)
- [ ] Detach from session
- [ ] SSH from different terminal
- [ ] Reattach to session
- [ ] OpenCode state preserved: [yes/no]

### Verdict
[WORKS / PARTIAL / BROKEN]
```

---

## Current Findings

### WezTerm Mux Server — Won't Work for Phone

**Status:** Researched, **not viable** for cross-device

WezTerm requires WezTerm on both ends. No WezTerm client for Android/Termux.

See: `findings/wezterm-mux.md`

### Zellij — Ready to Test

**Status:** Research complete, **testing needed**

Zellij is architecturally different from tmux (Rust, modern terminal protocols).
OpenCode's tmux bugs might not apply. Version 0.41+ has keybinding collision fixes.

See: `findings/zellij-research.md`

**Quick test:**
```bash
# Install
bash <(curl -L zellij.dev/launch)

# Test with OpenCode
zellij -s test
opencode

# If works, test persistence:
# Detach: Ctrl+O, D
# Reattach: zellij attach test
```

### Screen Testing

_To be tested if Zellij fails_

---

## File Structure

```
wezterm-cross-device/
├── README.md              # This file
├── findings/
│   ├── wezterm-mux.md     # WezTerm mux server research
│   ├── zellij-test.md     # Zellij test results
│   ├── screen-test.md     # Screen test results
│   └── ...
├── configs/
│   ├── wezterm.lua        # Test WezTerm configs
│   └── ...
└── scripts/
    └── ...                # Any helper scripts
```

---

## Success Criteria

**Minimum viable solution:**
1. OpenCode runs without display/keybinding issues
2. Sessions persist when terminal closes
3. Can attach from different device (phone SSH)

**Ideal solution:**
- Same UX as tmux (`t sessionname` to attach)
- Tab completion for session names
- Works from both WezTerm (desktop) and plain SSH (phone)

---

## Related Resources

- [WezTerm Multiplexing Docs](https://wezfurlong.org/wezterm/multiplexing.html)
- [Zellij](https://zellij.dev/)
- [OpenCode tmux issues](https://github.com/sst/opencode/issues?q=tmux)
- [Ghostty](https://ghostty.org/)
- `../learnings/2025-12-30-cross-device-tmux-workflow.md` — Initial research
- `../../docs/terminal-setup.md` — Current terminal setup guide

---

## Log

### 2025-12-30
- Created project space
- Defined problem and research tracks
- Researched WezTerm mux server — **won't work** (requires WezTerm on both ends)
- Researched Zellij as alternative — promising
- **Tested Zellij + OpenCode on desktop — WORKS!**
  - Basic launch: pass
  - Keybindings: pass
  - Detach/reattach: pass
- Added Zellij bash helpers to `~/.bashrc` (z/zk/zl with autocomplete)
- Updated `docs/terminal-setup.md` with Zellij section
- **Fixed:** Autocomplete was capturing ANSI color codes from `zellij list-sessions` — added `sed` to strip them
- **Tested Termux SSH → Zellij attach — WORKS!**
- **PROJECT COMPLETE:** Full cross-device OpenCode workflow solved with Zellij
