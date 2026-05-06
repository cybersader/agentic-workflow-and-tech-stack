---
date: 2025-12-31
tags:
  - terminal
  - zellij
  - opencode
  - vscode
  - terminal-workspaces
---

# Terminal Session Management Learnings

## Zellij WSL Resize Bug

### The Problem
Zellij sessions may retain old terminal dimensions when reattaching, especially in WSL environments. Symptoms:
- Content appears squished/boxed
- Status bar hints cut off
- `stty size` inside Zellij shows smaller dimensions than actual terminal

### Diagnosis
```bash
# Outside Zellij
stty size  # e.g., 59 125

# Inside Zellij (after attach)
stty size  # e.g., 47 96 (WRONG - smaller)
```

### Solution: `zfix` Command
Added to `~/.bashrc` and `profiles/bashrc-snippets/zellij-helpers.sh`:

```bash
# Fix Zellij terminal size (workaround for WSL resize bug)
# Toggles fullscreen twice to force Zellij to recalculate dimensions
zfix() {
    if [ -n "$ZELLIJ" ]; then
        zellij action toggle-fullscreen
        sleep 0.1
        zellij action toggle-fullscreen
        echo "Zellij size recalculated"
    else
        echo "Not inside Zellij"
    fi
}
```

### When It Happens
- Attaching to session created at different terminal size
- VS Code integrated terminal (timing issue with size reporting)
- WezTerm + WSL sometimes affected too

