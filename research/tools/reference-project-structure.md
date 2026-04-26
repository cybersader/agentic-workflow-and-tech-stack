---
created: 2025-12-15
updated: 2025-12-15
tags:
  - tools
  - claude-code
  - reference
  - portable
---

# Reference Project Structure: Portable vs Claude-Specific

This document shows a complete project structure with clear labeling of what's portable (works anywhere) vs what's Claude Code specific.

---

## The Honest Truth

```
┌─────────────────────────────────────────────────────────────────┐
│  PORTABLE = Your actual value (knowledge, conventions)          │
│  CLAUDE-SPECIFIC = Convenience features (auto-invoke, spawn)    │
│                                                                  │
│  If Claude Code dies tomorrow, you lose the convenience,        │
│  not the knowledge.                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Reference Folder Structure

```
my-project/
│
├── PROJECT.md                    # PORTABLE - Project context
│   │                             # Claude Code reads this as CLAUDE.md
│   │                             # Other tools: manually paste or configure
│   │
│   └── (symlink: CLAUDE.md → PROJECT.md)  # Optional compatibility
│
├── .claude/                      # CLAUDE CODE SPECIFIC
│   ├── skills/                   # Auto-invoked behaviors
│   │   └── research/
│   │       └── SKILL.md
│   ├── agents/                   # Explicitly spawned specialists
│   │   └── knowledge-curator.md
│   └── commands/                 # Slash command shortcuts
│       └── research.md
│
├── .mcp.json                     # MOSTLY PORTABLE (MCP is standard)
│                                 # Config format varies by tool
│
├── docs/                         # PORTABLE - Your knowledge
│   ├── architecture/
│   ├── research/
│   ├── learnings/               # Agent-discovered insights
│   └── INDEX.md                 # Navigation (works in any markdown viewer)
│
└── vault/                        # PORTABLE - Obsidian vault (optional)
    ├── Entity/
    │   └── Cybersader/
    │       └── Home Lab/
    ├── Capture/
    ├── Output/
    └── System/
```

---

## What Each Part Does

### PROJECT.md (Portable)

```markdown
# My Project

## Overview
What this project is about.

## Conventions
- YAML frontmatter on all docs
- Tags follow SEACOW: --entity/, -clip/, _/, /system

## Key Files
- docs/INDEX.md - Navigation
- docs/architecture/ - Design docs

## Current Infrastructure
- Home Assistant: [HOMELAB_IP]:8123
- TrueNAS: [NAS_IP]
```

**Why portable:** It's just markdown. Any tool can read it. Claude Code auto-reads it as CLAUDE.md, but you can paste it into ChatGPT, Cursor, whatever.

---

### .claude/skills/research/SKILL.md (Claude Code Specific)

```yaml
---
name: research
description: Research topics before answering. Use when asked
             to find information, investigate, or explain
             something that might be in the knowledge base.
allowed-tools:
  - Read
  - Glob
  - Grep
  - mcp__obsidian__simple_search
  - mcp__obsidian__get_file_contents
---

# Research Skill

## When Activated
This skill triggers when you ask questions that might have
answers in the vault.

## Workflow
1. Search vault first (obsidian_simple_search)
2. Read relevant files
3. Synthesize answer
4. Cite sources

## WITHOUT Good RAG
Also check these locations:
- docs/research/ for research notes
- docs/learnings/ for discovered insights
- vault/Entity/Cybersader/ for personal knowledge

## WITH Good RAG
Just search. RAG handles the "where."
Focus on synthesis and citation.
```

**Why Claude Code specific:** The auto-invocation based on description matching is a Claude Code feature. Other tools don't have this.

**Migration path:** If you switch tools, this becomes a prompt you manually invoke.

---

### .claude/agents/knowledge-curator.md (Claude Code Specific)

```markdown
# Knowledge Curator Agent

You are a specialized agent for managing the knowledge base.

