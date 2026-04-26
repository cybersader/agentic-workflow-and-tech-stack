---
title: Dogfooding the parallel-agent fan-out — three waves on the scaffold itself
description: Empirical follow-up to the 2026-04-25 parallel-agent coordination findings. The same scaffold that documents the pattern was improved using three waves of three parallel agents — 12 invocations producing ~50 surgical edits across 38 source files in ~7 minutes of agent wall-clock. Validates several of the findings doc's predictions (cost multiplier, spec-driven file ownership, single-sided coordination) and surfaces fresh observations about agent quality variance, rejection-rate norms, and per-wave scope shape. Companion to the findings doc, not a replacement.
stratum: 5
status: observed
priority: low
date: 2026-04-25
tags:
  - parallelization
  - multi-agent
  - dogfooding
  - empirical
  - fan-out
  - validation
  - research
---

## Why this is captured

The findings doc from earlier today listed five graduation-ready candidates and four falsifiable experiments. Within hours of shipping it, the same scaffold ran a three-wave fan-out to add cross-links, Mermaid diagrams, and callouts across 01-kernel/, 02-stack/, 03-work/, research/, and root meta-docs. The run is itself an instance of the pattern the findings doc characterizes — worth capturing while the data is fresh, before memory rounds the corners.

This note is a companion to [`2026-04-25-parallel-agent-coordination-findings.md`](./2026-04-25-parallel-agent-coordination-findings.md), not a replacement. It supplies empirical numbers; the findings doc supplies the conceptual frame.

## The shape of the run

Three waves, structured progressively:

| Wave | Pattern | Agents | Scope |
|---|---|---|---|
| 1 | Audit-then-apply (split phases) | 3 Explore (audit) + 3 general-purpose (apply) | Kernel principles, root docs, examples |
| 2 | Combined survey-and-apply | 3 general-purpose | Tier-2 stack patterns, tier-3 research notes, challenges + selected learnings |
| 3 | Combined survey-and-apply | 3 general-purpose | Stack layer-folders + decisions, research/architecture, top-level meta-docs |

**12 total agent invocations.** Wave 1 used the split audit/apply pattern (one set of agents proposes a changeset, another set verifies and applies). Waves 2 and 3 collapsed both phases into a single agent — survey, decide, edit, report — which proved adequate for the smaller scope per agent and roughly halved coordination overhead.

## Numbers

Pulled from the committed range `4d3565a..2fda337`:

| Wave | Files modified | Insertions | Deletions | Per-agent wall-clock (typical) |
|---|---:|---:|---:|---|
| 1 | 15 | 131 | 17 | ~60–110 s |
| 2 | 17 (sources + auto-synced mirrors) | 177 | 33 | ~90–140 s |
| 3 | 10 | 215 | 81 | ~110–120 s |
| **Total** | **42** (~38 unique sources) | **523** | **131** | — |

Across the three waves: **~50 surgical edits** (cross-links, diagrams, callouts), ~25 lines of redundant ASCII trimmed where Mermaid subsumed it, no edit collisions across parallel agents, no PII flagged in any sweep.

Wall-clock for agent execution alone (parallel within each wave): roughly 7 minutes total. Orchestration overhead (planning, commit messages, site syncs, PII sweeps, push) added another ~10 minutes. Real-time end-to-end: ~20 minutes for a doc improvement pass that would have been an afternoon's work serially.

## Validation against findings-doc predictions

### Cost multiplier ≈ 1.8–2.2×, not N×

Roughly held. Each wave dispatched three agents in a single message, so the orchestrator's prompt-cache stayed warm across the spawn — system context, recent conversation, and stable kernel docs were not re-paid for per agent. Token spend was higher than a serial run but visibly less than 3× per wave, consistent with the findings doc's prediction.

### Spec-driven file-ownership decomposition prevents collisions

Held cleanly. Each agent received a disjoint file set (by tier, by folder, by topic). Zero file-write collisions across all three waves. No sentinel locks, no claim protocol, no inter-agent communication required. The single-sided primitive worked as advertised.

