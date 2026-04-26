---
created: 2025-01-15
updated: 2025-12-20
tags:
  - tools
  - claude-code
  - agents
  - workflow
  - reference
---

# Claude Code Mental Model: Files, Skills, Agents, Tools

This document explains how hierarchical filesystems, Claude Code conventions, skills, subagents, and MCP tools all fit together into one coherent system.

---

## TL;DR — The 30-Second Version

```
EVERYTHING IS FILES. Claude has no magic memory.

┌──────────────────────────────────────────────────────────────┐
│  CLAUDE.md      → Always read. Project context (PORTABLE)    │
│  AGENTS.md      → Available agents to offload to (PORTABLE)  │
│  Skills         → Auto-invoked WORKFLOWS (Claude Code only)  │
│  Subagents      → Side quests for complex tasks (CC only)    │
│  MCP Tools      → External capabilities (PORTABLE protocol)  │
│  Vault/Files    → THE MEMORY. All knowledge (PORTABLE)       │
└──────────────────────────────────────────────────────────────┘

THE KEY INSIGHT: CONTEXT FUNNELING via PROGRESSIVE DISCLOSURE
  Problem:  Gigabytes → 200K tokens (must funnel)
  Solution: Disclose progressively in stages

  Level 1: Skill metadata (always loaded, ~100 tokens)
  Level 2: SKILL.md (loaded when relevant, ~1000 tokens)
  Level 3+: Referenced files (loaded as needed)
  Level ∞: Vault via MCP/RAG (effectively unbounded)

  Skills don't hold knowledge—they ORCHESTRATE disclosure.

TOOL ACCESS:
  • Skills have allowed-tools (access control by design)
  • Subagents have tool access (fresh context + tools)
  • MCP gateway can enforce policy (enterprise)

LOCK-IN REALITY:
  • Knowledge/vault = portable
  • CLAUDE.md/AGENTS.md = portable (any AI reads markdown)
  • MCP protocol = mostly portable
  • Skills/subagents = Claude Code specific (convenience, not necessity)
```

---

## The Fundamental Truth

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   EVERYTHING IS FILES                                            │
│                                                                  │
│   • Your knowledge = files (Obsidian vault)                     │
│   • Claude's "memory" = files (CLAUDE.md, vault)                │
│   • Skills = files (.claude/skills/)                            │
│   • Agents = files (.claude/agents/)                            │
│   • Config = files (.claude/, mcp.json)                         │
│                                                                  │
│   The filesystem IS the system. Claude reads files.             │
│   There is no magic persistence—only what's written down.       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Global vs Project-Level: Where Things Live

```
┌─────────────────────────────────────────────────────────────────┐
│  GLOBAL (user-level)                                             │
│  Location: ~/.claude/                                            │
│  ─────────────────────────────────────────────────────────────  │
│  Contains:                                                       │
│  • Skills/agents you want in ALL projects                       │
│  • Meta-agents (skill-builder, agent-builder)                   │
│  • Personal conventions that follow you everywhere              │
│                                                                  │
│  NOT version controlled with any project                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  PROJECT-LEVEL                                                   │
│  Location: {project}/.claude/                                    │
│  ─────────────────────────────────────────────────────────────  │
│  Contains:                                                       │
│  • Skills/agents specific to THIS project                       │
│  • Domain-specific workflows                                    │
│  • Project conventions (if different from global)               │
│                                                                  │
│  Version controlled with the project (share with team)          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### What Goes Where?

| Agent/Skill | Level | Why |
|-------------|-------|-----|
| `skill-builder` | **Global** | Want it everywhere to create project skills |
| `agent-builder` | **Global** | Want it everywhere to create project agents |
| `knowledge-curator` | **Project** | Specific to this vault's conventions |
| `vault-research` | **Project** | Specific to this project's structure |
| `code-conventions` | **Project** | Each project has different style |

### Directory Structure

```
~/.claude/                              # GLOBAL
├── agents/
│   ├── skill-builder.md                # Meta: available everywhere
│   ├── agent-builder.md                # Meta: available everywhere
│   └── agentic-systems-architect.md    # Personal agent
└── skills/
    └── {personal-skills}/              # Your universal skills

{project}/.claude/                      # PROJECT-LEVEL
├── agents/
│   └── knowledge-curator.md            # Project-specific
└── skills/
    └── {project-skills}/               # Project-specific
