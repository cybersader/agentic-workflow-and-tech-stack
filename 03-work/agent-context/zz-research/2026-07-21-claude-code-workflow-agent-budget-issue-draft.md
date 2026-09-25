---
title: Claude Code Workflow agent-budget issue draft
description: Sanitized upstream issue draft showing that Workflow-internal agent calls do not pass through a blocking Agent PreToolUse boundary and have no configurable runtime maximum.
stratum: 5
status: research
date: 2026-07-21
upstream: https://github.com/anthropics/claude-code/issues/79953
tags:
  - upstream
  - claude-code
  - workflow
  - hooks
  - delegation
---

> [!success] Published upstream
> [anthropics/claude-code#79953](https://github.com/anthropics/claude-code/issues/79953) — published 2026-07-21 after a final identifier scan, duplicate search, documentation check, and explicit human approval.

## Proposed title

**Workflow-internal `agent()` calls are not subject to blocking Agent PreToolUse hooks or a configurable runtime budget**

## Issue body

### Summary

A `PreToolUse` hook matching `Agent|Workflow` can block a direct Agent call or the outer Workflow invocation, but it cannot enforce a cumulative agent limit inside an admitted Workflow.

The hook runs once for the outer Workflow. Internal `agent()` calls scheduled by the Workflow runtime do not generate additional blocking `PreToolUse` events visible to the parent guard. A single admitted Workflow can therefore create substantially more agents than a local Agent cap permits.

Claude Code exposes a `SubagentStart` hook, but the [hooks documentation](https://code.claude.com/docs/en/hooks) describes it as non-blocking: exit code 2 reports an error while the subagent proceeds. It therefore cannot be used as a pre-spawn quota boundary.

### Environment

- Claude Code: 2.1.216
- Platform: Linux / WSL2
- Workflow feature enabled
- Command-type `PreToolUse` hook with matcher `Agent|Workflow`

### Minimal hook

`~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Agent|Workflow",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/scripts/count-agent-events.py"
          }
        ]
      }
    ]
  }
}
```

`~/.claude/scripts/count-agent-events.py`:

```python
#!/usr/bin/env python3
import json
import sys

payload = json.load(sys.stdin)
with open("/tmp/agent-hook-events.jsonl", "a", encoding="utf-8") as handle:
    handle.write(json.dumps({
        "tool_name": payload.get("tool_name"),
        "tool_use_id": payload.get("tool_use_id"),
    }) + "\n")
```

### Minimal Workflow

```javascript
export const meta = {
  name: 'agent-hook-repro',
  description: 'Demonstrate Workflow-internal agent hook behavior',
  phases: [{ title: 'Reproduce', detail: 'Schedule five small agents' }],
}

phase('Reproduce')
const results = await parallel(
  Array.from({ length: 5 }, (_, index) => () =>
    agent(`Return the number ${index}.`, { label: `worker-${index}` })
  )
)
return results
```

Run it through `Workflow({scriptPath: "/absolute/path/to/repro.js"})`.

### Actual behavior

The parent hook records the outer `Workflow` invocation, but not five blocking `Agent` PreToolUse events corresponding to the internal `agent()` calls. A guard that admits the outer Workflow while fewer than N historical agent receipts exist cannot stop the Workflow when it crosses N internally.

Transcript files and progress telemetry may show the agents after they have started or completed, but that is retrospective accounting rather than admission control. Concurrent Workflow launches can also pass the same preflight count before either has materialized agent receipts.

### Expected behavior

Claude Code should provide at least one enforceable runtime boundary for Workflow fan-out:

1. A `maxAgents`/agent-budget argument enforced by the Workflow runtime, including retries; or
2. A blocking pre-spawn hook for each Workflow-internal `agent()` call.

The runtime should reject call N+1 before allocating it.

### Impact

- User-defined Agent caps cannot constrain bundled, third-party, named, or inline Workflows.
- Data-dependent fan-out can create unexpected usage, cost, concurrency, and host-resource pressure.
- A status display or transcript count may reveal the overrun only after it is already in progress.
- Permission bypass settings are not the cause; command hooks still run, but at the wrong lifecycle boundary for nested Workflow agents.

### Requested improvements

- Add a runtime-enforced `maxAgents` field to Workflow invocations and/or workflow metadata.
- Count all internal agent attempts, including structured-output retries and replacement attempts.
- Add a blocking `PreSubagentStart` event, or make a documented pre-start decision available before allocation.
- Include parent Workflow run ID and parent tool-use ID in nested lifecycle events.
- Make agent-budget accounting atomic across simultaneous workflows in one session.
- Surface the declared maximum before launch and stop scheduling when it is exhausted.
- Document whether Workflow-internal agents emit `SubagentStart`/`SubagentStop`, and clarify that `SubagentStart` cannot block.

### Current workaround

The local workaround is intentionally restrictive:

- Deny named and inline Workflows.
- Deny resumed and unknown `scriptPath` Workflows.
- Allow only exact hash-registered scripts.
- Reserve each trusted script's full declared maximum before launch under an atomic lock.
- Require the trusted script to route every `agent()` call through its own budget wrapper.
- Avoid schema-driven retry paths when a strict physical-agent maximum matters.

This reduces exposure for audited local workflows but cannot provide a general hard cap for arbitrary Workflow code. Runtime enforcement belongs in Claude Code.

### Additional notes

`PostToolUse`, transcript counting, and `SubagentStop` are not substitutes for admission control: by those points the agent has already been allocated. `SubagentStop` can keep an existing agent working, not prevent its creation.

## Publication record

- [x] Failure mode confirmed from captured Workflow and hook receipts on Claude Code 2.1.216.
- [x] Current CLI version at filing recorded as 2.1.217 without claiming a fresh runtime reproduction.
- [x] Current hooks documentation reconfirmed that `SubagentStart` cannot block and exit code 2 does not prevent startup.
- [x] `anthropics/claude-code` searched again for a matching issue; none found.
- [x] Automated scan found no personal names, project names, local absolute paths, private-network addresses, emails, transcript IDs, or tool/run IDs.
- [x] Published body contains only the synthetic five-agent example and generic paths—no personal transcript or screenshot.
- [x] Explicit human approval received before publication.

Published: [anthropics/claude-code#79953](https://github.com/anthropics/claude-code/issues/79953)
