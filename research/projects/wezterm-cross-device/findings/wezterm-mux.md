# WezTerm Mux Server Research

**Date:** 2025-12-30
**Status:** Researched - Major Limitation Found

---

## Key Finding: WezTerm Requires WezTerm on Both Ends

**This is a blocker for the phone scenario.**

From the [WezTerm multiplexing docs](https://wezterm.org/multiplexing.html):

> "A compatible version of wezterm must be installed on the remote system in order to use SSH domains."

This means:
- ✓ Desktop WezTerm → WSL mux server → sessions persist
- ✗ Phone Termux → SSH → WSL mux server → **Can't connect** (no WezTerm client in Termux)

---

## How WezTerm Multiplexing Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  WezTerm Multiplexing (ONLY WezTerm clients can connect)   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Desktop:                                                   │
│  ┌──────────────┐     ┌─────────────────────────────────┐  │
│  │ WezTerm GUI  │ ──▶ │  wezterm-mux-server (daemon)    │  │
│  │ (client)     │     │  - Unix socket or TCP           │  │
│  └──────────────┘     │  - Sessions persist here        │  │
│         ↑             └─────────────────────────────────┘  │
│         │                        ↑                         │
│         │                        │                         │
│         └────────────────────────┘                         │
│         Can reconnect after disconnect                     │
│                                                             │
│  Phone:                                                     │
│  ┌──────────────┐                                          │
│  │ Termux       │ ──▶ ??? No WezTerm client available     │
│  │ (SSH only)   │                                          │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Components

| Component | Purpose |
|-----------|---------|
| `wezterm-gui` | GUI client, can embed mux or connect to server |
| `wezterm-mux-server` | Background daemon, maintains sessions |
| `wezterm cli` | Command-line admin (list panes, spawn, etc.) |
| `wezterm connect` | Connect client to a domain |

### Connection Methods

1. **Unix Domain Sockets** (local)
   ```lua
   config.unix_domains = {
     { name = 'unix' }
   }
   ```
   Connect: `wezterm connect unix`

2. **SSH Multiplexing** (remote)
   ```lua
   config.ssh_domains = {
     {
       name = 'my.server',
       remote_address = '[ROUTER_IP]',
       username = 'user'
     }
   }
   ```
   Connect: `wezterm connect SSHMUX:my.server`

3. **TLS Domains** (remote with certificates)
   - Bootstraps via SSH
   - Auto-reconnects with cached certificate

### WSL Integration Example

```lua
-- Windows side .wezterm.lua
config.unix_domains = {
  {
    name = 'wsl',
    serve_command = { 'wsl', 'wezterm-mux-server', '--daemonize' }
  }
}
config.default_gui_startup_args = { 'connect', 'wsl' }

-- This makes WezTerm auto-start the mux server in WSL
-- Sessions persist even if WezTerm GUI closes
-- Can reattach by running WezTerm again
```

---

## The Phone Problem

**WezTerm is not available for Android/Termux.**

Options explored:

| Option | Viable? | Notes |
|--------|---------|-------|
| WezTerm on Android | No | No Android build |
| Web terminal to WezTerm | Maybe | Would need custom solution |
| Plain SSH to mux | No | Protocol is WezTerm-specific |

---

## Alternative Approaches

Since WezTerm can't solve the phone scenario, we need alternatives:

### 1. Test Other Multiplexers with OpenCode

| Multiplexer | Why Test |
|-------------|----------|
| **Zellij** | Different architecture than tmux, might not trigger same bugs |
| **Screen** | Older, different terminal handling |
| **Abduco+dvtm** | Minimal, different approach |

### 2. WezTerm for Desktop Only

Use WezTerm multiplexing for local persistence, accept phone = different workflow:
- Desktop: WezTerm mux → OpenCode ✓
- Phone: tmux → Claude Code (fallback)

### 3. tmux with OpenCode Workarounds

Research if OpenCode issues have workarounds:
- Different TERM values
- tmux configuration changes
- OpenCode settings

---

## WezTerm CLI Commands (for reference)

If WezTerm mux is used locally, these would be the equivalents to tmux helpers:

```bash
# List panes/sessions
wezterm cli list

# Spawn new pane
wezterm cli spawn

# Kill pane
wezterm cli kill-pane --pane-id <id>

# Split pane
wezterm cli split-pane

# Activate specific pane
wezterm cli activate-pane --pane-id <id>
```

Could create bash helpers similar to `t`, `tk`, `tl`:

```bash
# wezterm helpers (local only - won't work from SSH)
wl() { wezterm cli list; }
wk() { wezterm cli kill-pane --pane-id "$1"; }
# etc.
```

---

## Conclusion

**WezTerm multiplexing is NOT a solution for cross-device (phone) access.**

It solves a different problem: local session persistence on the desktop where WezTerm is installed.

**Next steps:**
1. Test Zellij with OpenCode
2. Test Screen with OpenCode
3. If those fail, accept split workflow (WezTerm/OpenCode on desktop, tmux/Claude on phone)

---

## Sources

- [WezTerm Multiplexing Docs](https://wezterm.org/multiplexing.html)
- [GitHub Discussion #1322 - Tmux-like sessions](https://github.com/wezterm/wezterm/discussions/1322)
- [GitHub Discussion #3901 - Multiplexing questions](https://github.com/wezterm/wezterm/discussions/3901)
