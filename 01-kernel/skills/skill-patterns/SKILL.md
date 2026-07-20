---
name: skill-patterns
description: Expertise in designing Claude Code skills. Use when creating new skills, refining existing ones, designing skill templates, or understanding how skills work.
title: Skill Patterns
stratum: 2
branches: [agentic]
---

## Purpose
Expertise in designing Claude Code skills. Load this skill when creating new skills or refining existing ones.

---

## What Is a Skill?

A skill is **passive expertise** that Claude discovers and uses when relevant. Skills inform; they don't execute.

| Aspect | Description |
|--------|-------------|
| **Trigger** | Claude determines relevance from YAML description |
| **Action** | Content loads into context |
| **Scope** | Runs in main context (not isolated) |
| **Purpose** | Provide expertise, patterns, conventions |

---

## CRITICAL: Correct Skill Structure

**Skills MUST be in a subdirectory with SKILL.md file:**

```
.claude/skills/
└── my-skill/           # Subdirectory required!
    └── SKILL.md        # Must be named SKILL.md
```

**SKILL.md MUST have YAML frontmatter:**

```yaml
---
name: my-skill
description: What this skill does AND when Claude should use it. Be specific about trigger contexts.
---

# Skill Content

[The expertise content here]
```

**IMPORTANT:** The old `## Activation Keywords` section is NOT a real Claude Code feature. It was a documentation convention that doesn't actually work. Skills are discovered via the `description` field in YAML frontmatter.

---

## Skill File Structure (Correct Format)

```yaml
---
name: [skill-name]
description: [What this skill provides AND when to use it. Include trigger contexts.]
---

# [Skill Name]

## Purpose
One-sentence description of what expertise this provides.

---

## Core Knowledge
[The main content - patterns, rules, templates, etc.]

---

## Usage Patterns
[How to apply this knowledge]

---

## Anti-Patterns
[What NOT to do]

---

## Related Skills
- `related-skill` — Brief description
```

---

## Description Writing Guidelines

The `description` field is HOW Claude discovers your skill. Write it well.

### Good Descriptions
- State WHAT the skill provides
- State WHEN Claude should use it
- Include trigger contexts/scenarios
- Be specific enough to avoid false activation

### Examples

| Good | Why |
|------|-----|
| "Expertise in Python testing patterns including pytest, fixtures, mocking. Use when user asks about testing, pytest, fixtures, or test coverage." | Clear what + when |
| "SEACOW meta-framework for organizational design. Use when designing structures, asking 'where should this go', or creating conventions." | Clear domain + triggers |
| "Provides test conventions for this workspace. Use when user asks about test conventions, testing patterns, or verification methods." | Specific to workspace + clear triggers |

| Bad | Why |
|-----|-----|
| "Helps with testing" | Too vague, when? |
| "Python stuff" | No trigger context |
| "test, pytest, fixture, mock" | Just keywords, no context |

---

## Progressive Disclosure

Skills should practice progressive disclosure:

1. **Summary section** — Quick overview (50 words)
2. **Core knowledge** — Essential patterns/rules
3. **Deep reference** — Detailed examples, edge cases
4. **External files** — Reference separate docs for extensive content

### Why?
- Context windows are finite
- Load what's needed, reference the rest
- Keep skill files under 500 lines

---

## Skill Sizing Guidelines

| Size | Lines | Use Case |
|------|-------|----------|
| Micro | <100 | Single concept, quick reference |
| Standard | 100-300 | Domain expertise, patterns |
| Large | 300-500 | Complex domain, many rules |
| Split | 500+ | Break into multiple skills |

If a skill exceeds 500 lines, consider:
- Splitting into sub-skills
- Moving detailed content to reference files
- Using `## See Also` for deep dives

---

## SEACOW Placement

| Skill Type | Location |
|------------|----------|
| Meta (building skills/agents) | `/.claude/skills/skill-name/SKILL.md` |
| Domain expertise | `/.claude/skills/domain-name/SKILL.md` |
| Project-specific | `/project/.claude/skills/skill-name/SKILL.md` |

---

## Skill Template

```yaml
---
name: [domain]-conventions
description: [What expertise this provides AND when Claude should use it. Be specific about trigger contexts.]
---

# [Domain] Conventions

## Purpose
[One sentence: what expertise this provides]

---

## Quick Reference

| Concept | Rule |
|---------|------|
| [Concept 1] | [Brief rule] |
| [Concept 2] | [Brief rule] |

---

## Core Patterns

### [Pattern 1]
[Description and example]

### [Pattern 2]
[Description and example]

---

## Usage Examples

### Example: [Scenario]
```
[Code or content example]
```

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| [Bad practice] | [Good practice] |

---

## Related Skills
- `[skill-name]` — [Brief purpose]
```

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Put skill.md directly in skills/ folder | Use subdirectory: `skills/name/SKILL.md` |
| Use "## Activation Keywords" section | Use YAML `description` field |
| Vague description ("helps with code") | Specific what + when description |
| Massive monolithic skills | Split into focused sub-skills |
| Duplicate content from other skills | Reference other skills |
| Include execution logic | Skills inform, agents execute |

---

## Composability Rules

1. **Skills can chain** — One skill can reference another
2. **Skills don't conflict** — Use clear headers, avoid namespace collisions
3. **Skills are additive** — Multiple skills can load together
4. **Skills inform agents** — Agents preload skills via `skills:` field

---

## Testing a New Skill

1. **Structure test** — Is it in `skills/name/SKILL.md` format?
2. **Frontmatter test** — Does it have `name` and `description`?
3. **Description test** — Is the description specific about when to use?
4. **Relevance test** — Does Claude use it when you expect?
5. **Size test** — Is it under 500 lines?
6. **Composability test** — Does it work with other skills?

---

## Migration from Old Format

If you have skills using the old format (direct `.md` file with `## Activation Keywords`):

1. Create subdirectory: `mkdir .claude/skills/skill-name/`
2. Move and rename: `mv skill-name.md skill-name/SKILL.md`
3. Add YAML frontmatter with `name` and `description`
4. Remove `## Activation Keywords` section
5. Move keyword content INTO the description field

---

## Related Skills
- `seacow-conventions` — SEACOW framework for placement
- `agent-patterns` — How agents use skills
