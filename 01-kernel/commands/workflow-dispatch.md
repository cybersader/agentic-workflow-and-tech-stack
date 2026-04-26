---
stratum: 3
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
argument-hint: "[action: poll|status|cleanup|send]"
branches: [agentic]
---

# Workflow Dispatch

Orchestrate inter-agent messaging by polling inboxes, dispatching work, and managing message lifecycle.

## Quick Reference

| Action | What It Does |
|--------|--------------|
| `/workflow-dispatch poll` | Check inboxes, dispatch pending messages to agents |
| `/workflow-dispatch status` | Show current message state across all inboxes/outboxes |
| `/workflow-dispatch cleanup` | Archive completed message chains |
| `/workflow-dispatch send <agent> "<message>"` | Write a new message to an agent's inbox |

---

## Process

### Action: poll (default)

Scan inboxes for pending messages and dispatch to appropriate agents.

**Step 1: Scan Inboxes**

```
Glob: .claude/inboxes/**/*.md
Filter: files with status: pending in frontmatter
Sort: by priority (urgent > high > normal > low), then by created date
```

**Step 2: For Each Pending Message**

1. Read message content and frontmatter
2. Update status to `in_progress`
3. Spawn target agent with message as context:
   ```
   Task agent: [to field from message]
   Prompt: "Process this inbox message: [message content]"
   ```
4. Wait for agent completion
5. Check if agent wrote to outbox
6. Update inbox message status to `completed`

**Step 3: Report Results**

```markdown
## Dispatch Complete

### Messages Processed
| From | To | Status | Duration |
|------|----|---------| ---------|
| explore | skill-writer | completed | 45s |
| user | workflow-improver | completed | 30s |

### Responses Available
- `.claude/outboxes/skill-writer/2025-01-01-001-response.md`
- `.claude/outboxes/workflow-improver/2025-01-01-002-response.md`

### Still Pending
[None or list of messages that couldn't be processed]
```

---

### Action: status

Show current state of all messages without processing.

**Step 1: Scan All Directories**

```
Glob: .claude/inboxes/**/*.md
Glob: .claude/outboxes/**/*.md
Glob: .claude/shared/*.md
```

**Step 2: Parse and Summarize**

```markdown
## Message Status

### Inboxes
| Agent | Pending | In Progress | Completed |
|-------|---------|-------------|-----------|
| skill-writer | 2 | 0 | 5 |
| explore | 0 | 1 | 3 |
| workflow-improver | 1 | 0 | 2 |

### Recent Messages (Last 5)
| ID | From → To | Status | Age |
|----|-----------|--------|-----|
| 2025-01-01-003 | explore → skill-writer | pending | 5m |
| 2025-01-01-002 | user → explore | completed | 1h |
| 2025-01-01-001 | skill-writer → user | completed | 2h |

### Shared State
- `session-context.md` - Last updated: 2h ago
- `workflow-state.md` - Workflow: create-skill | Step 2/3

### Actions Available
- `/workflow-dispatch poll` - Process 3 pending messages
- `/workflow-dispatch cleanup` - Archive 10 completed messages
```

---

### Action: cleanup

Archive completed message chains to reduce clutter.

**Step 1: Find Completed Chains**

A chain is complete when:
- Inbox message has `status: completed`
- Corresponding outbox response exists with `status: completed`
- No dependent messages reference this chain

**Step 2: Move to Archive**

```
.claude/inboxes/agent/message.md → .claude/archive/inboxes/agent/message.md
.claude/outboxes/agent/response.md → .claude/archive/outboxes/agent/response.md
```

**Step 3: Report**

```markdown
## Cleanup Complete

### Archived
- 5 inbox messages
- 5 outbox responses

### Preserved
- 2 pending messages (not yet processed)
- 1 in-progress chain (still active)

### Archive Location
`.claude/archive/` (can be deleted or committed for history)
```

---

### Action: send

Create a new message in an agent's inbox.

**Usage:** `/workflow-dispatch send <agent> "<message>"`

**Example:** `/workflow-dispatch send skill-writer "Create a skill for Python testing patterns"`

**Step 1: Generate Message ID**

