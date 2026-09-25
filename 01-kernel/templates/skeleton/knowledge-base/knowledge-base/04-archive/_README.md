---
date created: YYYY-MM-DD
temperature: archive
title: Archive (Frozen Zone)
stratum: 3
---

Long-term filed knowledge organized with **Johnny Decimal**.

## Johnny Decimal Structure

```
04-archive/
├── misc-uncategorized.md        # Loose files OK at root
├── 10-19 [Area Name]/
│   ├── 11 [Category]/
│   │   ├── 11.01-specific-item.md
│   │   └── 11.02-another-item.md
│   └── 12 [Category]/
├── 20-29 [Area Name]/
└── ...
```

## How It Works

- **Areas** (10-19, 20-29, etc.): Broad domains defined per-project
- **Categories** (11, 12, etc.): Subdivisions within an area
- **IDs** (11.01, 11.02): Specific items within a category

## Defining Areas

Use SEACOW thinking to define areas based on:
- **Audience:** Who accesses this knowledge?
- **Domain:** What subject area does it cover?
- **Usefulness:** How is this knowledge used?

> [!tip] Start Simple
> Start with 2-3 areas and add more as content accumulates. Files that don't fit any area sit loose at `04-archive/` root -- that's fine.

## Cross-Temperature References

Archive content can be referenced from ANY zone via wikilinks:

```markdown
<!-- In 01-working/draft.md -->
Based on [[04-archive/11 System Design/11.01-initial-architecture]].
```

## Your JD Areas

_Define your areas here after setup:_

<!-- Example:
| Area | Domain |
|------|--------|
| 10-19 | Architecture |
| 20-29 | Operations |
| 30-39 | Research |
-->
