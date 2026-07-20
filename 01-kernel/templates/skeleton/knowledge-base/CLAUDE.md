---
title: {{PROJECT_NAME}}
stratum: 3
---
## Identity

**Purpose:** [What this project does]

---

## Knowledge Base

This project uses the **temperature gradient** system for persistent context across sessions. Content flows from hot (raw captures) to cold (archived reference) as it matures.

```
HOT                                                                        COLD
<------------------------------------------------------------------------------>

task_plan.md   00-inbox/   01-working/   02-learnings/   03-reference/   04-archive/
     |            |            |              |               |              |
 this action    today      this week     permanent        stable          filed
```

- **00-inbox/** - Raw captures, unprocessed session discoveries
- **01-working/** - Drafts being synthesized, docs in progress
- **02-learnings/** - Distilled atomic insights (permanent)
- **03-reference/** - Actively used stable docs, guides, how-tos
- **04-archive/** - Long-term filed knowledge (Johnny Decimal)

See `knowledge-base/README.md` for full documentation.

---

## Conventions

- All knowledge-base files use **Obsidian Flavored Markdown** (wikilinks, callouts, properties)
- Default to `00-inbox/` for uncertain items -- better to capture warm than lose
- Use wikilinks (`[[note]]`) to connect content across temperature zones
- Use YAML frontmatter with `date created`, `temperature`, and `tags`

---

## Directory Structure

```
project/
├── CLAUDE.md                    # You are here
├── AGENTS.md                    # Portable agent definitions
├── task_plan.md                 # Hot: create on-demand for complex tasks (not auto-created)
├── knowledge-base/
│   ├── README.md                # How the gradient works
│   ├── 00-inbox/                # Hot: raw captures
│   ├── 01-working/              # Warm: active processing
│   ├── 02-learnings/            # Cool: distilled insights
│   ├── 03-reference/            # Cold: stable docs
│   └── 04-archive/              # Frozen: Johnny Decimal filed knowledge
├── .claude/
│   ├── settings.local.json      # Hooks for context persistence
│   ├── scripts/
│   │   ├── check-complete.sh    # Session completion check
│   │   ├── read-plan.sh         # Smart plan reader (detects empty plans)
│   │   └── check-knowledge.sh   # KB status & capture prompts at session end
│   └── skills/
│       └── knowledge-curator/   # Nudges AI to use the gradient
└── (your existing files)
```

> **Note:** `task_plan.md` is not created during scaffolding. Run `/task-plan` or create it manually when you start a multi-phase task. Hooks silently do nothing without it. If an empty `task_plan.md` exists, the PreToolUse hook will detect it and offer to populate or delete it.

---

## Context Loading Rules

1. Read `CLAUDE.md` first for project context
2. Read `knowledge-base/README.md` for gradient usage
3. Check `task_plan.md` for current session focus
4. Use `.claude/skills/knowledge-curator/SKILL.md` for gradient placement guidance
