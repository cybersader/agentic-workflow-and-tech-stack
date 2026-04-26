# n8n - Concrete Role in Your Stack

## The Real Question

You likely already have or want n8n. Where does it actually plug in?

---

## n8n's Sweet Spot: The "Glue" Layer

n8n sits **between services** and handles things MCP can't:

```
┌─────────────────────────────────────────────────────────┐
│                      n8n                                 │
│  (webhooks, schedules, multi-step workflows, alerts)    │
└────┬──────────┬──────────┬──────────┬──────────────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
  GitLab    Home Asst   TrueNAS   Notifications
                                  (Telegram/Email)
```

MCP is **request/response** - Claude asks, service answers.

n8n is **event-driven** - something happens, trigger a workflow.

---

## Concrete Use Cases in Your Setup

### 1. Git Deploy Pipeline
```
GitLab webhook → n8n → call HA REST API to reload
```
Better than Git Pull polling. Instant deploys.

### 2. Claude Config Review Workflow
```
Claude pushes to "review" branch
  → n8n detects push
  → n8n sends you notification (Telegram/Discord/Email)
  → You approve (button/reply)
  → n8n merges to main
  → n8n triggers HA reload
```

### 3. MCP Server Health Checks
```
n8n scheduled job (every 5 min)
  → ping each MCP endpoint
  → if down, alert you
  → optionally restart container via TrueNAS API
```

### 4. Security Audit Digest
```
n8n daily schedule
  → pull Gateway audit logs
  → summarize: "Claude accessed X, Y, Z today"
  → send digest email
```

### 5. HA Event → External Action
```
HA motion sensor triggers
  → n8n webhook receives event
  → n8n checks conditions (time, who's home)
  → n8n triggers action in non-HA service
```

### 6. Backup Automation
```
n8n weekly schedule
  → export HA config via API
  → commit to Git
  → notify on success/failure
```

---

## What n8n Does NOT Replace

| Task | Use This |
|------|----------|
| Claude ↔ HA real-time control | MCP |
| MCP auth/permissions | Gateway + Keycloak |
| File editing by Claude | Local Git repo |
| Service discovery for Claude | MCP Gateway Registry |

---

## Where It Fits in the Full Stack

```
┌─────────────┐
│ Claude Code │
└──────┬──────┘
       │ MCP protocol
       ▼
┌──────────────┐      ┌─────────────┐
│ MCP Gateway  │      │    n8n      │
│ (auth/route) │      │ (workflows) │
└──────┬───────┘      └──────┬──────┘
       │                     │
       │    ┌────────────────┤
       │    │                │
       ▼    ▼                ▼
┌──────────────┐      ┌─────────────┐
│ Home Assist  │◄────▶│   GitLab    │
│   (MCP)      │      │  (webhooks) │
└──────────────┘      └─────────────┘
       ▲                     │
       │                     │
       └─────────────────────┘
         n8n triggers reload
```

**Claude path**: Claude → Gateway → HA MCP (real-time interaction)

**Automation path**: GitLab → n8n → HA (event-driven workflows)

---

## Do You Need n8n Day 1?

**No.** Start with:
1. MCP Gateway Registry (for visibility/auth)
2. Git workflow (for config management)

**Add n8n when you want:**
- Webhook-triggered deploys (instead of polling)
- Approval workflows
- Cross-service automation
- Monitoring/alerting

---

## TL;DR

| Layer | Tool | When Claude Involved? |
|-------|------|----------------------|
| Real-time AI ↔ Service | MCP Gateway | Yes |
| Event-driven automation | n8n | No (background) |
| Config editing | Git + local files | Yes |

n8n handles the **async, event-driven stuff** that happens *around* Claude, not the direct Claude ↔ service communication.
