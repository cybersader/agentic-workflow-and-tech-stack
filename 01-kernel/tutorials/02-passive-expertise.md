---
title: "Tutorial 2: Creating Passive Expertise (Skills)"
stratum: 2
branches: [agentic]
---
**Time:** 20 minutes
**Prerequisites:** Completed Tutorial 1

Learn to create skills that inform without acting. By the end, you'll have created a reusable skill for your own domain.

---

## What You'll Learn

1. The anatomy of a skill file
2. How to write effective descriptions (trigger matching)
3. Progressive disclosure in skill content
4. Testing your skill works as expected

---

## The Skill Anatomy

```
.claude/skills/
└── your-skill-name/          ← Directory (required)
    └── SKILL.md              ← Must be named exactly this
```

### File Structure

```markdown
---
name: your-skill-name
description: When to use this skill. Be specific about triggers.
---

# Skill Title

Brief introduction (50 words max).

---

## Quick Reference

[Most important patterns - scannable]

---

## Core Knowledge

[Main content - the expertise]

---

## Examples

[How to apply the knowledge]

---

## Anti-Patterns

[What NOT to do]
```

---

## Exercise 1: Create a Domain Skill

**Goal:** Build a skill for a domain you work in.

### Step 1: Choose your domain

Pick something you explain repeatedly:
- Code review patterns
- API design conventions
- Testing strategies
- Documentation standards
- Security practices

### Step 2: Create the skill

```bash
# Replace 'api-design' with your domain
mkdir -p .claude/skills/api-design
```

```bash
cat > .claude/skills/api-design/SKILL.md << 'EOF'
---
name: api-design
description: Use when discussing REST APIs, endpoint design, HTTP methods, status codes, or API versioning.
---

# API Design Patterns

Conventions for designing consistent, intuitive REST APIs.

---

## Quick Reference

| Method | Use For | Idempotent? |
|--------|---------|-------------|
| GET | Retrieve resource | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Partial update | No |
| DELETE | Remove resource | Yes |

---

## Core Patterns

### URL Structure
```
/resources                    # Collection
/resources/{id}               # Specific resource
/resources/{id}/subresources  # Nested resources
```

### Status Codes
- 2xx: Success (200 OK, 201 Created, 204 No Content)
- 4xx: Client error (400 Bad Request, 404 Not Found)
- 5xx: Server error (500 Internal Server Error)

### Versioning
Prefer URL versioning: `/v1/resources`

---

## Anti-Patterns

- Using verbs in URLs (`/getUser` instead of `/users/{id}`)
- Returning 200 for errors
- Inconsistent pluralization
- Deep nesting beyond 2 levels
EOF
```

### Step 3: Test it

Start a fresh session:
```bash
claude
```

Say: "I'm designing a new API for user management. What patterns should I follow?"

**Observe:**
- [ ] Skill permission prompt or usage indication
- [ ] Response includes patterns from your skill
- [ ] Quick reference patterns appear in response

---

## Exercise 2: Write an Effective Description

**Goal:** Master the trigger mechanism.

### The Description Field

The `description` field determines WHEN your skill loads. It's semantic, not keyword-based.

**Bad descriptions:**
```yaml
# Too vague - when would this trigger?
description: Useful skill for coding

# Too narrow - misses related queries
description: Use when user says "API design"
```

**Good descriptions:**
```yaml
# Specific scenarios, natural language
description: Use when discussing REST APIs, endpoint design, HTTP methods,
             status codes, API versioning, or when designing web service interfaces.

# Proactive version
description: Use PROACTIVELY when user is building APIs, discussing HTTP endpoints,
             or designing client-server communication patterns.
```

### Test different phrasings

With your API skill loaded, try:
1. "How should I design this endpoint?" ← Should trigger
2. "What HTTP method for updating?" ← Should trigger
3. "Help me write a function" ← Should NOT trigger
4. "REST best practices" ← Should trigger

---

## Exercise 3: Progressive Disclosure

**Goal:** Structure content for efficient context usage.

### The Problem

Skills load into context. If your skill is 2000 lines, that's a lot of tokens.

### The Solution: Layer the content

```markdown
## Quick Reference (always useful)
[50 words - scannable tables]

## Core Knowledge (usually useful)
[200 words - main patterns]

## Deep Reference (sometimes useful)
[Extended content - examples, edge cases]

## External Links (rarely needed in context)
[Point to external docs instead of including them]
```

### Refactor your skill

Update your skill to follow this pattern:
1. Put the most-used info at the top
2. Make tables for quick scanning
3. Put detailed examples at the bottom
4. Link to external docs instead of copying them in

---

## Exercise 4: Test Skill Isolation

**Goal:** Verify your skill works without dependencies.

### The Test

```bash
# Create isolated environment
mkdir -p /tmp/skill-test/.claude/skills
cp -r .claude/skills/api-design /tmp/skill-test/.claude/skills/
cd /tmp/skill-test
claude
```

Say: "What are the REST API conventions?"

**Verify:**
- [ ] Skill loads without errors
- [ ] Response uses skill content
- [ ] No warnings about missing dependencies
- [ ] Works on second question too

### What isolation proves

If your skill works alone, it's truly **passive expertise** — it doesn't depend on agents, other skills, or scaffold infrastructure.

---

## Skill Design Checklist

Before considering a skill complete:

- [ ] **Name** matches directory name
- [ ] **Description** covers all trigger scenarios
- [ ] **Quick Reference** at top (scannable)
- [ ] **No dependencies** on other skills
- [ ] **Tested in isolation** (works alone)
- [ ] **Tested with variations** (different phrasings trigger it)
- [ ] **Not too long** (<500 lines ideally)

---

## Common Mistakes

### Mistake 1: Keyword thinking

```yaml
# Wrong - thinking in keywords
description: api, rest, http, endpoint

# Right - thinking in scenarios
description: Use when designing REST APIs, discussing HTTP methods,
             or planning endpoint structure.
```

### Mistake 2: Too much content

Don't paste entire documentation into a skill. Instead:
- Summarize the key patterns
- Link to external docs
- Use progressive disclosure

### Mistake 3: Dependencies

```markdown
# Wrong - requires another skill
See the authentication-patterns skill for auth details.

# Right - self-contained or explicit
For authentication, use JWT tokens with short expiry...
```

---

## What You Built

You now have:
- A skill for your domain
- Understanding of trigger matching
- Progressive disclosure structure
- Isolation testing confidence

---

## What's Next?

- [Tutorial 3: Creating Active Executors](03-active-executors.md) — Build agents
- [Tutorial 4: Proactive Patterns](04-proactive-patterns.md) — Auto-triggering
- [Concepts Reference](../docs/CONCEPTS.md) — Full vocabulary

---

## Template: Copy This

```markdown
---
name: your-skill-name
description: Use when [specific scenarios]. Use PROACTIVELY when [optional auto-triggers].
---

# Skill Title

One sentence: what this skill provides.

---

## Quick Reference

| Key | Value |
|-----|-------|
| Pattern 1 | Description |
| Pattern 2 | Description |

---

## Core Patterns

### Pattern Name
[Explanation]

### Pattern Name
[Explanation]

---

## Examples

### Example: [Scenario]
[Code or demonstration]

---

## Anti-Patterns

- Don't do X because Y
- Avoid Z

---

## See Also

- [External resource](url)
```
