---
created: 2025-12-18
updated: 2025-12-18
tags:
  - guides
  - practical
  - mcp
  - tools
  - reference
---

# MCP Client Ecosystem: Claude Code, Cline, and Others

Multiple tools can act as MCP clients — they connect to MCP servers and expose those capabilities to LLMs. This guide compares them and shows how they differ in access control and capabilities.

---

## Quick Comparison

| Client | LLM | Environment | Best For |
|--------|-----|-------------|----------|
| **Claude Code** | Claude (Anthropic) | CLI/Terminal | Terminal power users, automation |
| **Cline** | Multiple (configurable) | VS Code | IDE-centric development |
| **Continue** | Multiple | VS Code/JetBrains | Multi-IDE, open source |
| **Cursor** | Multiple | Cursor IDE | Cursor-specific workflows |
| **Zed** | Claude/others | Zed Editor | Fast, native editor |
| **n8n** | Multiple | Workflow automation | Business process automation |

---

## Claude Code CLI

### What It Is

Anthropic's official CLI for Claude. Terminal-based, powerful, scriptable.

### Access Control

| Mechanism | How |
|-----------|-----|
| **Path-based** | Working directory + MCP server config |
| **Tool-based** | `allowed-tools` in skills |
| **MCP servers** | `~/.config/claude/settings.json` |

### Configuration

```json
// ~/.config/claude/settings.json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "obsidian-mcp"],
      "env": { "VAULT_PATH": "/path/to/vault" }
    }
  }
}
```

### Unique Features

- **Skills system:** `.claude/skills/*.md` with `allowed-tools`, `allowed-paths`
- **Agents:** `.claude/agents/*.md` for subagent definitions
- **Context files:** `CLAUDE.md` auto-loaded from project root
- **Session management:** tmux-friendly, persistent
- **Subagents:** Built-in Explore, Plan agents

### Best For

- Terminal power users
- Automation scripts
- SSH-based remote work
- Complex multi-step tasks

### Example Workflow

```bash
cd ~/projects/my-app
claude
# "Use the Explore agent to understand this codebase"
# "Search my Obsidian vault for related design docs"
# "Help me implement the feature, following existing patterns"
```

---

## Cline (VS Code Extension)

### What It Is

VS Code extension that adds AI capabilities with MCP support. Formerly "Claude Dev".

### Access Control

| Mechanism | How |
|-----------|-----|
| **Path-based** | VS Code workspace + `allowedDirectories` setting |
| **Tool-based** | Extension settings |
| **MCP servers** | Extension configuration |

### Configuration

```json
// .vscode/settings.json
{
  "cline.apiProvider": "anthropic",
  "cline.apiKey": "${env:ANTHROPIC_API_KEY}",
  "cline.mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "obsidian-mcp"],
      "env": { "VAULT_PATH": "/path/to/vault" }
    }
  },
  "cline.allowedDirectories": [
    "${workspaceFolder}",
    "/home/user/shared"
  ]
}
```

### Unique Features

- **Visual diff preview:** See changes before applying
- **File tree integration:** Visual workspace navigation
- **Multi-model support:** Claude, GPT-4, local models
- **Task history:** Visual task tracking

### Best For

- Visual developers
- Those who prefer IDE over terminal
- Multi-model workflows
- Code review with diffs

### Example Workflow

1. Open project in VS Code
2. Open Cline panel
3. "Help me refactor this component"
4. Review diffs in side panel
5. Accept/reject changes visually

---

## Continue

### What It Is

Open-source AI code assistant for VS Code and JetBrains.

### Access Control

| Mechanism | How |
|-----------|-----|
| **Path-based** | IDE workspace |
| **MCP servers** | `config.json` |

### Configuration

```json
// ~/.continue/config.json
{
  "models": [...],
  "mcpServers": [
    {
      "name": "obsidian",
      "transport": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "obsidian-mcp"]
      }
    }
  ]
}
```

### Best For

- Open source preference
- JetBrains users
- Custom model hosting

---

## How They Handle MCP Differently

### Server Discovery

| Client | Discovery Method |
|--------|------------------|
| Claude Code | `settings.json` + per-project `.mcp.json` |
| Cline | Extension settings + workspace settings |
| Continue | `config.json` |

### Tool Exposure

All clients expose MCP server tools to the LLM, but presentation differs:

- **Claude Code:** Tools appear in context, LLM calls them directly
- **Cline:** Tools shown in UI, user can see calls being made
- **Continue:** Similar to Cline with visual tool calls