```

### Resolution Order

When Claude looks for skills/agents:
1. **Project-level first** — `./{project}/.claude/`
2. **Global fallback** — `~/.claude/`

Project-level can override global if needed.

---

## The Complete Picture

```
YOUR PROJECT DIRECTORY
│
├── CLAUDE.md                      ← ALWAYS READ FIRST
│   (Project context, conventions, pointers)
│
├── .claude/                       ← CLAUDE CODE CONFIG
│   ├── skills/                    ← Auto-invoked capabilities
│   │   └── skill-name/
│   │       └── SKILL.md
│   ├── agents/                    ← Explicitly-invoked specialists
│   │   └── agent-name.md
│   └── commands/                  ← Slash commands (/command-name)
│       └── command-name.md
│
├── .mcp.json                      ← MCP SERVER CONFIG
│   (Which tools Claude can use)
│
└── docs/                          ← YOUR KNOWLEDGE BASE
    ├── architecture/
    ├── research/
    ├── learnings/                 ← Agent-written insights
    └── ...
```

---

## How Each Piece Works

### 1. CLAUDE.md — The Entry Point

**What:** A markdown file in your project root.
**When read:** Automatically, at the start of every session.
**Purpose:** Give Claude immediate context about your project.

```
┌─────────────────────────────────────────────────────────────────┐
│  CLAUDE.md is your "system prompt" for this project             │
│                                                                  │
│  Include:                                                        │
│  • What this project is                                         │
│  • Key decisions already made                                   │
│  • Conventions to follow (frontmatter, tags, folders)           │
│  • Pointers to important docs                                   │
│                                                                  │
│  Don't include:                                                  │
│  • Everything—keep it <500 lines                                │
│  • Content that changes frequently                              │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2. Skills — Auto-Invoked Capabilities

**What:** Markdown files in `.claude/skills/skill-name/SKILL.md`
**When invoked:** Automatically, when Claude detects relevance based on description.
**Purpose:** Encode "how to do X" so you don't repeat yourself.

```
┌─────────────────────────────────────────────────────────────────┐
│  SKILLS = AUTOMATIC BEHAVIOR                                     │
│                                                                  │
│  You: "Write a doc about MCP gateways"                          │
│                                                                  │
│  Without skill:                                                  │
│    Claude writes doc however it wants                           │
│                                                                  │
│  With "vault-conventions" skill:                                │
│    Claude auto-applies your frontmatter, tags, folder rules     │
│    because the skill description matched "write a doc"          │
│                                                                  │
│  You didn't ask for the skill—Claude used it automatically      │
└─────────────────────────────────────────────────────────────────┘
```

**Skill file structure:**
```yaml
---
name: skill-name
description: What it does AND when to use it (this is how Claude finds it)
allowed-tools: Read, Grep, Glob  # Optional: restrict tools
---

# Skill Name

Instructions for Claude when this skill activates...
```

**Key insight:** The `description` field is how Claude decides to use the skill. Write it like: "Do X when Y happens."

---

### 3. Subagents — Explicitly-Invoked Specialists

**What:** Markdown files in `.claude/agents/agent-name.md`
**When invoked:** Explicitly, via the Task tool or when you ask for it.
**Purpose:** Delegate complex tasks to a fresh context.

```
┌─────────────────────────────────────────────────────────────────┐
│  SUBAGENTS = EXPLICIT DELEGATION                                 │
│                                                                  │
│  You: "Use the knowledge-curator agent to research X"           │
│                                                                  │
│  What happens:                                                   │
│  1. Main Claude spawns a NEW Claude instance                    │
│  2. New instance gets FRESH context (not your conversation)     │
│  3. New instance reads the agent file for instructions          │
│  4. New instance does work, returns summary                     │
│  5. New instance DIES (no persistence)                          │
│                                                                  │
│  Your context stays clean—only the summary comes back           │
└─────────────────────────────────────────────────────────────────┘
```

**Why use subagents instead of just asking Claude directly?**

| Direct Ask | Via Subagent |
|------------|--------------|
| Files loaded into YOUR context | Files loaded into SUBAGENT's context |
| Context fills up | Your context stays clean |
| Good for small tasks | Good for large exploration |

---

### 4. MCP Tools — External Capabilities

**What:** Connections to external servers that provide tools.
**Configured in:** `.mcp.json` or via `/mcp` commands.
**Purpose:** Let Claude interact with external systems (Obsidian, Home Assistant, APIs).

```
┌─────────────────────────────────────────────────────────────────┐
│  MCP = CLAUDE'S HANDS                                            │
│                                                                  │
│  Without MCP:                                                    │
│    Claude can only read/write files in your project             │
│                                                                  │
│  With MCP:                                                       │
│    Claude can search Obsidian, control Home Assistant,          │
│    query databases, call APIs...                                │
│                                                                  │
│  MCP servers are stateless function calls:                      │
│    obsidian_simple_search("gateway") → returns results          │
│    No memory, no context, just input → output                   │
└─────────────────────────────────────────────────────────────────┘
```

#### MCP + Skills: Complementary, Not Competing

> **"MCP is providing the connection to the outside world while skills are providing the expertise."**
> — Anthropic DevDay Talk

**The relationship:**
- **MCP**: Connectivity layer - "How do I call the Home Assistant API?"
- **Skills**: Expertise layer - "How do I check if lights are on and turn them off if needed?"