### "Be ruthless" instruction propagates to subagents

Held. Agents reported skipping roughly as often as they applied. Most-cited rejection reasons (paraphrased from agent reports):

- "Already crisp — adding would be decoration."
- "Already heavily diagrammed — adding would be noise."
- "Tables-heavy — no natural diagram-shaped target."
- "Wrong shape — lineage/philosophy doc, doesn't fit."

The user-facing emphasis in the brief ("actually beautiful actually useful") propagated through the prompt and showed up in agent rejection messages. Worth noting: rejection-as-honesty was preserved without re-prompting.

## Fresh observations not in the findings doc

### Agent quality varies by category, not just by agent

Diagram-applying agents tended to volunteer prose trims when a Mermaid block subsumed an ASCII diagram (good — the right move). Callout-applying agents stayed strictly additive (also fine — callouts are accents, not replacements). Cross-link agents handled missing-target validation gracefully (skipping with rationale rather than fabricating paths).

The variance correlated with the *kind* of edit, not the agent identity. Suggests the prompt-shape per category matters more than per-instance tuning.

### Audit-then-apply vs. combined: combined wins for small scope

Wave 1 used the split pattern; waves 2 and 3 collapsed it. Combined agents finished in roughly the same wall-clock as split-pattern agents because they save one round-trip of context-rebuilding (the apply agent in the split pattern has to re-read everything the audit agent already read). For scopes of <10 files per agent, combined is the right default; split is justified when audit findings need orchestrator review before any edits land.

### Rejection rate is the quality signal

Across 12 agent invocations, the average per-agent ratio was roughly 4 applied : 2 skipped. Lower-than-expected reject rates from any single agent would be a flag — either the agent is over-eager (low quality bar) or the scope is genuinely sparse. Higher-than-expected (skipping most candidates) suggests either prompt mis-targeting or domain that's already saturated.

## Falsifiable hypotheses for next runs

1. **Rejection rate as quality predictor.** Hypothesis: agents reporting >70% apply rate produce lower-quality changes than agents reporting 50–70% apply. Test: compare aggregate quality of edits across two runs with deliberately permissive vs. strict instruction emphasis.
2. **Combined survey+apply scales to ~7 files per agent.** Beyond that, audit-then-apply is faster overall. Test: dispatch a combined agent against a 15-file scope; measure time and quality vs. split-pattern equivalent.
3. **Prompt-cache warmth holds for 3 parallel spawns within ≤300s.** Beyond that or with more agents, cache misses dominate and the cost multiplier creeps toward N×. Test: dispatch 5 agents across a 5-min span vs. 5 agents across a 10-min span; compare token telemetry.

Each is cheap to falsify. None block a default-on parallel-agent recipe — they would refine it.

## Graduation impact

The findings doc named five graduation candidates. This run exercised three of them in production:

- **Spec-driven file-ownership decomposition** (graduation candidate 1) — used as the coordination primitive. No collisions.
- **Cost-vs-speed thresholds** (graduation candidate 2) — wave-1 work was implementation-grade (>20 min sequential per task), so parallelism was clearly justified by the threshold rule. Held.
- **"Use foreground parallel, not run_in_background, for write-heavy work"** (graduation candidate 5) — followed automatically; all 12 agents ran foreground. Held.

Two un-exercised candidates (Task-tool concurrency model, multiplexer-native dashboard gap) await separate experiments.

## See also

- [Parallel agent coordination findings (2026-04-25)](./2026-04-25-parallel-agent-coordination-findings.md) — the conceptual frame this empirical pass exercised
- [Challenge 03 — Parallel Agent Coordination](../../../research/zz-challenges/03-parallel-agent-coordination.md) — the open challenge whose graduation candidates this dogfood validated
- [2026-04-18 zz-research — Parallel Agentic Work](./2026-04-18-parallel-agentic-work.md) — the pre-challenge stamp these notes descend from
- Commit range `4d3565a..2fda337` — the empirical artifact: 42 files, 523 insertions, 131 deletions, 12 agent invocations, ~20 minutes wall-clock
