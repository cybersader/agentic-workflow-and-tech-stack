---
created: 2025-12-18
updated: 2025-12-18
tags:
  - guides
  - access-control
  - practical
  - mcp
  - enterprise
---

# Explicit Grants: Implementation Guide

Explicit grants are the **escape hatch** — ways to grant access to specific resources that cross normal boundaries (path or tag).

> **Key insight:** Purpose-bound tokens with ticket_id, justification, and granted_paths/tags enable auditable explicit grants. Gateway validates the ticket and grants temporary access. See [Implementing All Access Mechanisms](implementing-all-access-mechanisms.md) for OPA policies and [Identity Governance Patterns](../../architecture/10-identity-governance-patterns.md) for token structures.

**Use cases:**
- Access a specific file outside normal scope
- Allow a specific tool the agent wouldn't normally have
- Grant temporary elevated access with justification

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  EXPLICIT GRANTS                                                 │
│                                                                  │
│  Normal scope: /projects/                                        │
│  Agent sees: project-a/, project-b/                             │
│                                                                  │
│  Explicit grant: /shared/reference.md                           │
│  Agent can NOW access this specific file                        │
│                                                                  │
│  Still CANNOT see: /shared/secrets.md, /finance/                │
│                                                                  │
│  Grants are specific, not transitive.                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation by Context

### Personal Stack: Skills with allowed-paths

Claude Code skills can specify explicit path grants:

```yaml
# .claude/skills/project-skill.md
---
name: project-skill
allowed-tools:
  - Read
  - Edit
  - Glob
  - Grep
allowed-paths:
  - /home/user/projects/*
  - /home/user/shared/reference.md     # Explicit grant
  - /home/user/shared/templates/*      # Explicit grant (wildcard)
---

# Skill instructions here
```

**How it works:**
1. Skill activates when relevant
2. Agent gets access to listed tools and paths
3. Outside those paths, tools are blocked

### Personal Stack: Symlinks (Workaround)

Create symlinks to bring files into scope:

```bash
cd ~/projects/my-project
ln -s ~/shared/reference.md ./reference.md
# Now reference.md is "in" the project
```

**Caveats:**
- Symlink target must be readable by your user
- Not a security boundary — just convenience
- Can get confusing with many symlinks

### Personal Stack: Multiple MCP Servers

Configure separate servers for different scopes:

```json
{
  "mcpServers": {
    "project-vault": {
      "env": { "VAULT_PATH": "/vault/projects" }
    },
    "shared-reference": {
      "env": { "VAULT_PATH": "/vault/shared/reference" }
    }
  }
}
```

Then control which agents use which servers.

### Cline: Workspace Configuration

In VS Code with Cline:

```json
// .vscode/settings.json
{
  "cline.allowedDirectories": [
    "${workspaceFolder}",
    "/home/user/shared/reference"  // Explicit grant
  ]
}
```

---

## Enterprise Stack: Policy-Based Grants

### Gateway with OPA/Cedar

```rego
# OPA policy for explicit grants
package mcp.access

default allow = false

# Normal path-based access
allow {
    glob.match("/projects/**", [input.resource])
    input.user.role == "developer"
}

# Explicit grant for specific resource with justification
allow {
    input.resource == "/finance/q4-report.xlsx"
    input.context.ticket_id != ""
    input.context.justification != ""
    input.user.role == "developer"
}
```

### Azure/Entra ID

Using Conditional Access + custom claims:

```json
{
  "conditionalAccess": {
    "grantControls": {
      "customAuthenticationFactors": ["ticket-validation"]
    }
  }
}
```

### MCP Gateway (microsoft/mcp-gateway)

```yaml
policies:
  - name: developer-base
    subjects: ["role:developer"]
    resources: ["/projects/**"]
    actions: ["read", "write"]

  - name: finance-report-exception
    subjects: ["role:developer"]
    resources: ["/finance/q4-report.xlsx"]
    actions: ["read"]
    conditions:
      - ticket_id: { required: true }
      - justification: { required: true }
```