### Related Issues
- [zellij #3568](https://github.com/zellij-org/zellij/issues/3568) - VS Code 80-column bug

---

## OpenCode Session Picker Improvements

### Enhanced `o` Command UX

Previous behavior:
- ESC = create new session (confusing)

New behavior:
- **Enter** = continue selected session
- **Ctrl-N** = new session (prompts for task description)
- **ESC** = cancel (do nothing)

### Task Description → Session Title
When starting a new session, you can describe your task. OpenCode uses your first message as the session title, so this becomes the session name.

### Implementation
fzf with `--expect=ctrl-n` and `--bind="ctrl-n:abort"` to capture Ctrl-N as a distinct action from ESC.

---

## Terminal Workspaces: Disposed Terminal Fix

### The Problem
Error when running a task after terminating the VS Code terminal:
```
Error running command terminalWorkspaces.runTask: Terminal has already been disposed.
```

### Root Cause
1. User runs task → creates VS Code terminal → starts tmux/zellij session
2. User terminates VS Code terminal → terminal disposed, but multiplexer session keeps running
3. User runs task again → extension tries `existingTerminal.show()` on disposed terminal → ERROR

### Fix
Added try-catch around terminal reuse in `extension.ts`:

```typescript
if (existingTerminal) {
    try {
        existingTerminal.show();
        return;
    } catch {
        // Terminal was disposed, fall through to create a new one
    }
}
```

### Why This Happens
- VS Code's `vscode.window.terminals` may briefly include disposed terminals
- tmux/zellij sessions persist after VS Code terminal closes (by design)
- The "green indicator" logic checks session existence, not terminal validity

---

## Shell Commands Reference

| Command | Action |
|---------|--------|
| `o` | Smart OpenCode session picker (Enter/Ctrl-N/ESC) |
| `oc` | Quick continue most recent session for current directory |
| `on` | New OpenCode session (skip picker) |
| `z` | Attach/create Zellij session |
| `zfix` | Fix Zellij terminal size (resize bug workaround) |
| `zk` | Kill Zellij session |
| `zl` | List Zellij sessions |

---

## Files Modified

| File | Change |
|------|--------|
| `~/.bashrc` | Added `zfix`, updated `o` with new UX |
| `profiles/bashrc-snippets/zellij-helpers.sh` | Added `zfix` |
| `profiles/bashrc-snippets/opencode-helpers.sh` | Updated `o` picker keybindings |
| `profiles/keybindings/opencode-zellij/README.md` | Documented new commands |
| `tools/terminal-workspaces/src/extension.ts` | Fixed disposed terminal error |

---

---

## Firewall/Network Blockers and Dev Tools

### The Problem
Desktop firewalls (Portmaster, Little Snitch, GlassWire, etc.) can silently block development tools that need to download components:

- `code .` from WSL → stuck downloading VS Code Server
- `npm install` → hanging on packages
- `apt update` → timeouts
- Language servers → failing to install

### Symptoms
- Downloads hang at 0% or progress bar doesn't move
- No explicit error message (just hangs)
- Works fine on other networks/machines

### Common Domains to Whitelist

| Tool | Domains |
|------|---------|
| **VS Code Server** | `update.code.visualstudio.com`, `az764295.vo.msecnd.net` |
| **npm** | `registry.npmjs.org`, `*.npmjs.com` |
| **GitHub** | `github.com`, `raw.githubusercontent.com`, `*.githubassets.com` |
| **Ubuntu/apt** | `archive.ubuntu.com`, `security.ubuntu.com` |

### Quick Diagnosis
```bash
# Test if you can reach the service
curl -I https://update.code.visualstudio.com

# If timeout/blocked → firewall issue
# If connection refused → service down
# If 200 OK → something else
```

### Solutions
1. **Temporarily disable firewall** to confirm it's the issue
2. **Add rules** for the specific domains
3. **Check firewall logs** for blocked connections

### WSL-Specific Note
WSL traffic goes through Windows networking, so Windows-side firewalls affect WSL connections. A domain blocked in Portmaster (Windows) will also be blocked in WSL.

---

## VS Code + WSL First Run

When running `code .` from WSL for the first time (or after VS Code updates):

```
Updating VS Code Server to version ...
Downloading: [stuck]
```

This is VS Code installing its server component in `~/.vscode-server/`.

**If stuck:** Usually firewall blocking Microsoft CDN. Whitelist or temporarily disable.

**Alternative:** Open VS Code on Windows → `Ctrl+Shift+P` → "Remote-WSL: Open Folder in WSL"

---

## PATH and Non-Interactive Shells (tmux/Zellij Detection)

### The Problem

VS Code extensions in **Windows mode** (not WSL Remote) detect tmux/zellij sessions by running:
```bash
wsl.exe -e bash -c "zellij list-sessions"
```

This spawns a **non-interactive, non-login shell** which:
- Does NOT source `~/.bashrc`
- Does NOT source `~/.bash_profile` or `~/.profile`
- Only has the default system PATH

### Impact on Tool Detection

| Install Location | In Default PATH? | Detected from Windows mode? |
|------------------|------------------|----------------------------|
| `/usr/bin/` (apt install) | ✅ Yes | ✅ Yes |
| `/usr/local/bin/` | ✅ Yes | ✅ Yes |
| `~/.local/bin/` | ❌ No | ❌ **No - fails silently** |
| `~/.cargo/bin/` | ❌ No | ❌ No |

### Why tmux Works but Zellij Didn't

- **tmux**: Installed via `apt install tmux` → `/usr/bin/tmux` → in PATH
- **Zellij**: Manual install to `~/.local/bin/zellij` → NOT in PATH for non-interactive shells

### Solution: Install to System Paths

"System-wide" means putting a binary in a directory that's **always in PATH** - for all users and all shell types.

| Directory | Managed By | Use Case |
|-----------|------------|----------|
| `/usr/bin/` | Package manager (apt) | System packages |
| `/usr/local/bin/` | You (manual installs) | User-installed binaries |

**Multiple ways to install to `/usr/local/bin/`:**

```bash
# tmux - via package manager (goes to /usr/bin/)
sudo apt install tmux

# zellij - Option 1: Download directly there
sudo curl -L https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz | sudo tar xz -C /usr/local/bin

# zellij - Option 2: Move existing install
sudo mv ~/.local/bin/zellij /usr/local/bin/

# zellij - Option 3: Copy (keeps original)
sudo cp ~/.local/bin/zellij /usr/local/bin/

# zellij - Option 4: Symlink
sudo ln -s ~/.local/bin/zellij /usr/local/bin/zellij

# zellij - Option 5: Install command (sets permissions)
sudo install -m 755 ~/.local/bin/zellij /usr/local/bin/
```

### Alternative: Always Use WSL Remote Mode

When VS Code is in WSL Remote mode (bottom-left shows "WSL: Ubuntu"):
- Extension runs directly in WSL
- Commands run in interactive shell context
- `~/.bashrc` is loaded
- `~/.local/bin` is in PATH

**Best practice:** Use WSL Remote mode when working with Linux tools.

---

## See Also

- [keybinding-profiles-system.md](2025-12-30-keybinding-profiles-system.md) - Previous learnings
- [../docs/terminal-setup.md](../../docs/terminal-setup.md) - Terminal setup guide