Format: `YYYY-MM-DD-NNN` where NNN is sequence number for that day

**Step 2: Create Message File**

```yaml
---
id: 2025-01-01-001
from: user
to: skill-writer
priority: normal
status: pending
created: 2025-01-01T12:00:00Z
context: "User-initiated request"
---

## Request

[User's message content]

## Expected Output

Response in outbox with results of processing this request.
```

**Step 3: Confirm**

```markdown
## Message Sent

Created: `.claude/inboxes/skill-writer/2025-01-01-001.md`

To process immediately: `/workflow-dispatch poll`
To check status: `/workflow-dispatch status`
```

---

## Message Frontmatter Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (YYYY-MM-DD-NNN) |
| `from` | string | Sending agent or "user" |
| `to` | string | Target agent name |
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
| `error` | string | (failed) Error description |

---

## Agent Integration

When spawning agents to process messages, include these instructions:

```
You are processing a message from the inter-agent messaging inbox.

1. Read the message content carefully
2. Perform the requested work
3. Write your response to your outbox:
   - File: .claude/outboxes/[your-name]/[request_id]-response.md
   - Include: request_id, from (you), to (original sender), status: completed
4. Return a summary of what you did
```

---

## Workflow Chaining

For multi-step workflows, messages can specify continuation:

```yaml
---
id: 2025-01-01-001
from: user
to: explore
workflow: research-and-create-skill
step: 1
---

## Request

Research Python testing patterns in the codebase.

## Next Step

After completing, send findings to skill-writer:
- to: skill-writer
- workflow: research-and-create-skill
- step: 2
- Include your findings in the payload
```

The dispatched agent can then write to the next agent's inbox to continue the chain.

---

## Examples

### Example: Simple Dispatch Cycle

```
User: /workflow-dispatch poll

AI: Scanning inboxes...

Found 2 pending messages:
1. skill-writer: "Create Python testing skill" (from: explore)
2. workflow-improver: "Check for improvement opportunities" (from: user)

Processing message 1...
[Spawns skill-writer agent]
Agent completed. Response in outbox.

Processing message 2...
[Spawns workflow-improver agent]
Agent completed. Response in outbox.

## Dispatch Complete

### Messages Processed
| From | To | Status | Duration |
|------|----|---------| ---------|
| explore | skill-writer | completed | 45s |
| user | workflow-improver | completed | 30s |

All pending messages processed.
```

### Example: Send and Process

```
User: /workflow-dispatch send explore "Find all API endpoints in the codebase"

AI: ## Message Sent

Created: `.claude/inboxes/explore/2025-01-01-001.md`

User: /workflow-dispatch poll

AI: Processing message to explore agent...
[Spawns explore agent with message]

## Dispatch Complete

Response available: `.claude/outboxes/explore/2025-01-01-001-response.md`

Would you like me to show the response?
```

### Example: Status Check

```
User: /workflow-dispatch status

AI: ## Message Status

### Inboxes
| Agent | Pending | In Progress | Completed |
|-------|---------|-------------|-----------|
| skill-writer | 0 | 0 | 3 |
| explore | 1 | 0 | 5 |
| workflow-improver | 0 | 0 | 2 |

### Recent Messages (Last 5)
| ID | From → To | Status | Age |
|----|-----------|--------|-----|
| 2025-01-01-006 | user → explore | pending | 2m |
| 2025-01-01-005 | explore → skill-writer | completed | 1h |
| ... | ... | ... | ... |

1 message pending. Run `/workflow-dispatch poll` to process.
```

---

## Important Notes

- **Orchestrator role** - This command IS the orchestrator; agents return here
- **Sequential by default** - Process one message at a time for predictability
- **Status tracking** - Always update message status through lifecycle
- **Error handling** - Mark failed messages with `status: failed` and `error` field
- **Audit trail** - Messages provide complete history of agent interactions

---

## Related

- `.claude/skills/inter-agent-messaging/SKILL.md` - Full pattern documentation
- `research/learnings/2025-12-31-inter-agent-messaging.md` - Deep dive
- `AGENTS.md` - Agent definitions and capabilities
