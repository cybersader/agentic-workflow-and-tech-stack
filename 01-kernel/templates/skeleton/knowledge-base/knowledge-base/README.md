---
date created: YYYY-MM-DD
date modified: YYYY-MM-DD
temperature: reference
title: Knowledge Base
stratum: 3
---

This project uses the **temperature gradient** system for knowledge management. Content flows from hot (raw captures) to cold (archived reference) as it matures.

## Gradient Mapping (5 Zones)

```
HOT                                                                        COLD
<------------------------------------------------------------------------------>

task_plan.md   00-inbox/   01-working/   02-learnings/   03-reference/   04-archive/
     |            |            |              |               |              |
 this action    today      this week     permanent        stable          filed
     |            |            |              |               |              |
  "doing"     "captured"  "processing"  "distilled"     "accessed"     "organized"
```

Numbers make the flow direction explicit: content matures from 00 to 04.

## Where Things Live

| Zone | Folder | What Goes Here |
|------|--------|----------------|
| **Hot** | `task_plan.md` (root) | Current task phases — create on-demand, not auto-scaffolded |
| **Warm** | `00-inbox/` | Raw captures, quick notes, unprocessed session discoveries |
| **Active** | `01-working/` | Drafts being synthesized, docs in progress |
| **Cool** | `02-learnings/` | Distilled atomic insights (permanent) |
| **Cold** | `03-reference/` | Actively used stable docs, guides, how-tos |
| **Frozen** | `04-archive/` | Long-term filed knowledge (Johnny Decimal) |

## 04-archive: Johnny Decimal

The archive uses **Johnny Decimal** areas and categories defined per-project. Files that don't fit any area sit loose at `04-archive/` root.

```
04-archive/
├── loose-uncategorized.md       # No JD area needed
├── 10-19 [Area Name]/
│   ├── 11 [Category]/
│   └── 12 [Category]/
└── 20-29 [Area Name]/
```

> [!tip] Defining JD Areas
> Use SEACOW thinking to define areas: audience, domain, usefulness. The scaffolder helps you define these when setting up a new project. Start with 2-3 areas and add more as content accumulates.

## Cross-Temperature References

Content maturity flows one direction (00 to 04), but **references go any direction** via wikilinks:

```markdown
<!-- In 01-working/draft.md -->
See [[03-reference/api-guide]] for conventions.
Based on [[04-archive/11 System Design/11.01-initial-architecture]].
```

The gradient determines WHERE content lives. Wikilinks connect content freely across zones.

## Usage

1. **During sessions:** Capture discoveries in `00-inbox/`
2. **Between tasks:** Process inbox items to `01-working/` drafts
3. **When insights crystallize:** Distill to `02-learnings/YYYY-MM-DD-topic.md`
4. **When stable:** Move guides/docs to `03-reference/`
5. **When done:** File into `04-archive/` JD areas

## See Also

- `.claude/skills/knowledge-curator/SKILL.md` -- AI nudging for gradient placement