### Scope Inheritance

| Client | Scope Behavior |
|--------|----------------|
| Claude Code | Working directory is scope; MCP servers add more |
| Cline | Workspace + `allowedDirectories` |
| Continue | Workspace-based |

---

## Combining Clients

You CAN use multiple clients with the same MCP servers:

```
┌─────────────────────────────────────────────────────────────────┐
│  SHARED MCP SERVERS                                              │
│                                                                  │
│  Obsidian MCP Server (running locally)                          │
│           │                                                      │
│           ├── Claude Code (terminal work)                       │
│           ├── Cline (VS Code, visual diff review)               │
│           └── n8n (automated workflows)                          │
│                                                                  │
│  Same vault, multiple interfaces.                                │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration Sync

To keep configs in sync:

1. **Use environment variables** for sensitive values
2. **Symlink config files** where possible
3. **Document canonical config** in repo

```bash
# Example: Share MCP config across tools
export MCP_OBSIDIAN_VAULT="/home/user/vault"
```

---

## Access Control Comparison

### Path-Based Access

| Client | Implementation | Strength |
|--------|----------------|----------|
| Claude Code | Working directory + skills | Most flexible |
| Cline | `allowedDirectories` | Visual, explicit |
| Continue | Workspace | Simple |

### Tool Restriction

| Client | Implementation | Strength |
|--------|----------------|----------|
| Claude Code | `allowed-tools` in skills | Fine-grained |
| Cline | Extension settings | Global |
| Continue | Model config | Per-model |

### MCP Server Scoping

All clients: Configure each MCP server with its own scope (e.g., `VAULT_PATH`).

---

## Enterprise Considerations

### Gateway Integration

For enterprise, you want a gateway between clients and MCP servers:

```
┌─────────────────────────────────────────────────────────────────┐
│  ENTERPRISE PATTERN                                              │
│                                                                  │
│  Claude Code ─┐                                                  │
│  Cline       ─┼── MCP Gateway ── Policy Engine ── MCP Servers   │
│  n8n         ─┘        │                                         │
│                   Audit Log                                      │
│                                                                  │
│  Gateway enforces identity, policy, logging.                     │
└─────────────────────────────────────────────────────────────────┘
```

### Identity Mapping

| Client | Identity Source |
|--------|-----------------|
| Claude Code | OS user + Anthropic account |
| Cline | VS Code session + configured API |
| Enterprise Gateway | Entra ID / Okta / etc. |

---

## Choosing a Client

### Choose Claude Code If:

- You prefer terminal
- You need complex automation
- You want subagent orchestration
- You work over SSH
- You need skills/agents system

### Choose Cline If:

- You prefer VS Code
- You want visual diff preview
- You use multiple LLM providers
- You want IDE integration

### Choose Continue If:

- You use JetBrains
- You prefer open source
- You host your own models

### Use Multiple If:

- Different tasks need different interfaces
- Team uses different tools
- Some tasks are automated (n8n), some interactive

---

## MCP Server Compatibility

Most MCP servers work with all clients. Check:

1. **Transport:** stdio (most common), HTTP, WebSocket
2. **Authentication:** Some servers need API keys
3. **Platform:** Some servers are OS-specific

### Common Servers

| Server | Works With | Notes |
|--------|------------|-------|
| obsidian-mcp | All | Needs Obsidian running |
| filesystem-mcp | All | Basic file operations |
| github-mcp | All | Needs GitHub PAT |
| playwright | All | Browser automation |

---

## Practical Setup

### Minimal Personal Stack

```
Claude Code CLI
├── MCP: obsidian-mcp (knowledge)
├── MCP: github-mcp (repos)
└── Skills: project-specific workflows
```

### IDE-Centric Stack

```
VS Code + Cline
├── MCP: same servers as above
├── Workspace: project folder
└── Settings: allowedDirectories
```

### Hybrid Stack

```
Claude Code (complex tasks, automation)
Cline (code review, visual diff)
n8n (scheduled automations)
└── All connect to same MCP servers
```

---

## See Also

- [Pragmatic Workflow Guide](../personal-workflow/pragmatic-workflow-guide.md) — Daily workflows
- [Path-Based Access](access/path-based-access.md) — Main access mechanism
- [Agent Workflow Guide](../tools/agent-workflow-guide.md) — Claude Code specifics
- [Personal Architecture](../architecture/12-personal-architecture.md) — Visual diagram