## Your Mission
Research topics, synthesize findings, write learnings to vault.

## Tools Available
- obsidian_simple_search(query)
- obsidian_get_file_contents(filepath)
- obsidian_append_content(filepath, content)
- Read, Write, Glob, Grep

## Workflow
1. Search existing vault
2. Identify gaps
3. Synthesize new insights
4. Write to docs/learnings/YYYY-MM-DD-topic.md
5. Return summary to caller

## Conventions
- YAML frontmatter required
- One insight per file
- Cite sources
```

**Why Claude Code specific:** The Task tool spawning mechanism is Claude Code specific.

**Migration path:** This becomes a standalone script or a prompt template for other tools.

---

### .mcp.json (Mostly Portable)

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "obsidian-mcp"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/vault"
      }
    },
    "home-assistant": {
      "command": "npx",
      "args": ["-y", "@anthropic/home-assistant-mcp"],
      "env": {
        "HA_URL": "http://[HOMELAB_IP]:8123",
        "HA_TOKEN": "${HA_TOKEN}"
      }
    }
  }
}
```

**Why mostly portable:** MCP is a standard protocol. The servers themselves work across tools. But config format varies (some tools use different file names or formats).

---

## The Access Control Model

```
┌─────────────────────────────────────────────────────────────────┐
│  WHO CAN USE WHAT TOOLS?                                        │
│                                                                  │
│  Main Claude instance:                                          │
│  └── All tools configured in .mcp.json                         │
│  └── All built-in tools (Read, Write, Bash, etc.)              │
│                                                                  │
│  Skills:                                                         │
│  └── Tools listed in allowed-tools (RESTRICTION)               │
│  └── If not specified, inherits from main instance             │
│                                                                  │
│  Subagents:                                                      │
│  └── Tools specified when spawned                              │
│  └── Can be restricted per-agent                               │
│                                                                  │
│  MCP Gateway (enterprise):                                      │
│  └── Policy layer BEFORE tool execution                        │
│  └── User identity + tool + action = allow/deny                │
└─────────────────────────────────────────────────────────────────┘
```

### Tool Access in Skills

```yaml
---
name: read-only-research
allowed-tools:
  - Read
  - Glob
  - Grep
  - mcp__obsidian__simple_search
  - mcp__obsidian__get_file_contents
# CANNOT: Write, Edit, Bash, mcp__obsidian__append_content
---
```

### Tool Access in Subagents

When spawning via Task tool, you can specify which tools the subagent gets. But currently this is implicit (subagent gets the tools appropriate for its type).

---

## RAG Changes Everything

### Without RAG (Current State)

```
┌─────────────────────────────────────────────────────────────────┐
│  You: "What's my TrueNAS setup?"                                │
│                                                                  │
│  Claude:                                                         │
│  1. Skill tells me to search vault                              │
│  2. obsidian_simple_search("truenas")                           │
│  3. Results: 15 files with "truenas"                            │
│  4. I read the most relevant-looking ones                       │
│  5. Synthesize answer                                           │
│                                                                  │
│  Problems:                                                       │
│  - Keyword search misses semantic matches                       │
│  - "NAS", "storage server", "TrueNAS" are different queries     │
│  - Skill needs to know WHERE to look as backup                  │
└─────────────────────────────────────────────────────────────────┘
```

### With Good RAG (Future State)

```
┌─────────────────────────────────────────────────────────────────┐
│  You: "What's my TrueNAS setup?"                                │
│                                                                  │
│  Claude:                                                         │
│  1. RAG search (semantic + graph)                               │
│  2. Results: Top 5 most relevant chunks, ranked by meaning      │
│  3. Includes: "storage server" doc, "home lab infra" doc        │
│  4. Synthesize answer                                           │
│                                                                  │
│  Benefits:                                                       │
│  - Finds semantically related content                           │
│  - Multi-hop: "TrueNAS → storage → home lab → network"          │
│  - Skill just says "search" not "search these folders"          │
└─────────────────────────────────────────────────────────────────┘
```

