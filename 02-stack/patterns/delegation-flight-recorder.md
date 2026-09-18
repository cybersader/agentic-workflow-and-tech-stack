---
title: Delegation Flight Recorder
description: Crash-resilient per-worker journals for recovering partial subagent and Workflow progress without preserving transient detail forever.
stratum: 2
status: active
tags:
  - stack
  - pattern
  - claude-code
  - agents
  - workflows
  - recovery
  - hooks
date: 2026-08-29
branches: [agentic]
---

## The problem

A parent session normally receives a worker's final return. That is not a durable contract when the worker, terminal, VM, or host dies first.

Three existing records each cover only part of the problem:

- task state remembers assignments and status, not incremental evidence;
- session and subagent transcripts are implementation-oriented recovery material rather than a compact handoff;
- Workflow journals preserve completed `agent()` returns, but an agent can die before returning.

The missing layer is a write-ahead journal for delegated work: create a run before execution, record each worker separately while it progresses, surface unfinished work after restart, and delete transient detail only after synthesis and verification have reached a durable destination.

## The pattern

**Delegation Flight Recorder** combines automatic lifecycle receipts with explicit semantic checkpoints.

```text
one genuine user prompt
        │
        ▼
  one delegation run
        │
        ├── worker A journal
        ├── worker B journal
        ├── worker C journal
        └── shared manifest + append-only event ledger
```

Workers never write one shared vlog. Each worker owns a separate human-readable journal; shared state changes use a lock and atomic replacement.

The machine-local default is:

```text
~/.claude/state/delegation-flight-recorder/
├── projects/<project-key>/runs/<run-id>/
│   ├── manifest.json
│   ├── events.jsonl
│   └── agents/<agent-id>.md
└── receipts/<project-key>/<run-id>.json
```

This state is private runtime evidence, not repository knowledge. It can contain local paths, failed hypotheses, and incomplete findings. It does not belong in Git, `zz-log`, or a public mirror.

## Two evidence lanes

### Automatic operational trail

Claude Code hooks record bounded metadata without relying on worker compliance:

- worker start and type;
- successful and failed tool calls;
- file paths without Write/Edit bodies;
- bounded, redacted command descriptions;
- task completion association;
- final worker message at normal stop.

The recorder does not persist raw tool output, environment dumps, full Agent prompts, authorization values, or file contents. Automatic records explain what the worker did, but do not pretend tool activity is the same as a finding.

### Semantic checkpoints

The `SubagentStart` hook injects the run ID, worker ID, journal path, and checkpoint command into every native worker. Workers checkpoint after:

1. initial discovery;
2. each coherent work unit;
3. edits or generated artifacts;
4. each build or test group;
5. a failure or contradictory finding;
6. before an expensive next phase;
7. before the final response.

A checkpoint should contain:

```markdown
## Objective

## Completed

## Findings

## Evidence

## Changes

## Current Work

## Next Exact Action

## Blockers
```

The checkpoint command reads the body from standard input:

```bash
python3 ~/.claude/scripts/delegation-flight-recorder.py checkpoint --run <run-id> --agent <agent-id> --stdin
```

A hard shutdown can lose work since the most recent semantic checkpoint, but the automatic trail still records completed tool operations. The recovery window becomes one work unit instead of the entire delegation.

## Hook lifecycle

| Event | Recorder behavior |
|---|---|
| `PreToolUse` for `Agent` / `Workflow` | Creates the run before delegation and records bounded assignment metadata |
| `SubagentStart` | Creates a separate worker journal and injects the checkpoint contract |
| `PostToolUse` | Records a bounded successful tool event when `agent_id` is present |
| `PostToolUseFailure` | Records the failed operation, interruption flag, and redacted bounded error |
| `SubagentStop` | Captures `last_assistant_message` and marks that worker terminal |
| `TaskCompleted` | Associates task completion without conflating task and worker lifecycle |
| Main-thread `PostToolUse` for `Agent` / `Workflow` | Returns run status and the recovery/closure commands to the orchestrator |
| `Stop` | Warns without blocking when the current run remains open |
| `SessionStart` | Surfaces unclosed runs for the current project before work is redispatched |

The recorder does not change Agent/Workflow admission. `agent-guard` still owns fan-out limits, Workflow approval, model locks, and reservations.

Lifecycle hooks are non-blocking. A broken journal must not trap a worker in a stop loop or prevent a session from closing. The hook reports a warning and leaves recovery to the existing transcript plus any records already fsynced.

## Recovery

List unclosed runs:

```bash
python3 ~/.claude/scripts/delegation-flight-recorder.py list --project "$PWD"
```

