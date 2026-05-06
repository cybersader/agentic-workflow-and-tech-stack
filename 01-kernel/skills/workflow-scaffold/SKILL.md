---
name: workflow-scaffold
description: Concierge for navigating, using, and maintaining this workflow scaffold. Use when users ask about scaffold structure, where things go, conventions, how to get started, how to do scaffold-level work, or when scaffold actions may need delegation to agents. Answers directly when possible; ASKS before spawning agents.
stratum: 2
branches: [agentic]
---

# Workflow Scaffold (navigation + concierge)

## Purpose

Expertise in understanding, navigating, and maintaining this workflow scaffold. This skill combines two closely-related concerns that previously lived in separate skills:

- **Navigation** — where things live, what each part does, how pieces connect
- **Concierge / delegation** — recognizing when a task needs an agent and asking before spawning one

Load this skill when users ask about the scaffold itself (its structure, conventions, patterns) OR when they're about to do work that may benefit from agent delegation.

**I am a skill (lightweight, loaded into context).** When I recognize work that needs an agent (heavyweight, fresh context), I **ASK before delegating** rather than auto-invoking.

---

## Ask-First Pattern (how I work)

When I detect a task that could benefit from an agent:

1. **RECOGNIZE** the task type
2. **ASK** via `AskUserQuestion`: "Would you like me to spawn `[agent]`?"
3. **RESPECT** the user's choice — direct handling is always valid
4. **DELEGATE** only with approval, passing relevant context

This prevents context waste from unnecessary agent spawns while keeping the option available.

---

## What This Scaffold Is

A **scaffolding + progressive agent memory system** organized in three tiers:

| Zone | Tier | Purpose |
|---|---|---|
| `01-kernel/` | Universal | Philosophy, patterns, meta-agents, templates, scripts — forkable by anyone |
| `02-stack/` | Opinionated | Tool installs, configs, helpers — forkable for similar setups |
| `03-work/` | Personal | Project patterns, agent memory, rebuild guide — mostly personal |
| `00-meta/` | Tooling | Kernel-dev scripts, audits, test-workspace |

Deep dive on the structure and philosophy: `01-kernel/PHILOSOPHY.md` + `01-kernel/principles/`.

---

## Navigation Map

### Tier 1 — `01-kernel/` (universal)

| Path | Purpose |
|---|---|
| `PHILOSOPHY.md` | Invariant claims about knowledge work |
| `principles/` | Named philosophical principles (stratum 1) |
| `patterns/` | Named patterns — SEACOW lens, meta-agent pattern, hook pattern, etc. (stratum 2) |
| `templates/` | Parametric templates — AGENTS.md.tmpl, skeleton directory, skill/agent tmpls (stratum 3) |
| `scripts/` | Deterministic scripts — `install.sh`, hooks, seacow-scaffolder (stratum 4) |
| `skills/` | Meta-skills for agentic work (this file included) |
| `agents/` | Meta-agents — scaffolder, writers, improvers |
| `commands/` | Slash commands — `/task-plan`, `/improve`, `/validate`, etc. |

### Tier 2 — `02-stack/` (opinionated toolkit)

| Path | Purpose |
|---|---|
| `01-ai-coding/` | Claude Code + OpenCode install & config |
| `02-terminal/` | Zellij, WezTerm, Alacritty setup |
| `03-cross-device/` | Tailscale SSH, Termux |
| `04-knowledge-mgmt/` | Obsidian + CLI |
| `05-homelab/` | General homelab patterns |
| `06-dev-infra/` | Docker, Git, utilities |
| `07-editor-ext/` | VS Code extensions |
| `profiles/` | Bashrc helpers + keybindings (stack-specific) |
| `patterns/` | Stack-level patterns (cross-device, parallel-agents-worktrees, obsidian-workflow) |
| `install/` | Install scripts for the stack |
| `decisions/` | Decision matrices (Claude Code vs OpenCode, etc.) |

### Tier 3 — `03-work/` (personal workflow)

| Path | Purpose |
|---|---|
| `project-types/` | How the user builds each type (Astro+Starlight docs, etc.) |
| `memory/` | Agent-consumable preferences, tool picks, project references |
| `rebuild/` | The user's specific rebuild-my-machine walkthrough |
| `homelab/` | User's specific home lab (TrueNAS, MCP endpoints, Tailscale) |
| `references/` | Links to external projects as living examples |

### Root Level

| File | Purpose |
|---|---|
| `README.md` | Vision-first quick start |
| `CLAUDE.md` | Conventions for THIS repo |
| `AGENTS.md` | Portable agent definitions (stratum 5 — describes THIS repo) |
| `ROADMAP.md` | This repo's roadmap |

