---
title: Agent Resource Supervision and Control Plane
description: Research model for attributing Linux agent sessions to process trees and cgroups, observing real resource pressure in a GUI, and terminating the smallest safely identified workload.
stratum: 5
status: research
priority: high
date: 2026-08-21
tags:
  - agents
  - observability
  - resource-control
  - fedora
  - systemd
  - cgroups
  - portagenty
  - research
---

## Why this matters

A workstation running several agent sessions can become progressively slow without producing a clean crash. The desktop still responds, but scheduling contention, swap activity, I/O stalls, or a growing process tree can make every interaction feel locked up. At that point, a flat process list is not enough: the operator needs to know **which logical agent session owns the pressure** and must be able to stop the smallest safely identified unit.

This is not automatically a reason to build a new GUI. It is a reason to separate four concerns before choosing a UI:

1. stable logical session identity;
2. reuse-safe process and cgroup attribution;
3. resource and pressure observation;
4. narrow, confirmation-gated control actions.

The first goal is to evaluate existing tools against that model. A custom daemon, GUI, service, or network endpoint is not approved by this note.

## Failure shapes that look alike

“Everything is slow” can have materially different causes:

| Failure shape | Useful evidence | Common misleading signal |
|---|---|---|
| CPU saturation | per-session CPU, runnable tasks, CPU pressure | one busy child appears harmless in isolation |
| Memory pressure | cgroup memory current/high events, reclaim, memory PSI | free memory alone ignores reclaim cost |
| Swap churn | per-session swap plus host swap-in/out rate | swap allocated does not prove active thrashing |
| I/O contention | read/write rates, I/O wait, I/O PSI | low CPU can look like an idle process |
| Process or worker explosion | descendants and task count over time | the root agent process remains small |
| External/provider wait | low local pressure plus network/provider state | a long-running process looks “stuck” but is not harming the host |
| Desktop compositor pressure | graphical-session metrics and GPU state | killing an agent may not fix the actual bottleneck |

A useful control plane therefore needs both utilization and **pressure/stall information**. Linux PSI (`cpu`, `memory`, and `io`) answers whether runnable work is being delayed, not merely how much resource has been allocated.

## Existing-tool assessment

No single evaluated tool currently joins Portagenty identity, session-level cgroup aggregation, child/subagent attribution, pressure metrics, and granular safe termination.

| Tool | Strong at | Missing for this use case |
|---|---|---|
| **KDE Plasma System Monitor** | graphical process trees, per-process metrics, signals, customizable pages, some GPU views | no Portagenty session identity; incomplete cgroup/scope-first navigation and attribution |
| **Cockpit** | browser-based host metrics and systemd unit management | adds a web/service boundary; no Portagenty or subagent model; must not be enabled merely for evaluation |
| **`systemd-cgls`** | authoritative cgroup hierarchy and process membership | terminal-only; not a historical resource dashboard; logical session labels depend on launch integration |
| **`systemd-cgtop`** | live cgroup CPU, memory, I/O, and task aggregation | terminal-only; limited logical identity and action semantics |
| **Mission Center** | approachable application/process and hardware GUI | application grouping is not the same as stable agent-session attribution |
| **Resources** | lightweight process/application resource GUI | does not provide the full session-to-cgroup ownership and control contract |

These are complementary candidates, not failed products. Plasma System Monitor may remain the best process-level GUI while systemd supplies authoritative workload grouping. The open question is whether an existing GUI can consume or expose the missing session binding cleanly enough to avoid a bespoke dashboard.

## Current Portagenty boundary

Portagenty already has a suitable logical starting point:

```text
SessionAddress {
  workspace_id,
  session_name
}
```

A workspace UUID plus exact declared session name is more stable than a PID, cwd, or sanitized multiplexer name. Today, however, Portagenty's live session model is intentionally narrow: it resolves multiplexer sessions and supports attach/create/kill lifecycle operations. It does not expose:

- root PID plus process start time;
- pidfd or another reuse-safe process handle;
- process group ID or POSIX session ID;
- systemd unit and cgroup path;
- child/subagent hierarchy;
- resource snapshots or pressure events;
- attribution source and confidence.

As a result, Portagenty can target an entire multiplexer session but cannot prove which smaller descendant represents one subagent, build, search, or tool invocation. Multiplexer destruction is therefore a wide fallback, not granular supervision.

## Minimal identity and observation model

### Resolved session

```text
ResolvedSession {
  address,
  workspace,
  multiplexer,
  backend_target,
  live_state,
  capabilities
}
```

This record says where the logical session is and what the current backend can do. It should not pretend that attachability implies process attribution.

### Supervision binding

```text
SupervisionBinding {
  address,
  root_pid,
  root_start_time,
  pidfd?,
  process_group_id?,
  posix_session_id?,
  systemd_unit?,
  cgroup_path?,
  discovery_source,
  attribution_confidence,
  observed_at
}
```

The root PID alone is unsafe because Linux reuses PIDs. At minimum, every action must verify PID plus process start time; a pidfd is preferable when the implementation boundary permits it. A binding inferred after launch should carry lower confidence than one created atomically with the process or systemd scope.

### Workload tree

The UI should distinguish identities rather than flattening every descendant into “Claude”:

```text
logical session
  ├─ root agent process
  ├─ subagent or delegated worker
  ├─ tool invocation
  ├─ build/test process group
  └─ unrelated or unclassified descendant
```

Command-name matching is not sufficient proof. A process may change names, exec another program, fork a long-lived daemon, or be reparented. Classification should retain its evidence and confidence rather than silently asserting ownership.

### Resource snapshot

