---
title: "Example: Frontmatter for Output/Delivery Areas"
stratum: 3
---
This shows ONE WAY you might tag items in areas where FINISHED information goes to consumers (published, shared, delivered).

---

```yaml
---
aliases: []
tags:
  - _output            # Example: tag for output areas
  - _[audience]        # Example: tag for target audience
  - _[format]          # Example: tag for content format
publish: true          # Usually true for output
date created: [date]
date modified: [date]

# Example SEACOW links (showing relationships)
entity: [[--[target-audience]]]
source: [[Work/path/to/source]]        # Where this came from (work area)
system: [[/System/Templates/[template]]]

# Example: Tracking output status
status: published      # draft, review, published
audience: [public|team|self]
format: [blog|presentation|doc|video]
---
```

---

## This is an Example

**You don't have to use this exact structure.** Consider it a starting point showing:
- How you MIGHT distinguish finished output from work-in-progress
- One tagging approach (using `_` prefix)
- Example fields for tracking audience and format

---

## Adapt to Your Context

**If using Obsidian:**
- Use properties for publish status
- Use templates for different output formats
- Link back to source work items

**If using VS Code:**
- Use file metadata
- Track publication status in comments
- Or use a publishing plugin

**If using a file share:**
- Use folder structure (`Published/`, `Shared/`, `Deliverables/`)
- Use filename conventions (include date, version)
- Use file permissions (read-only for delivered items)

**If using Notion:**
- Use status property with published/draft states
- Use relations to link to audiences
- Use formulas for automation (publish date, etc.)

---

## The Core Questions (SEACOW)

When tagging output/delivery areas, ask:
1. **Where do finished artifacts go?**
2. **Who is the audience for this?**
3. **How do I distinguish drafts from published work?**
4. **How do I track what's been shared/delivered?**
5. **What format/medium is this in?**

Your answers determine YOUR structure, not this template.

---

## Example Tag Conventions

This scaffold uses `#_` prefix for output areas. Examples:
- `#_public` — Public-facing content
- `#_team` — Team/internal content
- `#_blog` — Blog posts
- `#_presentation` — Slides/decks
- `#_docs` — Documentation

**For audiences, uses `#--` prefix:**
- `#--public` — General public
- `#--recruiters` — Job seekers
- `#--team/engineering` — Specific team
- `#--clients` — Client-facing

**Alternatives:**
- 📤 emoji prefix
- `output/` or `published/` namespace
- `status: published` property
- Folder structure defines output areas (Blog/, Reports/)