### What Skills Become With RAG

```yaml
---
name: research
description: Research topics in the knowledge base
allowed-tools:
  - mcp__rag__search          # Semantic + graph search
  - mcp__obsidian__get_file_contents
---

# Research Skill

## Workflow
1. Use RAG search (handles the "where")
2. Read full files for top results
3. Synthesize
4. Cite sources with [[wikilinks]]

## Conventions
- Always cite sources
- If ambiguous, ask for clarification
- Write new learnings to docs/learnings/
```

Note: No folder paths needed. RAG handles retrieval. Skill defines workflow.

---

## Does Claude Auto-Read Folders?

**No.** Claude Code does NOT automatically read markdown files from folders.

What it DOES do:
- Auto-reads CLAUDE.md at session start
- Auto-invokes skills when descriptions match
- Provides tools to read files (but you have to ask or it has to decide)

What would make it auto-read:
- A skill that says "always read these files first"
- You asking "read the docs folder"
- A subagent with instructions to load context

### The "Skill as Auto-Loader" Pattern

```yaml
---
name: project-context
description: Load full project context. Use at session start
             or when asked about the project architecture.
---

# Project Context Skill

## On Activation
Read these files to get full context:
1. PROJECT.md (already loaded as CLAUDE.md)
2. docs/INDEX.md
3. docs/ROADMAP.md
4. docs/architecture/12-personal-architecture.md

## When to Use
- Session start
- "What is this project?"
- "What have we decided?"
```

This WOULD cause auto-reading when the skill triggers. But you're right — this is Claude Code lock-in.

---

## Avoiding Lock-in: A Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  CORE PRINCIPLE: Keep value in portable formats                 │
│                                                                  │
│  1. Knowledge lives in markdown (not in skill files)            │
│  2. Conventions documented in PROJECT.md (not just CLAUDE.md)   │
│  3. RAG search via MCP (standard protocol)                      │
│  4. Skills/agents are CONVENIENCE, not NECESSITY                │
│                                                                  │
│  If you can do your work by:                                    │
│    - Pasting PROJECT.md into any LLM                           │
│    - Manually searching your vault                              │
│    - Manually invoking prompts                                  │
│                                                                  │
│  Then skills/agents are just automation on top.                 │
│  You're not locked in — you're just more efficient.             │
└─────────────────────────────────────────────────────────────────┘
```

### Migration Paths

| Claude Code Feature | If You Switch To Cursor/Codex/etc |
|---------------------|-----------------------------------|
| CLAUDE.md auto-read | Paste PROJECT.md into context |
| Skills auto-invoke | Use prompt templates manually |
| Subagents | Use separate chat windows or scripts |
| MCP tools | Reconfigure for new tool's format |
| Vault structure | Unchanged (it's just files) |

---

## Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR QUESTION: "Isn't this just Claude Code lock-in?"          │
│                                                                  │
│  HONEST ANSWER: Partially, yes.                                 │
│                                                                  │
│  The auto-invoke, skill matching, subagent spawning —           │
│  those are Claude Code specific.                                │
│                                                                  │
│  But the KNOWLEDGE (vault, docs, conventions) is portable.      │
│  And MCP servers are mostly portable.                           │
│                                                                  │
│  Strategy: Use Claude Code features for speed,                  │
│  but don't encode critical logic in non-portable formats.       │
│                                                                  │
│  With good RAG: Skills become workflow definitions,             │
│  not retrieval maps. That's MORE portable (workflow is just     │
│  a prompt, RAG handles finding content).                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## See Also

- [Agent Workflow Guide](agent-workflow-guide.md) - Full mental model
- [Context Management](context-management.md) - Working within limits
- [Personal Architecture](../architecture/12-personal-architecture.md) - Where things live
