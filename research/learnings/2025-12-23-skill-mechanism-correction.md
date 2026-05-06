---
created: 2025-12-23
updated: 2025-12-23
tags:
  - learnings
  - claude-code
  - skills
  - correction
---

# Learning: Skill Discovery Mechanism Correction

## Summary

The `## Activation Keywords` section documented throughout the codebase was NOT a real Claude Code feature - it was a documentation convention we created that doesn't actually work. Skills are discovered via YAML `description` field semantic matching, not keyword matching.

---

## The Discovery

While testing the first test case (01: Skill Loading), skills were not loading when keywords were mentioned. Investigation revealed:

1. **What we documented:** Skills have an "Activation Keywords" section that triggers loading when those words appear
2. **What actually works:** Skills in `.claude/skills/name/SKILL.md` with YAML frontmatter `description` field

Claude reads the `description` field and autonomously decides when a skill is relevant based on semantic understanding of the context.

---

## Correct Skill Format

### Structure (Required)

```
.claude/skills/
└── skill-name/           # Subdirectory REQUIRED
    └── SKILL.md          # Must be named SKILL.md
```

### SKILL.md Content

```yaml
---
name: skill-name
description: What this skill provides AND when Claude should use it. Be specific about trigger contexts.
---

# Skill Title

[Content - NO "Activation Keywords" section needed]
```

### Good vs Bad Descriptions

**Good:**
- "Expertise in Python testing patterns. Use when user asks about pytest, fixtures, mocking, or test coverage."
- "SEACOW framework for organizational design. Use when designing structures or asking 'where should this go'."

**Bad:**
- "Helps with testing" (too vague)
- "test, pytest, fixture" (just keywords, no context)

---

## What This Means

1. **Keyword matching doesn't exist** - Claude uses semantic understanding
2. **Description field is critical** - It's the sole mechanism for skill discovery
3. **"Use when..." pattern works best** - Tells Claude when to apply the skill

---

## Files Corrected

### Skills Migrated (7 files)
- `.claude/skills/proactive-patterns/SKILL.md`
- `.claude/skills/workflow-guide/SKILL.md`
- `.claude/skills/delegation-advisor/SKILL.md`
- `.claude/skills/workflow-meta/SKILL.md`
- `.claude/skills/seacow-conventions/SKILL.md`
- `.claude/skills/agent-patterns/SKILL.md`
- `.claude/skills/skill-patterns/SKILL.md`

### Documentation Fixed
- `.claude/ARCHITECTURE.md`
- `docs/tool-comparison.md`
- `docs/01-initial-setup.md`
- `docs/02-project-init.md`
- `docs/03-ongoing-usage.md`
- `.claude/agents/meta/skill-writer.md`

---

## Validation

Tested in `test-workspace/`:
1. Created `.claude/skills/test-skill/SKILL.md` with proper YAML frontmatter
2. Asked "What are the test conventions?"
3. Skill content was used in response

---

## Source

Discovered during testing of Multi-Tool Agent Testing Guide. See `test-workspace/TESTING.md` for test results.
