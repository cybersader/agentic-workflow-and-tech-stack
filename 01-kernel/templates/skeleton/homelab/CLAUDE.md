---
skills: seacow-conventions, workflow-guide
title: {{PROJECT_NAME}}
stratum: 3
---

## Purpose

Documentation-first infrastructure. Run your homelab from markdown files with ready-to-paste configs.

## Key Files

| File | Purpose |
|------|---------|
| `.claude/ENVIRONMENT.md` | Current complete setup (read this first) |
| `ARCHITECTURE.md` | Design patterns and decisions |
| `ROADMAP.md` | Future plans and priorities |
| `configs/ready-to-paste/` | Tested, working configs |

## Workflow

```
1. Agent reads ENVIRONMENT.md → knows your exact setup
2. Agent consults ARCHITECTURE.md → understands patterns
3. Agent creates/updates configs → ready-to-paste/
4. You copy config to actual service → test
5. Update docs with findings
```

## SEACOW Mapping

| Activity | Implementation |
|----------|----------------|
| Capture | Troubleshooting notes, new ideas |
| Work | Config development, testing |
| Output | ready-to-paste/, documentation |
| System | .claude/, environment details |
