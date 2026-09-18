---
title: Claude Code keybindings through SSH + Zellij
description: How keybindings survive (or don't) across the phone → Termux → SSH → Zellij → Claude Code chain — which layer eats which chords and the working combinations.
stratum: 2
status: research
date: 2025-01-28
tags:
  - claude-code
  - keybindings
  - ssh
  - zellij
  - termux
  - cross-device
---
---

# Claude Code Keybindings Through SSH + Zellij

## The Problem

Claude Code's default keybind for cycling permission modes (accept edits, bypass permissions, etc.) is **Shift+Tab**. This doesn't work reliably when:
- Running through SSH
- Using terminal multiplexers (Zellij, tmux)
- Using mobile terminals (Termux)

Many key combinations get intercepted or don't pass through the SSH → Zellij → Claude Code chain.

## The Solution

Claude Code keybindings are configured in `~/.claude/keybindings.json`.

### Working Configuration

```json
{
  "$schema": "https://platform.claude.com/docs/schemas/claude-code/keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "f2": "chat:cycleMode",
        "alt+m": "chat:cycleMode"
      }
    },
    {
      "context": "Confirmation",
      "bindings": {
        "f2": "confirm:cycleMode",
        "alt+m": "confirm:cycleMode"
      }
    }
  ]
}
```

### Key Mappings

| Key | Use Case | Notes |
|-----|----------|-------|
| **F2** | Direct terminal, Termux | In Termux: Volume Up + 2 |
| **Alt+m** | SSH + Zellij | "m" for "mode" - easy to remember |

## Keys That DON'T Work Through SSH+Zellij

Tested and failed:

| Key | Why It Fails |
|-----|--------------|
| `ctrl+\` | Terminal SIGQUIT signal |
| `ctrl+]` | Often intercepted by SSH |
| `ctrl+6` | Inserts null/control character |
| `ctrl+space` | Produces `^@` (null) |
| `F2` alone | Function keys often don't pass through SSH |

## How to Debug Key Passthrough

To find what keys actually pass through your terminal stack:

```bash
cat -v
```

Then press key combinations. The output shows what the terminal receives:
- `^[m` = Alt+m (or Escape then m)
- `^O` = Ctrl+o
- `^@` = Null character (key combo didn't work)
- `^[` = Escape

Press Ctrl+C to exit.

## Claude Code Keybindings Reference

- **Location**: `~/.claude/keybindings.json`
- **Contexts**: `Chat`, `Confirmation`, `Input`, `Vim`, `History`
- **Auto-reload**: Changes apply without restarting (though UI hints may need restart)
- **Validation**: Run `/doctor` to check for conflicts

### Common Actions

| Action | Description |
|--------|-------------|
| `chat:cycleMode` | Cycle through accept/bypass modes |
| `confirm:cycleMode` | Cycle modes in confirmation dialogs |
| `chat:submit` | Submit current input |
| `chat:interrupt` | Interrupt Claude |

## Zellij Locked Mode

Zellij's `default_mode "locked"` helps by passing most keys through to the application. But SSH can still intercept certain sequences before they reach Zellij.

```kdl
// In ~/.config/zellij/config.kdl
default_mode "locked"

keybinds {
    locked {
        bind "Ctrl g" { SwitchToMode "Normal"; }
    }
}
```

## Key Insight

**Alt+letter combinations** are the most reliable through SSH + Zellij because:
1. They're not terminal control signals
2. SSH passes them through as escape sequences (`^[` + letter)
3. Zellij in locked mode doesn't intercept them
4. Claude Code can bind to them

## See Also

- [Claude Code Keybindings Docs](https://code.claude.com/docs/en/keybindings)
- `/doctor` command for keybinding validation
- `/keybindings` command to open the config file
