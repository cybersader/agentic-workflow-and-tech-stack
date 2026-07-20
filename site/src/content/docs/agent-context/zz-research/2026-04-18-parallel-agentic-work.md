---
title: Parallel Agentic Work — Worktrees, Orchestration, What Deserves a Deeper Pass
description: Capture of what I already know and what I don't about running multiple AI coding agents in parallel. Git worktrees + orchestrator + filesystem messaging is the local-side toolkit. Coordination, merging, and cost dynamics are still under-explored. Stamps the open questions ahead of the deeper research session planned for Phase 9.
stratum: 5
status: research
date: 2026-04-18
tags:
  - parallelization
  - worktrees
  - orchestration
  - multi-agent
  - research
---

## Why this is captured

Phase 9 of the roadmap is a deeper research session on parallelization — git worktrees, background agents, multi-agent coordination. Before that session, stamp what I already know, what I'm uncertain about, and what the session should actually produce. Otherwise the session drifts into vibes.

## What I already know (the local-side toolkit)

### 1. Git worktrees as the isolation primitive

Multiple working directories on one repo, each on its own branch, sharing the same `.git` object store.

- `git worktree add .trees/feature-a -b feature/auth`
- Each worktree is a filesystem-isolated agent sandbox
- One agent per worktree; no file-write collisions
- Branches share history; merging is normal-git

Already exists at `examples/git-worktrees/README.md` (drafted). Planned to extract/rewrite into `02-stack/patterns/parallel-agents-worktrees.md` in Phase 4.

**Load-bearing property:** worktrees separate *filesystem state*. They do NOT separate *process state* (running agents + their conversation history live outside the worktree). Two agents in two worktrees don't accidentally step on each other's files, but they can still step on each other if they're talking to shared services (the same database, the same external API with rate limits, the same MCP server).

### 2. Orchestrator pattern

Canonical shape:

```
  Root session (orchestrator agent)
     ├── Worktree A: agent exploring approach 1
     ├── Worktree B: agent exploring approach 2
     └── Worktree C: agent on a different task entirely
```

