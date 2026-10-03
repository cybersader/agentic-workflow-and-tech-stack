---
title: Homelab Infrastructure
stratum: 3
---
## Identity

Documentation-first infrastructure management with ready-to-paste configs.

## Agent Instructions

When helping with infrastructure:
1. Read .claude/ENVIRONMENT.md first for current setup
2. Check ARCHITECTURE.md for existing patterns
3. Create configs in configs/ready-to-paste/
4. Add comments explaining purpose
5. Update troubleshooting/ if issues arise

## Structure

```
homelab/
├── .claude/
│   └── ENVIRONMENT.md     # Complete current setup
├── ARCHITECTURE.md        # Design patterns
├── ROADMAP.md             # Future ideas
├── configs/
│   └── ready-to-paste/    # Tested, working configs
└── troubleshooting/       # Issue guides by topic
```

## Conventions

- Only add TESTED configs to ready-to-paste/
- Include comments in config files
- Update ENVIRONMENT.md when setup changes
- Track troubleshooting for future reference

## Config File Standard

```yaml
# Purpose: [what this config does]
# Service: [which service uses it]
# Tested: [date tested]
# Dependencies: [what must exist first]

[actual config here]
```
