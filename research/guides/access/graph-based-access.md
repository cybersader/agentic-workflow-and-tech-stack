---
created: 2025-12-18
updated: 2025-12-18
tags:
  - guides
  - access-control
  - practical
  - mcp
  - obsidian
---

# Graph-Based Access: Implementation Guide

Graph navigation (links, backlinks, relationships) helps agents **navigate within granted scope**. By default it is NOT access control.

**However:** With a Gateway + Policy Engine, you CAN turn graph traversal into access control — controlling which edges agents can follow.

> **Key insight:** Gateway policies can intercept link-following and allow/deny based on edge type, node classification, or relationship metadata. See [Implementing All Access Mechanisms](implementing-all-access-mechanisms.md) for the OPA policies.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  GRAPH NAVIGATION ≠ ACCESS CONTROL                              │
│                                                                  │
│  /vault/ (agent's granted scope)                                │
│  ├── projects/                                                   │
│  │   └── project-a.md  →  [[meetings/standup]]                  │
│  │                     →  [[reference/api-docs]]                │
│  ├── meetings/                                                   │
│  │   └── standup.md    ←  backlink from project-a               │
│  └── reference/                                                  │
│      └── api-docs.md   ←  backlink from project-a               │
│                                                                  │
│  /secrets/ (OUTSIDE scope)                                       │
│  └── passwords.md                                                │
│                                                                  │
│  If project-a.md contains [[../secrets/passwords]]               │
│  The LINK exists, but agent CANNOT follow it (outside scope).   │
│                                                                  │
│  Graph helps navigation. Path controls access.                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Available Graph Features by Tool

### Obsidian MCP

| Feature | Available | How to Use |
|---------|-----------|------------|
| Outgoing links | Yes | Get links from a note |
| Backlinks | Yes | Find what links TO a note |
| Tags as search | Yes | Search by #tag |
| Graph view | No | Visual graph not exposed |

**Example calls:**
```
"What notes link to [[project-a]]?"
"Show me all outgoing links from this note"
"Search for notes tagged #security"
```

### Claude Code (Native)

| Feature | Available | How to Use |
|---------|-----------|------------|
| File imports | Yes | Grep for import statements |
| Call graphs | Manual | Trace function calls by reading |
| Type references | Manual | Follow type definitions |

Claude doesn't have built-in graph features, but can follow references by reading files.

### Cline

Same as Claude Code — follows file references by reading.

---

## Using Graph for Knowledge Navigation

### Pattern: Follow Links to Gather Context

```
Prompt: "Read the note on MCP security.
Then follow its outgoing links to gather related context.
Synthesize what you learn."
```

What happens:
1. Agent reads the main note
2. Sees [[related-note-1]], [[related-note-2]]
3. Reads those (if in scope)
4. Builds connected understanding

### Pattern: Find Related Content via Backlinks

```
Prompt: "What other notes reference this concept?
Use backlinks to find related material."
```

What happens:
1. Agent queries backlinks for current note
2. Gets list of notes that link here
3. Can read those for context

### Pattern: Knowledge Graph Traversal

```
Prompt: "Starting from [[architecture-overview]]:
1. Follow links to component docs
2. For each component, find related design decisions
3. Map out the relationships"
```

---

## Using Graph for Code Navigation

### Pattern: Follow Imports

```
Prompt: "Start at src/index.ts.
Follow the import statements to map the dependency tree."
```

What Claude does:
1. Reads index.ts
2. Parses import statements
3. Reads imported files
4. Recurses (depth-first for code)

### Pattern: Find Usages

```
Prompt: "Find all files that import or reference UserService."
```

What Claude does:
1. Grep for "UserService" or "import.*UserService"
2. Returns list of files
3. This is the "backlink" equivalent for code

### Pattern: Call Graph Tracing

```
Prompt: "Trace the call graph from handleRequest() down.
What functions does it call? What do those call?"
```

---

## Can You LIMIT Graph Navigation?

**Question:** "Can I set up an MCP server so the agent can navigate graph links but can't access certain linked files?"

**Answer:** Not directly. Options:

### Option 1: Path Boundaries (Works Today)

Put files you don't want accessed outside the MCP server's path scope. Links to them will be "dead" — agent sees the link text but can't follow it.

### Option 2: Multiple MCP Servers

```json
{
  "mcpServers": {
    "vault-general": {
      "env": { "VAULT_PATH": "/vault/general" }
    },
    "vault-restricted": {
      "env": { "VAULT_PATH": "/vault/restricted" }
    }
  }
}
```

Links between vaults are visible but not traversable by the wrong server.

### Option 3: Honor System with Instructions

```
Prompt: "When navigating links, do not follow links to
notes in the /personal/ folder. Skip those."
```

This is NOT access control — agent CAN read them, you're asking it not to.

### Option 4: Gateway-Level Filtering (Enterprise)

Future: A gateway could inspect graph traversal and block certain edges based on policy. This doesn't exist yet.

---

## Practical Workflows

### Research Workflow with Graph

```
1. Start: "Find notes about [topic]"
2. Navigate: "Follow links from those notes"
3. Gather: "What do the backlinks tell us?"
4. Synthesize: "Connect these ideas"
```

### Code Understanding with Graph

```
1. Entry: "Find the main entry point"
2. Traverse: "Follow imports depth-first"
3. Map: "Build the dependency structure"
4. Focus: "Now let's look at this component"
```

### Documentation with Graph

```
1. Index: "What docs exist for this system?"
2. Navigate: "Follow links between docs"
3. Gap Analysis: "What's missing or broken?"
4. Fix: "Update the broken links"
```

---

## MCP Servers with Graph Features

### Obsidian MCP

Best for: Knowledge graph in markdown vaults

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "obsidian-mcp"],
      "env": {
        "OBSIDIAN_API_KEY": "...",
        "OBSIDIAN_HOST": "http://localhost:27123"
      }
    }
  }
}
```

Features:
- Search notes
- Read note content
- Get backlinks
- Get outgoing links
- List files

### Neo4j MCP (If You Build It)

For actual graph database:

```json
{
  "mcpServers": {
    "neo4j": {
      "command": "node",
      "args": ["./neo4j-mcp-server.js"],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "..."
      }
    }
  }
}
```

Would enable:
- Cypher queries
- Graph traversal
- Relationship-based search

**Note:** No standard Neo4j MCP exists yet. You'd need to build or find one.

---

## Graph + Access Control

### Current State

```
Graph navigation:  ✓ Works (within scope)
Graph as access:   ✗ Doesn't exist
```

### What Would Graph-Based Access Look Like?

```
# Theoretical policy
allow_traversal {
    edge.type in ["references", "implements"]
    edge.source.classification <= user.clearance
}

deny_traversal {
    edge.type == "contains_secret"
}
```

This would allow navigating some edges while blocking others. Doesn't exist yet.

---

## Recommendations

### Today

1. **Use graph for navigation**, not access control
2. **Rely on path boundaries** for actual access
3. **Design folder structure** so paths align with access needs
4. **Use Obsidian MCP** if you want graph features for knowledge

### For Semantic Problems

Graph is great for breadth-first exploration:
- "What relates to this?"
- "What else mentions this concept?"
- "Map the connections"

### For Deterministic Problems

Use imports/calls as your "graph":
- Follow import statements
- Grep for function usages
- Trace data flow

---

## See Also

- [Path-Based Access](path-based-access.md) — What actually controls access
- [Tag-Based Access](tag-based-access.md) — Cross-cutting (not implemented)
- [Explicit Grants](explicit-grants.md) — Breaking out of scope
- [Solving Semantic Problems](../solving-semantic-problems.md) — Using graph for research
