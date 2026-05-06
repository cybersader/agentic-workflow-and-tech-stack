# MCP Gateway Options - Research

## The Problem

You have (or want) multiple MCP servers:
- Home Assistant MCP
- Potentially others (TrueNAS, other APIs)

**Challenges:**
- Each MCP server = separate config, separate auth
- No centralized tool authorization (which tools can Claude use?)
- No audit trail
- Token sprawl

---

## Gateway Solutions Comparison

### 1. Microsoft MCP Gateway
**Repo**: [github.com/microsoft/mcp-gateway](https://github.com/microsoft/mcp-gateway)

| Aspect | Details |
|--------|---------|
| **What it does** | Reverse proxy + management layer for MCP servers |
| **Auth** | Azure Entra ID, RBAC (mcp.engineer, mcp.admin roles) |
| **Features** | Session-aware routing, tool registration, telemetry |
| **Deployment** | Kubernetes required (AKS or Docker Desktop K8s) |
| **Self-host?** | Technically yes, but heavy - needs K8s |
| **Verdict** | Overkill for home lab, Azure-centric |

---

### 2. MCP Gateway Registry (Agentic Community)
**Repo**: [github.com/agentic-community/mcp-gateway-registry](https://github.com/agentic-community/mcp-gateway-registry)

| Aspect | Details |
|--------|---------|
| **What it does** | Centralized gateway + registry for MCP servers |
| **Auth** | Keycloak, AWS Cognito, or Azure Entra ID |
| **Features** | Dynamic tool discovery, agent-to-agent comms, security scanning |
| **Deployment** | Docker Compose, pre-built images, runs in 2 min |
| **Self-host?** | YES - designed for it, SQLite included |
| **Verdict** | Best option for home lab - lightweight, full-featured |

**Key Features:**
- Single connection point for multiple MCP servers
- Fine-grained access control at tool level
- Keycloak for auth (can self-host Keycloak too)
- Works with Claude Desktop and Claude Code
- Apache 2.0 license

---

### 3. MCP Auth Proxy
**Repo**: [github.com/sigbit/mcp-auth-proxy](https://github.com/sigbit/mcp-auth-proxy)

| Aspect | Details |
|--------|---------|
| **What it does** | Adds OAuth 2.1 auth to ANY MCP server |
| **Auth** | Google, GitHub, any OIDC (Okta, Auth0, Keycloak) |
| **Features** | Drop-in, no code changes, auto TLS |
| **Deployment** | Single binary/command |
| **Self-host?** | YES - very simple |
| **Verdict** | Good for quick auth on individual servers |

**Use case**: Wrap existing MCP servers with auth without modifying them

**Limitation**: Not a full gateway - no aggregation, no tool-level permissions

---

### 4. IBM Context Forge
**Not deeply researched yet**

- Open source gateway + registry
- Federates MCP and REST services
- JWT/basic auth, AES-encrypted credentials
- Auto-discovery via mDNS
- Multi-database (Postgres, MySQL, SQLite)

---

### 5. Obot MCP Gateway
**URL**: [obot.ai](https://obot.ai/)

- Enterprise SaaS offering
- Centralized control plane
- Not self-hostable (managed service)

---

### 6. AWS Bedrock AgentCore Gateway
- AWS managed service
- Groups multiple MCP servers behind single interface
- Not self-hostable

---

## Recommendation for Home Lab

### Best Fit: MCP Gateway Registry

**Why:**
1. **Self-hostable** - Docker Compose on TrueNAS
2. **Keycloak auth** - Can also self-host, or use existing IdP
3. **Tool-level permissions** - Control what Claude can access
4. **Lightweight** - SQLite, no external DB required
5. **Active development** - Apache 2.0, community-driven

### Architecture with Your Stack

```
┌─────────────┐
│ Claude Code │
└──────┬──────┘
       │ MCP
       ▼
┌──────────────────────┐
│  MCP Gateway Registry │ ← TrueNAS (Docker)
│  + Keycloak (auth)    │
└──────────┬───────────┘
           │ Routes to:
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│ HA MCP  │ │ Other   │
│ Server  │ │ MCP     │
└─────────┘ └─────────┘
```

### Simpler Alternative: MCP Auth Proxy

If full gateway is overkill:
1. Put MCP Auth Proxy in front of HA MCP
2. Use Keycloak/Authelia for OIDC
3. No aggregation, but gets you centralized auth

---

## Security Considerations

### Token/Auth Management
- Gateway centralizes auth - one place to revoke access
- Keycloak provides audit logs
- Tool-level permissions = least privilege

### Network Security
- Gateway runs on Tailscale network
- Backend MCP servers don't need exposure
- Only gateway endpoint accessible to Claude

### Audit Trail
- Gateway logs all tool invocations
- Who accessed what, when
- Required for security review
