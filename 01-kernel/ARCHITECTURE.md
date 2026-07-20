---
title: Agent Composability Architecture
stratum: 1
branches: [agentic]
---
This document explains agent orchestration patterns across different AI coding tools (Claude Code, OpenCode, etc.) and how to design portable workflows.

---

## Tool Comparison: Recursive Agents

| Tool | Recursive Agents? | Notes |
|------|-------------------|-------|
| **Claude Code** | NO | Subagents terminate, cannot spawn children |
| **OpenCode** | YES | Subagents can spawn child sessions with own context |
| **Codex** | Varies | Check current capabilities |
| **Cline/Cursor** | Varies | Check current capabilities |

### What This Means

**Claude Code:** Design for sequential orchestration (context funneling)
**OpenCode:** Can do true recursive hierarchical workflows

This scaffold is designed to work with BOTH — agents include constraint reminders for Claude Code but the architecture supports recursive patterns when available.

---

## Reality Check: What Actually Works (Claude Code 2.0.44+)

Based on official documentation and testing, here's what **actually works** vs what's aspirational:

### Confirmed Working

| Feature | How to Use |
|---------|------------|
| **Skill discovery via description** | Skills in `.claude/skills/name/SKILL.md` with YAML `name` and `description` |
| **Agent proactive invocation** | Use `description: "Use PROACTIVELY when..."` in YAML frontmatter |
| **Agent auto-loading** | Place `.md` files in `~/.claude/agents/` or `.claude/agents/` with YAML frontmatter |
| **Skills preloading in agents** | Add `skills: skill1, skill2` in agent YAML frontmatter |
| **Task tool delegation** | Built-in types: `Explore`, `Plan`, `general-purpose` |
| **Interactive prompts** | Via `AskUserQuestion` tool |
| **Commands for orchestration** | `.claude/commands/*.md` files |
| **Agent resumption** | Resume agents by ID for follow-up work |

**NOTE:** The `## Activation Keywords` section was previously documented as a feature but is NOT functional. Skills are discovered via the YAML `description` field, not keyword matching.

### Agent File Format (Required for Auto-Loading)

```markdown
---
name: my-agent
description: Use PROACTIVELY when user wants to [specific trigger]. Does [capability].
tools: Read, Glob, Grep, Edit, Write
model: sonnet
skills: skill1, skill2
---

# Agent Title

Your agent's system prompt and instructions here.
```

**Key fields:**
- `name` (required) - Unique identifier
- `description` (required) - **Critical for auto-invocation** - include "Use PROACTIVELY when..."
- `tools` (optional) - Comma-separated, inherits all if omitted
- `model` (optional) - `sonnet`, `opus`, `haiku`, or `inherit`
- `skills` (optional) - Auto-loaded when agent starts

### Built-in Subagent Types

| Type | Model | Tools | Best For |
|------|-------|-------|----------|
| `Explore` | Haiku | Glob, Grep, Read, Bash (read-only) | Fast codebase exploration |
| `Plan` | Sonnet | Glob, Grep, Read, Bash | Implementation design |
| `general-purpose` | Sonnet | All tools | Complex multi-step tasks |

### Custom Agents via Task Tool

Custom agents in `.claude/agents/` are instruction sets. To invoke them:
1. The Task tool uses **built-in types** (Explore, Plan, general-purpose)
2. Custom agent files provide **instructions** that Claude uses when deciding HOW to work
3. For proactive invocation, Claude reads `description` fields and decides when to use them

### Implementation Status (Updated Jan 2026)

| Feature | Status |
|---------|--------|
| Hooks (`.claude/settings.local.json`) | **Functional** — PreToolUse, PostToolUse, Stop hooks work via `settings.local.json` (NOT the old `.claude/.hooks/` format) |
| Custom `subagent_type` in Task tool | Use built-in types instead |
| Agent → Agent spawning | Hard constraint in Claude Code |
| Knowledge-base temperature gradient | **Functional** — inbox/working/reference/archive zones with knowledge-curator skill |

### Delegation Pattern That Works

Instead of hoping for auto-invocation, use the **delegation advisor** pattern:

1. **Skill discovered** when context matches description (delegation-advisor, workflow-meta)
2. **Skill recognizes** task that would benefit from delegation
3. **Skill asks** via AskUserQuestion: "Would you like me to spawn [agent]?"
4. **User approves** → Task tool invokes appropriate built-in type
5. **Agent instructions** from `.claude/agents/` guide the work

This gives you control while still enabling intelligent delegation.

---

