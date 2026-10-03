---
title: Governed Steward — Scheduled Agent Work Under Subsidiarity
description: Essence-first design for unattended (scheduled) agent work that stays local, bounded and aligned. It defines a charter (delegated, scoped, expiring authority), an envelope enforced outside the model (cost, wall time, CPU/memory/IO), an inbox of proposals instead of actions, and an append-only ledger. A subsidiarity ladder runs deterministic scripts first and models only when needed. The first slice is model-free.
stratum: 5
status: research
date: 2026-10-02
candidate-only: true
tags:
  - agent-architecture
  - scheduling
  - subsidiarity
  - governance
  - research
---

## Bottom line

- **The gap is real:** the scaffold already governs *interactive* delegation (agent-guard caps, one-run approvals, the permission controller, containment slices, the flight recorder). It has no governed form of *unattended* work. Background and scheduled agents are where the conference talks are heading, and they are exactly where cost, hardware and alignment risk compound overnight with no human in the loop.
- **Essence, not "loop engineering":** a scheduled agent is a **cron job with a model inside it, acting on delegated authority**. Harness, context and loop engineering all describe the *efficient cause* (how a run executes). What is missing is the formal cause: who granted what authority, for what end, within what limits, and until when. That is subsidiarity: authority is delegated downward, scoped to competence, revocable, and help is escalated upward only when the lower level cannot do the work.
- **Design:** five primitives (Charter, Run, Envelope, Inbox, Ledger) and one ordering rule (the subsidiarity ladder). Every limit is enforced **outside** the model, because a model cannot be trusted to keep its own budget or scope.
- **First slice:** a model-free nightly steward. A deterministic health report (disk, stale docs, frontmatter, open flight-recorder runs) is written to an Obsidian inbox under a systemd-enforced envelope. It proves the charter, envelope, inbox and ledger at zero inference cost before any model is scheduled.

## Essence pass

| Step | Answer |
|---|---|
| Final cause | Unattended work that serves the person. Success eval: every run ends inside its declared envelope, leaves exactly one reviewable inbox item, and changed nothing outside its scope. |
| Definition | Genus: scheduled job. Differentia: it may contain a model, so it acts on **delegated, revocable authority** rather than fixed instructions. |
| Primitives | **Charter** (the delegation) · **Run** (one execution under a charter) · **Envelope** (ceilings enforced outside the model) · **Inbox** (proposals awaiting the human) · **Ledger** (append-only record of runs, spend and outcomes). |
| Accidents | systemd vs cron, which model, which harness (Claude Code headless, OpenCode, a plain script), and the inbox's storage format. All swappable. |
| Propria → enforcement | See the table below. |
| Glossary | *Run* (not "loop"); *charter* (not "agent config"); *escalate* = write to the inbox and stop, never self-promote. |

## Propria and where each is enforced

| Necessary property | Enforcement (outside the model) |
|---|---|
| Cost cannot run away overnight | Per-run `--max-budget-usd` (Claude Code headless print mode) **and** a per-charter daily ceiling in the ledger checked before launch; prepaid, hard-capped keys for any API lane. Weekly-pool lanes (Sol/Luna/Astra) are excluded from schedules by default. |
| Hardware stays healthy | `systemd-run --user` transient units in the existing `claude-code.slice` with `CPUQuota`, `MemoryMax`, `IOWeight`, `Nice`, `RuntimeMaxSec`; `ConditionACPower=true` on laptops; quiet hours; a disk-usage precondition (skip when the disk is above a threshold). |
| Scope is bounded | The charter lists the paths, tools and network it may use. Work happens in a throwaway worktree or a read-only bind. GUI work only in `cu-sandbox`, never the human desktop. No push, send or credential rights in the run's environment. |
| Nothing outward happens unapproved | Output is a **proposal** (inbox note, branch, draft PR body). Applying it is a human act. |
| Alignment does not drift | Every run starts fresh from the charter (no accumulating hidden memory); the charter carries its purpose and success eval; charters **expire** and must be re-approved; the ledger records every outcome so drift is visible on review. |
| Authority is the human's | Charters are approved by the human, pinned by hash, and void if edited. Approval uses the existing controller pattern; no agent approves or renews its own charter. |
| Nothing fails silently | Every run writes a ledger line and an inbox item even when it skips or fails ("skipped: disk 92%", "stopped: budget"). |

## Subsidiarity ladder

Each charter declares the **lowest level that can do the job**; a run never climbs on its own.

0. **Deterministic script**: no model, no cost. Most monitoring and hygiene lives here.
1. **Cheap bounded model**: a prepaid capped lane (for example GLM Flash on a hard-capped key) with a strict per-run dollar ceiling, for summarizing or triage.
2. **Subscription model**: a 5h-refill lane with a dollar ceiling and turn limit, for real drafting. It is used only when a charter says so explicitly.
3. **Human**: anything beyond the charter goes to the inbox as a question, and the run stops.

