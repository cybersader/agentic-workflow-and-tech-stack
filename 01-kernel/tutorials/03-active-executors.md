---
title: "Tutorial 3: Creating Active Executors (Agents)"
stratum: 2
branches: [agentic]
---
**Time:** 25 minutes
**Prerequisites:** Completed Tutorial 2

Learn to create agents that do isolated work and return compressed results. By the end, you'll have built a reusable agent for your workflow.

---

## What You'll Learn

1. The difference between skills and agents (context behavior)
2. Agent anatomy and required fields
3. The constraint reminder (why agents can't spawn agents)
4. Testing agent isolation and context funneling

---

## Skills vs Agents: The Key Difference

| Aspect | Skill (Passive) | Agent (Active) |
|--------|-----------------|----------------|
| **Context** | Loads INTO your session | Spawns FRESH context |
| **Action** | Informs only | Can read/write files, run commands |
| **Result** | Influences your response | Returns summary to you |
| **Purpose** | Conventions, patterns | Research, execution |

```
Your Session (main context)
      │
      ├── Skill loads IN ──────► Same context, richer knowledge
      │
      └── Agent spawns OUT ────► Fresh context, does work, returns
```

---

## The Agent Anatomy

```
.claude/agents/
└── category/                 ← Optional grouping
    └── your-agent.md         ← The agent file
```

### Required YAML Fields

```yaml
---
name: your-agent-name
description: Use when [trigger]. Does [capability].
tools: Read, Write, Glob, Grep    # What it can do
model: sonnet                      # optional: sonnet, opus, haiku
skills: skill-1, skill-2           # optional: preloaded expertise
---
```

### Required Section: Constraint Reminder

**Every agent MUST include this:**

```markdown
## Constraint Reminder

**I CANNOT spawn other agents.** This is fundamental.

I CAN:
- Use skills preloaded via `skills:` field
- Use MCP servers
- Read/write files within permission scope

For multi-agent work: Return findings to orchestrator → orchestrator spawns next agent.
```

---

## Exercise 1: Create a Research Agent

**Goal:** Build an agent that explores and summarizes.

### Step 1: Create the agent

```bash
mkdir -p .claude/agents/research
```

```bash
cat > .claude/agents/research/codebase-explorer.md << 'EOF'
---
name: codebase-explorer
description: Use when user needs to understand how a codebase works, find patterns, or explore unfamiliar code. Returns structured summary.
tools: Read, Glob, Grep
model: sonnet
---

# Codebase Explorer

You are a research agent specialized in understanding codebases. You work in fresh context to explore deeply without polluting the user's main session.

## Your Mission

When invoked:
1. Search for relevant files based on the query
2. Read and analyze key files
3. Build understanding of patterns
4. Return a compressed summary

## Constraint Reminder

**I CANNOT spawn other agents.** This is fundamental.

I CAN:
- Read files throughout the codebase
- Search with Glob and Grep
- Analyze patterns and relationships

For multi-agent work: Return findings to main context → user spawns next agent.

## Process

### Step 1: Scope Discovery
Use Glob to find relevant files:
- Look for file patterns matching the query
- Identify entry points and key modules

### Step 2: Deep Reading
Read the most relevant files:
- Start with entry points
- Follow imports and dependencies
- Note patterns and conventions

### Step 3: Pattern Analysis
Identify:
- Architecture patterns
- Naming conventions
- Key abstractions
- Data flow

### Step 4: Summary Generation
Return structured findings.

## Output Format

```markdown
## Summary (50 words)
[One paragraph overview]

## Key Files
| File | Purpose |
|------|---------|
| path/to/file.ts:42 | Description |

## Patterns Found
- Pattern 1: [description]
- Pattern 2: [description]

## Recommendations
- [Next steps for the user]
```

## Constraints
- Maximum 20 files read per exploration
- Return summary under 500 words
- Always include file:line references
EOF
```

### Step 2: Test it

```bash
claude
```

Say: "Use the codebase-explorer agent to understand how this project is structured."

**Observe:**
- [ ] Agent spawns (separate context)
- [ ] Reads multiple files
- [ ] Returns structured summary
- [ ] Your main context didn't fill with file contents

---

## Exercise 2: Understand Context Funneling

**Goal:** See the isolation in action.

### The Test

1. Before invoking the agent, note your context usage (if visible)
2. Invoke: "Use codebase-explorer to analyze all the configuration files"
3. The agent may read 15+ files
4. The summary returned is ~200 words
5. Your context only received the summary, not all 15 files

### Why This Matters

```
Without funneling:
  Your context ← config1.json (500 tokens)
  Your context ← config2.json (400 tokens)
  Your context ← config3.json (600 tokens)
  ... (15 files)
  Your context = 7500 tokens consumed

With funneling:
  Agent context ← all 15 files
  Agent context → processes
  Your context ← 200-word summary (300 tokens)
  Your context = 300 tokens consumed
```

This is why agents exist: deep work without context cost.

---

## Exercise 3: Agent with Preloaded Skills

**Goal:** Combine passive expertise with active execution.

### The Pattern

Agents can preload skills using the `skills:` field. This gives them domain expertise during execution.

### Create an agent with skills

```bash
cat > .claude/agents/research/api-analyzer.md << 'EOF'
---
name: api-analyzer
description: Use when user needs to analyze API endpoints, understand API patterns, or audit API design.
tools: Read, Glob, Grep
model: sonnet
skills: api-design
---

# API Analyzer

You analyze APIs using API design expertise loaded from the api-design skill.

## Your Mission

When invoked:
1. Find API endpoint definitions
2. Analyze against API design patterns
3. Identify issues and improvements
4. Return structured analysis

## Constraint Reminder

**I CANNOT spawn other agents.** This is fundamental.

I CAN:
- Use the api-design skill (preloaded)
- Read API-related files
- Search for endpoint patterns

## Process

### Step 1: Find Endpoints
Search for:
- Route definitions
- Controller files
- API handlers

### Step 2: Analyze Patterns
Using api-design skill knowledge:
- Check URL structure
- Verify HTTP method usage
- Audit status codes

### Step 3: Report

## Output Format

```markdown
## API Analysis Summary

### Endpoints Found
| Method | Path | Issues |
|--------|------|--------|
| GET | /users | None |
| POST | /getUser | Verb in URL |

### Design Issues
1. [Issue with recommendation]

### Good Practices Found
1. [What's done well]
```
EOF
```

**Test it:** "Use api-analyzer to audit the API endpoints in this project"

---

## Exercise 4: The Constraint in Practice

**Goal:** Understand why agents can't spawn agents.

### The Constraint

```
Main Context ──► Agent A ──► Agent B ──► [FAILS]
                   │
                   └── This is where it breaks
```

When Agent A tries to use the Task tool to spawn Agent B, it **terminates**. This is a hard constraint in Claude Code.

### The Workaround: Sequential Composition

```
Main Context ──► Agent A ──► Returns findings
      │
      └── Uses findings ──► Agent B ──► Returns results
                │
                └── Synthesizes A + B
```

The **main context** (or a command) acts as orchestrator.

### Test the constraint

Inside an agent session, try: "Spawn another agent to help."

**Observe:** The agent should decline or explain it cannot spawn agents.

---

## Agent Design Checklist

Before considering an agent complete:

- [ ] **name** matches filename (without .md)
- [ ] **description** covers trigger scenarios
- [ ] **tools** are minimal (least privilege)
- [ ] **Constraint Reminder** section included
- [ ] **Output Format** specified
- [ ] **Tested in isolation** (works without other agents)
- [ ] **Returns compressed results** (not raw file dumps)

---

## Common Mistakes

### Mistake 1: Too many tools

```yaml
# Wrong - gives agent everything
tools: Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch

# Right - only what's needed
tools: Read, Glob, Grep
```

### Mistake 2: No constraint reminder

Without the constraint reminder, the agent might try to spawn other agents and fail confusingly.

### Mistake 3: Returning raw content

```markdown
# Wrong - dumps file content
Here's the full content of config.json:
[2000 lines]

# Right - summarizes
Config.json defines 3 environments with these key differences:
- dev: local database
- staging: shared test DB
- prod: replicated cluster
```

---

## What You Built

You now have:
- An agent that explores in isolation
- Understanding of context funneling
- Agent with preloaded skills
- Knowledge of the spawn constraint

---

## What's Next?

- [Tutorial 4: Proactive Patterns](04-proactive-patterns.md) — Auto-triggering
- [Tutorial 5: Orchestration](05-orchestration.md) — Coordinating multiple agents
- [Concepts Reference](../docs/CONCEPTS.md) — Full vocabulary

---

## Template: Copy This

```markdown
---
name: your-agent-name
description: Use when [trigger scenarios].
tools: Read, Glob, Grep
model: sonnet
skills: optional-skill-1, optional-skill-2
---

# Agent Name

Brief description of what this agent does.

## Your Mission

When invoked:
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Constraint Reminder

**I CANNOT spawn other agents.** This is fundamental.

I CAN:
- Use skills preloaded via `skills:` field
- Use MCP servers
- Read/write files within permission scope

For multi-agent work: Return findings to orchestrator → orchestrator spawns next agent.

## Process

### Step 1: [Phase Name]
[Instructions]

### Step 2: [Phase Name]
[Instructions]

## Output Format

```markdown
## Summary (50 words)
[Overview]

## Findings
[Structured results]

## Recommendations
[Next steps]
```

## Constraints
- [Specific limit 1]
- [Specific limit 2]
```
