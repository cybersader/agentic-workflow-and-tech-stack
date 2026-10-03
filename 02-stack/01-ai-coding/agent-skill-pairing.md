---
title: Agent + skill pairing — the deterministic firing pattern
description: Claude Code agents can preload skills via the `skills:` frontmatter field, which sidesteps the skill-firing-reliability problem entirely. Documents the pattern, lists ideal pairings for development work, and names the anti-patterns. Tier-2 — general Claude Code design wisdom, ships to the agentic public mirror.
stratum: 2
status: research
sidebar:
  order: 5
tags:
  - stack
  - ai-coding
  - claude-code
  - skills
  - agents
  - reliability
  - design-patterns
date: 2026-05-06
branches: [agentic]
---

## The pattern in one sentence

**Pair an agent with one or more preloaded skills.** The agent's `skills:` frontmatter field deterministically loads the named skills into the agent's context every time the agent fires. The orchestrator's routing decision is the only firing decision — no mid-turn skill-match gamble.

```yaml
---
name: my-agent
description: Use PROACTIVELY when [trigger].
tools: Read, Write, Glob
skills: skill-one, skill-two, skill-three
---
```

## Why this is the most reliable way to land skill content

The companion pattern doc — `.claude/skills/proactive-patterns/SKILL.md` § *"Firing Reliability — Pick the Right Mechanism FIRST"* — ranks firing mechanisms most-to-least reliable: **hook → CLAUDE.md → slash command → subagent → skill.** Skills are the weakest link because the model has to decide mid-turn whether the skill description matches the situation; that judgment frequently misses.

Agent + skill pairing collapses two probabilistic decisions into one:

| Without pairing | With pairing |
|---|---|
| Orchestrator decides whether to route to agent | Orchestrator decides whether to route to agent |
| **Then** model decides whether to load skill (separate, probabilistic) | Skills load automatically with the agent |

The skill content goes from "loaded if Claude judges it relevant" to "loaded every time this agent runs." Same content, deterministic delivery.

## Pairing patterns already in this workspace

The scaffold's existing meta-agents are the canonical demonstration. None of these pairings are accidental — they reflect "this agent always needs this expertise to do its job correctly":

| Agent | Preloaded skills | What the pairing guarantees |
|---|---|---|
| `seacow-scaffolder` | `seacow-conventions, workflow-guide, opencode-permissions` | Any structure-creation work has the meta-framework in context AND knows the scaffold's conventions AND understands permission models |
| `workspace-advisor` | `seacow-conventions, workflow-guide, skill-patterns, agent-patterns, opencode-permissions` | Audit work has all design wisdom available for recommendations |
| `skill-writer` | `skill-patterns, seacow-conventions` | Every new skill follows the documented design rules and the scaffold's organizational conventions |
| `agent-writer` | `agent-patterns, seacow-conventions` | Every new agent follows the documented design rules and the scaffold's organizational conventions |
| `improvement-logger` | `seacow-conventions` | Every captured idea lands in a structurally-sensible place |
| `workflow-expert` | (preloads scaffold knowledge directly) | Authoritative answers about the scaffold itself |

The pattern is consistent: the agent's job depends on background knowledge, so the background knowledge is hard-wired in.

## Ideal pairings for development work

Below are the pairings most worth investing in for a Claude-Code-driven development workflow. Some are already implemented in this scaffold; others are gaps worth filling.

### Pre-design context-gathering (the wikilink-crawl class)

**Problem:** Agent ships a buggy design because it didn't read the spec docs the schema referenced. Common, recurring, expensive.

**Pairing:** `pre-design-crawler` agent + `wikilink-crawl` skill (or a more general `spec-crawler` skill).

**Mechanism:** the agent's job is *gather context before designing*; the skill teaches it *how* to crawl wikilinks, resolve `[[ref]]` syntax, recognize spec-doc patterns. Combined with a CLAUDE.md trigger line ("Before designing system components, invoke pre-design-crawler"), this becomes reliable end-to-end.

**Why pair instead of standalone skill:** the canonical recursive-failure-mode — putting the trigger inside the same probabilistic mechanism that just failed. Pairing puts the trigger in the orchestrator's routing decision (CLAUDE.md prompts agent invocation) and the content in the skill (deterministic load via the agent).

### Code review and quality checks

**Problem:** Reviewers (human or AI) miss test-coverage gaps, anti-patterns, security issues, the codebase's own conventions.

