---
title: Context-window engineering & delegation architecture
description: Operational guide to context budgeting in Claude Code — advertised vs routed context windows, harness model-metadata fallbacks, compaction strategy, and how quality, quota cost, and context capacity jointly shape bounded subagent and workflow design.
stratum: 2
status: research
sidebar:
  order: 8
tags:
  - stack
  - ai-coding
  - context-engineering
  - delegation
  - compaction
  - model-routing
  - quota
date: 2026-07-20
branches: [agentic]
---

Every delegation decision sits at the intersection of **three axes that are usually discussed separately**:

1. **Quality** — is this model tier capable enough for the task?
2. **Cost / quota** — whose meter runs, and how fast does it refill?
3. **Context capacity** — how much window does the session *actually* have, on the route it *actually* uses?

Most guidance covers axes 1–2 (see the [delegation rules in the global profile](../../profiles/claude-global/CLAUDE.md)). This page adds axis 3 — the one that failed silently twice in one week — and shows how all three combine into an operating posture. Theory lives in [progressive disclosure](../../01-kernel/principles/04-progressive-disclosure.md) and [context funneling](../../01-kernel/ARCHITECTURE.md); this page is the decision layer on top.

Claims here are labeled:

- **[invariant]** — true regardless of provider or current tooling.
- **[stack default]** — this stack's current policy; change deliberately.
- **[route-specific, as of 2026-07-20]** — measured on one route at one point in time. Re-verify before relying on it; these decay.

## 1. Three context windows, not one

**[invariant]** For any harness + gateway + model combination there are *three* distinct numbers, and they are routinely conflated:

| Window | Who defines it | How you learn it |
|---|---|---|
| **Advertised** — what the model supports on its native API | Provider docs | Marketing/spec pages |
| **Routed** — what your access path actually accepts | The route (subscription tier, gateway, OAuth lane) | Only by evidence: real requests succeeding/failing |
| **Managed** — what the harness believes and budgets against | Harness model metadata + your config | `/context` |

A session is healthy only when **managed ≤ routed ≤ advertised** and managed is as close to routed as safety allows. Every failure mode below is one of these inequalities breaking:

- **managed > routed** → the *wedge*: the harness sails past the real limit, upstream 400s, and `/compact` self-seals because compaction itself must submit the oversized context. Recovery costs a session ([rescue recipes](./claudex-codex-models-via-cliproxyapi.md)).
- **managed ≪ routed** → silent capability loss: premature compaction, lossy summaries, "why is this compacting again?" — paying a quality tax on every long session with no error to notice.

**[route-specific, as of 2026-07-20]** All three numbers for the Sol lane, measured this week:

