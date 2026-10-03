---
title: "Example: Frontmatter for Input/Capture Areas"
stratum: 3
---
This shows ONE WAY you might tag items in areas where information ENTERS your system (inbox, clippings, raw input).

---

```yaml
---
aliases: []
tags:
  - -capture           # Example: tag for input areas
  - -clip/[source]     # Example: tag for source type (youtube, article, etc.)
publish: false
date created: [date]
date modified: [date]

# Example SEACOW links (showing relationships)
entity: [[--cybersader]]
source: [URL or reference]
related: []

# Example: Tracking input status
status: inbox          # inbox, processing, processed
source_type: [article|youtube|podcast|book|other]
---
```

---

## This is an Example

**You don't have to use this exact structure.** Consider it a starting point showing:
- How you MIGHT distinguish input from other content
- One tagging approach (using `-` prefix)
- Example fields for tracking sources

---

## Adapt to Your Context

**If using Obsidian:**
- Use properties instead of frontmatter
- Leverage Templater for dynamic values
- Add Dataview-queryable fields

**If using VS Code:**
- Use file metadata or comments
- Consider JSON frontmatter
- Or skip frontmatter entirely

**If using a file share:**
- Use folder structure instead (`Drop/`, `Incoming/`)
- Use filename conventions
- Use file properties (created date, author)

**If using Notion:**
- Use database properties
- Status field with options
- Relations to source databases

---

## The Core Questions (SEACOW)

When tagging input/capture areas, ask:
1. **Where does information ENTER my system?**
2. **How do I distinguish raw input from processed work?**
3. **What metadata helps me process this later?**
4. **What's the source of this information?**

Your answers determine YOUR structure, not this template.

---

## Example Tag Conventions

This scaffold uses `#-` prefix for input areas. Examples:
- `#-inbox` — Unprocessed items
- `#-clip/youtube` — YouTube videos
- `#-clip/article` — Web articles
- `#-clip/podcast` — Podcast episodes
- `#-processed` — Ready to move to work area

**Alternatives:**
- 📥 emoji prefix
- `input/` namespace
- `status: inbox` property
- No special tags, just folder placement