**Example workflow:**
1. Skill knows the WORKFLOW: "To control lighting, first check state, then decide action"
2. Skill uses MCP tools to EXECUTE: `home_assistant.get_state()`, `home_assistant.turn_off()`
3. MCP provides CONNECTIVITY, skill provides DOMAIN LOGIC

**Emerging architecture:**
```
Agent Runtime
├── Agent Loop (manages context)
├── Runtime Environment (file system, code execution)
├── MCP Servers (connectivity to external data/tools) ← "The hands"
└── Skills Library (domain expertise, workflows)        ← "The brain"
```

This separation means:
- You can swap MCP implementations without changing skills
- You can share skills across different MCP setups
- Skills orchestrate multiple MCP tools into coherent workflows

---

### 5. Slash Commands — Quick Prompts

**What:** Markdown files in `.claude/commands/command-name.md`
**When invoked:** Explicitly, when you type `/command-name`.
**Purpose:** Shortcuts for prompts you use frequently.

```
┌─────────────────────────────────────────────────────────────────┐
│  COMMANDS = SAVED PROMPTS                                        │
│                                                                  │
│  Instead of typing: "Search the vault for X, summarize          │
│  findings, and write to learnings if you find something new"    │
│                                                                  │
│  You type: /research X                                          │
│                                                                  │
│  The command file contains the full prompt template             │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Hierarchy of Invocation

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ALWAYS ON          │  CLAUDE.md                                │
│  (read every        │  (project context)                        │
│   session)          │                                           │
│                     │                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  AUTO-INVOKED       │  Skills                                   │
│  (Claude decides    │  (based on description matching)          │
│   based on context) │                                           │
│                     │                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  EXPLICITLY         │  Subagents (Task tool)                    │
│  INVOKED            │  Slash commands (/command)                │
│  (you ask for it)   │  MCP tools (Claude decides, but you      │
│                     │    can direct: "search the vault for X")  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Skills vs Subagents: When to Use Which

### Critical Distinction: Context Behavior

```
┌─────────────────────────────────────────────────────────────────┐
│  SKILLS = SAME CONTEXT WINDOW (additions)                        │
│  ──────────────────────────────────────────                      │
│                                                                  │
│  Your context: [CLAUDE.md] + [skill.md] + [your conversation]   │
│                                                                  │
│  Skills are LOADED INTO your context.                           │
│  They don't escape context limits.                              │
│  They're for changing HOW Claude behaves.                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  SUBAGENTS = FRESH CONTEXT WINDOW (separate)                    │
│  ───────────────────────────────────────────                    │
│                                                                  │
│  Your context: [CLAUDE.md] + [your conversation]                │
│       │                                                          │
│       └── Spawns subagent with FRESH context                    │
│           Subagent: [its instructions] + [its exploration]      │
│           Returns: compressed summary to you                     │
│                                                                  │
│  Subagents ESCAPE your context limits.                          │
│  They burn through their own context, return distilled results. │
│  They're for OFFLOADING WORK.                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implication:** If you want something to explore and come back with distilled info, use a SUBAGENT. If you want Claude to follow certain conventions, use a SKILL.

```
┌─────────────────────────────────────────────────────────────────┐
│  USE SKILLS WHEN:                                                │
│                                                                  │
│  • You want behavior to apply AUTOMATICALLY                     │
│  • It's about HOW Claude does things (conventions, style)       │
│  • Examples:                                                     │
│    - "Always use YAML frontmatter when writing docs"            │
│    - "When researching, search vault before answering"          │
│    - "When writing learnings, use atomic files"                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  USE SUBAGENTS WHEN:                                             │
│                                                                  │
│  • Task requires loading many files (keeps your context clean)  │
│  • You want a SPECIALIST with focused instructions              │
│  • Task is complex enough to warrant delegation                 │
│  • Examples:                                                     │
│    - "Explore codebase and summarize auth flow"                 │
│    - "Research everything we know about X"                      │
│    - "Plan the implementation for feature Y"                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Practical: Breaking Out of Naive Mode

### The Naive Pattern (What You're Probably Doing)

```
You: Do X
Claude: [reads 10 files, fills context]
Claude: Here's X
You: Actually, also do Y
Claude: [reads 10 more files]
Claude: Here's Y
You: Wait, that's wrong because Z
Claude: [context at 60%, in the "dumb zone"]
Claude: [makes mistakes, you correct, it gets worse]
You: [give up or start over]
```

**Problems:**
- Context fills up with exploration, not solution
- Corrections create negative trajectory
- No distillation happening
- You're the only one managing complexity

### The Smart Pattern (Offload Early)

```
You: I need to do X
You: First, use a subagent to research how our codebase handles similar things
Claude: [spawns Explore agent with fresh context]
          ↓
          [Explore burns through 50 files]
          [Returns: "File A:42 and File B:100 are relevant"]
          ↓
