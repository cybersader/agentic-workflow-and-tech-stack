---
created: 2025-12-18
updated: 2025-12-18
tags:
  - guides
  - access-control
  - practical
  - mcp
---

# Path-Based Access: Implementation Guide

Path-based access is the **primary access primitive**. It works today with all MCP clients.

**Principle:** Grant access to a directory → agent sees that directory and all children.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  PATH-BASED ACCESS                                               │
│                                                                  │
│  /home/user/                                                     │
│  ├── projects/           ← Grant here                           │
│  │   ├── project-a/      ← Agent sees this                      │
│  │   ├── project-b/      ← Agent sees this                      │
│  │   └── project-c/      ← Agent sees this                      │
│  ├── personal/           ← Agent does NOT see                   │
│  └── finances/           ← Agent does NOT see                   │
│                                                                  │
│  Access flows DOWNWARD. Cannot see siblings or parents.         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation by Tool

### Claude Code CLI

**Working Directory (Default)**

```bash
cd /path/to/project
claude
# Agent sees /path/to/project and below
```

**Explicitly Running from Different Directory**

```bash
claude --cwd /path/to/project
# or
CLAUDE_CWD=/path/to/project claude
```

### Cline (VS Code Extension)

Cline inherits the VS Code workspace:
- Open folder = agent scope
- Multi-root workspace = agent sees all roots

**Settings:**
```json
{
  "cline.allowedDirectories": [
    "/home/user/projects",
    "/home/user/docs"
  ]
}
```

### MCP Server Configuration

Each MCP server has its own path configuration:

**Filesystem MCP:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-filesystem"],
      "env": {
        "ALLOWED_DIRECTORIES": "/home/user/projects,/home/user/docs"
      }
    }
  }
}
```

**Obsidian MCP:**
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "obsidian-mcp"],
      "env": {
        "VAULT_PATH": "/home/user/vault"
      }
    }
  }
}
```

---

## Strategies for Scope Control

### Strategy 1: Multiple MCP Servers

Run separate servers for different scopes:

```json
{
  "mcpServers": {
    "vault-work": {
      "env": { "VAULT_PATH": "/home/user/vault/work" }
    },
    "vault-personal": {
      "env": { "VAULT_PATH": "/home/user/vault/personal" }
    },
    "vault-homelab": {
      "env": { "VAULT_PATH": "/home/user/vault/homelab" }
    }
  }
}
```

Then control which agents call which servers (see [Explicit Grants](explicit-grants.md)).

### Strategy 2: Folder Structure = Access Zones

Design your folder structure around access boundaries:

```
~/vault/
├── shared/          ← Safe for any agent
│   ├── templates/
│   └── reference/
├── work/            ← Work agents only
│   ├── client-a/
│   └── client-b/
├── personal/        ← Personal agents only
│   ├── finances/
│   └── health/
└── homelab/         ← Home automation agents
```

Run agents from the appropriate root.

### Strategy 3: Symlinks for Cross-Cutting

If you need to include a file from outside scope:

```bash
# Inside your project
ln -s /path/to/shared/reference.md ./reference.md
# Now it's in scope
```

**Warning:** This is a workaround, not a security boundary.

### Strategy 4: Working Directory Per Task

```bash
# Research task
cd ~/vault/research && claude

# Development task
cd ~/projects/my-app && claude

# Home automation
cd ~/homelab && claude
```

Different tasks = different scopes.

---

## Common Patterns

### Monorepo: Scope to Package

```bash
# Don't run from monorepo root (too much scope)
cd ~/monorepo/packages/frontend
claude
# Now agent only sees frontend
```

### Multi-Project: Parent Directory

```bash
# Need to see multiple projects
cd ~/projects
claude
# Sees project-a/, project-b/, etc.
```

### Vault + Code: Multiple Servers

```json
{
  "mcpServers": {
    "obsidian": {
      "env": { "VAULT_PATH": "/home/user/vault" }
    }
  }
}
```

Run Claude from code directory; it sees code via working directory AND vault via Obsidian MCP.

---

## Security Considerations

### What Path-Based Access Prevents

- Agent cannot see parent directories
- Agent cannot see sibling directories
- Agent cannot escape the granted scope

### What Path-Based Access Does NOT Prevent

- Agent sees ALL files within scope (no tag filtering)
- Agent can read sensitive files if they're in scope
- Agent can potentially write/delete within scope

### Best Practices

1. **Minimal scope:** Grant the smallest directory needed
2. **Sensitive data separation:** Keep secrets outside agent-accessible paths
3. **Separate servers:** Don't mix concerns in one scope
4. **Audit:** Know what's in the directories you grant

---

## Troubleshooting

### "Claude can't find my file"

1. Is the file in the working directory or below?
2. Is there an MCP server configured for that path?
3. Check `pwd` in Claude session

### "Claude sees too much"

1. Run from a more specific directory
2. Use multiple MCP servers with narrower scopes
3. Restructure folders to match access needs

### "I need cross-folder access"

Options:
1. Run from a parent directory (broadens scope)
2. Use symlinks (workaround)
3. Configure multiple MCP servers
4. Accept the limitation and restructure

---

## See Also

- [Tag-Based Access](tag-based-access.md) — Cross-cutting access (not yet implemented)
- [Graph-Based Access](graph-based-access.md) — Navigation within scope
- [Explicit Grants](explicit-grants.md) — Breaking out of scope
- [Access Model Implementation](../../architecture/14-access-model-implementation.md) — Full theory
