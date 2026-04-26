---
title: "Example: Frontmatter for Work/Processing Areas"
stratum: 3
---
This shows ONE WAY you might tag items in areas where information gets PROCESSED (active projects, drafts, synthesis).

---

```yaml
---
aliases: []
tags:
  - [topic]            # Example: topic tags (no prefix)
  - [domain]
publish: false
date created: [date]
date modified: [date]

# Example SEACOW links (showing relationships)
entity: [[--cybersader]]
source: [[path/to/source]]     # Where this originated (from input area)
output: []                     # Where this will go when finished
related:
  - [[Work/Projects/related/_index]]

# Example: Tracking work status
status: active         # draft, active, review, complete
project: [[Work/Projects/[name]/_index]]
---
```

---

## This is an Example

**You don't have to use this exact structure.** Consider it a starting point showing:
- How you MIGHT distinguish work-in-progress from input/output
- One tagging approach (no prefix for work)
- Example fields for tracking project status

---

## Adapt to Your Context

**If using Obsidian:**
- Use properties for status
- Link to project MOCs
- Track dependencies with wikilinks

**If using VS Code:**
- Use file metadata
- Track in TODO comments
- Or use a project management plugin

**If using a file share:**
- Use folder structure (`Active/`, `WIP/`, `Drafts/`)
- Use filename conventions (prefix with date or status)
- Use file properties

**If using Notion:**
- Use status property with workflow states
- Use relations to link projects
- Use formulas for automation

---

## The Core Questions (SEACOW)

When tagging work/processing areas, ask:
1. **Where does active processing happen?**
2. **How do I track what's in progress vs complete?**
3. **How do I connect work items to their sources?**
4. **How do I connect work items to future outputs?**
5. **What projects/contexts does this belong to?**

Your answers determine YOUR structure, not this template.

---

## Example Tag Conventions

This scaffold uses plain tags (no prefix) for work areas. Examples:
- `#research` — Research notes
- `#synthesis` — Combined insights
- `#draft` — In-progress content
- `#[domain]` — Topic tags (security, mcp, architecture)

**Alternatives:**
- ⚙️ emoji prefix
- `work/` namespace
- `status: active` property
- Folder structure defines work areas