Claude: Based on the research, here's the approach...
You: That looks right, proceed
Claude: [small context, only relevant files, executes cleanly]
```

### When to Offload: Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│  SHOULD I OFFLOAD THIS?                                          │
│                                                                  │
│  Will this require reading more than 3-5 files?                 │
│  ├── YES → Spawn subagent (Explore, Plan, or custom)            │
│  └── NO  → Do it directly                                       │
│                                                                  │
│  Am I asking "how does X work in this codebase?"                │
│  ├── YES → Spawn Explore agent                                  │
│  └── NO  → Continue                                             │
│                                                                  │
│  Is this a multi-step implementation?                           │
│  ├── YES → Spawn Plan agent, review plan, then implement        │
│  └── NO  → Do it directly                                       │
│                                                                  │
│  Will I need this information again in future sessions?         │
│  ├── YES → Write to vault (docs/learnings/) after              │
│  └── NO  → Ephemeral is fine                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### How to Know It's Working (Visibility)

**In Claude Code, you'll see:**
```
⏳ Launching agent: Explore codebase structure    ← Subagent spawned
   [agent explores in fresh context]
   [agent returns summary]
✓ Agent completed                                  ← Back to parent

⏳ Launching task: Research MCP patterns          ← Task tool used
   ...
```

**If you DON'T see this, you're doing it yourself.** That's the problem.

**To force subagent usage:**
```
Prompt: "Use the Explore agent to find how auth works"
        "Spawn a subagent to research this, then report back"
        "Use a fresh context to investigate X, summarize findings"
```

### The Distillation Pipeline Pattern

For complex research, use **nested context compression**:

```
┌─────────────────────────────────────────────────────────────────┐
│  HIERARCHICAL DISTILLATION                                       │
│                                                                  │
│  You: "Research how to implement feature X"                     │
│                                                                  │
│  Main Agent                                                      │
│       │                                                          │
│       ├── Spawns: Architecture Explorer                         │
│       │       └── Explores: /docs/architecture/                 │
│       │       └── Returns: "Key patterns are..."                │
│       │                                                          │
│       ├── Spawns: Codebase Explorer                             │
│       │       └── Explores: /src/ for similar features          │
│       │       └── Returns: "Existing impl at X:42..."           │
│       │                                                          │
│       ├── Spawns: Research Synthesizer                          │
│       │       └── Reads findings from above                     │
│       │       └── Writes: docs/learnings/YYYY-MM-DD-feature.md  │
│       │                                                          │
│       └── Main agent now has compressed knowledge               │
│           Can proceed with implementation in clean context       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Prompt to trigger this:**
```
"Research how to implement X:
1. Use subagents to explore the architecture docs
2. Use subagents to find similar implementations in code
3. Synthesize findings into a learnings file
4. Then report back with a plan"
```

### The Knowledge Curator Pattern

Your `knowledge-curator` agent can be invoked for vault operations:

```
Prompt: "Use the knowledge-curator agent to:
- Search the vault for existing info on [topic]
- Identify gaps
- Write a learnings file with what you find
- Return a summary"
```

This keeps exploration out of your main context.

### The CLAUDE.md Updater Pattern

**Question:** Should we have a skill or subagent that updates CLAUDE.md?

**Answer:** A **subagent**, not a skill. Here's why:

```
┌─────────────────────────────────────────────────────────────────┐
│  CLAUDE.MD UPDATER = SUBAGENT                                    │
│                                                                  │
│  Why NOT a skill:                                                │
│  • Updating CLAUDE.md requires WORK (scanning, understanding)   │
│  • That work burns context                                      │
│  • Skills add to YOUR context, not separate                     │
│                                                                  │
│  Why a subagent:                                                 │
│  • Fresh context to scan project                                │
│  • Can read many files without bloating your context            │
│  • Returns: "Here's the proposed CLAUDE.md update"              │
│  • You review, approve, then it writes                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Example agent file (.claude/agents/claude-md-updater.md):**
```markdown
---
name: claude-md-updater
---

# CLAUDE.md Updater

## Mission
Scan the project and propose updates to CLAUDE.md to keep it accurate.

## Workflow
1. Read current CLAUDE.md
2. Scan project structure (Glob, Grep)
3. Check for:
   - New important files not mentioned
   - Deleted files still referenced
   - Changed conventions
   - New decisions made (check docs/learnings/, recent commits)
4. Draft proposed changes
5. Return summary: what changed and why

## Output Format
Return:
- Proposed CLAUDE.md content (full or diff)
- Summary of changes
- Questions if unsure

## What I DON'T do
- Write directly without approval
- Make style changes
- Add content you haven't documented
```

**Invocation:**
```
Prompt: "Use the claude-md-updater agent to check if CLAUDE.md
        needs updating based on recent project changes"