### Reframe: compile, don't run

The most fundamental fix avoids the premise: a model running unattended at all. Recurring work usually needs intelligence to *design*, not to *execute* repeatedly, so the model works at authoring time and the schedule runs plain code with no inference. That makes runtime cost and drift structurally impossible rather than merely capped.

- **Level 0 is the destination, not the beginner tier.** Level 1 means a model *writes or updates* a level-0 program as an inbox proposal; the human reviews it and re-pins the hash.
- **A runtime model call is a quarantined function.** Fixed code calls the model for a pure transformation (for example "summarize this text") with no tools and no influence on control flow, as in CaMeL's privileged/quarantined split.
- **Bounded services, not open-ended agents.** Each charter is a bounded task with bounded resources and time that returns options to the human (Drexler's Comprehensive AI Services). Work that needs open-ended agency becomes an inbox question.
- **Verify outputs, not producers.** The charter's deterministic success check is the light version of the Guaranteed Safe AI verifier gate.

Sources: [Compiled AI](https://arxiv.org/abs/2604.05150), [LLM-as-Code](https://arxiv.org/html/2606.15874v1), [Defeating Prompt Injections by Design (CaMeL)](https://arxiv.org/abs/2503.18813), [Reframing Superintelligence (CAIS)](https://www.lesswrong.com/posts/x3fNwSe5aWZb5yXEG/reframing-superintelligence-comprehensive-ai-services-as), [Towards Guaranteed Safe AI](https://arxiv.org/html/2405.06624).

Gaps worth closing after level 0 has run cleanly: a dead man's switch (alert when a charter stops running), a hash-chained ledger, and an action monitor before any level-1 runtime call.

## Local, not cloud

The control plane (charters, scheduler, envelopes, ledger, inbox, sandbox) is entirely local: systemd user timers, files and Obsidian. Inference is the only thing that leaves the machine, and only for level 1–2 charters. A local model (for example via Ollama) can fill level 1 later without changing the design. Cloud background-agent products put the loop, state and credentials on someone else's servers; this design keeps them on yours.

The human surfaces are local too: Obsidian for the inbox and ledger views, and the existing permission controller for approvals. A run dashboard can come later as an Obsidian Base over the ledger, not a new app.

## Hardware wear (honest answer)

Sustained CPU load does not meaningfully wear a consumer desktop CPU within its lifetime. The real costs are heat and fan noise, laptop battery cycles (charging while hot), SSD write volume (indexers and logs, not agents thinking), and power. The envelope addresses all four: CPU quota, AC-power condition, quiet hours, bounded log retention, and the disk precondition. The past ck incident (10–17 GiB RSS, swap thrash) shows that **memory** is the acute risk on this machine, which is why `MemoryMax` is mandatory.

## Thin slice

**Built and smoke-verified:** [`profiles/steward/`](../../../profiles/steward/README.md) is model-free, level 0 only; levels 1–3 are refused as not implemented. No persistent timer has been installed or enabled. The original proposal below is historical: the implementation uses TOML and collected transient services, not `--scope`, so RuntimeMaxSec is enforced; filesystem isolation and model budgets remain outside this slice.

1. `profiles/steward/`: a stdlib CLI with `steward run <charter>`, `steward list`, `steward ledger`.
2. Charter format: TOML/YAML with purpose, success check, ladder level, command, paths, envelope, schedule, `expires`, and a pinned hash.
3. `run` wraps the charter command in `systemd-run --user --scope` (slice plus limits plus `RuntimeMaxSec`), appends a JSONL ledger line, and writes one Markdown inbox note.
4. First charter, level 0: a nightly health report covering disk usage (the WSL disk is at 81% today), invalid frontmatter, unclosed flight-recorder runs, and stopped-but-present sandbox containers. It changes nothing.
5. `steward install <charter>` writes a systemd user timer only after the human runs it; there is no self-install.
6. Level 1 charters wait until the level-0 slice has run cleanly for a week.

## Open questions for the user

- **Charter approval — decided: start simple.** The human commits the reviewed charter and runs `steward install` by hand. No permission-controller integration in this slice; installation prints enable instructions for the human instead of running systemctl.
- **Inbox location — default chosen:** `<state>/inbox` (`~/.local/state/steward/inbox`), overridable with `--inbox` or `STEWARD_INBOX` to point at an Obsidian folder later.
- **Ceilings:** a default per-charter daily dollar ceiling for level 1–2 (proposal: $0.50 per run, $2 per day per charter).