| Number | Value | Evidence |
|---|---|---|
| Advertised (direct API) | 1.05M input / 128k output | Provider model docs |
| Routed (ChatGPT/Codex OAuth via CLIProxyAPI) | ~400k total — last *successful* requests at ~345k and ~372k input, next request 400'd | Session JSONL forensics, two independent projects |
| Managed (this stack's profile) | 300k window → auto-compact ~267k | `sol-settings.json` |

The ~100k gap between managed and routed is deliberate **emergency headroom**: one large mid-turn tool result (a Skill body injection measured at ~153k *characters*) is what pushed the first wedge over the edge.

## 2. The harness lies about unknown models

**[route-specific, as of 2026-07-20, Claude Code v2.1.215]** Claude Code has a fourth number hiding under "managed": its **model-metadata fallback**. Model ids it doesn't recognize (any foreign model through a gateway, e.g. `gpt-5.6-sol`) are assumed to be **200k models**, and `autoCompactWindow` is **clamped to that metadata** — a 300k setting silently became `min(300k, 200k) = 200k`. `/context` showing `x/200k` on a model you configured for 300k is this fallback, not the route's real limit.

The documented override (v2.1.193+) is `CLAUDE_CODE_MAX_CONTEXT_TOKENS`, which exists precisely for gateway-routed models whose real window differs from the harness assumption. This stack sets it in the Sol settings profile:

```json
{
  "autoCompactEnabled": true,
  "autoCompactWindow": 300000,
  "env": {
    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "300000",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "300000"
  }
}
```

**[invariant]** The general lesson: *the harness's belief about a foreign model is a default, not a discovery.* Gateways don't advertise context size in `/v1/models` metadata, so the harness cannot learn the routed window — you must measure it (watch where real requests fail) and configure it explicitly.

**[invariant]** Never configure managed = advertised on a routed lane without evidence. "The model supports 1M" is a claim about the *advertised* window; your OAuth/subscription route may enforce a fraction of it. Configuring 1M on a ~400k route re-creates the wedge with extra confidence.

## 3. Compaction is lossy — budget like it

**[invariant]** Auto-compaction is not free continuation; it replaces raw history with a model-authored summary. Exact requirements, tool outputs, rejected alternatives, and subtle constraints degrade. Each compaction also *shrinks the effective working span*: post-compact baseline (summary + system prefix) can be 40–65k before any new work happens, so a too-small window compacts again within minutes — measured worst case this week: **two compactions six minutes apart** under a 150k misconfiguration.

**[invariant]** The harness reserves headroom below the configured window (Claude Code: ~33k = output reservation + compaction reserve), so practical trigger ≈ window − 33k. Budget from the *trigger*, not the window.

**[stack default]** Compaction posture:

- Managed window set from *measured* routed capacity minus emergency headroom (Sol: 300k → trigger ~267k, ~100k margin below the ~372k failure region).
- Treat every compaction as a quality event, not bookkeeping. If a session compacts more than twice, the marginal value of continuing degrades — prefer a bounded handoff (`pconv handoff` / `cc-handoff`) into a fresh session.
- Long-haul synthesis belongs on the native Anthropic lane (Fable, true 1M managed = routed). Sol sessions are sprints.
- Profiles follow the session, not the model: a Sol `--settings` profile will clamp Fable to 300k if you model-switch mid-session. Switch lanes by relaunching, not just `/model`.

## 4. What actually fills the window

**[invariant]** Ranked by observed contribution in this stack's sessions:

1. **Tool results** — file reads, workflow/agent returns, command output. Single reads of 12–48k characters are routine; they compound fast.
2. **Skill body injections** — a skill invocation pastes its full content into context (~153k chars measured for one). Skills are cheap at rest (frontmatter only) and expensive when fired.
3. **Post-compaction summaries** — 28–42k chars each, and they *persist* as baseline.
4. **The stable prefix** — system prompt, tool schemas, agents, memory, CLAUDE.md (measure with `/context`; ~90k in this repo's sessions). This is the rent every session pays before work starts.

The [four channels of context](../../01-kernel/principles/08-four-channels-of-context.md) classify these; the operational point is that **channels 3 and 4 (environment- and model-authored) dominate growth**, and both are controllable: scope reads tightly, prefer agents' *summaries* over raw dumps, and treat skill invocations as context purchases.

## 5. Delegation under all three axes

Subagents are the standard answer to a bounded main window — and it's a *partially* correct answer.

**[invariant]** What isolation actually buys:

- A fresh window per worker: exploration garbage (file dumps, dead ends, tool noise) stays in the worker and dies with it.
- The orchestrator pays only for the **compressed return** — the summary, not the search.
- This is context *funneling*, not context *expansion*: the main session's window is unchanged; what changes is what you spend it on. Details are lost at the funnel boundary by design — delegation trades fidelity for capacity, same as compaction, just at a boundary you choose.

**[invariant]** What isolation does not buy:

- Continuity. Work whose value is *accumulated judgment across the whole task* (architecture evolution, long negotiation with requirements) resists funneling — the compressed return is exactly the part that can't carry it.
- Free capacity. Every worker re-pays the stable-prefix rent and bills its own tokens.

**[stack default]** The three axes assign each delegation a *lane*, and the lanes are not interchangeable:

| Axis | Question | Rule |
|---|---|---|
| Quality | Weakest tier that does the job? | narrow retrieval/mechanical → Haiku; implementation/reasoning → Sonnet; cross-cutting execution/design analysis → Opus; Fable normally remains the orchestrator, with a separately approved Fable worker only for a genuinely hard independent problem |
| Quota | Whose meter, what refill? | Anthropic lane ≈ 5h refill → afternoon blast radius. Codex OAuth lane = **weekly, no short-cycle refill** → a runaway costs the week. Wide fan-outs belong on the fast-refill lane. |
| Context | Where does the *output* land? | Every return lands in the orchestrator's window. N workers × k-token returns is a purchase against the *main* budget — size the return contract ("≤500 words, findings only") as deliberately as the worker count. |

**[stack default]** Bounded fan-out discipline (the enforcement layer is the [global profile](../../profiles/claude-global/CLAUDE.md) + `agent-guard` hook; this is the rationale):

- Small sequential waves (3–5), read results, decide the next wave — an interruptible loop, not a dispatched graph.
- Default admission budgets are 15 agents per genuine user prompt and 80 per rolling 5h session. The guard atomically reserves direct Agent calls and the full declared maximum of an approved workflow before launch, closing parallel preflight races.
- Claude Code's outer `Workflow` PreToolUse event does **not** provide a blocking boundary around its internal `agent()` calls. Therefore named, inline, resumed, and unresolvable Workflows fail closed and are never approvable — only a resolvable `scriptPath` can be admitted, and that script must independently enforce the same literal maximum the guard reserved. This is two-layer admission + execution control, not a claim that the hook observes hidden children.
- Hard agent-count bound on every workflow; >15 expected agents requires same-turn disclosure (count, model, rough tokens), explicit confirmation, and a human-set launch-time cap. There is deliberately no agent-writable in-session `cap-off` file.
- Workers never sub-delegate; every delegation prompt says so explicitly.
- 429/quota errors stop the fan-out — report, don't retry-loop.

### The proven Fable director pattern

**[observed]** TeachingStack's bounded waves made the context-funneling shape concrete:

1. **Fable director** — frame the problem; freeze interfaces, acceptance criteria, file ownership, return contracts, and human decision gates.
2. **Bounded builders** — Sonnet fills decision-free implementation, tests, and repair; Opus handles cross-cutting implementation or architecture-heavy execution.
3. **Independent evidence** — a fresh Sonnet worker tests runtime, visual, and behavioral claims rather than accepting builder self-certification. Haiku may extract mechanical evidence.
4. **Bounded repair** — evidence becomes a separate repair contract and regression guard, not an unbounded retry loop.
5. **Fable closeout** — reconcile reports against the frozen contract, resolve conflicts, preserve uncertainty, and produce the user-facing synthesis and next decision.

Escalation is evidence-driven: move up when bounded lower-tier work exposes ambiguity, crosses subsystem boundaries, or fails to reach a reliable result. Opus is a legitimate heavy worker. A delegated Fable worker is rarer: the hard problem must be independently bounded, Opus/Sonnet must be insufficient, quota pressure and scope must be disclosed, and the user must approve that launch explicitly. Never escalate merely because the top-level model is already Fable.

The canonical task-shape routing table lives in the `delegation-advisor` skill. This document explains why; it does not maintain a competing copy.

## 6. Dynamic workflows vs. reusable harnesses

**[invariant]** A workflow script is two things at once: *the orchestration graph this task needs* and *an artifact someone has to trust*. Those pull in opposite directions — the graph wants to be shaped exactly to the task, the trust wants a stable file that was reviewed once. Conflating them produces the two failure modes seen in practice: sessions bending a task into a harness that doesn't fit, and sessions accumulating half-generic scripts nobody maintains.

**[stack default]** Resolve it by admission class, not by file:

| Need | Mechanism |
|---|---|
| ≤6 mutually independent tasks, one parallel phase, no cross-task synthesis | registered `bounded-parallel` (args-driven; the file never changes) |
| Phases, dependencies, pipelines, barriers, conditional stages, synthesis, or split audit/apply/verify roles | **task-specific dynamic `scriptPath` + one-run approval** |
| The same graph, deliberately, across many sessions | permanent registration (reviewed, hash-pinned, installer-validated) |
| A workflow is missing, renamed, or blocked | author/keep the intended graph and stop for approval — **never** substitute |

**[invariant]** The substitution failure is worth naming: when a saved workflow name no longer exists, "use the reusable one that *is* registered" looks like recovery and is actually silent scope change. `bounded-parallel` cannot express a dependency, so a three-phase audit→apply→verify task run through it becomes three unordered parallel guesses. A blocked workflow is likewise not a signal to change execution strategy — it is a signal to get one human approval.

**[stack default]** One-run approval exists so the correct answer isn't expensive. A dynamic script is admitted once, bound to its exact path, hash, declared bound, model-neutrality attestation, and the launcher's model lock; it never enters the permanent registry, and editing it voids the approval. Requirements the guard checks statically:

- exactly one literal bound (`maxAgents:` / `MAX_AGENTS =` / `HARD_CAP =`) — conflicting or absent bounds are not approvable;
- on a pinned lane, a literal `subagentModelPolicy: 'inherit-launcher'` line and no worker-model selection or nested `workflow()` call;
- on a pinned lane, human approval at *exactly* the declared bound — the guard reserves all of it and never silently caps.

**[invariant]** These are fail-closed *eligibility* checks under the same non-adversarial threat model as the rest of the guard: they stop accidental lane escapes and unbounded fan-out, not a script written to defeat them. The real bound is still the one the script enforces on itself.

## 7. Operating checklists

**Starting a long session** — know your three numbers: which lane (quota), which model (quality), and what `/context` reports as the window (managed). If managed doesn't match what you configured, suspect metadata clamping (§2).

**Mid-session** — `/context` at natural breakpoints. Nearing the trigger with major work left: prefer a deliberate `/compact` at a clean boundary (you choose what's summarized) or a `pconv handoff` over an automatic compaction mid-thought.

**Before a fan-out** — count the agents; name the lane and its refill; size the return contract; state the bound. If any answer is "not sure," the fan-out isn't ready.

**When a context request 400s** — the wedge (§1). Don't retry, don't `/compact` (self-sealing). Go to the [rescue recipes](./claudex-codex-models-via-cliproxyapi.md): window-swap onto a native large-window lane, or `pconv handoff` into a fresh session.

**When a route changes** (new proxy version, new subscription tier, new model id) — every **[route-specific]** number above is stale until re-measured. Watch the first long session's failure/success boundary before trusting old limits.

## Related

- [`claudex-codex-models-via-cliproxyapi.md`](./claudex-codex-models-via-cliproxyapi.md) — the Sol route itself: setup, quota asymmetry, wedge rescue recipes
- [Progressive disclosure](../../01-kernel/principles/04-progressive-disclosure.md) — why context is the scarce resource
- [Four channels of context](../../01-kernel/principles/08-four-channels-of-context.md) — what fills it
- [Kernel architecture](../../01-kernel/ARCHITECTURE.md) — context funneling, no-recursive-subagents
- [Agent–skill pairing](./agent-skill-pairing.md) — deterministic skill preloading for workers