```

**Why this works:**
- Subagent scans in fresh context (doesn't bloat your main context)
- Returns compressed summary (what changed)
- Human reviews before committing
- Keeps CLAUDE.md accurate without manual maintenance

---

## Memory and Persistence

### The Core Problem

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENTS DON'T REMEMBER                                           │
│                                                                  │
│  Session 1: Claude learns X                                     │
│  Session 2: Claude doesn't know X (fresh context)               │
│                                                                  │
│  Subagent runs: Learns Y                                        │
│  Subagent dies: Y is gone (unless written to file)              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The Solution: Files Are Memory

```
┌─────────────────────────────────────────────────────────────────┐
│  THE VAULT IS THE MEMORY                                         │
│                                                                  │
│  Want Claude to "remember" something?                           │
│  → Write it to a file                                           │
│                                                                  │
│  Want Claude to "know" your conventions?                        │
│  → Put them in CLAUDE.md or a skill                             │
│                                                                  │
│  Want Claude to "learn" from research?                          │
│  → Write learnings to docs/learnings/                           │
│                                                                  │
│  Next session reads the files → "remembers"                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Self-Improving Knowledge Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  WRITE-TO-VAULT LEARNING                                         │
│                                                                  │
│  1. You: "Research X, save useful findings"                     │
│  2. Agent researches (searches, reads, synthesizes)             │
│  3. Agent writes: docs/learnings/2025-01-15-x.md                │
│  4. Agent returns summary to you                                │
│  5. Next session: Agent can read that learning file             │
│                                                                  │
│  The file is the memory. The agent is just the processor.       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Skills Enable Continuous Learning

From Anthropic's research:

> **"This standardized format gives a very important guarantee. Anything that Claude writes down can be used efficiently by a future version of itself. This makes the learning actually transferable."**

**What this means:**
- **Skills are procedural memory** - Claude can write skills for future Claude
- **Learning compounds over time** - Day 30 Claude > Day 1 Claude (because of accumulated skills)
- **Organizational knowledge persists** - New team members inherit team's collective expertise
- **Not just human-authored** - Claude can use the skill-builder to create skills as it learns

**Example learning cycle:**
1. You work with Claude on a complex task
2. Claude discovers a better workflow
3. Claude (or you) writes a skill encoding that workflow
4. Future sessions automatically use the improved approach
5. Knowledge transfers across your entire team/vault

This is why `docs/learnings/` and skills stored in Git are so powerful - they're the mechanism for continuous improvement.

---

## Information Retrieval Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: ALWAYS LOADED                                          │
│  ─────────────────────                                           │
│  • CLAUDE.md (project context)                                  │
│  • Skills (conventions, behaviors)                              │
│  • Your conversation history (current session)                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: ON-DEMAND (MCP)                                        │
│  ────────────────────────                                        │
│  • obsidian_simple_search("keyword")                            │
│  • obsidian_get_file_contents(path)                             │
│  • obsidian_complex_search(tags, dates)                         │
│                                                                  │
│  Keyword-based, fast, but no semantic understanding             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: FUTURE (GraphRAG)                                      │
│  ──────────────────────────                                      │
│  • Semantic search (meaning, not just keywords)                 │
│  • Graph traversal (relationships between concepts)             │
│  • Multi-hop reasoning ("X relates to Y which connects to Z")   │
│                                                                  │
│  Requires: Neo4j, Qdrant, embedding pipeline, MCP server        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Putting It All Together

### Your Daily Workflow

```
1. START SESSION
   └── Claude reads CLAUDE.md automatically
   └── Skills are available (auto-invoke when relevant)

2. ASK QUESTIONS
   ├── Simple question → Claude answers from context
   ├── Need vault info → Claude uses MCP search (or you direct it)
   └── Complex research → Spawn subagent, get summary back

3. CREATE CONTENT
   └── Skills auto-apply your conventions (frontmatter, tags, folders)

4. LEARN SOMETHING NEW
   └── Write to docs/learnings/ so future sessions can read it

5. END SESSION
   └── Everything in files persists
   └── Everything only in conversation is gone
```

### Decision Tree

```
What do you need?

Claude to automatically follow conventions?
└── Create a SKILL

Claude to do complex research without filling your context?
└── Use a SUBAGENT

Claude to interact with external systems?
└── Configure MCP

A shortcut for a prompt you use often?
└── Create a SLASH COMMAND

Claude to "remember" something across sessions?
└── Write it to a FILE (vault, learnings, CLAUDE.md)
```

---

## Technology Stack Summary

