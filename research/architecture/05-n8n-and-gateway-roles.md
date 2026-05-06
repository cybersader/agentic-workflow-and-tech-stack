# Where n8n and MCP Gateway Fit

## Different Jobs

| Tool | Role | What It Does |
|------|------|--------------|
| **MCP Gateway** | Access control layer | Routes Claude to MCP servers, auth, permissions, audit |
| **n8n** | Automation/orchestration | Workflows triggered by events, connects services |

They're **complementary, not competing**.

---

## n8n's Role

n8n is a workflow automation tool - think "if this, then that" but powerful.

### Use Cases WITH MCP Setup

1. **Git webhook handler**
   - GitLab push → n8n → trigger HA reload
   - More flexible than Git Pull add-on's polling

2. **Approval workflows**
   - Claude proposes change → n8n notifies you → you approve → n8n triggers deploy

3. **Cross-service automation**
   - HA event → n8n → update TrueNAS → notify via Telegram

4. **MCP server health monitoring**
   - n8n checks MCP endpoints → alerts if down

### NOT a Replacement For

- MCP Gateway (n8n doesn't route MCP traffic)
- Auth/permissions (n8n isn't an identity provider)
- Real-time Claude ↔ service communication

---

## MCP Gateway's Role

The gateway is specifically for **Claude ↔ MCP server communication**.

### What You Want From It

1. **Single pane of glass** - See all registered MCP servers
2. **Add/remove servers** - UI or API to manage
3. **Auth in one place** - Not scattered tokens everywhere
4. **Tool permissions** - "Claude can use X but not Y"
5. **Audit log** - What did Claude access and when
6. **Security visibility** - Know if something's misconfigured

---

## Architecture With Both

```
                    ┌─────────────────────┐
                    │     n8n             │
                    │ (automation/glue)   │
                    └──────────┬──────────┘
                               │ webhooks, triggers
                               ▼
┌─────────────┐         ┌─────────────┐
│ Claude Code │────────▶│ MCP Gateway │
└─────────────┘   MCP   │  Registry   │
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  HA MCP  │    │ Future   │    │ Future   │
        │  Server  │    │ MCP #2   │    │ MCP #3   │
        └──────────┘    └──────────┘    └──────────┘
```

### n8n Handles
- Webhooks from Git pushes
- Scheduled health checks
- Notifications
- Complex multi-step workflows
- Connecting non-MCP services

### Gateway Handles
- Claude's MCP traffic routing
- Authentication (via Keycloak)
- Tool-level authorization
- Request logging/audit
- Server registry UI

---

## Do You Need Both?

### Start With: MCP Gateway Registry
- Solves your core ask: visibility, management, security
- Has UI for managing servers
- Keycloak handles auth centrally

### Add n8n If/When
- You want webhook-triggered automations
- Git push → deploy workflows
- Complex cross-service logic
- Already using n8n for other stuff

---

## Security Drift Prevention

The gateway helps prevent security drift by:

| Risk | Mitigation |
|------|------------|
| Token sprawl | Centralized auth via Keycloak |
| Unknown access | Audit logs show all MCP calls |
| Over-permissioned tools | Tool-level permissions in gateway |
| Forgotten servers | Registry shows all connected MCPs |
| Stale credentials | Keycloak token expiry/rotation |

### What To Monitor
- Gateway dashboard: registered servers, recent activity
- Keycloak: active sessions, failed logins
- Periodic review: "do we still need this MCP server?"
