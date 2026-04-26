# Stupid Simple MCP Stack

## Goal
Claude can configure Home Assistant (and other services) with minimal setup.

## Your Infrastructure
- **TrueNAS SCALE 25.04** - Hosting platform (has SSH, can run containers)
- **Home Assistant OS** - VM on TrueNAS
- **Tailscale** - Secure network access
- **pfSense** - Split DNS for `.home` domain

## The Simplest Path

### Option A: SSH MCP Direct to HA
```
Claude Code → SSH MCP → Tailscale → HA VM → /config/
```

**Pros**: One MCP server, direct access, no extra services
**Cons**: Need SSH access to HAOS (possible via add-on or Terminal add-on)

### Option B: SSH MCP to TrueNAS + NFS/SMB Mount
```
Claude Code → SSH MCP → Tailscale → TrueNAS → mounted HA config
```

**Pros**: TrueNAS already has SSH, can mount HAOS config share
**Cons**: Extra mount step, permissions complexity

### Option C: File Server on TrueNAS (Samba) + Local Mount
```
Claude Code → Local Filesystem MCP → Windows mount → Tailscale → TrueNAS share
```

**Pros**: Native Windows experience, simple once mounted
**Cons**: Requires persistent mount, Windows-dependent

---

## Recommended: Option A with SSH Add-on

### Why?
1. **One thing to configure**: SSH MCP server
2. **Tailscale handles security**: No port forwarding, encrypted tunnel
3. **Direct file access**: Read/write `/config/*.yaml` directly
4. **Works from anywhere**: Laptop, desktop, wherever Claude Code runs

### Components Needed
1. **Home Assistant**: Terminal & SSH add-on (or Advanced SSH)
2. **Tailscale**: Already set up on your network
3. **SSH MCP Server**: `ssh-mcp` or `mcp-remote-fs`
4. **SSH Key**: For passwordless auth

---

## Tech Stack Summary

| Layer | Tool | Purpose |
|-------|------|---------|
| AI Interface | Claude Code | Your IDE |
| Protocol | MCP | Standardized tool access |
| Transport | SSH MCP Server | File ops over SSH |
| Security | Tailscale | Encrypted tunnel, no exposure |
| Target | HA Terminal Add-on | SSH endpoint in HAOS |

---

## Questions to Confirm

1. Does your HAOS VM have an SSH add-on installed?
2. Is HA on your Tailscale network (has 100.x.x.x address)?
3. Do you want Claude to access TrueNAS itself too, or just HA?
