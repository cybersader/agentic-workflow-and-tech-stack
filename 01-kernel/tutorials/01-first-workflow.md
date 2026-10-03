---
title: "Tutorial 1: Your First Agentic Workflow"
stratum: 2
branches: [agentic]
---
**Time:** 15 minutes
**Prerequisites:** Claude Code or OpenCode installed

This tutorial introduces the core concepts through hands-on experience. You'll learn by doing, not just reading.

---

## What You'll Learn

1. The difference between **passive expertise** and **active executors**
2. How **proactive triggers** work
3. The **ask-first delegation** pattern
4. How **context funneling** keeps your session clean

---

## Setup

1. Navigate to a project directory (any codebase will do)
2. Create a minimal skill:

```bash
mkdir -p .claude/skills/explain-code
cat > .claude/skills/explain-code/SKILL.md << 'EOF'
---
name: explain-code
description: Use when user asks to explain code, understand functions, or learn how something works.
---

# Code Explanation Patterns

When explaining code:
1. Start with the "what" (purpose)
2. Then the "how" (mechanism)
3. Then the "why" (design decisions)

Use concrete examples from the actual code being discussed.
EOF
```

3. Start your AI tool:
```bash
claude    # or: opencode
```

---

## Exercise 1: Passive Expertise

**Goal:** Understand that skills inform but don't act.

### Step 1: Trigger the skill

Say: "Can you explain how this codebase works?"

### What to observe:
- [ ] Did you see a permission prompt (Claude Code) or skill usage (OpenCode)?
- [ ] The response should follow the pattern from the skill (what → how → why)
- [ ] No files were created or modified

### Reflection

The skill **loaded into your context** and influenced the response. But it didn't:
- Spawn a separate process
- Read any files on its own
- Take any autonomous action

This is **passive expertise** — knowledge that informs, not acts.

---

## Exercise 2: Active Executor

**Goal:** Understand that agents work in isolated context.

### Step 1: Request exploration

Say: "Use the Explore agent to find all the entry points in this codebase."

### What to observe:
- [ ] An agent was spawned (you may see "Launching agent..." or similar)
- [ ] The agent read multiple files (possibly dozens)
- [ ] You received a **summary**, not the full content of every file
- [ ] Your main context didn't fill up with all that file content

### Reflection

The agent worked in **fresh context**. It could read 50 files without polluting your session. Only the compressed summary came back.

This is **context funneling** — deep work in isolation, compressed return.

---

## Exercise 3: Proactive Trigger

**Goal:** See how semantic matching activates functionality.

### Step 1: Create a proactive skill

```bash
cat > .claude/skills/complexity-advisor/SKILL.md << 'EOF'
---
name: complexity-advisor
description: Use PROACTIVELY when user mentions complex tasks, large changes, refactoring, or multi-file work. Suggests breaking down the work.
---

# Complexity Advisory

When a task seems complex, suggest:
1. Breaking it into smaller pieces
2. Using agents for exploration first
3. Creating a plan before implementing

Ask: "This seems like a multi-step task. Want me to break it down first?"
EOF
```

### Step 2: Trigger it naturally

Say: "I need to refactor the authentication system across this whole codebase."

### What to observe:
- [ ] The skill activated without you asking for it
- [ ] It matched on "refactor" + "whole codebase" (complexity signals)
- [ ] The response included the advisory pattern

### Reflection

You didn't say "use the complexity-advisor skill." The **proactive trigger** detected semantic relevance from your request. The `description` field told it WHEN to activate.

---

## Exercise 4: Ask-First Delegation

**Goal:** Experience the consent pattern before autonomous action.

### Step 1: Create a delegation advisor

```bash
cat > .claude/skills/delegation-advisor/SKILL.md << 'EOF'
---
name: delegation-advisor
description: Use PROACTIVELY when user faces complex research, multi-file exploration, or tasks that would benefit from agent delegation. Ask before spawning.
---

# Delegation Advisory

When you notice a task that could benefit from an agent:

1. **Identify the opportunity**
   - Large codebase exploration
   - Multi-file search
   - Deep research

2. **Ask first**
   "I could spawn an Explore agent to research this. It would:
   - Search across [scope]
   - Return a summary of findings
   - Keep your context clean

   Want me to proceed?"

3. **Wait for approval** before using Task tool
EOF
```

### Step 2: Trigger it

Say: "I need to understand how error handling works across this entire project."

### What to observe:
- [ ] The response ASKS if you want an agent spawned
- [ ] It explains what the agent would do
- [ ] It waits for your approval

### Reflection

This is **ask-first delegation**. The AI noticed you might benefit from an agent but didn't just spawn one. It asked permission, maintaining your control.

---

## Exercise 5: The Full Pattern

**Goal:** See all concepts working together.

### The Workflow

```
You: "Help me understand and improve the auth system"
                    │
                    v
     ┌──────────────────────────────┐
     │  PROACTIVE TRIGGER activates │
     │  complexity-advisor          │
     └──────────────────────────────┘
                    │
                    v
     ┌──────────────────────────────┐
     │  ASK-FIRST: "This is complex │
     │  Want me to break it down?"  │
     └──────────────────────────────┘
                    │
           You: "Yes"
                    │
                    v
     ┌──────────────────────────────┐
     │  ORCHESTRATOR creates plan:  │
     │  1. Explore current auth     │
     │  2. Identify pain points     │
     │  3. Propose improvements     │
     └──────────────────────────────┘
                    │
                    v
     ┌──────────────────────────────┐
     │  ASK-FIRST: "Want me to      │
     │  spawn Explore agent first?" │
     └──────────────────────────────┘
                    │
           You: "Yes"
                    │
                    v
     ┌──────────────────────────────┐
     │  ACTIVE EXECUTOR:            │
     │  Explore agent searches      │
     │  (50 files in fresh context) │
     └──────────────────────────────┘
                    │
                    v
     ┌──────────────────────────────┐
     │  CONTEXT FUNNELING:          │
     │  Returns 200-word summary    │
     │  Your context stays clean    │
     └──────────────────────────────┘
                    │
                    v
     ┌──────────────────────────────┐
     │  PASSIVE EXPERTISE:          │
     │  Uses patterns from skills   │
     │  to inform recommendations   │
     └──────────────────────────────┘
```

### Try it

Say: "Help me understand and improve the error handling in this project."

Observe the full pattern in action.

---

## Key Takeaways

| Concept | What It Does | How to Recognize |
|---------|--------------|------------------|
| **Passive Expertise** | Informs responses | No files changed, patterns in output |
| **Active Executor** | Does isolated work | "Spawning agent...", summary returned |
| **Proactive Trigger** | Auto-activates | Skill used without explicit request |
| **Ask-First** | Maintains control | Questions before autonomous action |
| **Context Funneling** | Keeps context clean | Deep work, short summary |

---

## What's Next?

- [Tutorial 2: Creating Passive Expertise](02-passive-expertise.md) — Write your own skills
- [Tutorial 3: Creating Active Executors](03-active-executors.md) — Write your own agents
- [Tutorial 4: Proactive Patterns](04-proactive-patterns.md) — Design triggers
- [Concepts Reference](../docs/CONCEPTS.md) — Full vocabulary

---

## Cleanup

Remove the test skills:
```bash
rm -rf .claude/skills/explain-code
rm -rf .claude/skills/complexity-advisor
# Keep delegation-advisor if you want it
```
