---
name: agent-patterns
description: Expertise in designing Claude Code subagents. Use when creating new agents, understanding agent composition, designing agent templates, or learning about agent constraints.
title: Agent Patterns
stratum: 2
branches: [agentic]
---

## Purpose
Expertise in designing Claude Code subagents. Load this skill when creating new agents or understanding agent composition.

---

## What Is an Agent?

An agent is an **isolated executor** with its own fresh context window. Agents do work and return results.

| Aspect | Description |
|--------|-------------|
| **Trigger** | Explicit invocation or auto-selection |
| **Action** | Executes in isolated context |
| **Scope** | Fresh context window |
| **Purpose** | Focused task execution, context isolation |

---

## CRITICAL: The Subagent Constraint

**Agents CANNOT spawn other agents.**

This is fundamental. Every agent definition MUST include this reminder:

```markdown
## Constraint Reminder

**I CANNOT spawn other agents.** This is fundamental.

I CAN:
- Use skills preloaded via `skills:` field
- Use MCP servers
- Read/write files within permission scope

For multi-agent work: Return findings to command → command spawns next agent.
```

---

## Agent File Structure

```yaml
---
name: agent-name
description: Use PROACTIVELY when [specific trigger]. [What it does in 10-15 words].
tools: Read, Write, Edit, Glob, Grep
model: sonnet
skills: skill-1, skill-2
---

# Agent Name

[Agent instructions and process]

## Constraint Reminder
[Include the constraint reminder]

## Process
[Step-by-step process]

## Output Format
[How to structure return value]
```

---

## Description Writing

The `description` field is critical — it determines when Claude auto-invokes the agent.

### Good Descriptions
- Start with "Use PROACTIVELY when..."
- Specific trigger conditions
- Clear capability statement

### Examples

| Good | Why |
|------|-----|
| "Use PROACTIVELY when user wants to create a new skill. Creates skill files following conventions." | Clear trigger + capability |
| "Use for deep codebase exploration. Searches files, traces dependencies, returns architecture summary." | Clear use case + output |

| Bad | Why |
|-----|-----|
| "Helps with skills" | Vague, no trigger |
| "Code helper" | Too generic |

---

## Tool Selection

Only include tools the agent actually needs:

| Task Type | Recommended Tools |
|-----------|-------------------|
| Read-only exploration | Read, Glob, Grep |
| Research with web | Read, Glob, Grep, WebFetch, WebSearch |
| Writing/creating | Read, Write, Edit, Glob, Grep |
| Execution | Read, Write, Edit, Bash, Glob, Grep |

### Principle: Least Privilege
More tools = more risk. Only grant what's needed.

---

## Skill Preloading

Use the `skills:` field to preload expertise:

```yaml
skills: seacow-conventions, skill-patterns
```

Benefits:
- Agent has expertise without searching
- Consistent behavior
- Faster execution

---

## Output Format Design

Agents should return predictable structure for context funneling:

```markdown
## Summary (50 words)
[Brief overview of findings]

## Details
[Main content, findings, created files]

## Recommendations
[Next steps, follow-up suggestions]

## File References
[Paths for main context to load if needed]
```

### Why Structure Matters
- Main context receives compressed summary
- Can selectively load more detail
- Enables multi-agent workflows

---

## SEACOW Placement

| Agent Type | Location |
|------------|----------|
| Meta (scaffolders) | `/.claude/agents/meta/` |
| Orchestrators | `/.claude/agents/orchestrators/` |
| System utilities | `/.claude/agents/system/` |
| Project-specific | `/project/.claude/agents/` |

---

## Agent Template

```yaml
---
name: [agent-name]
description: Use PROACTIVELY when [trigger]. [Capability in 10-15 words].
tools: [tool list]
model: [sonnet|haiku|opus]
skills: [skill-1, skill-2]
---

# [Agent Name]

You are a specialized agent for [purpose]. You have expertise in [domain] via preloaded skills.

## Your Mission

When invoked, you will:
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Constraint Reminder

**I CANNOT spawn other agents.** This is fundamental.

I CAN:
- Use skills preloaded via `skills:` field
- Use MCP servers
- Read/write files within permission scope

For multi-agent work: Return findings to command → command spawns next agent.

## Process

### Step 1: [Phase Name]
[Instructions]

### Step 2: [Phase Name]
[Instructions]

### Step 3: [Phase Name]
[Instructions]

## Output Format

Return in this format:

```markdown
## Summary (50 words)
[Brief overview]

## [Main Section]
[Details]

## Recommendations
[Next steps]

## File References
[Paths]
```

## Constraints
- [Specific constraint 1]
- [Specific constraint 2]
```

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Assume agent can spawn agents | Design for single execution, clear return |
| Vague description | Specific trigger + capability |
| Include all tools | Minimum needed tools |
| Forget constraint reminder | Always include it |
| Unstructured output | Define clear output format |
| Generic agent | Focused specialist |

---

## Composition Notes

When designing agents for workflows:

1. **Define the hand-off** — What does this agent return?
2. **Note prerequisites** — What skills/context does it need?
3. **Suggest follow-ups** — What agent might run next?
4. **Keep it focused** — One job per agent

Example composition note:
```markdown
## Composition Notes
- Returns to: create-skill command
- Prerequisite skills: skill-patterns, seacow-conventions
- Suggested follow-up: none (terminal agent)
- Part of: /create-skill workflow
```

---

## Related Skills
- `seacow-conventions` — SEACOW framework for placement
- `skill-patterns` — How to design skills agents can preload
