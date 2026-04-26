---
title: Tutorials
stratum: 2
branches: [agentic]
---
Hands-on guides for learning agentic workflow patterns. Start with Tutorial 1 and progress through.

---

## Learning Path

```
Concepts (theory)     Tutorials (practice)
       │                     │
       └──────┬──────────────┘
              │
              v
    ┌─────────────────┐
    │ 01: First       │  ← Start here
    │ Workflow        │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ 02: Passive     │
    │ Expertise       │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ 03: Active      │
    │ Executors       │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ 04: Proactive   │  (coming soon)
    │ Patterns        │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ 05: Orchestr-   │  (coming soon)
    │ ation           │
    └─────────────────┘
```

---

## Tutorial Index

| # | Title | Time | What You'll Learn |
|---|-------|------|-------------------|
| [01](01-first-workflow.md) | Your First Agentic Workflow | 15 min | Core concepts through hands-on experience |
| [02](02-passive-expertise.md) | Creating Passive Expertise | 20 min | Building skills that inform without acting |
| [03](03-active-executors.md) | Creating Active Executors | 25 min | Building agents that do isolated work |
| 04 | Proactive Patterns | - | Auto-triggering and ask-first (coming soon) |
| 05 | Orchestration | - | Coordinating multiple agents (coming soon) |

---

## Prerequisites

- Claude Code or OpenCode installed
- A codebase to experiment with
- 1-2 hours total time

---

## Concepts Reference

Read [CONCEPTS.md](../docs/CONCEPTS.md) for the unified vocabulary. The tutorials use this terminology.

| Term | Meaning |
|------|---------|
| Passive Expertise | Knowledge that informs (skills) |
| Active Executor | Worker that does isolated work (agents) |
| Proactive Trigger | Auto-activation based on context |
| Context Funneling | Deep work → compressed return |
| Ask-First Delegation | Consult before autonomous action |

---

## Testing Your Learning

After completing tutorials, test your understanding:

1. **Can you create a skill from scratch?**
   - Create one for your domain
   - Test it triggers correctly
   - Verify it works in isolation

2. **Can you create an agent from scratch?**
   - Define clear mission and output format
   - Include constraint reminder
   - Test context funneling works

3. **Do you understand the difference?**
   - Skills load INTO your context
   - Agents spawn FRESH context
   - Orchestrators coordinate agents

---

## Feedback

Found a snag? Tutorial unclear? Add a note:

```markdown
%%TUTORIAL-FEEDBACK: [tutorial number] [issue description]%%
```

These will be collected during testing to improve the tutorials.