---

## Delegation Triggers (ASK before spawning)

| User is asking / trying to... | Recommend spawning... |
|---|---|
| "How does X work in this scaffold?" deep investigation | `workflow-expert` agent |
| "Where should I put Y?" requires file-level analysis | `workflow-expert` agent |
| "What's the convention for Z?" | answer directly if simple; else `workflow-expert` |
| "Set up a new project/vault/structure at [path]" | `seacow-scaffolder` agent |
| "Create a skill for [domain]" | `skill-writer` agent |
| "Create an agent that [does X]" | `agent-writer` agent |
| "Check/update CLAUDE.md after my changes" | `claude-md-updater` agent |
| "Audit my existing project's structure" | `workspace-advisor` agent |
| Any "How does X work in [large codebase]?" | built-in `Explore` (Task tool) |
| Pre-implementation design for multi-file changes | built-in `Plan` (Task tool) |
| Complex task the user expects will need multiple steps | `general-purpose` (Task tool) |

When recommending, use `AskUserQuestion` with wording like:

> "This looks like it needs a `[agent]` agent — it'll give us [benefit]. Want me to spawn one?"

---

## Common Questions (answer directly)

### "Where do I start?"
`README.md` for the quick overview, then `01-kernel/PHILOSOPHY.md` for the why.

### "How do I create a new project?"
`seacow-scaffolder` agent (ask first). Or the deterministic `scripts/setup.sh` if the template is obvious.

### "How do I add domain expertise?"
`skill-writer` agent (ask first).

### "What's the difference between skills and agents?"
- **Skill** = passive expertise (loaded into same context, no tool use)
- **Agent** = active executor (fresh context window, can use tools, returns summary)

Deep dive: `01-kernel/principles/03-skills-vs-agents.md`.

### "What is SEACOW?"
An analytical lens (not a folder structure): S-ystem, E-ntity, A-ctivities (Capture/Output/Work), r-elation. It's a set of questions for thinking about organization. Load `seacow-conventions` skill for the full framework.

### "Can I use this with tools other than Claude Code?"
Yes — `AGENTS.md` is portable to 20+ AI tools. Key constraint differences:
- **Claude Code**: agents cannot spawn other agents (sequential composition only)
- **OpenCode**: agents CAN spawn child agents (recursive composition)

Deep dive: `02-stack/decisions/tool-comparison.md` or `01-kernel/ARCHITECTURE.md`.

### "What's the `stratum:` field in frontmatter?"
A classification (1–5) indicating how portable a file is:
- **1 philosophy** — always true; anyone can adopt
- **2 pattern** — same shape, different content; named patterns
- **3 parametric** — fill-in-the-blank templates
- **4 deterministic** — drop-in scripts, fixed content
- **5 instance** — specific to this user; not a template

Deep dive: `01-kernel/principles/07-five-strata.md`.

---

## Workflow Patterns

### Pattern 1: Start a new project from the scaffold
1. Decide: deterministic (use `scripts/setup.sh`) or interview (use `seacow-scaffolder` agent).
2. If interview → ask first, then spawn agent.
3. Scaffolder creates structure based on user's context.

### Pattern 2: Add domain expertise
1. Identify the domain/task type.
2. Ask: "Want me to spawn `skill-writer` for [domain]?"
3. If yes → agent creates skill in correct format.
4. Verify the description covers the right activation contexts.

### Pattern 3: Create a new specialist agent
1. Identify the repeatable work.
2. Ask: "Want me to spawn `agent-writer` for this?"
3. If yes → agent creates file with appropriate tools and skills.

### Pattern 4: Understand your organization
1. Load `seacow-conventions` skill.
2. Ask SEACOW questions about the situation.
3. Design YOUR structure based on YOUR answers — don't copy, think.

### Pattern 5: Scaffold maintenance after changes
1. User adds/modifies a skill/agent.
2. Remind: "Remember to update `CLAUDE.md` / `AGENTS.md`."
3. Offer: "Want me to spawn `claude-md-updater` or `workflow-expert` to check docs?"

---

## Maintenance Reminders

**After user adds an agent:**
- "Remember to add it to `AGENTS.md` and `CLAUDE.md`'s Available Agents section."
- Or: "Want me to spawn `workflow-expert` to update docs?"

**After user adds a skill:**
- "Skills should be at `01-kernel/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`, `stratum`). Remember to update CLAUDE.md's skills list."

**After structural changes:**
- "Want me to spawn `claude-md-updater` to check if docs need updating?"

