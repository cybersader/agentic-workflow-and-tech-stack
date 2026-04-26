---
stratum: 2
name: inter-agent-messaging
description: Filesystem-based message passing for agent communication. Use when user asks about agent messaging, inbox/outbox, how agents talk to each other, multi-agent workflows, agent coordination, passing data between agents, agent handoffs, or working around the subagent spawn constraint. Also triggers on "how do I use messaging", "send message to agent", "agent communication".
branches: [agentic]
---

# Inter-Agent Messaging

## Quick Start - How to Use This

**Check inbox status:**
```
/workflow-dispatch status
```

**Send a message to an agent:**
```
/workflow-dispatch send skill-writer "Create a skill for Python testing"
```

**Process pending messages:**
```
/workflow-dispatch poll
```

**That's it!** The `/workflow-dispatch` command handles everything. See below for how it works.

---

## Purpose
Defines a filesystem-based message passing pattern for agent communication in Claude Code, where agents CANNOT spawn other agents directly.

---

## Critical: Same Agents, Communication Layer

**This pattern does NOT create new agents.** It adds a communication layer for EXISTING agents.

| Agent (TAB/SHIFT+TAB) | Its Mailbox |
|-----------------------|-------------|
| `skill-writer` | `.claude/inboxes/skill-writer/` |
| `explore` | `.claude/inboxes/explore/` |

The inbox is WHERE an agent looks for work. The agent is still spawned via Task tool.

**Agents don't "watch" their inboxes** - the orchestrator polls and spawns them.

---

## Quick Reference

| Concept | Rule |
|---------|------|
| Inboxes | Capture area where messages enter for an agent |
| Outboxes | Output area where completed responses go |
| Shared | Work area for shared state/context |
| Status | `pending` -> `in_progress` -> `completed` |
| Orchestrator | Command or main context that polls and dispatches |

---

## Why This Pattern?

In Claude Code, agents cannot spawn other agents. This creates a coordination problem:

```
Agent A needs Agent B's analysis
      |
      v
Agent A CANNOT invoke Agent B
      |
      v
??? How do they communicate ???
```

**Solution:** Filesystem-based message passing with an orchestrating layer.

```
Agent A writes request -> Inbox for B
         |
Orchestrator polls -> sees pending message
         |
Orchestrator spawns Agent B -> reads inbox
         |
Agent B writes response -> Outbox
         |
Orchestrator routes -> back to Agent A or next step
```

---

## Folder Structure (SEACOW Aligned)

```
.claude/
├── inboxes/                    # CAPTURE - messages enter here
│   ├── skill-writer/           # Inbox per agent
│   │   └── 2025-01-01-001.md
│   ├── explore/
│   └── workflow-improver/
│
├── outboxes/                   # OUTPUT - completed responses
│   ├── skill-writer/
│   │   └── 2025-01-01-001-response.md
│   └── explore/
│
└── shared/                     # WORK - shared context/state
    ├── session-context.md      # Current session state
    └── workflow-state.md       # Multi-step workflow state
```

### SEACOW Mapping

| Folder | SEACOW Activity | Purpose |
|--------|-----------------|---------|
| `inboxes/` | Capture | Where requests enter the system |
| `outboxes/` | Output | Where responses exit to consumers |
| `shared/` | Work | Where shared state is processed |

---

## Message Format

### Request Message (Inbox)

```yaml
---
id: 2025-01-01-001
from: explore
to: skill-writer
priority: normal           # low | normal | high | urgent
status: pending            # pending | in_progress | completed | failed
created: 2025-01-01T12:00:00Z
context: "Creating skill from exploration findings"
workflow: create-skill-from-research
step: 2
---

## Request

Create a new skill based on the following exploration findings.

## Payload

[Content from previous agent or user]

## Expected Output

- Skill file created at appropriate location
- Summary of what was created

## References

- `.claude/outboxes/explore/2025-01-01-001-response.md`
```

### Response Message (Outbox)

```yaml
---
id: 2025-01-01-001-response
request_id: 2025-01-01-001
from: skill-writer
to: explore
status: completed
created: 2025-01-01T12:05:00Z
duration_seconds: 45
---

## Summary

Created skill `python-testing` at `.claude/skills/python-testing/SKILL.md`.

## Result

[Detailed output]

## Files Created

- `/path/to/skill/SKILL.md`

## Recommendations

[Next steps if any]
```

---

## Frontmatter Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (timestamp + sequence) |
| `from` | string | Sending agent name |
| `to` | string | Receiving agent name |
| `status` | enum | `pending`, `in_progress`, `completed`, `failed` |
| `created` | ISO8601 | Creation timestamp |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `priority` | enum | `low`, `normal`, `high`, `urgent` |
| `context` | string | Brief context for the request |
| `workflow` | string | Parent workflow identifier |
| `step` | number | Step number in workflow |
| `request_id` | string | (responses) Links to original request |
| `duration_seconds` | number | (responses) Processing time |
| `error` | string | (failed) Error description |

---

## Orchestration Pattern

The orchestrator (command or main context) manages the message flow:

### Polling Logic

