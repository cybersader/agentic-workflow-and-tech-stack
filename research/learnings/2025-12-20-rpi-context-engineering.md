---
created: 2025-12-20
updated: 2025-12-20
tags:
  - context-engineering
  - agents
  - subagents
  - practical
  - reference
source:
  title: "No Vibes Allowed: Solving Hard Problems in Complex Codebases"
  speaker: Dex Horthy, HumanLayer
  url: https://www.youtube.com/watch?v=rmvDxxNubIg
  event: AI Engineer (assumed from context)
---

# RPI Context Engineering: Sub-Agents for Context Compression

## The Core Insight

> "Sub-agents are not for anthropomorphizing roles. They are for **controlling context**."

The key pattern: Fork a fresh context window to do expensive exploration work (reading files, searching, understanding codebase), then return a **compressed summary** to the parent agent. The parent agent stays in the "smart zone" while sub-agents burn through context doing the heavy lifting.

```
┌─────────────────────────────────────────────────────────────────────┐
│  NESTED CONTEXT COMPRESSION                                          │
│                                                                      │
│  Parent Agent (stays small, stays smart)                            │
│       │                                                              │
│       ├── Spawns: Research Sub-Agent                                │
│       │       └── Reads 50 files, searches codebase                 │
│       │       └── Returns: "The file you want is X:line 42"         │
│       │                                                              │
│       ├── Spawns: Another Sub-Agent                                 │
│       │       └── Does more exploration                             │
│       │       └── Returns: Compressed findings                      │
│       │                                                              │
│       └── Parent has all the knowledge, none of the bloat          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The "Dumb Zone" Concept

Around **40% context window usage**, you start getting diminishing returns:

```
┌─────────────────────────────────────────────────────────────────────┐
│  CONTEXT WINDOW ZONES                                                │
│                                                                      │
│  0%  ─────────────────────────────────────────────────────── 100%   │
│  │                    │                                       │      │
│  │    SMART ZONE      │            DUMB ZONE                  │      │
│  │    (good work)     │    (diminishing returns)              │      │
│  │                    │                                       │      │
│  └────────────────────┴───────────────────────────────────────┘      │
│                      ~40%                                            │
│                                                                      │
│  "The more you use the context window, the worse outcomes you get"  │
│                                                   — Jeff Huntley     │
└─────────────────────────────────────────────────────────────────────┘
```

**Implication:** If you have too many MCP tools dumping JSON into your context, you're doing all your work in the dumb zone.

---

## Research → Plan → Implement (RPI)

A three-phase workflow optimized for staying in the smart zone:

### 1. Research Phase
**Goal:** Compression of truth

- Understand how the system works
- Find the right files
- Stay objective
- Output: Research document with exact files and line numbers

### 2. Plan Phase
**Goal:** Compression of intent

- Outline exact steps
- Include file names and code snippets
- Be explicit about testing after each change
- Output: Plan file that "the dumbest model could execute"

### 3. Implement Phase
**Goal:** Reliable execution

- Follow the plan mechanically
- Keep context low
- Test as you go

---

## Intentional Compaction

Before context gets too large, **intentionally compress** it:

> "Take your existing context window and ask the agent to compress it down into a markdown file. You can review this, tag it, and then when the new agent starts, it gets straight to work."

**What to compact:**
- Files found and why they matter
- Understanding of code flow
- Key decisions made
- Exact files and line numbers relevant to the problem

**What burns context (avoid loading directly):**
- File searching/exploration
- Understanding code flow
- Full file contents
- Test and build output
- MCP JSON responses with UUIDs

---

## Progressive Disclosure for Codebases

Dex explicitly mentions progressive disclosure for onboarding context:

```
monorepo/
├── CLAUDE.md              ← Root context (always loaded)
├── packages/
│   ├── frontend/
│   │   └── CLAUDE.md      ← Loaded when working here
│   ├── backend/
│   │   └── CLAUDE.md      ← Loaded when working here
│   └── shared/
│       └── CLAUDE.md      ← Loaded when needed
```

> "Pull in the root context and then pull in the subcontext... you still have plenty of room in the smart zone because you're only pulling in what you need to know."

---

## On-Demand Compressed Context

Instead of maintaining documentation that gets stale, generate compressed context on demand:

> "We are compressing truth... based on the code itself, not documentation that might be out of date."

Use sub-agents to take "vertical slices through the codebase" and build research documents that are:
- Actually true (based on current code)
- Relevant to the specific task
- Compressed to essential information

---

## Mental Alignment

The key benefit of plans isn't just execution — it's keeping humans aligned:

> "Code review is about making sure things are correct, but the most important thing is how do we keep everybody on the team on the same page about how the codebase is changing and why."

Plans are readable artifacts that:
- Let leaders review approach without reading 1000 lines of code
- Catch problems early
- Maintain understanding of system evolution
- Enable async review ("Does this plan look right?")

---

## Don't Outsource the Thinking

> "AI cannot replace thinking. It can only amplify the thinking you have done or the lack of thinking you have done."

Key points:
- A bad line of code = 1 bad line of code
- A bad part of a plan = 100 bad lines of code
- A bad line of research = entire solution is hosed

The human must stay in the loop reading and validating research/plans.

---

## Trajectory Matters

If you keep correcting the agent:

```
You: Do X
Agent: Does wrong thing
You: No, do Y
Agent: Does wrong thing
You: NO! Do Z
Agent: (sees pattern: do wrong thing → human yells)
Agent: Does wrong thing again
```

> "The next most likely token is 'I better do something wrong so the human can yell at me again.'"

**Solution:** Start fresh context instead of accumulating negative trajectory.

---

## When to Use RPI

| Complexity | Approach |
|------------|----------|
| Change button color | Just ask the agent |
| Small feature | Simple plan, minimal research |
| Medium feature (multi-file) | One research doc → one plan |
| Complex feature (multi-repo) | Full RPI with sub-agents |
| Hardest problems | Multiple research rounds, layered planning |

> "The ceiling goes up the more context engineering compaction you're willing to do."

---

## Connection to Our Docs

This talk validates and extends several patterns we document:

| Our Concept | RPI Equivalent |
|-------------|----------------|
| Progressive disclosure | Same term, same pattern |
| Context funneling | "Compression of truth/intent" |
| Explore subagent | Research sub-agents |
| Plan subagent | Planning phase |
| FOUNDATIONS: agents are ephemeral | Intentional compaction between agents |

The "nested context compression" pattern is a concrete implementation of what we describe as subagents for exploration.

---

## Key Quotes

> "Sub-agents are not for anthropomorphizing roles. They are for controlling context."

> "The more you use the context window, the worse outcomes you get."

> "We are compressing truth... a snapshot of the actually true parts of the codebase that matter."

> "A bad line of research — a misunderstanding of how the system works — your whole thing is going to be hosed."

---

## See Also

- [Agent Workflow Guide](../tools/agent-workflow-guide.md) — Our subagent patterns
- [Context Management](../tools/context-management.md) — Token limits and strategies
- [Solving Deterministic Problems](../guides/solving-deterministic-problems.md) — Code-focused workflows
- [2025-12-20-anthropic-skills-paradigm.md](2025-12-20-anthropic-skills-paradigm.md) — Complementary Anthropic perspective
