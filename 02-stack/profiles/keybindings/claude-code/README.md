---
title: Claude Code Keybindings
stratum: 4
branches: [agentic]
---
Keybindings optimized for SSH + Zellij + Termux workflows.

## Installation

Copy to your global Claude config:

```bash
cp keybindings.json ~/.claude/keybindings.json
```

## Key Mappings

| Key | Action | Use Case |
|-----|--------|----------|
| **F2** | Cycle permission mode | Direct terminal, Termux (Volume Up + 2) |
| **Alt+m** | Cycle permission mode | SSH + Zellij (reliable passthrough) |

## Why These Keys?

Many key combinations don't pass through SSH → Zellij → Claude Code:

| Key | Problem |
|-----|---------|
| `Shift+Tab` | Default, often intercepted |
| `Ctrl+\` | Terminal SIGQUIT signal |
| `Ctrl+]` | SSH escape sequence |
| `Ctrl+6` | Inserts control character |
| `Ctrl+Space` | Produces null character |

**Alt+letter** combinations reliably pass through because they're sent as escape sequences (`^[` + letter).

## Debugging Key Passthrough

To test what keys pass through your terminal stack:

```bash
cat -v
# Press key combos, see what appears
# ^[m = Alt+m (working)
# ^@ = null (not working)
# Ctrl+C to exit
```

## See Also

- Full documentation: `knowledge-base/02-learnings/2025-01-28-claude-code-keybindings-ssh-zellij.md`
- [Claude Code Keybindings Docs](https://code.claude.com/docs/en/keybindings)