```markdown
## Orchestrator Poll Cycle

1. **Scan inboxes** for `status: pending` messages
2. **Sort by priority** (urgent > high > normal > low)
3. **For each pending message:**
   a. Update status to `in_progress`
   b. Spawn the target agent with message content
   c. Agent reads inbox, processes, writes to outbox
   d. Update inbox status to `completed`
4. **Check outboxes** for completed responses
5. **Route responses** to next step or requesting agent
```

### Command Implementation Example

```markdown
## /workflow-dispatch Command

1. Glob `.claude/inboxes/**/` for pending messages
2. Parse frontmatter, sort by priority
3. For highest priority pending:
   - Read message content
   - Spawn target agent with content as context
   - Wait for agent completion
   - Check outbox for response
   - Update statuses
4. Report results
```

---

## Example Workflow

### Scenario: Research -> Skill Creation

```
User: "Research Python testing patterns and create a skill"

Step 1: Command spawns Explore agent
        |
        v
Explore agent researches, writes to skill-writer inbox:
        .claude/inboxes/skill-writer/2025-01-01-001.md
        status: pending
        |
        v
Step 2: Command sees pending message
        Command spawns skill-writer agent
        |
        v
Skill-writer reads inbox, creates skill, writes to outbox:
        .claude/outboxes/skill-writer/2025-01-01-001-response.md
        status: completed
        |
        v
Step 3: Command reads outbox, reports to user
```

### Message Flow Diagram

```
User Request
    |
    v
+-------------------+
|   COMMAND         |  (Orchestrator - has conversation context)
+-------------------+
    |
    | spawns
    v
+-------------------+       writes       +---------------------------+
|   EXPLORE AGENT   | -----------------> | inboxes/skill-writer/     |
+-------------------+                    | 2025-01-01-001.md         |
    |                                    | status: pending           |
    | returns                            +---------------------------+
    v                                              |
+-------------------+                              |
|   COMMAND         |  polls, sees pending         |
+-------------------+ <----------------------------+
    |
    | spawns
    v
+-------------------+       reads        +---------------------------+
|  SKILL-WRITER     | <----------------- | inboxes/skill-writer/     |
|     AGENT         |                    | 2025-01-01-001.md         |
+-------------------+                    +---------------------------+
    |
    | writes
    v
+-------------------+                    +---------------------------+
| outboxes/         | -----------------> | skill-writer/             |
| skill-writer/     |                    | 2025-01-01-001-response.md|
+-------------------+                    | status: completed         |
    |                                    +---------------------------+
    | returns
    v
+-------------------+
|   COMMAND         |  reads outbox, reports to user
+-------------------+
```

---

## Shared State Pattern

For workflows needing shared context across agents:

### Session Context

```yaml
# .claude/shared/session-context.md
---
session_id: 2025-01-01-session-001
started: 2025-01-01T10:00:00Z
user_goal: "Set up Python testing infrastructure"
agents_invoked:
  - explore (completed)
  - skill-writer (in_progress)
---

## Current State

[Accumulated context from all agents]

## Decisions Made

- Using pytest over unittest
- Fixtures for database mocking

## Open Questions

- Coverage threshold?
```

### Workflow State

```yaml
# .claude/shared/workflow-state.md
---
workflow_id: create-skill-from-research
status: in_progress
current_step: 2
total_steps: 3
---

## Steps

1. [x] Explore: Research Python testing patterns
2. [ ] Skill-Writer: Create skill from findings
3. [ ] Validator: Test skill activation

## Accumulated Results

[Summary from each completed step]
```

---

## Implementation Checklist

### Setting Up

1. Create folder structure:
   ```
   mkdir -p .claude/inboxes .claude/outboxes .claude/shared
   ```

2. Create agent-specific inboxes as needed:
   ```
   mkdir -p .claude/inboxes/skill-writer
   mkdir -p .claude/inboxes/explore
   ```

3. Add to `.gitignore` (optional - messages are ephemeral):
   ```
   .claude/inboxes/
   .claude/outboxes/
   .claude/shared/
   ```

### Agent Integration

Agents that participate in messaging should:

1. **Check inbox on start** (if designed to receive messages)
2. **Write to target inbox** when needing another agent
3. **Write to outbox** when completing a request
4. **Update status fields** appropriately

### Orchestrator Commands

Create commands that:

1. Poll inboxes for pending messages
2. Dispatch to appropriate agents
3. Track workflow state
4. Clean up completed messages

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Expect agents to read each other's outboxes directly | Route through orchestrator |
| Skip status updates | Always update `status` field |
| Use messages for real-time communication | Use for async handoffs only |
| Store sensitive data in messages | Keep credentials in secure config |
| Let messages accumulate | Clean up completed workflows |
| Assume message order | Use explicit `step` numbers |

---

## When to Use This Pattern

**Good Use Cases:**
- Multi-agent workflows with distinct phases
- Long-running processes with handoffs
- Workflows where one agent's output feeds another
- Audit trails of agent interactions

**Not Needed When:**
- Single agent can handle the task
- Simple exploration without handoffs
- Direct user interaction (no agent-to-agent)

---

## Related Skills

- `agent-patterns` -- How to design agents that use messaging
- `seacow-conventions` -- SEACOW framework underlying the folder structure
- `workflow-guide` -- How workflows compose in this scaffold