**Pairing:** `code-reviewer` agent + `testing-patterns, seacow-conventions` skills (plus codebase-specific skills if any).

**Mechanism:** the agent does the review pass; the skills provide the criteria the agent applies. Without the skills loaded, the agent reviews from training-data conventions, not the project's actual rules.

### Planning and architecture

**Problem:** The built-in `Plan` agent is generic. Project-specific architectural decisions need project-specific context.

**Pairing:** Custom `architect` agent + `proactive-patterns, agent-patterns, delegation-advisor` skills (and any domain-architecture skills).

**Mechanism:** the agent runs the architectural-analysis workflow; the skills supply the design vocabulary and decision frameworks. The combo means architectural advice references *your* patterns, not generic ones.

### Scaffolding and structure-creation

**Problem:** Creating new directories / projects / vaults without a coherent organizational lens produces mess.

**Pairing:** **(already in this workspace)** `seacow-scaffolder` + `seacow-conventions, workflow-guide, opencode-permissions`.

**Mechanism:** documented above. This is the gold-standard example of the pattern.

### Knowledge curation (temperature-gradient management)

**Problem:** Files accumulate in inboxes, never get distilled, never reach reference status.

**Pairing:** `knowledge-curator` agent + `knowledge-curator` skill.

**Mechanism:** the skill teaches the temperature-gradient model (00-inbox → 01-working → 02-learnings → 03-reference → 04-archive); the agent does the proactive-curation pass. Same name on both is fine — the agent and skill have distinct roles.

### Documentation maintenance

**Problem:** CLAUDE.md and README.md drift after structural changes. Generic doc-update agents miss project-specific conventions.

**Pairing:** `claude-md-updater` (existing) + would benefit from preloading `seacow-conventions, workflow-guide`.

**Mechanism:** updater agent does the scanning + diff-proposal; preloaded skills supply the conventions to compare against.

### Test improvement / triage

**Pairing:** **(already in this workspace partially)** `test-improver` agent + `testing-patterns` skill.

**Mechanism:** agent analyzes failures and proposes fixes; skill provides the test-design vocabulary the analysis uses.

## Anti-patterns

Combinations to avoid:

- **Skill-only solution to a must-fire problem.** If the trigger has to fire reliably, a standalone skill is wrong; pair it with an agent (or use a hook). See the wikilink-crawl recursive-failure-mode in `proactive-patterns`.
- **Agent without preloaded skills that needs domain knowledge.** Agent fires correctly via routing, but then re-derives or hallucinates domain conventions because no skill is loaded. Symptom: "the agent did the right *kind* of work but in the wrong style."
- **Agent overloaded with unrelated skills.** Loading 8 skills into every invocation wastes context and dilutes the agent's focus. Each preloaded skill should answer "is this *always* needed when this agent runs?" — if not, it goes in CLAUDE.md or a separate agent.
- **Pairing two agents instead of agent + skills.** Subagent-spawning subagents is forbidden in Claude Code (`AGENTS.md` § "Subagent Limitation"). Compose via the orchestrator: agent A returns → orchestrator spawns agent B with A's findings.

## When NOT to use a pair

- **One-off task with no recurrence.** Just write a slash command or do it inline; the pair pattern is for repeated patterns of work.
- **Knowledge that's universally needed.** That belongs in CLAUDE.md, not in a skill that only loads with one agent.
- **Behavior that must fire on an event boundary** (session start, post-tool, post-edit). That's a hook, not a pair.

## Decision flow

```
Need to encode some Claude Code behavior?
│
├─ Must fire on an event boundary? → Hook
├─ Always-known rule for every turn? → CLAUDE.md
├─ User explicitly invokes? → Slash command
├─ Defined workflow + isolated context? → Agent (with paired skills if domain knowledge is required)
└─ Optional domain expertise? → Standalone skill (accept it's probabilistic)
```

## Cross-references

- `.claude/skills/proactive-patterns/SKILL.md` — Firing Reliability section (the source ranking).
- `.claude/skills/skill-patterns/SKILL.md` — caveat in Purpose pointing back to reliability.
- `.claude/skills/agent-patterns/SKILL.md` — agent design conventions (the *how* of writing an agent).
- `AGENTS.md` § "Subagent Limitation" — why pairs use skills, not nested agents.
- `agent-context/zz-log/2026-05-06.md` — worklog entry capturing the firing-reliability principle that motivated this doc.
