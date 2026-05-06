---
created: 2025-12-23
updated: 2025-12-23
tags:
  - research
  - agents
  - claude-code
  - delegation
  - learned
---

# Claude Code Agent Auto-Invocation and Delegation Patterns

**Source:** Research on Claude Code v2.0.44, official Anthropic docs, and testing

## Key Discovery

Custom agents in `.claude/agents/` **DO auto-load and can be proactively invoked** — but only if they have proper YAML frontmatter with specific patterns.

---

## What Actually Works (Claude Code 2.0.44+)

### Agent YAML Frontmatter

Agents MUST have YAML frontmatter (not markdown code blocks) at the top of the file:

```yaml
---
name: my-agent
description: Use PROACTIVELY when user wants to [specific trigger]. Does [capability].
tools: Read, Glob, Grep, Edit, Write
model: sonnet
skills: skill1, skill2
---
```

**Critical fields:**
- `name` (required) - Unique identifier
- `description` (required) - **Key for auto-invocation** — include "Use PROACTIVELY when..."
- `tools` (optional) - Comma-separated; inherits all if omitted
- `model` (optional) - `sonnet`, `opus`, `haiku`, or `inherit`
- `skills` (optional) - Auto-loaded when agent starts

### Skill Description-Based Loading

**CORRECTION:** Skills do NOT load via "Activation Keywords" sections. Skills are discovered via YAML `description` field:

```yaml
---
name: my-skill
description: What this skill does AND when to use it. Use when user asks about X, Y, or Z.
---
```

Skills must be in subdirectory format: `.claude/skills/skill-name/SKILL.md`

See `research/learnings/2025-12-23-skill-mechanism-correction.md` for full details.

### Built-in Task Tool Types

| Type | Model | Tools | Best For |
|------|-------|-------|----------|
| `Explore` | Haiku | Glob, Grep, Read, Bash (read-only) | Fast codebase exploration |
| `Plan` | Sonnet | Glob, Grep, Read, Bash | Implementation design |
| `general-purpose` | Sonnet | All tools | Complex multi-step tasks |

### What's NOT Implemented

- **Hooks** (`.claude/.hooks/`) - Documented but not functional
- **Custom `subagent_type`** - Task tool uses built-in types only
- **Agent → Agent spawning** - Hard constraint in Claude Code

---

## The Delegation Advisor Pattern

Since auto-invocation may not always trigger predictably, use an explicit ask-first pattern:

1. **Skill discovered** when context matches description (delegation-advisor)
2. **Skill recognizes** task that would benefit from delegation
3. **Skill asks** via `AskUserQuestion`: "Would you like me to spawn [agent]?"
4. **User approves** → Task tool invokes appropriate built-in type
5. **Agent instructions** from custom files guide the work

This gives explicit control while still enabling intelligent delegation suggestions.

---

## Key Insight: Description Field Importance

The `description` field in agent YAML frontmatter is **critical** for proactive invocation. Claude reads these descriptions to decide when to suggest using an agent.

**Good description:**
```yaml
description: Use PROACTIVELY when user wants to explore codebase architecture. Searches files, traces dependencies, returns architecture summary.
```

**Bad description:**
```yaml
description: Helps with code
```

Include "Use PROACTIVELY when..." and be specific about triggers.

---

## OpenCode Comparison

OpenCode has additional capabilities:
- TRUE recursive agents (agents can spawn agents)
- Session navigation between parent/child
- Isolated contexts per session
- Different LLMs per level
- Parallel exploration possible

When designing portable agents, include dual-mode instructions and constraint reminders for Claude Code.

---

## Related Files

- `.claude/skills/delegation-advisor/SKILL.md` - Ask-first delegation pattern
- `.claude/ARCHITECTURE.md` - Reality Check section
- `docs/tool-comparison.md` - Claude Code vs OpenCode details
- [Official Subagents Docs](https://code.claude.com/docs/en/sub-agents)

---

## Sources

- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Code v2.0.44 Multi-Agent Features](https://alirezarezvani.medium.com/claude-code-v2-0-44-your-complete-guide-to-native-multi-agent-features-that-actually-work-207be12ed173)
- [Claude Code Frameworks & Sub-Agents: Dec 2025 Edition](https://www.medianeth.dev/blog/claude-code-frameworks-subagents-2025)
