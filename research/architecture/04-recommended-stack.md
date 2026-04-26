# Recommended MCP Stack - Final Architecture

## Two-Track Approach

### Track 1: HA Config Management (Git Workflow)
For editing YAML configs - no MCP needed, maximum security

```
Claude Code → Local Git Repo → GitLab/Gitea (TrueNAS) → HA Git Pull Add-on
```

**Stack:**
- Git (local)
- Gitea on TrueNAS (lightweight, ~200MB)
- HA Git Pull add-on (official)

**Security:** Claude never touches HA directly. You review all changes.

---

### Track 2: Live HA Control + Future APIs (MCP Gateway)
For real-time control and expanding to other services

```
Claude Code → MCP Gateway Registry → [HA MCP, Future MCPs]
                    ↓
              Keycloak (auth)
```

**Stack:**
- MCP Gateway Registry (Docker on TrueNAS)
- Keycloak (Docker on TrueNAS) - or Authelia if lighter
- HA MCP Server (already configured)

**Security:** Centralized auth, tool-level permissions, audit logs

---

## Full Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR MACHINE                              │
│  ┌─────────────┐    ┌─────────────────┐                         │
│  │ Claude Code │    │ Local Git Repo  │                         │
│  └──────┬──────┘    │ (ha-config/)    │                         │
│         │           └────────┬────────┘                         │
└─────────┼────────────────────┼──────────────────────────────────┘
          │ MCP                │ git push
          │                    │
══════════╪════════════════════╪═══════════ Tailscale ════════════
          │                    │
┌─────────┼────────────────────┼──────────────────────────────────┐
│         │            TRUENAS SCALE                               │
│         │                    │                                   │
│         ▼                    ▼                                   │
│  ┌─────────────┐    ┌─────────────┐                             │
│  │ MCP Gateway │    │   Gitea     │                             │
│  │  Registry   │    │  (Git repo) │                             │
│  └──────┬──────┘    └──────┬──────┘                             │
│         │                  │                                     │
│         │           ┌──────┘                                     │
│  ┌──────┴──────┐    │                                           │
│  │  Keycloak   │    │                                           │
│  │   (Auth)    │    │                                           │
│  └─────────────┘    │                                           │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │
┌─────────────────────┼────────────────────────────────────────────┐
│                     │        HOME ASSISTANT VM                   │
│                     ▼                                            │
│  ┌─────────────┐   ┌─────────────┐                              │
│  │   HA MCP    │   │ Git Pull    │                              │
│  │   Server    │   │  Add-on     │                              │
│  └─────────────┘   └─────────────┘                              │
│                                                                  │
│  Config: /config/*.yaml                                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Summary

| Component | Purpose | Runs On | RAM |
|-----------|---------|---------|-----|
| Gitea | Git server for HA configs | TrueNAS | ~200MB |
| MCP Gateway Registry | Centralized MCP routing + auth | TrueNAS | ~500MB |
| Keycloak | OAuth/OIDC identity provider | TrueNAS | ~500MB-1GB |
| HA Git Pull | Syncs config from Git | HA Add-on | Minimal |
| HA MCP Server | Live HA control via MCP | HA (built-in) | Minimal |

**Total additional RAM on TrueNAS:** ~1.5GB

---

## Implementation Priority

### Phase 1: Git Workflow (Simplest, Most Secure)
1. Install Gitea on TrueNAS
2. Export HA config to Git repo
3. Install Git Pull add-on on HA
4. Claude edits local, you push, HA syncs

### Phase 2: MCP Gateway (When Ready to Scale)
1. Deploy MCP Gateway Registry on TrueNAS
2. Deploy Keycloak (or use simpler Authelia)
3. Register HA MCP server in gateway
4. Configure Claude Code to use gateway endpoint
5. Set up tool-level permissions

### Phase 3: Expand
- Add more MCP servers (TrueNAS API, other services)
- All go through gateway
- Single auth, single audit point

---

## Security Summary

| Layer | Protection |
|-------|------------|
| Network | Tailscale (encrypted, no public exposure) |
| Auth | Keycloak/OIDC (centralized, revocable) |
| Authorization | Gateway tool-level permissions |
| Config Changes | Git review before deploy |
| Audit | Gateway + Git history |