## CRITICAL: Skills vs Subagents Context Behavior

This is the most important distinction for effective agent workflows:

```
┌─────────────────────────────────────────────────────────────────────┐
│  SKILLS = SAME CONTEXT WINDOW                                        │
│  ─────────────────────────────                                       │
│                                                                      │
│  Your context: [CLAUDE.md] + [skill.md] + [your conversation]       │
│                                                                      │
│  Skills are LOADED INTO your context.                               │
│  They don't escape context limits.                                  │
│  They're for changing HOW the agent behaves.                        │
│                                                                      │
│  Use skills for: Conventions, workflows, domain expertise           │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  SUBAGENTS = FRESH CONTEXT WINDOW                                    │
│  ────────────────────────────────                                    │
│                                                                      │
│  Your context: [CLAUDE.md] + [your conversation]                    │
│       │                                                              │
│       └── Spawns subagent with FRESH context                        │
│           Subagent: [its instructions] + [its exploration]          │
│           Returns: compressed summary to you                         │
│                                                                      │
│  Subagents ESCAPE your context limits.                              │
│  They burn through their own context, return distilled results.     │
│  They're for OFFLOADING WORK.                                       │
│                                                                      │
│  Use subagents for: Research, exploration, multi-file analysis      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This Matters

If you want something to explore and come back with distilled info → **SUBAGENT**
If you want the agent to follow certain conventions → **SKILL**

**Common mistake:** Using skills for research (bloats context)
**Correct:** Spawn subagent to research, get compressed summary back

### The "Dumb Zone" (~40% Context)

Around 40% context window usage, you start getting diminishing returns:

```
0%  ─────────────────────────────────────────────────────── 100%
│                    │                                       │
│    SMART ZONE      │            DUMB ZONE                  │
│    (good work)     │    (diminishing returns)              │
│                    │                                       │
└────────────────────┴───────────────────────────────────────┘
                    ~40%

"The more you use the context window, the worse outcomes you get"
                                              — Dex Horthy, HumanLayer
```

:::caution
Context rot is not a bug — it is an attention-allocation property of all current language models. Reasoning quality degrades predictably past roughly 40% context utilization, even on trivial tasks. Offload exploration to subagents whose compressed summaries return into the main context; do not rely on the model "just handling" a full window.
:::

**Implication:** If you fill context with exploration, you're doing synthesis in the dumb zone. Offload exploration to subagents instead.

---

## Claude Code: The Constraint

**In Claude Code, subagents CANNOT spawn other subagents.**

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLAUDE CODE: WHAT CAN INVOKE WHAT                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Main Context ──► Subagent ──► Skill ──► [TERMINATES]              │
│                       │                                              │
│                       ├──► MCP                                      │
│                       │                                              │
│                       └──► Prompts                                  │
│                                                                      │
│  ⚠️  Subagent CANNOT spawn Subagent                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Workaround: Context Funneling

```
COMMAND spawns Agent A → returns → spawns Agent B → returns → synthesizes
```

Sequential, not nested. The command/main context is the orchestrator.

---

## OpenCode: Recursive Agents

**In OpenCode, subagents CAN spawn child sessions.**

```
┌─────────────────────────────────────────────────────────────────────┐
│  OPENCODE: RECURSIVE HIERARCHY                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Primary Agent                                                       │
│       │                                                              │
│       ├──► Subagent A (own session, own context)                    │
│       │        │                                                     │
│       │        ├──► Child Agent A1 (own session)                    │
│       │        │        │                                            │
│       │        │        └──► Child Agent A1a...                     │
│       │        │                                                     │
│       │        └──► Child Agent A2                                  │
│       │                                                              │
│       └──► Subagent B                                               │
│                │                                                     │
│                └──► Child Agent B1...                               │
│                                                                      │
│  ✓ Each level has independent context window                        │
│  ✓ Can navigate between parent/child sessions                       │
│  ✓ Different agents can use different LLMs                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### What Recursive Agents Enable

- **Filesystem distillation:** Agent at each directory level summarizes and passes up
- **Graph traversal:** Agent at each node explores edges, spawns children for neighbors
- **Hierarchical decomposition:** Break complex problems into sub-problems recursively
- **Self-organizing workflows:** Agents decide when to spawn children based on complexity

---

## Designing Portable Agents

To make agents work in BOTH Claude Code and OpenCode:

### 1. Include Constraint Reminder (for Claude Code)

