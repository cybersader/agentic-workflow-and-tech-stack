---
name: delegation-advisor
description: Advises on when to delegate to subagents. Use when user is working on complex multi-file tasks, exploring codebases, researching, implementing large features, or needs help deciding if delegation would be beneficial.
title: Delegation Advisor
stratum: 2
branches: [agentic]
---

## Purpose

I help you decide when to delegate to subagents. When I detect a task that would benefit from a fresh context, I **ASK you first** rather than auto-invoking.

**Key principle:** Delegation should be explicit and user-controlled.

---

## Recognition Patterns

I suggest delegation when I detect:

| Pattern | Suggested Agent | Confidence |
|---------|-----------------|------------|
| "How does X work?" + codebase | Explore | High |
| Multi-file changes needed | Plan | High |
| Research/synthesis tasks | knowledge-curator | Medium |
| "Create a skill for..." | skill-writer | High |
| "Create an agent that..." | agent-writer | High |
| Scaffold/workflow questions | workflow-expert | High |
| New project/vault setup | seacow-scaffolder | High |
| Doc maintenance needed | claude-md-updater | Medium |

---

## How I Ask

When I recognize an opportunity, I use AskUserQuestion:

```
"This looks like [task type]. Would you like me to:
 • Spawn [agent] agent (fresh context, deep work)
 • Handle directly (uses current context)
 • Tell me more first"
```

I respect your choice. Quick "handle directly" is always an option.

---

## Tool-Specific Delegation

### Claude Code

When you approve delegation:
1. I use the Task tool with subagent_type: `Explore`, `Plan`, or `general-purpose`
2. I provide context summary to the agent
3. Agent works in fresh context, returns summary
4. I synthesize results for you

**Built-in types available:**
- `Explore` - Fast codebase exploration
- `Plan` - Design implementation approach
- `general-purpose` - Complex multi-step tasks

### OpenCode

When you approve delegation:
1. I can spawn child sessions with specific agents
2. For large tasks, I may suggest parallel exploration
3. Each child returns distilled summaries
4. I synthesize across all children

**OpenCode enables:**
- TRUE recursive agents (agents spawning agents)
- Isolated context per session
- Different LLMs per level
- Session navigation (parent/child)

---

## Parallel Delegation (OpenCode Only)

For large codebases, I may offer:

```
"This codebase has multiple major areas. Would you like:
 • Parallel agents for /src/, /api/, /docs/ (faster)
 • Single depth-first exploration (sequential)
 • Handle directly"
```

---

## Quick Decline

If you prefer direct handling, just say:
- "Handle it directly"
- "No delegation needed"
- "Just do it"

I'll adapt to your preference for similar future tasks.

---

## When NOT to Suggest Delegation

- Simple questions with obvious answers
- Single-file operations
- Tasks you've indicated preference to handle directly
- When context is already loaded and sufficient

---

## Agent Dispatch Reference

| You're asking about... | Suggested Agent | Why |
|------------------------|-----------------|-----|
| How codebase works | `Explore` | Multi-file discovery |
| Implementation approach | `Plan` | Design before code |
| This workflow scaffold | `workflow-expert` | Deep guide knowledge |
| New project structure | `seacow-scaffolder` | SEACOW-based design |
| Creating skills | `skill-writer` | Follows conventions |
| Creating agents | `agent-writer` | Follows conventions |
| Doc accuracy | `claude-md-updater` | Maintenance checks |
| Knowledge synthesis | `knowledge-curator` | Research + organize |

---

## Installation

### Global (All Projects)
```bash
cp -r .claude/skills/delegation-advisor/ ~/.claude/skills/
```

### Per-Project
Keep in your project's `.claude/skills/` directory.

### Hybrid (Recommended)
- **Global:** `delegation-advisor/SKILL.md` (universal delegation)
- **Project:** Domain-specific skills and agents

---

## See Also

- `workflow-meta` skill - Scaffold-specific concierge
- `workflow-expert` agent - Deep scaffold knowledge
- `.claude/ARCHITECTURE.md` - Tool capabilities and constraints
- `docs/tool-comparison.md` - Claude Code vs OpenCode details
