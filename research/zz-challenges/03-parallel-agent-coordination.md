---
title: "03 · Parallel Agent Coordination — worktrees, orchestration, human-in-the-loop"
description: Git worktrees + an orchestrator-workers pattern + filesystem-based messaging are the three local primitives for running multiple AI coding agents in parallel. They compose cleanly on paper. Under load — shared services, file-edit races, orchestrator context exhaustion, humans trying to track what three workers are doing — the failure modes aren't yet characterized. This challenge is the research brief for getting to the patterns + preferences + skill amendments that make parallel agentic work reliable enough to default to.
date created: 2026-04-25
tags:
  - /meta
  - research
  - challenges
  - parallelization
  - worktrees
  - orchestration
  - multi-agent
  - coordination
status: research
priority: medium
source: graduated from 2026-04-18 zz-research stamp "Parallel Agentic Work"
---

# 03 · Parallel Agent Coordination

:::note[First findings shipped 2026-04-25]
First fan-out research pass is complete — see [Research findings (2026-04-25)](#research-findings-2026-04-25) at the bottom for highlights, and [`2026-04-25-parallel-agent-coordination-findings.md`](../../agent-context/zz-research/2026-04-25-parallel-agent-coordination-findings.md) for the consolidated synthesis. The challenge stays open while the four remaining empirical experiments run and the tier-2 patterns get drafted.
:::

## The Assignment

Running a single AI coding agent is a solved workflow. Running **three agents in parallel** — each on its own git worktree, each on its own branch, an orchestrator watching them, possibly a human watching the orchestrator — exposes a class of coordination problems that aren't yet characterized well enough to build a default-on pattern around.

The primitives are clear:

- **Git worktrees** as the filesystem-isolation surface (one agent per worktree; no write collisions)
- **Orchestrator-workers pattern** (root session spawns workers, consumes summaries, integrates results)
- **Filesystem-based inter-agent messaging** (inboxes/outboxes under `.claude/`) for structured hand-offs

What's *not* clear:

1. How coordination breaks at the edges (shared service contention, merge-path entanglement, orchestrator context exhaustion, cost-vs-speed dynamics)
2. What Claude Code's Task tool actually does concurrently (vs. concurrent-looking status)
3. How the human stays informed across N workers without losing context on any single one
4. How the primitives cohere into a **default-on recipe** that's worth reaching for without thinking

Your job: **produce the patterns, preferences, and skill amendments that make parallel agentic work the obvious move when it applies**, and document the failure modes well enough to know when it doesn't.

## Why This Matters

The sequential-agent model (one agent at a time, wait for it to finish) is expensive in wall-clock time and conservative by design. Once parallelism is reliable:

- **A/B implementations become cheap** — two workers explore two approaches; orchestrator picks the winner
- **Exploration separates from implementation** — a worker does the read-heavy "how does this work" pass while another is coding against the answer
- **Speculative refactors stop blocking linear work** — one worktree holds the experimental refactor, another keeps shipping on main, merge-or-discard when ready

Without a characterized failure-mode catalog, parallelism remains "sometimes I do this for big features," not a default-on toolkit.

## What to Investigate

1. **Shared-service contention under parallel load.** Two agents hitting the same local database, the same external API (with rate limits), the same MCP server. What's the minimum coordination primitive that keeps this safe — a lock file in the repo? A queue? A mutex-style convention in an inbox? When is "just accept the collision and let the agent retry" cheaper?

2. **Branch-history entanglement.** Two worktree-agents that unintentionally touch the same file. Merge strategies: rebase-first? Always-merge? Claim-lock via a sentinel file in the repo (`.locks/<file>.lock`)? What's the cheapest convention that actually prevents stepping-on-each-other without forcing every agent to know about every other agent?

3. **Orchestrator context exhaustion.** A long-lived orchestrator session consumes tokens summarizing worker output across many integration steps. At what point does the orchestrator itself need a `/compact`, a spawn-child-orchestrator pattern, or an explicit hand-off to a fresh session? How does this interact with prompt caching?

4. **Cost-vs-speed dynamics.** Parallel N agents = roughly N× API spend. When does wall-clock savings actually justify it? Does the answer change for exploration (Task-tool parallelism) vs. implementation (worktree parallelism)? Is there a rule-of-thumb like "only parallelize if the sub-tasks are >30 min wall-clock each"?

5. **Claude Code Task-tool internals.** Claude Code can spawn multiple Task agents in a single turn. Are they *actually* concurrent in-process, or is the "running concurrently" status cosmetic? What happens if two Task agents both try to `Edit` the same file — silent last-write-wins, explicit lock, error? How does `/fast` mode change the calculus (cost, throughput, concurrency)?

6. **Background-agents pattern (cross-tool).** OpenCode historically shipped a `/bg` command for background agents. Whether or not OpenCode is in the tool stack, the *pattern* is worth characterizing: how do background agents persist state, return results, and coordinate with the parent session? Is it a Task-tool analog or a worktree-session analog, and when is each right?

7. **Human-in-the-loop coordination UX.** With three worker sessions running, the human's attention is the bottleneck. Does the answer look like a dashboard? A `tail -f` on an outbox? A multiplexer that shows all panes at once? A notification when a worker completes? How does this interact with phone/remote access (see cross-device SSH pattern)?

8. **Multiplexer integration.** Workspace launchers (portagenty) already know how to spin up multiple sessions; multiplexers (zellij, tmux) already know how to host them visibly. Is there a first-class "launch an orchestrator + N worker sessions, each in its own worktree" flow worth building? If yes, does it live in the launcher, the multiplexer layout, or a new orchestration helper?

## Context to Read First

- [2026-04-18 zz-research — Parallel Agentic Work](../../agent-context/zz-research/2026-04-18-parallel-agentic-work.md) — stamps the known primitives, open questions, and target artifacts this challenge inherits
- [examples/git-worktrees/README.md](../../examples/git-worktrees/README.md) — the initial draft of the pattern
- [inter-agent-messaging skill](../../.claude/skills/inter-agent-messaging/SKILL.md) — filesystem primitives for structured hand-offs
- [2025-12-31 learning — inter-agent messaging](../../research/learnings/2025-12-31-inter-agent-messaging.md) — deeper context on why filesystem-primitive messaging is load-bearing for parallel
- [delegation-advisor skill](../../.claude/skills/delegation-advisor/SKILL.md) — covers "when to delegate at all," directly relevant to "when does parallelism help"
- [`02-stack/02-terminal/index.md`](../../02-stack/02-terminal/index.md) — multiplexers give parallel sessions a *viewing* surface; worktrees give them a *filesystem* surface

## What Success Looks Like

A coherent bundle of artifacts that together make parallel agentic work a default-on tool:

1. **`02-stack/patterns/parallel-agents-worktrees.md`** — canonical stack-tier how-to. Walkthrough of spinning up N worktrees, wiring them to separate agent sessions, and integrating results. Extracts from `examples/git-worktrees/` and incorporates whatever the deeper investigation yields.

2. **`01-kernel/patterns/orchestrator-workers.md`** — kernel-tier abstract pattern. When to use, when to avoid. Tool-agnostic enough to apply beyond this specific stack.

3. **Failure-mode catalog** — documented as a section in the stack pattern or a sibling doc. Each known failure has: trigger, detection, cheapest mitigation.

4. **Amendments to [`inter-agent-messaging`](../../.claude/skills/inter-agent-messaging/SKILL.md)** — what changes about the messaging pattern when agents are running *concurrently* vs. *sequentially*. Message ordering, idempotency, how to claim a task safely.

5. **Preferences doc** — `03-work/memory/parallelism-preferences.md`. The opinionated defaults: how many parallel worktrees is typical, branch-naming, Task-tool vs. worktree decision rule, when `/fast` helps.

6. **Cost heuristic** — a simple rule for "should I parallelize?" grounded in measured numbers where possible: wall-clock savings × value of time vs. token-spend multiplier. Even a coarse heuristic beats vibes.

7. **Validity window** — "This recipe holds until [Claude Code's Task tool internals change / multiplexer integration becomes first-class in the launcher / etc.]."

## What This Does NOT Decide

- **Multi-machine orchestration** — parallel agents across multiple physical hosts. One step too far; revisit when load-bearing.
- **Commercial multi-agent framework adoption** (AutoGen, CrewAI, LangGraph). Useful as reference material, not as substitutes for the filesystem-primitive stack.
- **Agent-to-agent negotiation protocols.** Academic multi-agent systems literature. Worth skimming; unlikely to change the local toolkit this challenge is scoped to.
- **Specific tool loyalty** — Claude Code is the reference implementation, but the kernel-tier pattern should be tool-agnostic. OpenCode / Cursor / continue.dev adapters on the worktree side are separate follow-ups.

## Open Threads

- Does `inter-agent-messaging` need a **message-claim** primitive for safe parallel consumption (one worker gets a message, others see it's claimed)?
- Is there a "**screenshot / status snapshot → orchestrator**" primitive worth building so the orchestrator can eyeball each worker's state without reading every message?
- Should worktree branch naming follow a convention the orchestrator can parse (e.g., `parallel/<orchestrator-id>/<worker-role>`)? What falls out of that naming?
- How does this compose with the **cross-device SSH** pattern? A human watching three workers from a phone has different UX constraints than a human watching from a full-screen desktop.
- What's the **minimum viable orchestrator** — a fresh Claude Code session with a skill preloaded, or does it warrant a dedicated agent in `.claude/agents/`?

## Why "graduated, not resolved"

The 2026-04-18 zz-research note was the pre-challenge — it stamped what was known and what wasn't before the deeper pass happened. This challenge is the deeper pass's assignment. The investigation questions here are the *unresolved* ones; the primitives-toolkit from the 04-18 note stays the starting substrate.

## Research findings (2026-04-25)

First fan-out research pass complete. Four parallel Explore subagents investigated the eight questions above; consolidated findings at [`agent-context/zz-research/2026-04-25-parallel-agent-coordination-findings.md`](../../agent-context/zz-research/2026-04-25-parallel-agent-coordination-findings.md).

**Highlights:**

- **Task-tool parallelism is session-level, not LLM-level** — multiple Task calls dispatch separate sessions that run their own LLM reasoning sequentially. Concurrent file edits are silent last-write-wins with no locking. Official upstream guidance is to decompose work so workers don't touch the same file.
- **Spec-driven file-ownership decomposition** is the single cheapest coordination primitive that prevents most collisions and requires no protocol awareness from individual agents.
- **Cost-vs-speed thresholds** land around 5 min (exploration), 10 min (independent tasks), 20 min (implementation) per sub-task for parallelism to break even; cost multiplier is roughly 1.8–2.2× rather than N× thanks to prompt-cache sharing.
- **Launcher-integrated "orchestrator + N workers in worktrees" has already shipped in at least seven production tools** (Cursor 3.0, Devin 2.0, Claude Code Agent Teams, Manaflow, Claude Squad, Agentyard, Workmux). The remaining gap is a multiplexer-native dashboard for terminal-only workflows.

Four empirical experiments remain (cheapest first): Task-tool timestamp logging (~1 min), same-file concurrent-edit observation (~2 min), prompt-cache TTL measurement under worker churn (~10 min), merge-conflict cost across divergence windows (~1 hour). None block promotion of the ready findings into tier-2 patterns.