---

## Tool-Level Grants

### Granting Specific Tools

Claude Code's `allowed-tools` in skills:

```yaml
---
allowed-tools:
  - Read
  - Glob
  # NOT Edit, Write, Bash — this agent can't modify
---
```

### Denying Dangerous Tools

For sensitive contexts, limit destructive tools:

```yaml
---
allowed-tools:
  - Read
  - Glob
  - Grep
  - WebSearch
  # Explicitly exclude: Edit, Write, Bash, NotebookEdit
---
```

### MCP Server Tool Filtering

MCP servers expose specific tools. You can:

1. **Use servers that expose limited tools**
2. **Configure gateway to filter tools** (enterprise)
3. **Use skills to restrict tool access** (Claude Code)

---

## Temporary/Contextual Grants

### Break-Glass Pattern

For emergency access:

```
Prompt: "I need to access /finance/report.xlsx for ticket #12345.
Justification: Investigating billing discrepancy."
```

In enterprise, this would:
1. Log the request with justification
2. Validate ticket exists
3. Grant temporary access
4. Auto-revoke after time limit

### Session-Scoped Grants

Currently, Claude Code grants are session-scoped anyway — they don't persist across sessions. But you can be explicit:

```
Prompt: "For this session only, I'm granting you access to
read files in /shared/reference/. After this session ends,
that access is revoked."
```

This is honor system, but documents intent.

---

## Patterns for Explicit Grants

### Pattern 1: Reference Library

```
/projects/my-project/     ← Working scope
/shared/reference/        ← Explicitly granted (read-only)
```

Grant read access to shared reference materials while keeping write access limited to project.

### Pattern 2: Cross-Project Access

```
/projects/project-a/      ← Primary scope
/projects/project-b/api/  ← Explicit grant (just the API docs)
```

Need to reference another project's API without seeing all of it.

### Pattern 3: Elevated for Specific Task

```
Normal: Agent sees /projects/
Task: "Deploy to production"
Grant: /deploy/scripts/ (temporary)
```

Elevate access only when needed for specific task.

### Pattern 4: Multi-Tenant Isolation

```
Agent-A: /clients/client-a/
Agent-B: /clients/client-b/
Shared: /templates/ (granted to both)
```

Each agent sees their client plus shared resources.

---

## Security Considerations

### Audit Explicit Grants

Every explicit grant should be logged:
- Who granted it
- What was granted
- Why (justification)
- When it expires

### Principle of Least Privilege

Grant the minimum needed:
- Specific file, not directory
- Read, not read+write
- Time-limited, not permanent

### Review Grants Regularly

Skills with `allowed-paths` accumulate. Review them:
```bash
grep -r "allowed-paths" ~/.claude/skills/
grep -r "allowed-paths" .claude/skills/
```

---

## Current Limitations

### Personal Stack

- No automatic expiration
- No audit log
- No approval workflow
- Honor system for "temporary" grants

### What's Missing

| Feature | Status | Notes |
|---------|--------|-------|
| Time-limited grants | Not implemented | Would need gateway |
| Approval workflow | Not implemented | Enterprise only |
| Audit logging | Partial | Claude logs exist, not formal |
| Revocation | Manual | Delete skill or restart |

---

## Recommendations

### Personal Stack

1. Use skills with `allowed-paths` for explicit grants
2. Keep grants minimal and specific
3. Document WHY you granted access
4. Review grants periodically

### Enterprise Stack

1. Use gateway with policy engine
2. Require justification for elevated access
3. Implement audit logging
4. Set automatic expiration

### Both

1. Design folder structure to minimize need for explicit grants
2. Use explicit grants as exception, not default
3. Prefer narrower scope over broader

---

## See Also

- [Path-Based Access](path-based-access.md) — Default access model
- [Tag-Based Access](tag-based-access.md) — Cross-cutting (not implemented)
- [Graph-Based Access](graph-based-access.md) — Navigation within scope
- [Identity Governance Patterns](../../architecture/10-identity-governance-patterns.md) — Enterprise identity
