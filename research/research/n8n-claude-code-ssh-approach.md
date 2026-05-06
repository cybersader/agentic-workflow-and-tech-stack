# n8n + Claude Code via SSH (Network Chuck Approach)

**Source**: [YouTube - Network Chuck](https://youtu.be/s96JeuuwLzc)

## What He's Doing

Using **n8n as orchestrator** with **Claude Code as the worker** - connected via SSH.

```
n8n workflow → SSH node → Server running Claude Code → Response back
```

## The Setup

| Component | Purpose |
|-----------|---------|
| n8n | Orchestrator - triggers, routes, manages sessions |
| SSH node | Connects n8n to server |
| Claude Code | Actually does the AI work (with all its context, skills, agents) |

## Why This Approach?

1. **Claude Code has context** - Access to local files, skills, agents
2. **Subscription-based** - No per-token cost for heavy workflows
3. **Claude handles complexity** - Multi-agent spawning, skills, file access
4. **n8n stays simple** - Just orchestration, not complex AI logic

## Key Techniques

### Basic Execution
```bash
claude -p "your prompt here"
```
`-p` = print/headless mode (no interactive terminal)

### Session Persistence
```bash
# First message - create session
claude -p "check my wifi" --session-id abc123

# Continue conversation
claude -p "why is one down?" -r abc123
```
`-r` = resume session ID

### With Context (cd into directory first)
```bash
cd /path/to/project && claude -p "is this video going to be good?"
```
Claude sees all files in that directory.

### Dangerous Mode (auto-approve actions)
```bash
claude --dangerously-skip-permissions -p "deploy three agents..."
```

## His Use Cases

1. **Slack bot** - Chat with Claude Code from phone, maintains session
2. **Multi-agent deployment** - n8n triggers, Claude spawns multiple agents
3. **Home lab monitoring** - "Check wifi, network, security" → Claude runs Python scripts
4. **NAS health checks** - Query TrueNAS status via Claude's unified skill

## Architecture Philosophy

```
┌─────────────┐
│    n8n      │  ← Simple orchestrator (triggers, routing, session mgmt)
└──────┬──────┘
       │ SSH
       ▼
┌─────────────┐
│ Claude Code │  ← Complex AI work (agents, skills, file access, context)
└─────────────┘
```

**n8n**: What to do, when to do it
**Claude Code**: How to do it, with full context

## Session Management in n8n

1. Generate UUID in code node
2. Pass to first Claude command with `--session-id`
3. Subsequent commands use `-r` to resume
4. Loop until user says "done"

---

## Relevance to Your Setup

### Pros
- Simple (just SSH)
- Claude Code handles complexity
- Works with your existing n8n
- Session persistence = conversational workflows

### Cons
- **Requires SSH access** - You rejected this for HA/TrueNAS (security)
- Server running Claude Code needs to be accessible
- Not using MCP protocol - direct CLI execution

### How It Could Fit

If you're comfortable with a **dedicated Claude Code server** (not HA or TrueNAS directly):

```
n8n → SSH → Dedicated Ubuntu VM/container → Claude Code
                                               ↓
                                        MCP Gateway → HA
```

Claude Code on a sandboxed VM, accessing services through MCP Gateway.

---

## Comparison to MCP Gateway Approach

| Aspect | SSH + Claude Code | MCP Gateway |
|--------|-------------------|-------------|
| Protocol | SSH + CLI | MCP (HTTP/stdio) |
| Auth | SSH keys | OAuth/Keycloak |
| Orchestrator | n8n | Claude directly or n8n |
| Complexity location | Claude Code server | Gateway + backend MCPs |
| Session mgmt | CLI flags | MCP handles it |
| Tool permissions | Claude's own controls | Gateway RBAC |
| Audit | SSH logs + Claude logs | Gateway audit logs |

## Verdict

Network Chuck's approach is **clever and simple** but assumes:
- You're OK with SSH access to a server
- Claude Code subscription (not API tokens)
- Server has access to everything Claude needs

For your security-conscious setup, **MCP Gateway is cleaner** - but this n8n+SSH pattern could work for a **sandboxed Claude Code VM** that then uses MCP to reach services.
