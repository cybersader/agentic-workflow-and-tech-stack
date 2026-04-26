# Secure Workflows: Git vs Samba

## Option A: Git-Based Config

### Flow
```
1. Clone HA config repo locally
2. Claude edits files in local repo
3. You review diff
4. Push to remote (GitHub/Gitea/etc)
5. HA pulls changes (manual or automated)
```

### Tech Stack
| Component | Tool | Notes |
|-----------|------|-------|
| Local repo | Git | Claude edits here |
| Remote repo | GitHub / Gitea on TrueNAS | Central source of truth |
| HA sync | Git Pull add-on or manual | Pulls from repo |
| MCP | Local filesystem | Claude just edits local files |

### HA Side Setup
- **Git Pull Add-on**: Auto-pulls from repo on schedule/webhook
- Or **manual**: SSH/terminal to run `git pull` when ready

### Pros
- Full version history
- Review before deploy
- Works from anywhere
- No network exposure of HA filesystem

### Cons
- Need Git repo setup
- HA needs Git Pull add-on or manual process
- Two-step deploy (push → pull)

---

## Option B: Samba Read-Only

### The Problem You Identified
> HAOS runs as VM on TrueNAS. No easy way to expose Samba share securely tied to TrueNAS account.

### Why It's Hard
- HAOS Samba add-on runs **inside** the VM
- Exposes share on HA's IP, not TrueNAS
- TrueNAS can't manage those credentials
- Would need Tailscale on HA itself or firewall rules

### If You Wanted It Anyway
```
HA Samba Add-on → Exposes //[HOMELAB_IP]/config
Mount on Windows → net use X: \\[HOMELAB_IP]\config (via Tailscale route)
Claude → Local filesystem MCP on X:\
```

But: Credentials managed in HA, not TrueNAS. Security boundary is messier.

### Verdict
**Git workflow is cleaner** for your setup.

---

## Recommendation: Git Workflow

### Minimal Setup
1. **HA config in Git repo** (GitHub private or self-hosted Gitea)
2. **Clone locally** where Claude Code runs
3. **Claude edits local files** (no MCP needed - just normal file access)
4. **You review + push**
5. **HA Git Pull add-on** syncs on push or schedule

### Even Simpler Variant
Skip the add-on - just:
1. Claude edits local copy
2. You review
3. Copy files via HA File Editor (web UI) or `scp` one-time

This way Claude never touches HA directly. You're the gatekeeper.