The orchestrator:
- Spawns worker agents (via `/bg` command, or Claude Code's Task tool, or just a fresh session pointed at the worktree)
- Waits for them to complete or report
- Consumes their summaries (not their full context)
- Integrates results — merges, picks a winner, kills duds

Maps cleanly onto the filesystem-based messaging pattern (`.claude/inboxes/`, `.claude/outboxes/`) when agents need to pass structured data.

### 3. Sub-agent (Task tool) parallelism

Claude Code can spawn multiple Task agents in a single turn (they run concurrently under the hood when independent). This is a *within-session* parallelism, not a *cross-worktree* parallelism — different tool for a different problem:

- **Task-tool parallelism**: short-lived, read-mostly, returns summary into parent context. Good for exploration / research / survey queries.
- **Worktree parallelism**: long-lived, writes freely, branches diverge. Good for implementation A/B, independent features, experiments.

They compose: orchestrator uses Task tool for exploration, spawns worker sessions-in-worktrees for the write-heavy implementations.

### 4. Filesystem-based inter-agent messaging

Already have a skill for this (`.claude/skills/inter-agent-messaging/SKILL.md`). The persistence + auditability + async properties become more load-bearing when agents are actually running in parallel rather than sequentially.

## What I don't yet know (the research session's job)

### Coordination failure modes

- **Shared service contention** — two agents both hitting the same database / API / MCP server. Rate limits, transaction isolation, migration sequencing. What's the pattern?
- **Branch-history entanglement** — parallel worktrees that both touch the same file, even unintentionally. Merge strategies: rebase-first? Always-merge? Claim-lock via file in repo?
- **Orchestrator context exhaustion** — a long orchestrator session consumes tokens across many worker summaries. How do you keep the orchestrator itself cacheable?
- **Cost dynamics** — parallel agents = parallel API spend. When does parallelism actually save wall-clock time vs. just multiply cost?

### OpenCode's background-agents story

Historically OpenCode had a `/bg` command for background agents. I don't actively use OpenCode (banned per tool-picks) but the pattern is worth understanding for transplanting to Claude Code workflows.

Questions: How does OpenCode persist state across bg agents? How do they return? Is it a Task-tool analog or a worktree-session analog?

### Claude Code specifics worth verifying

- Can Claude Code's Task tool invocations actually run in parallel in-process? Or is the "run concurrently" part actually sequential under the hood with a parallel-looking status?
- What happens if two Task agents both try to `Edit` the same file? Is there a locking mechanism?
- How does `/fast` mode interact with parallel Task agents (cost + speed implications)?

### Human-in-the-loop coordination UX

- When three worktree-agents are running, how do I (human) stay informed enough to intervene without dropping context on any of them?
- Portagenty's "show me what's happening in all sessions" view — does it exist? Should it?
- Do I want a dashboard? Or notifications? Or just `tail -f` on the outboxes?

## What the deeper research session should produce

After the session, target artifacts:

1. **`02-stack/patterns/parallel-agents-worktrees.md`** — canonical how-to, drawing from `examples/git-worktrees/` and whatever the deeper research yields.
2. **`01-kernel/patterns/orchestrator-workers.md`** — the stratum-2 pattern, tier-1 abstract. When/why to use it, when to avoid.
3. **`03-work/memory/parallelism-preferences.md`** — my personal choices: default number of parallel worktrees, branch-naming, when I reach for Task-tool vs worktrees.
4. **Updates to `inter-agent-messaging` skill** — amendments for parallel-run coordination (message ordering, idempotency, etc.).
5. **Portagenty ADR (if applicable)** — if portagenty should grow first-class support for "launch an orchestrator + N worker sessions in worktrees," that decision + the UX belongs in the portagenty repo itself.

## Out-of-scope for now

- **Multi-machine orchestration** — multiple agents across multiple physical hosts (Tailscale-meshed or not). This is one step too far for the current setup; revisit if it becomes load-bearing.
- **Commercial multi-agent frameworks** (AutoGen, CrewAI, LangGraph orchestrators) — interesting as references but I don't intend to adopt them. The filesystem-primitive stack stays primary per `feedback_fundamental_features`.
- **Agent-to-agent negotiation protocols** — academic literature on multi-agent systems. Worth skimming during the research session but unlikely to change my local-side toolkit.

## Existing material to pull from

- `examples/git-worktrees/` — the initial draft of the pattern
- `examples/git-worktrees/.claude/commands/worktree-new.md` — the slash-command for spinning one up
- `.claude/skills/inter-agent-messaging/` — the messaging skill (relevant to parallel coordination)
- `.claude/skills/delegation-advisor/` — when to delegate at all (relevant to "when does parallelism help")
- `research/learnings/2025-12-31-inter-agent-messaging.md` (if it exists) — deeper inter-agent context

## See also

- [Parallel Agent Coordination — Findings from the Fan-Out Research Pass](/agentic-workflow-and-tech-stack/agent-context/zz-research/2026-04-25-parallel-agent-coordination-findings/) — the deeper-pass output that answers the open questions stamped here
- [ROADMAP Phase 4](/agentic-workflow-and-tech-stack/kernel/roadmap/) — where `parallel-agents-worktrees.md` gets authored
- [ROADMAP Phase 9](/agentic-workflow-and-tech-stack/kernel/roadmap/) — the deeper research session
- [`02-stack/02-terminal/index.md`](/agentic-workflow-and-tech-stack/stack/02-terminal/) — multiplexers give parallel sessions a *viewing* surface; worktrees give them a *filesystem* surface
- [Post-Filesystem Federated Knowledge](/agentic-workflow-and-tech-stack/agent-context/zz-research/2026-04-18-post-filesystem-federated-knowledge/) — at scale, multi-agent coordination eventually bumps into the same "filesystem is primitive" limits
