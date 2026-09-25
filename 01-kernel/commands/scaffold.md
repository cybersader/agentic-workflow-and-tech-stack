---
allowed-tools: Task
argument-hint: "[pattern-hint]"
title: Scaffold
stratum: 3
branches: [agentic]
---

Invoke the seacow-scaffolder agent to set up this directory with conversational guidance.

## Usage

```
/scaffold                 # Start fresh, agent asks questions
/scaffold research-kb     # Hint: research knowledge base pattern
/scaffold homelab         # Hint: infrastructure documentation
/scaffold obsidian        # Hint: Obsidian vault structure
/scaffold minimal         # Hint: minimal setup
```

## Process

### If no argument provided:

Spawn the seacow-scaffolder agent:
```
"Use seacow-scaffolder to help me set up this directory for AI-assisted work"
```

### If pattern hint provided:

Spawn the seacow-scaffolder agent with context:
```
"Use seacow-scaffolder to help set up this directory.
I'm interested in a [ARGUMENT] style structure.
Reference templates/[ARGUMENT]/ for pattern inspiration."
```

## What Happens Next

The seacow-scaffolder agent will:

1. **Ask SEACOW questions** about your specific context:
   - What platform/technology?
   - Who uses this?
   - Where does info enter/exit?

2. **Reference template patterns** for inspiration (not blind copy)

3. **Propose a custom structure** with rationale

4. **Create files with skill references** for progressive disclosure:
   - AGENTS.md (universal - works with 20+ tools)
   - CLAUDE.md with `skills:` frontmatter
   - Directory structure tailored to YOUR answers

## Available Patterns

| Pattern | Best For |
|---------|----------|
| `minimal` | Quick start, any project type |
| `research-kb` | Research projects, competitive analysis |
| `homelab` | Infrastructure, self-hosted services |
| `obsidian` | Obsidian vaults, PKM |

## Non-Locking

Everything created is:
- Plain markdown files
- Deletable without breaking anything
- Renamable freely
- Starting point, not rigid structure
