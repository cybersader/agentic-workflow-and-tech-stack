---
title: Keybinding Profiles
stratum: 4
branches: [agentic]
---
Pre-configured keybinding profiles for different workflows. These are **optional but recommended** for a smooth experience with AI coding agents.

---

## Quick Setup

```bash
# From this repo's root:
./profiles/install.sh opencode-zellij
```

Or manually copy configs (see each profile's README).

---

## Available Profiles

| Profile | Use Case | Multiplexer | Best For |
|---------|----------|-------------|----------|
| `opencode-zellij` | OpenCode + cross-device SSH | Zellij | OpenCode users |
| `tmux-claude` | Claude Code + traditional tmux | tmux | Claude Code users |

---

## What Gets Configured

Each profile includes configs for multiple layers:

```
Profile: opencode-zellij
├── zellij/config.kdl      → ~/.config/zellij/config.kdl
├── vscode/settings.json   → Merge into VS Code settings
├── vscode/keybindings.json → Merge into VS Code keybindings
└── bashrc-snippet.sh      → Append to ~/.bashrc
```

---

## Dependencies

```bash
# Required for smart session matching
sudo apt install jq

# Optional: prettier fuzzy picker UI
sudo apt install fzf
```

---

## Bashrc Snippets

Shared shell helpers that work across profiles:

| Snippet | Purpose | Requires |
|---------|---------|----------|
| `zellij-helpers.sh` | `z`, `zk`, `zl`, `zr`, `zd`, `zfix` commands with autocomplete | zellij |
| `tmux-helpers.sh` | `t`, `tk`, `tl` commands with autocomplete | tmux |
| `opencode-helpers.sh` | `o` (smart session picker), `oc`, `on` | **jq** |
| `claude-code-helpers.sh` | `cc`, `ccy`, `ccr`, `ccp`, `ccs` shortcuts | claude |
| `flow-control.sh` | Disables Ctrl+S/Ctrl+Q flow control | - |

These are in `bashrc-snippets/` and can be sourced individually:
```bash
source /path/to/profiles/bashrc-snippets/zellij-helpers.sh
```

---

## VS Code Extensions (Optional)

These extensions enhance keybinding management:

| Extension | Purpose |
|-----------|---------|
| [Dynamic Keybindings](https://marketplace.visualstudio.com/items?itemName=jeronimo-sanchez-santamaria.dynamic-keybindings) | Switch keybinding sets with Ctrl+Shift+1-9 |
| Vim/Neovim keymaps | If you want vim-style editing |

---

## Zellij Plugins (Optional)

| Plugin | Purpose | Install |
|--------|---------|---------|
| [zellij-autolock](https://github.com/fresh2dev/zellij-autolock) | Auto-lock when running vim/OpenCode | See profile README |

---

## Creating Custom Profiles

1. Copy an existing profile directory
2. Modify configs for your needs
3. Update the profile's README
4. Run install script or manually symlink

---

## See Also

- [docs/keybinding-layers.md](../docs/keybinding-layers.md) — Understanding keybinding conflicts
- [docs/terminal-setup.md](../docs/terminal-setup.md) — Terminal configuration guide
