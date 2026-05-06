---
title: Open Challenges
description: Hard problems currently being chewed on. Not questions to ask later — active exploration.
date created: 2026-04-18
tags:
  - /meta
  - research
  - challenges
status: research
---

# Open Challenges

This folder holds **active problems**, not settled ones. A challenge is:

- Grounded in a real observed friction or failure mode
- Not yet resolved
- Worth multiple sessions of thinking
- Blocking progress on something upstream

**The difference from open questions:** open questions are precise and waiting for an answer. Challenges are messier — they're the "I don't even know how to frame this yet" pile.

## Lifecycle of a Challenge

```
  raw friction
      │
      ▼
  zz-challenges/*.md  ←──  "I'm stuck on X, let me write it out"
      │
      ├─► promoted to research/architecture/ (when the shape of the solution is clear)
      ├─► promoted to research/learnings/ (when it turns out to be a primitive insight)
      └─► demoted to an open question (when it's crisp enough to just be a question)
```

Challenges accumulate; there's no rush to resolve them. Some will sit here for weeks while the relevant concepts mature.

## Challenge Format

Each challenge file includes:

- **The assignment** — What the problem is and why it matters
- **What to investigate** — Multiple numbered questions/angles
- **Context to read first** — Links to relevant existing docs
- **What success looks like** — Concrete deliverable criteria
- **What this does NOT decide** — Scope boundary

## Current Challenges

| # | Title | Status |
|---|-------|--------|
| 01 | [Interactive Agent Testing with Live Feedback](01-interactive-agent-testing.md) | Active |
| 02 | [Claude Code Conversation Fragmentation](02-claude-code-conversation-fragmentation.md) | Mostly resolved (portaconv v0.1) |
| 03 | [Parallel Agent Coordination](03-parallel-agent-coordination.md) | Active (findings shipped 2026-04-25) |

## Naming Convention

- `zz-` prefix → sorts to bottom of file listings
- Numbered `01-`, `02-`, etc. → preserve order of capture
- Kebab-case topic → e.g., `03-multi-tenant-agent-isolation.md`

When promoted out of challenges, rename and move to appropriate destination.
