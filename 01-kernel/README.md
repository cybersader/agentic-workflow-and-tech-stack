---
title: Kernel
description: The universal scaffold layer. Philosophy, patterns, parametric templates, and deterministic scripts. What any project gets when installed.
stratum: 1
status: stable
sidebar:
  order: 0
tags:
  - kernel
  - tier-1
---

This is tier 1 of the three-tier scaffold. Everything here is designed to port to any project, any tool, any year. Fork this directory (eventually: fork the standalone `agentic-kernel` repo) and install into a new workspace.

## Contents

| Path | Stratum | Purpose |
|---|---|---|
| [`PHILOSOPHY.md`](./PHILOSOPHY.md) | 1 | Invariants of structured cognitive work. Claims about the world. |
| [`principles/`](./principles/index.md) | 1 | Ten referenced principle pages expanding on PHILOSOPHY.md |
| [`patterns/`](./patterns/) | 2 | Named patterns — SEACOW lens, meta-agent pattern, hook pattern, Johnny Decimal |
| [`templates/`](./templates/) | 3 | Parametric templates — `AGENTS.md.tmpl`, skeleton directory, skill/agent templates |
| [`scripts/`](./scripts/) | 4 | Deterministic scripts — install.sh, hooks, sync-content |
| [`skills/`](./skills/) | 2 | Meta-skills for agentic work — patterns for designing skills, agents, delegation, testing, Obsidian formats |
| [`agents/`](./agents/) | 2 | Meta-agents — scaffolder, skill-writer, agent-writer, workflow-improver, etc. (agentic branch only) |
| [`commands/`](./commands/) | 3 | Slash commands — `/task-plan`, `/improve`, `/validate`, `/test`, etc. |
| [`tutorials/`](./tutorials/) | 2 | Generic learning path — first workflow, passive expertise, active executors |
| `ARCHITECTURE.md` | 1 | Composability patterns and tool comparison |

## The Minimum Viable Kernel

Per the Ultraplan research, the truly portable scaffold reduces to **seven artifacts**:

1. `PHILOSOPHY.md` — invariants
2. `templates/AGENTS.md.tmpl` + `templates/skeleton/` — parametric
3. `scripts/hooks/{check-complete,read-plan,check-knowledge}.sh` — three generalized hooks
4. `templates/skill.md.tmpl` + `templates/agent.md.tmpl` — frontmatter schema
5. `agents/seacow-scaffolder.md` — executable interview
6. One example vault (lives at `03-work/` in this repo as a case study)
7. `scripts/install.sh` — stratum-3 instantiation

Everything else is either downstream or nice-to-have. See [`PHILOSOPHY.md`](./PHILOSOPHY.md) for the rationale.

## Stratum map

The kernel holds strata 1–4 per the [five-strata framework](./principles/07-five-strata.md):

- **Stratum 1** (philosophy, always true): `PHILOSOPHY.md`, `principles/`, `ARCHITECTURE.md`
- **Stratum 2** (pattern, same shape): `patterns/`, `skills/`, `agents/`, `tutorials/`
- **Stratum 3** (parametric): `templates/`
- **Stratum 4** (deterministic): `scripts/`

Stratum 5 (instance content) lives outside the kernel entirely, in `03-work/` of this specific repo and in any fork's equivalent location.

## Using the kernel in a new project

Eventually (after the kernel is extracted to its own repo):

```bash
# Option 1: Submodule
git submodule add https://github.com/cybersader/agentic-kernel .kernel

# Option 2: Copy
git clone https://github.com/cybersader/agentic-kernel
cd your-project && ../agentic-kernel/scripts/install.sh

# Option 3: Remote install script
curl -fsSL https://raw.githubusercontent.com/cybersader/agentic-kernel/main/scripts/install.sh | bash
```

Each installs the skeleton, copies hooks + templates, offers to run `seacow-scaffolder` for an interactive setup.

## See also

- [`PHILOSOPHY.md`](./PHILOSOPHY.md) — the invariants this kernel expresses
- [`../02-stack/`](../02-stack/) — opinionated toolkit on top of the kernel
- [`../03-work/`](#private-reference) — the example instance (this user's personal workflow)
- [`../00-meta/`](../00-meta/) — kernel-development tooling (not part of the kernel itself)
