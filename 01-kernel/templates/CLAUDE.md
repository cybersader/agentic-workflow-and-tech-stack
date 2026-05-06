---
title: System Layer (Example)
stratum: 3
---
## Identity

**Purpose:** Meta-organization, templates, scripts, platform configuration

This is ONE EXAMPLE of how you might organize "system" components - the infrastructure that supports your workflow.

---

## Inherits

- SEACOW meta-framework from `/CLAUDE.md`
- Tool-agnostic patterns from `/.claude/ARCHITECTURE.md`

---

## What is a "System" Component?

When using SEACOW to analyze your organization, "System" refers to the infrastructure that makes everything else work:

- Templates for creating new content
- Scripts and automation
- Configuration files
- Documentation about the system itself
- Meta-organization tools

**This might be:**
- `_System/` folder (like this example)
- `.github/workflows/` (in a code repo)
- Obsidian plugin configurations
- `scripts/` directory
- `_Templates/` on a file share
- Or no dedicated folder at all - just scattered config files

---

## Layer Structure (This Example)

```
System/
├── CLAUDE.md           # You are here
├── _index.md           # Navigation summary
├── Templates/          # Reusable templates
│   ├── frontmatter/    # YAML frontmatter examples
│   └── project-template/  # New project scaffold
└── .claude/
    └── skills/
        └── template-usage.md
```

---

## What Belongs in a "System" Area

When analyzing with SEACOW, ask: "Does this support the system itself, or is it content?"

| System (Infrastructure) | Content (Capture/Work/Output) |
|------------------------|-------------------------------|
| Templates | Notes created from templates |
| Scripts | Data processed by scripts |
| Configuration | Actual work being configured |
| Documentation of conventions | Documents following conventions |
| Automation tools | Automated outputs |

---

## Templates in This Example

### Frontmatter Templates
Examples of how you MIGHT tag things based on SEACOW activities:
- `frontmatter/example-input-frontmatter.md` — For capture/input areas
- `frontmatter/example-work-frontmatter.md` — For work/processing areas
- `frontmatter/example-output-frontmatter.md` — For output/delivery areas

**Remember:** These are examples. Your system might not use frontmatter at all, or might use completely different conventions.

### Project Template
`project-template/` — An example scaffold for new projects in a Work area.

---

## Cross-Layer Connections

System provides infrastructure to other activities:
- **Capture:** Templates for clipping, inbox structure
- **Work:** Project scaffolds, workflow tools
- **Output:** Publishing templates, formatting scripts

---

## Alternative "System" Implementations

**Code Repository:**
```
.github/workflows/      (CI/CD automation)
scripts/               (Build, deploy, utility scripts)
.vscode/               (Editor configuration)
docs/contributing.md   (System documentation)
```

**Corporate File Share:**
```
_Templates/            (Document templates)
_Standards/            (Company-wide conventions)
_Scripts/              (Automation tools)
README.txt             (How to use this share)
```

**Personal Vault:**
```
Templates/             (Templater templates)
Scripts/               (Dataview queries)
.obsidian/             (Plugin configuration)
_Meta/                 (Vault documentation)
```

**No Dedicated Folder:**
Some systems don't need a separate "System" area:
- Configuration scattered in dotfiles
- Templates embedded in the tool itself
- Scripts kept elsewhere (global utilities)
- Documentation in the root README

---

## See Also

- [[/CLAUDE]] — Root conventions, SEACOW meta-framework
- [[/Capture/_index]] — Example input layer
- [[/Work/_index]] — Example processing layer
- [[/Output/_index]] — Example delivery layer
