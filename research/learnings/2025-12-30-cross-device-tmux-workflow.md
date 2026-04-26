# Cross-Device tmux Workflow Research

**Date:** 2025-12-30
**Status:** SOLVED - Use Zellij for OpenCode, tmux for Claude Code
**Goal:** Establish consistent terminal workflow across desktop (WezTerm/WSL) and mobile (Termux/Tailscale SSH)

> **UPDATE (2025-12-30):** OpenCode breaks in tmux. Use **Zellij** instead for OpenCode workflows.
> See [2025-12-30-keybinding-profiles-system.md](2025-12-30-keybinding-profiles-system.md) for the solution.
> tmux still works fine for Claude Code users.

---

## Key Finding: Already Documented!

Detailed setup guide exists at:
- **[wsl2-tailscale-ssh-tmux.md](../personal-workflow/wsl2-tailscale-ssh-tmux.md)** - Comprehensive 600-line guide
- **[tools/terminal-workspaces/docs/ssh-tmux-setup.md](../../tools/terminal-workspaces/docs/ssh-tmux-setup.md)** - Quick reference

**The core insight:** WezTerm is irrelevant when SSHing from phone. WezTerm is the LOCAL terminal emulator on desktop. When you SSH from Termux, Termux is your terminal emulator, and you connect to the SAME WSL environment with the SAME bash helpers.

---

## Architecture Understanding

### What Runs Where

```
┌─────────────────────────────────────────────────────────────────┐
│  DESKTOP (Windows + WSL)                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐      ┌─────────────────────────────────────┐  │
│  │  WezTerm    │ ───▶ │  WSL (Ubuntu)                       │  │
│  │  (terminal) │      │                                     │  │
│  └─────────────┘      │  ┌─────────┐  ┌─────────┐          │  │
│                       │  │ tmux    │  │ ~/.bashrc│          │  │
│                       │  │sessions │  │ t/tk/tl  │          │  │
│                       │  └─────────┘  └─────────┘          │  │
│                       │       ↑                             │  │
│                       │       │ SSH (Tailscale)             │  │
│                       └───────┼─────────────────────────────┘  │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│  PHONE (Android)              │                                 │
├───────────────────────────────┼─────────────────────────────────┤
│                               │                                 │
│  ┌─────────────┐              │                                 │
│  │  Termux     │ ─────────────┘                                 │
│  │  (terminal) │                                                │
│  └─────────────┘                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Insight

**The terminal emulator is local to each device:**
- Desktop: WezTerm renders the terminal
- Phone: Termux renders the terminal

**tmux and bash helpers are on the server (WSL):**
- tmux sessions persist in WSL
- `t`, `tk`, `tl` functions live in WSL's `~/.bashrc`
- These work regardless of how you connect

---

## Current State

### Desktop Workflow (Working)
1. Open WezTerm
2. Configured to launch WSL by default
3. `~/.bashrc` has tmux helpers
4. Tab completion works for `t` and `tk`

### Mobile Workflow (To Verify)
1. Open Termux
2. SSH via Tailscale to desktop
3. Connect to... Windows? WSL directly?
4. Attach to existing tmux sessions
5. Tab completion?

---

## Questions to Answer

### SSH Target
- [ ] What is the SSH target? Windows host or WSL directly?
- [ ] Can Tailscale SSH directly into WSL?
- [ ] If SSH goes to Windows, how do we get to WSL?

### tmux Session Access
- [ ] Can we attach to the same tmux sessions from both WezTerm and SSH?
- [ ] Are there any session isolation issues?

### Bash Helpers
- [ ] Do `t`, `tk`, `tl` work over SSH?
- [ ] Does tab completion work over SSH?
- [ ] Any TERM variable issues?

### Terminal Capabilities
- [ ] Does Termux support 256 colors / true color?
- [ ] Any keyboard shortcut issues in Termux?
- [ ] Does tmux copy mode work in Termux?

---

## Test Plan

### Test 1: Basic SSH Connectivity
```bash
# From Termux
ssh user@desktop-tailscale-ip
# Expected: Connect to Windows or WSL
```

### Test 2: WSL Access
```bash
# If SSH lands in Windows
wsl
# Or direct WSL SSH if configured
```

### Test 3: tmux Session Attachment
```bash
# After connecting to WSL
tmux list-sessions
t myproject  # Attach to existing session
```

### Test 4: Bash Helpers
```bash
t <TAB>      # Tab completion for sessions
tl           # List sessions
tk <TAB>     # Tab completion for kill
```

### Test 5: Terminal Features
```bash
# In tmux session
# Test copy mode: Ctrl+b [
# Test 256 colors
echo -e "\e[38;5;196mRed\e[0m"
```

---

## Potential Issues & Solutions

### Issue: SSH goes to Windows, not WSL
**Solutions:**
1. Configure SSH to auto-launch WSL: Add to Windows SSH config
2. Use WSL's SSH server instead of Windows
3. Create alias in Windows to jump to WSL

### Issue: Tab completion not working over SSH
**Potential causes:**
- Bash not loading `.bashrc` (non-interactive shell)
- `complete` commands not sourced
- TERM variable issues

**Solutions:**
- Ensure SSH opens interactive bash
- Force `.bashrc` loading in `.bash_profile`

### Issue: Different TERM values
**Termux default:** `xterm-256color`
**WezTerm default:** `wezterm`

**Solution:** Standardize or handle in tmux config

---

## Configuration Snippets

### SSH Config (Termux side)
```bash
# ~/.ssh/config in Termux
Host desktop
    HostName 100.x.x.x  # Tailscale IP
    User cybersader
    # RequestTTY yes  # Force TTY for interactive
