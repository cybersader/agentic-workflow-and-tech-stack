---
stratum: 3
aliases: [Templates Index]
tags:
  - /system
  - /templates
publish: false
date created: 2025-12-22
date modified: 2025-12-22
system: [[/System/CLAUDE]]
---

# Templates

Reusable scaffolds for creating content in each SEACOW layer.

---

## Frontmatter Templates

Copy the appropriate template when creating new files:

| Template | SEACOW Layer | Tag Prefix |
|----------|--------------|------------|
| [[frontmatter/seacow-capture]] | Capture | `#-` |
| [[frontmatter/seacow-work]] | Work | (none) |
| [[frontmatter/seacow-output]] | Output | `#_` |

---

## Project Template

Complete scaffold for new projects in Work/Projects/:

```
project-template/
├── CLAUDE.md           # Project-specific context
├── _index.md           # Navigation
└── .claude/
    ├── skills/         # Project-specific expertise
    └── agents/         # Project-specific agents
```

**Usage:** Copy entire folder to `Work/Projects/[project-name]/`

---

## Creating New Templates

When creating new templates:
1. Add to appropriate subdirectory
2. Include SEACOW frontmatter
3. Document in this _index.md
4. Update `template-usage.md` skill if needed
