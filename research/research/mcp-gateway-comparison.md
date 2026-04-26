# MCP Gateway/Proxy Comparison

## Three Main Options for Self-Hosting

| Feature | MCPJungle | MCP Gateway Registry | MCP Auth Proxy |
|---------|-----------|---------------------|----------------|
| **Purpose** | Gateway + Registry | Gateway + Registry + Agent Hub | Auth layer only |
| **Complexity** | Medium | High | Low |
| **UI** | Yes (web) | Yes (web) | No |
| **Auth** | Bearer tokens, RBAC (enterprise) | Keycloak/Cognito/Entra | Any OIDC provider |
| **Tool permissions** | Yes (tool groups) | Yes (fine-grained) | No (auth only) |
| **Docker setup** | Simple (1 container) | Complex (multiple services) | Simple (1 container) |
| **Database** | SQLite or Postgres | SQLite or Postgres | None |
| **RAM estimate** | ~200-500MB | ~1-2GB (with Keycloak) | ~50-100MB |
| **Best for** | Simple central management | Enterprise, full governance | Quick auth on existing MCPs |

---

## Option 1: MCPJungle

**Repo**: [github.com/mcpjungle/MCPJungle](https://github.com/mcpjungle/MCPJungle)

### What It Does
- Central registry for all your MCP servers
- Single endpoint for Claude to access all tools
- Enable/disable tools per server
- Tool Groups = expose subsets to specific clients

### Setup
```bash
curl -O https://raw.githubusercontent.com/mcpjungle/MCPJungle/refs/heads/main/docker-compose.yaml
docker compose up -d
# Access at http://localhost:8080
```

### Auth Model
- **Basic**: Bearer tokens per MCP server
- **Enterprise mode**: RBAC, access tokens per client, admin CLI

### Pros
- Simple Docker setup
- Web UI for management
- Tool-level control
- Lightweight

### Cons
- OAuth "coming soon" (not ready)
- Less mature than alternatives
- Fresh connections per tool call (no persistent state)

### Verdict
**Good for**: Getting started quickly, basic central management
**Not ideal for**: Full OAuth/OIDC integration (yet)

---

## Option 2: MCP Gateway Registry (Agentic Community)

**Repo**: [github.com/agentic-community/mcp-gateway-registry](https://github.com/agentic-community/mcp-gateway-registry)

### What It Does
- Full gateway + registry + agent communication hub
- Fine-grained RBAC at tool/method level
- Security scanning (Cisco AI Defence)
- Import from Anthropic's MCP Registry

### Setup
```bash
git clone https://github.com/agentic-community/mcp-gateway-registry
cd mcp-gateway-registry
# Configure .env with Cognito/Keycloak credentials
./build_and_run.sh --prebuilt
# Access at http://localhost:7860
```

### Services Started
- Registry UI (7860)
- Auth server (8888)
- Nginx (80/443)
- MCP servers (8000-8003)

### Auth Model
- **Full OAuth 2.0/3.0**
- Keycloak, Amazon Cognito, or Microsoft Entra ID
- Machine-to-machine (M2M) for agents
- Three-legged OAuth for external services

### Pros
- Most feature-complete
- Enterprise-grade auth
- Audit logging
- Security scanning built-in
- Active development

### Cons
- **Complex setup** - Multiple services, external IdP required
- **Resource heavy** - Keycloak alone needs ~500MB-1GB
- **AWS Cognito in quick start** - Need to swap for self-hosted Keycloak

### Verdict
**Good for**: Full governance, audit trails, enterprise needs
**Not ideal for**: Quick setup, resource-constrained environments

---

## Option 3: MCP Auth Proxy

**Repo**: [github.com/sigbit/mcp-auth-proxy](https://github.com/sigbit/mcp-auth-proxy)

### What It Does
- Adds OAuth 2.1 auth to ANY existing MCP server
- Drop-in, no code changes
- Converts stdio → HTTPS if needed

### Setup
```bash
# Single command to wrap an MCP server with auth
mcp-auth-proxy --backend "npx -y @modelcontextprotocol/server-filesystem /" \
  --oidc-issuer https://accounts.google.com \
  --allowed-users you@gmail.com
```

Or with Docker:
```bash
docker run -p 443:443 sigbit/mcp-auth-proxy \
  --backend "your-mcp-server" \
  --password-auth --password yourpassword
```

### Auth Options
- Google, GitHub (built-in)
- Any OIDC: Okta, Auth0, Azure AD, Keycloak, Authelia
- Simple password auth (for testing)
- Glob patterns: `*@company.com`

### Pros
- **Stupidly simple** - One container, one command
- Works with ANY MCP server
- No database
- Minimal resources
- Auto TLS via Let's Encrypt

### Cons
- **No aggregation** - One proxy per MCP server
- **No UI** - CLI only
- **No tool-level permissions** - Auth is all-or-nothing
- **No audit dashboard** - Just logs

### Verdict
**Good for**: Quick auth on individual MCPs, simple setups
**Not ideal for**: Managing many MCPs, fine-grained permissions

---

## Recommendation for Your Setup

### If You Want: Visibility + Simple Management
**→ MCPJungle**
- Quick to deploy
- Web UI to see all servers
- Tool enable/disable
- Bearer token auth (good enough with Tailscale)

### If You Want: Full Governance + Enterprise Auth
**→ MCP Gateway Registry + Self-hosted Keycloak**
- Replace Cognito with Keycloak on TrueNAS
- Full RBAC, audit logs
- More setup work but most capable

### If You Want: Minimal + Just Auth
**→ MCP Auth Proxy + Authelia**
- Wrap each MCP with auth proxy
- Use Authelia (lightweight) as OIDC provider
- Simple but no central UI

---

## Hybrid Approach

You could combine:
1. **MCP Auth Proxy** in front of each MCP server (auth layer)
2. **MCPJungle** as registry/aggregator (management layer)

```
Claude → MCPJungle (registry) → Auth Proxy → HA MCP
                              → Auth Proxy → Future MCP
```

But this adds complexity. Pick one approach to start.

---

## Quick Decision Matrix

| Your Priority | Choose |
|---------------|--------|
| Get running fast | MCPJungle |
| Full audit/compliance | MCP Gateway Registry |
| Minimal footprint | MCP Auth Proxy |
| Best UI | MCP Gateway Registry |
| Self-contained (no external IdP) | MCPJungle (enterprise mode) |