```

### Auto-WSL on SSH (Windows side)
```powershell
# If SSH lands in Windows, auto-launch WSL
# Add to user's PowerShell profile or SSH authorized_keys command
```

### Force bashrc loading
```bash
# ~/.bash_profile
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi
```

---

## Success Criteria

1. **Seamless attachment:** Can SSH from Termux and `t projectname` to attach to session started from WezTerm
2. **Tab completion works:** `t <TAB>` shows available sessions
3. **Visual consistency:** Colors and layouts render correctly
4. **No session conflicts:** Both access methods see same sessions

---

## Findings

### SSH Target Configuration
**Documented in:** `wsl2-tailscale-ssh-tmux.md`

**Summary:**
- Install Tailscale **inside WSL** (not Windows) for direct access
- SSH server runs in WSL on port 2222
- SSH config in Termux points to WSL's Tailscale hostname
- Connection: `Termux → Tailscale VPN → WSL SSH → bash (with helpers loaded)`

### Bash Helpers Status
**Confirmed working in WSL's `~/.bashrc`:**
```bash
t()   # Attach or create session
tk()  # Kill session (with usage help)
tl()  # List sessions
_tmux_complete()  # Tab completion for t/tk/tmux commands
```

**Tab completion over SSH:** Should work because:
- SSH opens interactive bash shell
- Interactive bash loads `.bashrc`
- `.bashrc` contains `complete -F _tmux_complete t tk tmux`

**Needs testing:** Verify tab completion actually fires over SSH (some terminals may not handle completion keycodes properly)

### Terminal Compatibility
**Expected to work:**
- 256 colors (Termux default: `xterm-256color`)
- tmux copy mode (Ctrl+B, [)
- Basic keyboard shortcuts

**Potential issues:**
- Android keyboard layouts may miss some keys (test Ctrl+B)
- Screen size on phone - tmux panes get cramped
- Battery optimization killing Termux in background

### Recommended Setup
**Already documented in `wsl2-tailscale-ssh-tmux.md`:**
1. Tailscale in WSL with SSH on port 2222
2. Key-based auth (no passwords)
3. Termux with SSH config file
4. tmux helpers in WSL bashrc
5. mosh for unreliable connections (optional)

### WezTerm Clarification
**WezTerm is NOT needed for mobile workflow.** It's only relevant on desktop:
- Desktop: WezTerm → opens WSL shell → tmux
- Phone: Termux → SSH to WSL → same tmux sessions

WezTerm's multiplexing features (tabs/panes) are an ALTERNATIVE to tmux when on desktop, but tmux is needed for cross-device session persistence.

---

## See Also

- [2025-12-30-keybinding-profiles-system.md](2025-12-30-keybinding-profiles-system.md) — **Zellij solution for OpenCode**
- [../../profiles/](../../profiles/) — Pre-configured keybinding profiles
- [terminal-setup.md](../../docs/terminal-setup.md) — Terminal configuration guide
- [agentic-tools.md](../../docs/agentic-tools.md) — tmux helpers documentation
- [2025-12-08-tmux-aliases-termux.md](../conversations/2025-12-08-tmux-aliases-termux.md) — Previous tmux/Termux work
