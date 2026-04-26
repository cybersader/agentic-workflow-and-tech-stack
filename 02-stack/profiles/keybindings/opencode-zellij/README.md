---
title: "Profile: opencode-zellij"
stratum: 4
branches: [agentic]
---
Keybinding profile optimized for OpenCode with Zellij multiplexer and cross-device SSH access.

---

## What This Profile Does

- **Zellij in locked mode** — Keys go to app by default, Ctrl+G unlocks
- **VS Code terminal passthrough** — Keys pass to terminal, not VS Code
- **Flow control disabled** — Ctrl+S/Q available for apps
- **Session helpers** — `z`, `zk`, `zl` commands with autocomplete

---

## Quick Install

```bash
# 0. Install dependencies
sudo apt install jq zellij  # jq for smart session matching

# 1. Copy Zellij config
mkdir -p ~/.config/zellij
cp zellij/config.kdl ~/.config/zellij/config.kdl

# 2. Add bashrc helpers
cat >> ~/.bashrc << 'EOF'
# OpenCode-Zellij profile helpers
source /path/to/profiles/bashrc-snippets/zellij-helpers.sh
source /path/to/profiles/bashrc-snippets/opencode-helpers.sh
source /path/to/profiles/bashrc-snippets/flow-control.sh
EOF
source ~/.bashrc

# 3. (Optional) Merge VS Code settings
# Copy settings from vscode/settings.json into your VS Code settings
```

---

## Files

| File | Purpose | Install To |
|------|---------|------------|
| `zellij/config.kdl` | Locked mode, Ctrl+G unlock | `~/.config/zellij/config.kdl` |
| `vscode/settings.json` | Terminal key passthrough | Merge into VS Code settings |
| `vscode/keybindings.json` | Custom keybindings | Merge into VS Code keybindings |

---

## Keybinding Reference

### Zellij (when unlocked with Ctrl+G)

| Key | Action |
|-----|--------|
| `d` | Detach from session |
| `n` | New tab |
| `x` | Close current pane |
| `q` | Quit Zellij |
| `\|` | Split vertical |
| `-` | Split horizontal |
| `h/j/k/l` | Navigate panes |
| `1-4` | Go to tab |
| `Esc` or `Ctrl+G` | Re-lock |

### Shell Commands

| Command | Action |
|---------|--------|
| `o` | **Smart picker** — lists sessions for current directory (uses fzf if installed) |
| `oc` | **Quick continue** — continues most recent session for current directory |
| `on` | Start fresh session (skip picker) |
| `z` | Attach to last Zellij session or create new |
| `z myproject` | Attach/create "myproject" session |
| `z my<TAB>` | Autocomplete session names |
| `zk myproject` | Kill "myproject" session |
| `zl` | List all sessions |
| `zfix` | Fix terminal size (WSL resize bug workaround) |

**Session picker (`o`) keybindings:**

| Key | Action |
|-----|--------|
| `Enter` | Continue selected session |
| `Ctrl-N` | New session (prompts for task description) |
| `ESC` | Cancel (do nothing) |

**Note:** `o` and `oc` match sessions by working directory, solving OpenCode's global session bug. Your first message becomes the session title.

---

## Optional: Zellij Autolock Plugin

Auto-locks Zellij when OpenCode/vim is running:

```bash
# Download plugin
mkdir -p ~/.config/zellij/plugins
curl -L https://github.com/fresh2dev/zellij-autolock/releases/latest/download/zellij-autolock.wasm \
  -o ~/.config/zellij/plugins/zellij-autolock.wasm

# Already configured in this profile's config.kdl
```

---

## See Also

- [../../docs/keybinding-layers.md](../../docs/keybinding-layers.md) — Understanding conflicts
- [../../docs/terminal-setup.md](../../docs/terminal-setup.md) — Terminal configuration
