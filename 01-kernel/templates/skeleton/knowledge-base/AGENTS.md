---
title: AGENTS.md
stratum: 3
---
Portable agent definitions for any AI coding tool.

---

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| [explore](#explore) | Find files, understand codebase | "How does X work?" |
| [plan](#plan) | Design implementation approach | Multi-step implementations |

---

## Agent Definitions

### explore

**Purpose:** Navigate codebase, find files, understand architecture.

**When to Use:**
- "How does X work in this codebase?"
- "Where is Y implemented?"
- Finding files by pattern or content

**Capabilities:** Glob, Grep, Read

### plan

**Purpose:** Design implementation approach before coding.

**When to Use:**
- Multi-file changes
- New features
- Architectural decisions

**Capabilities:** All exploration + design step-by-step plans

---

## Knowledge Base Agents

The `knowledge-curator` skill (`.claude/skills/knowledge-curator/SKILL.md`) guides AI to place content at the right temperature in the gradient. It activates automatically when creating files in `knowledge-base/`.
