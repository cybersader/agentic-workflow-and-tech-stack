# Security Threat Model

## Rejected Approaches

### SSH to Home Assistant
- **Risk**: Full shell access to HAOS
- **Attack surface**: SSH vulnerabilities, key compromise = full system access
- **Verdict**: Overkill for editing YAML files

### SSH to TrueNAS
- **Risk**: Root access to storage server
- **Attack surface**: Compromise = access to all data, VMs, everything
- **Verdict**: Absolutely not worth it for this use case

## Current Access Model
- HA accessible via Tailscale **subnet routing** (not directly on Tailscale)
- pfSense/Tailscale handles the tunnel
- HA at `[HOMELAB_IP]` (LAN IP, routed through Tailscale)

## What We Actually Need
Claude needs to:
1. Read HA config files (YAML)
2. Write/modify HA config files
3. Possibly reload HA config after changes

## Secure Alternatives

### Option 1: HA File Editor Add-on + REST Proxy
- HA has a File Editor add-on (web-based)
- No SSH, just web UI
- **Problem**: No API, can't automate

### Option 2: HA Git-based Config
- Store config in Git repo
- Claude edits locally, pushes to repo
- HA pulls changes (via automation or add-on)
- **Benefit**: No direct write access to HA

### Option 3: Custom HA Add-on with Scoped API
- Add-on exposes minimal REST API
- Only allows file ops in `/config/`
- Auth via HA long-lived token
- **Benefit**: Least privilege, uses existing HA auth

### Option 4: Samba Share (Read-Only + Manual Apply)
- HA Samba add-on exposes `/config/`
- Mount as read-only for Claude to analyze
- Write changes locally, manually copy or use Git
- **Benefit**: No write access to production

## Recommendation

**Git-based workflow** is probably the sweet spot:
- Claude writes to local/repo
- You review changes
- Push triggers HA update (or manual)
- No direct write access to live system
- Full audit trail

Or **Samba read-only** for analysis + **HA REST API** for safe operations (like reloading config after you manually apply changes).
