---
stratum: 3
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion
argument-hint: "[effort-level: minimal|standard|comprehensive]"
branches: [agentic]
---

# Initialize Workspace

Set up the current directory for AI-assisted work using SEACOW thinking.

## Process

### Step 1: Assess Current State

Check if this workspace is already initialized:
- Look for existing CLAUDE.md
- Check for .claude/ directory
- Identify existing structure

If already initialized, ask:
"This workspace has an existing setup. Would you like me to:
1. Enhance the current setup
2. Start fresh (backup existing)
3. Just analyze without changes"

### Step 2: Determine Effort Level

If no argument provided, ask:

"How much scaffolding would you like?

**minimal** - Just CLAUDE.md with purpose and basic conventions
  Good for: Small projects, quick starts, minimal overhead

**standard** - CLAUDE.md + .claude/skills/ ready for domain expertise
  Good for: Medium projects, room to grow

**comprehensive** - Full SEACOW analysis with agents, skills, templates
  Good for: Large projects, team work, long-term investment"

### Step 3: Context Discovery (for standard/comprehensive)

Ask SEACOW questions:

**System:**
- What platform/technology context? (code repo, notes, file share)
- What features available? (tags, links, folders only)

**Entity:**
- Who uses this? (just you, team, public)

**Activities:**
- Where does information ENTER? (inbox pattern)
- Where does WORK happen? (processing)
- Where does OUTPUT go? (delivery)

### Step 4: Create Structure

Based on effort level:

**minimal:**
```
workspace/
└── CLAUDE.md    # Purpose, basic conventions
```

**standard:**
```
workspace/
├── CLAUDE.md    # Purpose, conventions, SEACOW mapping
└── .claude/
    └── skills/  # Ready for domain expertise
```

**comprehensive:**
```
workspace/
├── CLAUDE.md           # Full conventions
├── _index.md           # Navigation
└── .claude/
    ├── skills/         # Domain expertise
    ├── agents/         # Project-specific agents
    └── commands/       # Project-specific commands
```

### Step 5: Generate CLAUDE.md Content

Include:
- Project identity and purpose
- SEACOW mapping (what was discovered)
- Conventions appropriate to the context
- References to global agents/skills

### Step 6: Report

Show what was created:
```
## Workspace Initialized

**Effort Level:** [chosen level]
**Files Created:**
- CLAUDE.md (purpose, conventions)
- .claude/skills/ (ready for domain expertise)

**SEACOW Mapping:**
- Capture: [where info enters]
- Work: [where processing happens]
- Output: [where finished work goes]

**Next Steps:**
1. Add domain skills with `skill-writer` agent
2. Create project agents as workflows emerge
3. Use `/improve` to evolve the structure
```

## Examples

### Example: Code Repository

```
User: /init-workspace standard

AI: Let me understand your context...
    What kind of code project is this?

User: Python API project

AI: Created:
    - CLAUDE.md with Python API conventions
    - .claude/skills/ for domain expertise

    I mapped your workflow as:
    - Capture: issues/, requirements/
    - Work: src/, tests/
    - Output: docs/api/, releases
```

### Example: Notes Vault

```
User: /init-workspace comprehensive

AI: Let me analyze with SEACOW...
    [Asks context questions]

AI: Created full structure:
    - CLAUDE.md with vault conventions
    - _index.md for navigation
    - .claude/skills/ for domain expertise
    - .claude/agents/ for vault-specific agents

    Your SEACOW mapping:
    - Capture: Inbox/, Clippings/
    - Work: Notes/, Projects/
    - Output: Published/
```

## Important Notes

- Always ask before overwriting existing files
- Preserve existing content when enhancing
- Create backups if replacing structure
- Adapt conventions to the actual context discovered
- Don't force SEACOW folder names - use what fits
