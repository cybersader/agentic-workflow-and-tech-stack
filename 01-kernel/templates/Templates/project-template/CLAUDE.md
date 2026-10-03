---
title: [Project Name]
stratum: 3
---
## Identity

**Purpose:** [Brief description of the project purpose and scope]

This is an EXAMPLE scaffold for a project. Adapt it to your needs.

---

## Inherits

- SEACOW meta-framework from `/CLAUDE.md`
- Conventions from parent workspace (if any)

---

## Project Structure (Example)

```
[project-name]/
├── CLAUDE.md           # You are here
├── _index.md           # Navigation summary
└── .claude/
    ├── skills/         # Project-specific expertise
    └── agents/         # Project-specific agents
```

**Adapt this to your context:**
- Code repo? Add `src/`, `tests/`, `docs/`
- Research project? Add `data/`, `analysis/`, `papers/`
- Personal project? Add whatever structure makes sense

---

## Key Concepts

Use this section to define project-specific concepts and terminology:

| Concept | Keywords | Description |
|---------|----------|-------------|
| [Concept 1] | keyword1, keyword2 | [Brief description] |
| [Concept 2] | keyword3, keyword4 | [Brief description] |

---

## Connections (SEACOW Thinking)

When using SEACOW to analyze this project, consider:

**Where did this project's information come from?**
- Source materials, references, requirements

**Where is active work happening?**
- This project itself, subprojects, tasks

**Where do finished artifacts go?**
- Deliverables, publications, outputs

**Example links:**
| Type | Connection |
|------|------------|
| Sources | Links to input/reference materials |
| Outputs | Links to where finished work goes |
| Related Projects | Links to other related work |

---

## Tool Compatibility

### Claude Code
Agents in `.claude/agents/` CANNOT spawn other agents. Return subtask lists.

### OpenCode
Agents CAN spawn child sessions for recursive work.

See `/CLAUDE.md` and `/.claude/ARCHITECTURE.md` for details.

---

## Using This Template

1. **Replace [Project Name]** with your actual project name
2. **Update Identity section** with real purpose/scope
3. **Adapt the structure** to your needs (don't blindly copy)
4. **Define key concepts** specific to this project
5. **Map connections** using SEACOW lens (where does info come from/go to?)
6. **Add project-specific skills/agents** as needed

Remember: This is a starting point, not a prescription. Your project might need a completely different structure.