Inspect machine-readable state:

```bash
python3 ~/.claude/scripts/delegation-flight-recorder.py show --run <run-id>
```

Render a compressed resumable handoff:

```bash
python3 ~/.claude/scripts/delegation-flight-recorder.py recover --run <run-id>
```

Recovery includes:

- delegation requests;
- worker type and terminal state;
- latest semantic checkpoint;
- automatic trail when no semantic checkpoint exists;
- final worker return when one exists;
- completed task associations;
- original root transcript path.

The next orchestrator verifies current repository and branch state before acting on old evidence. A checkpoint is evidence from an earlier point in time, not authority to overwrite newer work.

Do not redispatch all jobs blindly. Reuse terminal results, resume checkpointed workers from `Next Exact Action`, and redispatch only jobs with no usable state.

## Closure and deletion

Normal worker completion does not delete the run. Only the orchestrator knows whether results were synthesized and verified.

Close after the result reaches a durable destination such as a commit, decision record, issue, final report, or verified project file:

```bash
python3 ~/.claude/scripts/delegation-flight-recorder.py close --run <run-id> --receipt "<durable result>"
```

`close` requires every observed worker to be terminal. It writes one minimal receipt, fsyncs it, then deletes the transient run directory.

Abandon incomplete work explicitly:

```bash
python3 ~/.claude/scripts/delegation-flight-recorder.py abandon --run <run-id> --reason "<why>"
```

An abandonment receipt prevents late hook events from recreating deleted work.

Receipts retain only:

- run and project identity;
- closed or abandoned status;
- closure reason;
- timestamp;
- terminal/total worker counts;
- task associations.

They do not retain worker checkpoints, tool events, or final messages.

## Failure model

| Failure | What survives |
|---|---|
| Worker returns normally | Semantic checkpoints, tool trail, final message |
| Worker crashes | Checkpoints and tool events fsynced before the crash |
| Parent session dies | All worker-local records already written by hooks or checkpoint commands |
| VM or host dies | Filesystem state through the latest completed fsync |
| Transcript index is stale | Recorder state is independent of `sessions-index.json` |
| Recorder hook itself fails | Claude continues; existing transcript and prior records remain available |
| Run is abandoned while a worker is still ending | Receipt tombstone prevents recreation by late events |

No recorder can preserve unexpressed internal reasoning. The recoverable unit is evidence deliberately externalized to a checkpoint or tool operation.

## Security and privacy

- Directories use mode `0700`; files use `0600`.
- Shared writes use `fcntl.flock`; manifests use atomic rename.
- Identifiers become bounded path-safe names plus hashes.
- Common password, token, secret, key, credential, and Authorization values are redacted.
- Write/Edit/NotebookEdit content is omitted.
- Tool response bodies and environment mappings are omitted.
- URLs lose query strings before storage.
- Commands and errors are bounded.

This is accidental-secret containment, not a hostile-agent sandbox. A worker with shell access can still write arbitrary local files. Existing permissions, Bash safety rules, worktree boundaries, and Agent/Workflow admission remain the security controls.

## Installation

The global guard installer owns the recorder scripts and hook entries:

```bash
bash profiles/claude-global/install-agent-budget.sh
```

It preserves unrelated `~/.claude/settings.json` content, installs each owned hook exactly once, creates the private state root, and is byte-for-byte idempotent. Open a fresh Claude Code session after installation so lifecycle hooks load.

## Verification evidence

Static and synthetic tests prove state transitions, redaction, locking, installer idempotency, and hook output schemas. Fresh-session witnesses on the current Claude Code build also proved:

- one direct Explore worker received the injected checkpoint contract, wrote two semantic checkpoints, accumulated automatic tool events, and returned a captured final handoff;
- two workers created inside the Workflow runtime received distinct journals and wrote two checkpoints each;
- a later fresh session received the exact run ID and `0/1` terminal count for an intentionally interrupted fixture;
- explicit close and abandon operations retained only minimal receipts and removed transient worker detail.

The Workflow witness used the registered `bounded-parallel` harness because the fixture was exactly two independent tasks in one parallel phase. Admission class does not change native worker lifecycle hooks, but a task-specific dynamic Workflow still retains its separate one-run approval requirement.

## Related

- [Claude Code session recovery](./claude-code-session-recovery/) — recovering parent conversations and stale session indexes
- [Four channels of context](../../01-kernel/principles/08-four-channels-of-context/) — why delegated context must be externalized before it disappears
- [Claude Code hooks reference](https://code.claude.com/docs/en/hooks)
- [Claude Code hooks guide](https://code.claude.com/docs/en/hooks-guide)