```text
ResourceSnapshot {
  cpu_usage,
  cpu_pressure,
  memory_current,
  resident_memory,
  memory_events,
  memory_pressure,
  swap_current,
  io_read,
  io_write,
  io_pressure,
  task_count,
  sampled_at
}
```

Useful views need:

- current value and recent trend;
- logical-session aggregate and expandable process tree;
- host total for context;
- soft-threshold events before the desktop becomes unusable;
- clear differentiation between resource pressure and an agent merely waiting.

GPU utilization and VRAM are optional backend-specific metrics. GPU accounting does not automatically follow cgroup ownership, and cloud-model agent sessions may use little or no local GPU. The UI must show incomplete attribution honestly.

## Granular action ladder

Control should widen only when a narrower action is unavailable or ineffective:

1. **Request an agent/provider interrupt** through its supported control channel.
2. **Stop one positively attributed child or subagent subtree** after revalidating identity.
3. **Signal the selected process group** so a tool and its children terminate together.
4. **Stop the per-session systemd scope or cgroup** when the full logical workload must end.
5. **Destroy the multiplexer session** only as the widest final action.

Each layer should separate:

- graceful interruption or `SIGTERM`;
- timed escalation;
- forceful `SIGKILL` or cgroup kill.

Before any destructive action, the implementation must:

- revalidate PID plus start time or use a reuse-safe handle;
- show the exact logical session and target breadth;
- show whether descendants outside the selected target will survive;
- require explicit confirmation when widening from child to process group, scope, or multiplexer;
- return a receipt that states what was actually signaled and what remained.

A GUI that offers only a large “Kill session” button would reproduce the current gap with better styling.

## Possible UI shape

A proportionate first UI would be a local session dashboard rather than a full observability platform:

```text
Session                State      CPU   Memory   Swap   I/O PSI   Tasks
workspace / agent      active     ...   ...      ...    ...       ...
  root agent
  delegated worker
  current build
workspace / review     waiting    ...   ...      ...    ...       ...
```

Selecting a row would show:

- Portagenty logical address and redacted display label;
- attribution evidence and confidence;
- systemd scope/cgroup and process tree;
- recent pressure trend;
- supported control actions ordered from narrowest to widest.

The presentation layer should consume a narrow local API or existing system interface. It should not become the authority for sessions, process identity, or policy.

## Ownership questions before implementation

1. **Who creates the scope?** Portagenty could launch into a scope, or a separate containment layer could publish a binding after launch. Atomic launch-time ownership is stronger; separation of responsibilities may be easier to maintain.
2. **Who classifies descendants?** The kernel/cgroup hierarchy provides membership, but identifying one delegated worker versus a generic tool may require provider lifecycle events.
3. **Who owns control actions?** A GUI should call a narrow same-user control interface rather than synthesizing shell commands from labels.
4. **How are detached and resumed sessions handled?** Multiplexer reconnects must not create duplicate logical sessions or stale bindings.
5. **What survives a crash?** Receipts and bindings need enough persisted identity to reject stale PIDs after restart without retaining sensitive command content.

## Research gates

Do not move this to an adopted pattern until evidence covers:

- launch-time binding from logical session to systemd scope/cgroup;
- fork, exec, reparenting, detachment, resume, and PID-reuse behavior;
- attribution of delegated workers and long-running tools;
- graceful versus forceful termination at each target level;
- pressure reporting that correlates with an intentionally constrained synthetic workload;
- existing-GUI extensibility before choosing a custom frontend;
- behavior when systemd user scopes or a supported multiplexer capability are unavailable;
- rollback and recovery after a control action targets less or more than intended.

All empirical termination tests require a separate owner-approved maintenance exercise using synthetic sessions. Observation comes first.

## Privacy and trust boundary

A portable control plane should default to:

- local-only, same-user process observation;
- no new listener, remote access, telemetry, or relay persistence;
- redacted labels instead of absolute cwd paths or personal workspace names;
- aggregate metrics without prompts, transcript content, environment variables, or complete command lines;
- owner-only state and receipts without secrets;
- explicit disclosure when a GUI or mobile surface introduces another service or metadata path;
- confirmation before destructive operations and an audit record of target breadth, not private content.

Session names and workspace UUIDs can still be identifying metadata. They should be treated as sensitive when logs, screenshots, or remote views leave the workstation.

## Current conclusion

The problem is large enough to deserve its own control-plane track, but the next step is not “build a GUI.” The correct sequence is:

1. establish stable session-to-workload identity;
2. prove cgroup/process attribution and pressure metrics;
3. define the safe action ladder;
4. evaluate whether an existing GUI can present and invoke that model;
5. build a narrow frontend only if the remaining gap is repeated and material.

Portagenty is a plausible identity and session-control substrate. systemd cgroup v2 is a plausible Linux workload substrate. Neither currently provides the complete experience alone.

## See also

- [Parallel Agent Coordination — Findings from the Fan-Out Research Pass](./2026-04-25-parallel-agent-coordination-findings.md)
- [02 · Terminal & Session Management](../../../02-stack/02-terminal/index.md)
- [06 · Dev Infra](../../../02-stack/06-dev-infra/index.md)
- [systemd control-group interfaces](https://systemd.io/CONTROL_GROUP_INTERFACE/)
- [Linux pressure stall information](https://docs.kernel.org/accounting/psi.html)
- [Linux cgroup v2](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html)
- [KDE Plasma System Monitor](https://invent.kde.org/plasma/plasma-systemmonitor)
- [Cockpit systemd integration](https://cockpit-project.org/guide/latest/feature-systemd)
- [Mission Center](https://gitlab.com/mission-center-devs/mission-center)
- [Resources](https://github.com/nokyan/resources)
