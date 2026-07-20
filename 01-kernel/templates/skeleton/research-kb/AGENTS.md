---
title: Research Project
stratum: 3
---
## Identity

A research knowledge base where the structured files ARE the deliverable.

## Agent Instructions

When working on this research:
1. Read existing files first for full context
2. Update files in place (don't just append)
3. Create new files for new topics
4. Maintain cross-references between files
5. Use SCREAMING_SNAKE_CASE for key documents

## Structure

```
research/
├── 00-overview/       # Vision, goals, success criteria
├── 01-problem/        # Problem definition, constraints
├── 02-research/       # Analysis, competitors, findings
├── 03-architecture/   # Technical designs, solutions
└── AGENTS.md          # You are here
```

## Conventions

- **File naming:** SCREAMING_SNAKE_CASE for emphasis (e.g., BYPASS_METHODS.md)
- **Folders:** Numbered for progression (00-, 01-, etc.)
- **Cross-refs:** Use relative markdown links
- **Status tracking:** Use frontmatter with status field

## Frontmatter Template

```yaml
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: draft | review | final
tags:
  - research
  - [topic]
---
```