| Component | What It Is | Required? |
|-----------|-----------|-----------|
| **CLAUDE.md** | Project context file | Yes (for consistency) |
| **Skills** | Auto-invoked behaviors | Optional but powerful |
| **Subagents** | Delegated specialists | Optional but powerful |
| **MCP Obsidian** | Vault search/read | Yes (for knowledge retrieval) |
| **MCP Gateway** | Single endpoint for multiple MCPs | Optional (nice for many servers) |
| **GraphRAG** | Semantic + graph retrieval | Future (requires Neo4j, Qdrant) |
| **docs/learnings/** | Agent-written insights | Recommended (for persistence) |

### The Computing Stack Analogy

From [Anthropic's Skills Paradigm talk](https://www.anthropic.com/devday):

| Computing Layer | Traditional | AI Agents |
|----------------|-------------|-----------|
| **Hardware** | Processors (Intel, AMD) | **Models** (Claude, GPT, Gemini) |
| **Operating System** | OS (Windows, Linux) | **Agent Runtime** (Claude Code, Cursor) |
| **Applications** | Apps (browser, IDE) | **Skills** (domain expertise) |

**Key insight:** Skills are the "application layer" for AI agents. Just as millions of developers build apps on top of a few operating systems, we can build thousands of skills on top of agent runtimes like Claude Code.

**What this means practically:**
- You don't rebuild the OS (agent runtime) for each use case
- You build skills (applications) that run on the runtime
- Skills are composable, shareable, and evolve like software

---

---

## Context Funneling & Progressive Disclosure

Two ways to understand the same core problem:

```
┌─────────────────────────────────────────────────────────────────┐
│  CONTEXT FUNNELING (the problem)                                │
│  ───────────────────────────────                                │
│  Gigabytes of knowledge → 200K token window                     │
│  You must FUNNEL the right context at the right time            │
│                                                                  │
│  PROGRESSIVE DISCLOSURE (the solution)                          │
│  ─────────────────────────────────────                          │
│  Load information in stages, not all at once                    │
│  Each level reveals more detail only when needed                │
└─────────────────────────────────────────────────────────────────┘
```

> "Like a well-organized manual with table of contents, chapters, and appendix,
> progressive disclosure provides information in stages."
> — [Anthropic Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

### The Fundamental Constraint

```
┌─────────────────────────────────────────────────────────────────┐
│  THE BOTTLENECK                                                  │
│                                                                  │
│  Your knowledge: Gigabytes of nuanced content                   │
│  Context window: ~200K tokens (~150K words)                     │
│                                                                  │
│  You CANNOT fit everything. You must DISCLOSE PROGRESSIVELY.    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Progressive Disclosure Levels

```
┌─────────────────────────────────────────────────────────────────┐
│  LEVEL 1: METADATA (always loaded)                              │
│  ─────────────────────────────────                              │
│  Skill name + description in system prompt                      │
│  Cost: ~50-100 tokens per skill                                 │
│  Claude uses this to DECIDE if skill is relevant                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  LEVEL 2: SKILL.md (loaded when relevant)                       │
│  ─────────────────────────────────────────                      │
│  Full skill instructions, workflow steps                        │
│  Cost: ~500-2000 tokens                                         │
│  Claude reads this when task matches description                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  LEVEL 3+: REFERENCED FILES (loaded as needed)                  │
│  ──────────────────────────────────────────────                 │
│  Supporting docs, examples, domain knowledge                    │
│  Cost: Variable (only what's needed)                            │
│  Claude reads these based on SKILL.md instructions              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  LEVEL ∞: YOUR VAULT (effectively unbounded)                    │
│  ──────────────────────────────────────────                     │
│  Full knowledge base, searchable via MCP/RAG                    │
│  Cost: Only retrieved chunks enter context                      │
│  With filesystem access, skills can reference unlimited content │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight:** Progressive disclosure makes context "effectively unbounded" for agents with filesystem and search capabilities.

### What Can Go Where?

```
┌─────────────────────────────────────────────────────────────────┐
│  SKILL FILE (small)                                              │
│  ───────────────────                                             │
│  CAN contain:                                                    │
│  • Description (how Claude discovers it)                        │
│  • Retrieval patterns ("search vault for X when Y")             │
│  • Conventions ("use YAML frontmatter like this")               │
│  • Folder/tag structure hints                                   │
│                                                                  │
│  CANNOT contain:                                                 │
│  • All your domain knowledge                                    │
│  • Every nuance of your home lab setup                         │
│  • Complete fitness philosophy                                  │
│                                                                  │
│  SHOULD point to:                                                │
│  • Where the domain knowledge lives in your vault               │
│  • How to retrieve it                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AGENT FILE (small)                                              │
│  ──────────────────                                              │
│  CAN contain:                                                    │
│  • Mission/role description                                     │
│  • Tool instructions (which MCP tools to use)                   │
│  • Retrieval workflow ("search first, then read, then...")      │
│  • Output format expectations                                   │
│                                                                  │
│  CANNOT contain:                                                 │
│  • All domain knowledge (same problem)                          │
│                                                                  │
│  SHOULD:                                                         │
│  • Know WHERE to look                                           │
│  • Know HOW to search                                           │
│  • Retrieve domain knowledge at runtime                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  YOUR VAULT (large)                                              │
│  ──────────────────                                              │
│  CONTAINS:                                                       │
│  • All the nuance                                               │
│  • All the domain knowledge                                     │
│  • History, decisions, context                                  │
│                                                                  │
│  STRUCTURED BY:                                                  │
│  • Folders (storage necessity)                                  │
│  • Tags (knowledge relationships)                               │
│  • Frontmatter (queryable metadata)                             │
│  • Links (explicit connections)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Solution: Workflow Definitions (Not Just Retrieval)

**Key insight:** With good RAG, skills become WORKFLOW definitions, not retrieval maps.

```
WITHOUT RAG (keyword search only):
┌─────────────────────────────────────────────────────────────────┐
│  Skills need to define WHERE to look:                           │
│  - Folder paths                                                  │
│  - Tag queries                                                   │
│  - Search strategies                                             │
│                                                                  │
│  This is a WORKAROUND for lack of semantic search               │
└─────────────────────────────────────────────────────────────────┘

WITH GOOD RAG:
┌─────────────────────────────────────────────────────────────────┐
│  RAG handles: "Find relevant content" (semantic + graph)        │
│                                                                  │
│  Skills define:                                                  │
│  - Workflow steps (search → verify → synthesize)                │
│  - Output format conventions                                    │
│  - Tool permissions (allowed-tools)                             │
│  - Domain-specific interpretation                               │
│                                                                  │
│  Skills become MORE PORTABLE with RAG                           │
│  (workflow is just a prompt, not tied to folder structure)      │
└─────────────────────────────────────────────────────────────────┘
```

**Skill with keyword search (current state):**
```yaml
---
name: home-lab-expert
description: Help with home lab questions
allowed-tools:
  - Read
  - mcp__obsidian__simple_search
---

# Home Lab Skill

## Workflow
1. Search vault for keywords
2. ALSO check these folders (keyword search misses things):
   - Entity/Cybersader/Home Lab/
   - docs/architecture/personal-architecture.md
3. Read relevant files
4. Synthesize answer
```

**Skill with good RAG (future state):**
```yaml
---
name: home-lab-expert
description: Help with home lab questions
allowed-tools:
  - mcp__rag__search
  - mcp__obsidian__get_file_contents
---

# Home Lab Skill

## Workflow
1. RAG search (handles finding content)
2. Read full files for top results
3. Synthesize answer
4. Cite sources

# No folder paths needed - RAG finds semantically related content
```

### Mapping to Your Structure (SEACOW)

```
Your SEACOW structure enables targeted retrieval:

┌─────────────────────────────────────────────────────────────────┐
│  SEACOW TAG → RETRIEVAL PATTERN                                  │
│                                                                  │
│  -clip/, -inbox (CAPTURE)                                       │
│  → Recent, unprocessed content                                  │
│  → Skill: "Check Capture/Inbox for recent notes on X"           │
│                                                                  │
│  --cybersader/ (ENTITY + WORK)                                  │
│  → Personal projects, deep knowledge                            │
│  → Skill: "Search Entity/Cybersader/ for home lab, fitness..."  │
│                                                                  │
│  _/ (OUTPUT)                                                     │
│  → Polished, structured content                                 │
│  → Skill: "Check Output/ for finalized documentation"           │
│                                                                  │
│  / (SYSTEM)                                                      │
│  → Templates, config                                            │
│  → Skill: "Check System/ for templates and conventions"         │
│                                                                  │
│  plain tags (RELATION)                                          │
│  → Cross-cutting concepts (#research, #idea)                    │
│  → Skill: "Search by tag for cross-vault connections"           │
└─────────────────────────────────────────────────────────────────┘
```

### Project-Based Skills (PARA-style)

```
If you use PARA or similar project-based structure:

┌─────────────────────────────────────────────────────────────────┐
│  Project: MCP Workflow                                           │
│  Folder:  Projects/MCP Workflow/                                │
│  Skill:   mcp-workflow-expert                                    │
│                                                                  │
│  Skill knows:                                                    │
│  • Project folder location                                      │
│  • Key files (ROADMAP.md, architecture/)                        │
│  • Related tags (--cybersader/mcp, #mcp)                        │
│  • Conventions for this project                                 │
│                                                                  │
│  Skill retrieves:                                                │
│  • Domain knowledge from project folder at runtime              │
│  • Cross-references from related tags                           │
└─────────────────────────────────────────────────────────────────┘
```

### Auto-Generating Skills from Structure

```
PATTERN: If your vault follows conventions, skills can be templated

Given:
  Project folder: Projects/{ProjectName}/
  Project has: CLAUDE.md, docs/, src/

Generate skill:
┌─────────────────────────────────────────────────────────────────┐
│  name: {project-name-slug}                                       │
│  description: Expert for {ProjectName}. Use when asked about    │
│               {keywords from CLAUDE.md}                          │
│                                                                  │
│  # Instructions                                                  │
│  1. Read Projects/{ProjectName}/CLAUDE.md first                 │
│  2. For architecture: check Projects/{ProjectName}/docs/        │
│  3. For code: check Projects/{ProjectName}/src/                 │
│  4. Follow conventions in that project's CLAUDE.md              │
└─────────────────────────────────────────────────────────────────┘

This is what a "scaffolding subagent" could do:
- Scan vault structure
- Find projects with consistent conventions
- Generate skills from templates
```

### Subagent as Context Loader

```
┌─────────────────────────────────────────────────────────────────┐
│  THE SUBAGENT ADVANTAGE                                          │
│                                                                  │
│  Main agent context: Valuable, limited                          │
│  Subagent context: Fresh, disposable                            │
│                                                                  │
│  Pattern:                                                        │
│  1. You ask about complex domain (home lab)                     │
│  2. Main agent spawns subagent                                  │
│  3. Subagent loads domain-specific files into ITS context       │
│  4. Subagent synthesizes, returns summary                       │
│  5. Main agent gets summary (small)                             │
│  6. Your context stays clean                                    │
│                                                                  │
│  The subagent is the "context loader"                           │
│  It has space to load the nuance, then compress it              │
└─────────────────────────────────────────────────────────────────┘
```

### Practical Example: Home Lab Skill

```yaml
---
name: home-lab
description: Answer questions about home lab infrastructure.
             Use when asked about TrueNAS, pfSense, Home Assistant,
             Tailscale, or home network configuration.
---

# Home Lab Skill

## What I Know (always available)
- Infrastructure is documented in Entity/Cybersader/Home Lab/
- CLAUDE.md has current IP addresses and service locations
- Tags: --cybersader/home-lab, #truenas, #pfsense, #home-assistant

## When Activated

1. **First**: Read CLAUDE.md infrastructure section
2. **Then**: Search vault for specific topic:
   - TrueNAS → search "truenas" in --cybersader/
   - Network → search "pfsense" or "192.168"
   - Home Assistant → search "home-assistant" or check HA project folder

3. **For complex questions**: Spawn Explore subagent to gather context

## Conventions
- Home lab docs use frontmatter with: ip, service, status
- Network diagrams in Entity/Cybersader/Home Lab/diagrams/

## I DON'T contain the actual configs
- They live in the vault
- I just know HOW to find them
```

---

## Scaffolding Subagent Pattern

### What It Does

A "scaffolding subagent" helps set up new projects/vaults with consistent conventions:

```
┌─────────────────────────────────────────────────────────────────┐
│  SCAFFOLDING SUBAGENT WORKFLOW                                   │
│                                                                  │
│  1. User: "Set up a new project for X"                          │
│                                                                  │
│  2. Subagent:                                                    │
│     a. Creates folder structure (per conventions)               │
│     b. Creates CLAUDE.md with project context                   │
│     c. Creates appropriate skill file (if warranted)            │
│     d. Sets up frontmatter templates                            │
│     e. Adds tags per SEACOW conventions                         │
│                                                                  │
│  3. Result: New project ready for Claude Code                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Works

```
Instead of: Manually setting up every project
Do this:    Define conventions once, scaffold consistently

Convention defined in:
- CLAUDE.md (vault-level)
- Scaffolding subagent instructions

New project gets:
- Consistent folder structure
- Consistent frontmatter
- Consistent tags
- Auto-generated skill (optional)

Claude Code can then:
- Navigate predictably
- Apply skills correctly
- Retrieve knowledge efficiently
```

---

## Next Steps

1. **Now:** Understand this mental model
2. **Then:** Define your conventions (SEACOW is a great start)
3. **Then:** Encode conventions in CLAUDE.md (vault-level and project-level)
4. **Then:** Create skills that define RETRIEVAL PATTERNS, not content
5. **Then:** Create subagents for complex domains (they load content at runtime)
6. **Optional:** Create a scaffolding subagent to set up new projects consistently
7. **Future:** Set up GraphRAG when keyword search isn't enough

---

## See Also

- [AGENTS.md](../../AGENTS.md) - **Portable agent definitions (works with any AI tool)**
- [Anthropic Skills Paradigm](../learnings/2025-12-20-anthropic-skills-paradigm.md) - Official Anthropic perspective on skills
- [RPI Context Engineering](../learnings/2025-12-20-rpi-context-engineering.md) - Sub-agents for context compression
- [Reference Project Structure](reference-project-structure.md) - **Portable vs Claude-specific breakdown**
- [Context Management Guide](context-management.md) - Dealing with context limits
- [Personal Architecture](../architecture/12-personal-architecture.md) - Where things live
- [WWHF 2025 Insights](../research/wwhf-2025-insights.md) - Agent architecture patterns
- [FOUNDATIONS.md](../FOUNDATIONS.md) - Principles that don't change
