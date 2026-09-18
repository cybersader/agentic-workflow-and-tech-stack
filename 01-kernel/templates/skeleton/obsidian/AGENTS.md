---
title: Obsidian Vault
stratum: 3
---
## Identity

A personal knowledge management vault using Obsidian.

## Agent Instructions

When working in this vault:
1. Use wikilinks for internal references: [[Note Name]]
2. Add frontmatter to new notes
3. Respect the folder structure
4. Use templates from Templates/ folder
5. Tag appropriately using nested tags

## Structure

```
vault/
├── Inbox/          # Unprocessed captures
├── Notes/          # Processed thoughts
├── Projects/       # Active projects
├── Templates/      # Note templates
└── AGENTS.md       # You are here
```

## Conventions

### Wikilinks

```markdown
[[Note Name]]           # Link to note
[[Note Name|Display]]   # Custom display text
[[Note Name#Heading]]   # Link to heading
```

### Tags

```
#topic/subtopic         # Nested tags
#status/active          # Workflow status
#type/note              # Content type
```

### Frontmatter

```yaml
---
created: YYYY-MM-DD
tags:
  - topic/subtopic
aliases: []
---
```

## SEACOW Mapping

| Activity | Folder |
|----------|--------|
| Capture | Inbox/ |
| Work | Notes/, Projects/ |
| Output | (Publish if enabled) |
| System | Templates/ |