```markdown
## Constraint Reminder (Claude Code)

**In Claude Code, I CANNOT spawn other agents.**

In OpenCode or tools with recursive agents, I CAN spawn child agents.

Check your tool's capabilities before assuming recursive behavior.
```

### 2. Design for Both Patterns

```markdown
## Process

### If Recursive Agents Available (OpenCode)
1. Spawn child agent for [subtask]
2. Receive child's summary
3. Integrate and continue

### If No Recursive Agents (Claude Code)
1. Return findings to orchestrator
2. Note: "[subtask] needs separate agent invocation"
3. Orchestrator spawns next agent
```

### 3. Document the Recursion Depth Intent

```markdown
## Recursion Intent

This agent is designed for [depth]:
- **Leaf agent:** Does not need to spawn children
- **Branch agent:** Would spawn children if available, falls back to returning subtask list
- **Unlimited:** Will recurse until base case (requires termination condition)
```

---

## Context Funneling (Both Tools)

Regardless of tool, context funneling is a good pattern:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTEXT FUNNELING PATTERN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Deep Exploration (fills context) → Compress → Return Summary               │
│                                                                              │
│  Agent explores:                                                             │
│  ├── Reads many files                                                       │
│  ├── Searches broadly                                                       │
│  ├── Fills its context window                                               │
│  └── Distills to summary                                                    │
│                                                                              │
│  Returns to caller:                                                          │
│  ├── 50-word summary                                                        │
│  ├── Key findings                                                           │
│  ├── File references (paths only)                                           │
│  └── Recommendations                                                         │
│                                                                              │
│  Caller's context stays clean, receives only distilled knowledge            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Recursive Distillation Pattern (OpenCode)

When recursive agents are available, this pattern becomes powerful:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RECURSIVE DISTILLATION (filesystem example)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Root Agent: "Summarize this project"                                        │
│       │                                                                      │
│       ├──► Agent: /src/                                                     │
│       │        │                                                             │
│       │        ├──► Agent: /src/components/                                 │
│       │        │        └──► Returns: "15 React components, main: App.tsx"  │
│       │        │                                                             │
│       │        ├──► Agent: /src/utils/                                      │
│       │        │        └──► Returns: "Helper functions for dates, strings" │
│       │        │                                                             │
│       │        └──► Returns: "Frontend code: 15 components + utils"         │
│       │                                                                      │
│       ├──► Agent: /api/                                                     │
│       │        └──► Returns: "REST API with 8 endpoints"                    │
│       │                                                                      │
│       └──► Final: "Full-stack app: React frontend, REST API"                │
│                                                                              │
│  Each level distills, parent receives only summaries                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Termination Conditions

**CRITICAL for recursive agents:** Define when to STOP recursing.

| Condition | Example |
|-----------|---------|
| Depth limit | `max_depth: 3` |
| Size threshold | `if files < 5: process directly` |
| Complexity check | `if simple: return, else: recurse` |
| Explicit base case | `if is_leaf_directory: summarize and return` |

Without termination conditions, recursive agents can loop indefinitely.

---

## Composition Matrix (Updated)

| Primitive | Claude Code | OpenCode |
|-----------|-------------|----------|
| Main → Agent | YES | YES |
| Agent → Agent | **NO** | YES |
| Agent → Skill | YES | YES |
| Agent → MCP | YES | YES |
| Session Navigation | NO | YES (keyboard shortcuts) |
| Different LLMs per Agent | NO | YES |

---

## Practical Recommendations

### If Using Claude Code Only
- Design all agents as leaf nodes (terminal)
- Use context funneling via main context/commands
- Document subtask handoffs clearly

### If Using OpenCode Only
- Leverage recursive patterns freely
- Always define termination conditions
- Use session navigation for debugging

### If Using Both (Portable)
- Include constraint reminders
- Design agents with fallback patterns
- Document recursion intent
- Test in both environments

---

## Summary

| Tool | Recursive? | Design Pattern |
|------|------------|----------------|
| Claude Code | NO | Sequential context funneling |
| OpenCode | YES | Hierarchical recursive distillation |
| Portable | BOTH | Include fallbacks, document intent |

This scaffold supports both patterns. Agents include constraint reminders for Claude Code compatibility while the architecture can leverage recursive capabilities when available.

---

## Relationship to SEACOW

SEACOW is a meta-framework for analyzing organizational structures (see `/CLAUDE.md`). This architecture document focuses on how agents COMPOSE, not where they're placed.

Agents serve purposes, not prescribed layers. Whether an agent processes input, does work, or generates output depends on WHAT IT DOES, not WHERE IT LIVES in your folder structure.