**After a research insight worth keeping:**
- "Is this methodology (fits in a tier) or knowledge work (exits to external vault)? If methodology, which tier — kernel (universal), stack (your toolkit), or work (your specific patterns)?"

---

## File Conventions

### Frontmatter
Every markdown file in a tier should have:
```yaml
---
title: <page title>
description: <one-line purpose>
stratum: <1-5>
status: <research | planning | stable | parked>
tags: []
date: YYYY-MM-DD
---
```

### Wikilinks
Obsidian-style `[[path/to/file]]` works via remark-wiki-link. Prefer wikilinks for cross-references; regular markdown links for external URLs.

### `_index.md` / section README
Each section directory can have an `index.md` for sidebar navigation and orientation.

### Names
- Skills: `01-kernel/skills/<name>/SKILL.md`
- Agents: `01-kernel/agents/<name>.md`
- Commands: `01-kernel/commands/<name>.md`
- Principles: `01-kernel/principles/NN-<name>.md` (numeric prefix for sidebar order)
- Tier zone folders: `NN-<name>/` (dash separator, matches `00-inbox/` existing convention)

---

## Effective Agent Usage

### When to offload to an agent

```
┌─────────────────────────────────────────────────────────────────┐
│  SHOULD I OFFLOAD THIS TO A SUBAGENT?                            │
├─────────────────────────────────────────────────────────────────┤
│  Will this require reading more than 3-5 files?                  │
│  ├── YES → Spawn subagent (Explore/Plan/specialist)              │
│  └── NO  → Do it directly                                        │
│                                                                  │
│  Am I asking "how does X work in this codebase?"                 │
│  ├── YES → Spawn Explore agent                                   │
│  └── NO  → Continue                                              │
│                                                                  │
│  Is this a multi-step implementation with architectural choice?  │
│  ├── YES → Spawn Plan agent first, review, then implement        │
│  └── NO  → Do it directly                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Context budget awareness

Agents spawn with fresh context. When the main context is approaching ~40% used on exploration, offloading to an agent prevents further bloat. The agent returns a compressed summary; main context stays clean for synthesis.

### The distillation pipeline

```
Main → Agent A (explores /docs/)       → returns summary
     → Agent B (explores /src/)        → returns summary
     → Main synthesizes with clean context
```

Each level distills. Parents receive only summaries.

Deep dive on delegation decisions: `delegation-advisor` skill (also works with ask-first pattern).

---

## Troubleshooting

### "Agent X can't be found"
- Check path: `01-kernel/agents/<name>.md` (or the `.claude/agents/` symlink)
- Verify YAML frontmatter present
- Ensure `description` field exists (Claude uses this for auto-invocation)

### "Skill not loading when I expect it"
- Skills need subdirectory structure: `01-kernel/skills/<name>/SKILL.md`
- SKILL.md must have YAML frontmatter (`name`, `description`, `stratum`)
- Claude uses `description` for semantic matching (NOT keyword matching)
- Review skill's description — does it cover the contexts you're activating in?

### "Structure feels wrong for my context"
- Examples are not prescriptions
- Use SEACOW thinking to design YOUR structure
- The tier structure (kernel/stack/work) is THIS repo's decomposition — your project may need a different decomposition

### "Too much to read"
Start with:
1. `README.md` (5 min)
2. `01-kernel/PHILOSOPHY.md` (10 min)
3. Try `seacow-scaffolder` on a small project

Learn by doing, not reading everything first.

---

## Key Distinction

| Component | Role |
|---|---|
| **workflow-scaffold** (this skill) | Concierge — answers directly or ASKS to delegate |
| **workflow-expert** (agent) | Specialist — deep investigation of scaffold content |
| **seacow-scaffolder** (agent) | Builder — creates NEW structures elsewhere |
| **delegation-advisor** (skill) | Focused companion — when the delegation decision itself is the question |

This skill is the lightweight trigger. The agents do the heavy lifting.

---

## See Also

- `01-kernel/PHILOSOPHY.md` — invariants of the system
- `01-kernel/principles/` — 10 principle pages (philosophy)
- `01-kernel/patterns/` — named patterns (SEACOW lens, meta-agent pattern, etc.)
- `01-kernel/ARCHITECTURE.md` — tool composability details
- `seacow-conventions` skill — SEACOW framework deep dive
- `skill-patterns` / `agent-patterns` skills — designing new components
- `delegation-advisor` skill — when delegation is the right call

---

## History

Merged from `workflow-guide` + `workflow-meta` during Phase 1 restructure (2026-04-17). The two previous skills had near-identical purposes (navigation + meta-question handling + ask-first delegation); combining into one resolved the redundancy.
