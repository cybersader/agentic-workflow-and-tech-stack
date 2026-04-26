---
created: 2025-12-31
updated: 2025-12-31
tags:
  - research
  - agents
  - claude-code
  - messaging
  - architecture
  - seacow
  - learned
  - patterns
---

# Inter-Agent Messaging: Filesystem-Based Communication for AI Agents

**Source:** Original pattern developed while working with Claude Code limitations. Inspired by actor model, message queues, and Unix philosophy.

## Critical Clarification: Same Agents, New Communication Layer

**Inter-agent messaging does NOT create new agents.** It creates a communication layer for EXISTING agents.

| What You See in UI | What Inbox/Outbox Is |
|--------------------|----------------------|
| `skill-writer` agent (SHIFT+TAB) | Same agent, `inboxes/skill-writer/` is its mailbox |
| `explore` agent (Task tool) | Same agent, `inboxes/explore/` is its mailbox |
| `Plan` agent (built-in) | Same agent, could have `inboxes/plan/` |

```
┌─────────────────────────────────────────────────────────────────┐
│  THE RELATIONSHIP                                                │
│                                                                  │
│  Agent Definition          Communication Channel                 │
│  (.claude/agents/foo.md)   (.claude/inboxes/foo/)               │
│           │                         │                            │
│           └─────── SAME AGENT ──────┘                            │
│                                                                  │
│  The inbox is WHERE the agent looks for work                     │
│  The agent is still spawned via Task tool / UI                   │
│  The orchestrator routes messages TO agents                      │
└─────────────────────────────────────────────────────────────────┘
```

**Agents don't "watch" their inboxes.** The orchestrator:
1. Polls inboxes for pending messages
2. Spawns the target agent (same as always)
3. Points the agent to its inbox message
4. Agent processes and writes to outbox
5. Orchestrator reads outbox and routes next

---

## The Complete Taxonomy

How skills, agents, commands, and messaging fit together:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLAUDE CODE COMPONENTS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SKILLS (.claude/skills/)                                                │
│  ├── Load INTO agent's context (same conversation)                       │
│  ├── Provide domain knowledge, conventions, patterns                     │
│  └── Triggered by description keywords                                   │
│                                                                          │
│  AGENTS (.claude/agents/)                                                │
│  ├── Spawn in FRESH context (new conversation)                           │
│  ├── Do focused work, return summary                                     │
│  ├── Invoked via Task tool, SHIFT+TAB, or commands                       │
│  └── CAN'T spawn other agents (fundamental constraint)                   │
│                                                                          │
│  COMMANDS (.claude/commands/)                                            │
│  ├── Orchestrate multi-step workflows                                    │
│  ├── CAN spawn agents sequentially                                       │
│  ├── Maintain conversation context across agent calls                    │
│  └── The "glue" for multi-agent work                                     │
│                                                                          │
│  INTER-AGENT MESSAGING (.claude/inboxes/, outboxes/, shared/)            │
│  ├── Communication LAYER for the above agents                            │
│  ├── Persistent (filesystem), auditable (git)                            │
│  ├── Orchestrator polls → spawns agent → agent reads inbox               │
│  └── Use for complex chains, not simple handoffs                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### How Components Relate

```
    ┌──────────┐
    │  SKILL   │ ──── loads into ────► Agent or Main Context
    └──────────┘                       (same conversation)

    ┌──────────┐
    │  AGENT   │ ──── spawned by ────► Command or Main Context
    └──────────┘                       (fresh conversation)
         │
         │ can read/write
         ▼
    ┌──────────┐
    │  INBOX   │ ──── polled by ────► Orchestrator (Command)
    │  OUTBOX  │                       who spawns next agent
    └──────────┘
```

### When to Use What

| You Want To... | Use This |
|----------------|----------|
| Add knowledge to current context | **Skill** |
| Do focused work in fresh context | **Agent** (direct) |
| Chain multiple agents together | **Command** (orchestrates) |
| Complex multi-agent with persistence | **Command + Messaging** |
| Pass structured data between agents | **Messaging** (inboxes/outboxes) |
| Simple A → B handoff | **Direct return** (no messaging needed) |

### The Key Insight

**Messaging is optional infrastructure, not a replacement for agents.**

```
WITHOUT MESSAGING (fine for most cases):
  Command → Agent A returns → Command → Agent B returns → done

WITH MESSAGING (for complex/persistent workflows):
  Command → Agent A writes inbox → Command polls → Agent B reads inbox → writes outbox → Command reads → done
```

The agents are identical. Messaging just gives them a structured way to pass notes.

---

## The Core Problem

In Claude Code (and many AI coding tools), **agents cannot spawn other agents**. This is a fundamental architectural constraint:

```
┌─────────────────────────────────────────────────────────────┐
│  WHAT CAN INVOKE WHAT                                        │
├─────────────────────────────────────────────────────────────┤
│  Command → Agent     ✓  (Commands orchestrate)              │
│  Agent → Skill       ✓  (Skills load into agent context)    │
│  Agent → MCP         ✓  (External tools allowed)            │
│  Agent → Agent       ✗  (TERMINATES - cannot spawn)         │
└─────────────────────────────────────────────────────────────┘
```

This creates a coordination problem: How do you build workflows where multiple specialist agents need to collaborate?

### Why This Constraint Exists

1. **Context isolation** - Each agent has its own context window; spawning would create unbounded context growth
2. **Control flow** - Preventing recursive agent spawning avoids infinite loops and runaway processes
3. **Determinism** - Orchestration from a central point is more predictable
4. **Resource management** - Prevents exponential API call growth

---

## The Solution: Filesystem as Message Bus

Instead of direct agent-to-agent communication, use the filesystem as an asynchronous message passing system:

```
Agent A writes request → Inbox for Agent B
         ↓
Orchestrator polls → sees pending message
         ↓
Orchestrator spawns Agent B → reads inbox
         ↓
Agent B processes → writes to outbox
         ↓
Orchestrator routes → back to Agent A or next step
```

### Why Filesystem?

| Property | Benefit |
|----------|---------|
| **Persistent** | Messages survive process crashes, VS Code restarts |
| **Auditable** | Git history tracks all agent communication |
| **Human-readable** | Markdown with YAML frontmatter is inspectable |
| **Tool-agnostic** | Works with any AI tool that can read/write files |
| **No dependencies** | No message queue infrastructure needed |
| **Async by nature** | Agents don't block waiting for each other |

---

## SEACOW Alignment

The folder structure maps directly to SEACOW activities:

```
.claude/
├── inboxes/                    # CAPTURE - messages enter here
│   ├── skill-writer/
│   ├── explore/
│   └── workflow-improver/
│
├── outboxes/                   # OUTPUT - completed responses exit
│   ├── skill-writer/
│   └── explore/
│
└── shared/                     # WORK - shared state being processed
    ├── session-context.md
    └── workflow-state.md
```

| Folder | SEACOW Activity | Information Flow |
|--------|-----------------|------------------|
| `inboxes/` | **Capture** | Requests ENTER the system here |
| `outboxes/` | **Output** | Responses EXIT to consumers here |
| `shared/` | **Work** | Active state being PROCESSED |

### Why This Mapping Works

- **Inboxes as Capture**: Just like a physical inbox, this is where new work arrives. An agent's inbox is its capture zone.
- **Outboxes as Output**: Completed work is delivered here for consumption by the orchestrator or other agents.
- **Shared as Work**: Active session state, workflow progress, accumulated context - all the "work in progress" lives here.

---

## Message Format Design

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

### Frontmatter Schema

**Required Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (timestamp + sequence) |
| `from` | string | Sending agent name |
| `to` | string | Receiving agent name |
| `status` | enum | `pending`, `in_progress`, `completed`, `failed` |
| `created` | ISO8601 | Creation timestamp |

**Optional Fields:**

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

## Comparison to Other Patterns

### Actor Model

The actor model (Erlang, Akka) uses message passing between isolated actors:

| Aspect | Actor Model | Inter-Agent Messaging |
|--------|-------------|----------------------|
| **Messages** | In-memory, typed | Filesystem, Markdown |
| **Routing** | Actor addresses | Folder paths |
| **Persistence** | Optional (event sourcing) | Built-in (files) |
| **Concurrency** | Native | Orchestrator-managed |
| **Supervision** | Hierarchical supervisors | Orchestrating command |

**Key Difference:** Actor model is real-time; inter-agent messaging is batch/async.

### Message Queues (RabbitMQ, Kafka)

| Aspect | Message Queue | Inter-Agent Messaging |
|--------|---------------|----------------------|
| **Infrastructure** | Requires server | None (filesystem) |
| **Guarantees** | At-least-once, exactly-once | Best-effort |
| **Scaling** | Distributed | Single machine |
| **Visibility** | Dashboard tools | File browser, git |
| **Schema** | Protocol buffers, JSON | YAML frontmatter |

**Key Difference:** MQs are infrastructure; inter-agent messaging is convention.

### Unix Philosophy

Most similar to Unix pipes and files as IPC:

```bash
# Unix: program A outputs to file, program B reads
program_a > /tmp/output.txt
program_b < /tmp/output.txt

# Inter-agent: agent A writes to inbox, agent B reads
agent_a → .claude/inboxes/agent_b/message.md
agent_b ← .claude/inboxes/agent_b/message.md
```

**Key Similarity:** Everything is a file. Simple, debuggable, composable.

### Event Sourcing

| Aspect | Event Sourcing | Inter-Agent Messaging |
|--------|----------------|----------------------|
| **Storage** | Event log (append-only) | Inbox/outbox files |
| **State** | Derived from events | Explicit in `shared/` |
| **History** | Full replay possible | Git history |
| **Causality** | Event timestamps | `workflow` + `step` fields |

**Key Insight:** The `shared/workflow-state.md` file is essentially an event-sourced aggregate.

---

## Implementation Patterns

### The Orchestrator Pattern

The orchestrator (command or main context) manages all message routing:

```
┌─────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                            │
│  (Command with conversation context)                         │
├─────────────────────────────────────────────────────────────┤
│  1. Poll inboxes for status: pending                         │
│  2. Sort by priority (urgent > high > normal > low)          │
│  3. For each pending:                                        │
│     a. Update status → in_progress                           │
│     b. Spawn target agent                                    │
│     c. Agent reads inbox, processes, writes outbox           │
│     d. Update inbox status → completed                       │
│  4. Check outboxes for completed responses                   │
│  5. Route to next step or report to user                     │
└─────────────────────────────────────────────────────────────┘
```

### The Context Funneling Pattern

Each agent explores deeply in isolation, returns compressed results:

```
User Request: "Research and create a Python testing skill"
    │
    v
COMMAND (has full conversation context)
    │
    ├── Spawns EXPLORE agent
    │       │
    │       v
    │   Explores codebase, finds patterns
    │   Writes to inboxes/skill-writer/
    │   Returns: "Found 5 testing patterns, wrote request"
    │       │
    │       v
    ├── Returns to COMMAND
    │
    ├── Polls inboxes, finds pending message
    │
    ├── Spawns SKILL-WRITER agent
    │       │
    │       v
    │   Reads inbox, creates skill
    │   Writes to outboxes/skill-writer/
    │   Returns: "Created skill at path X"
    │       │
    │       v
    ├── Returns to COMMAND
    │
    v
COMMAND synthesizes: "Created Python testing skill based on 5 patterns found"
```

### The Shared State Pattern

For workflows needing accumulated context:

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

## Accumulated Context

[Summary from all agents so far]

## Decisions Made

- Using pytest over unittest
- Fixtures for database mocking

## Open Questions

- Coverage threshold?
```

---

## Workflow State Machine

Messages follow a clear state lifecycle:

```
              ┌─────────────┐
              │   CREATED   │
              └──────┬──────┘
                     │ write to inbox
                     v
              ┌─────────────┐
              │   PENDING   │◄────────────────┐
              └──────┬──────┘                 │
                     │ orchestrator picks up  │ retry on
                     v                        │ transient error
              ┌─────────────┐                 │
              │ IN_PROGRESS │─────────────────┘
              └──────┬──────┘
                     │
           ┌─────────┴─────────┐
           │                   │
           v                   v
    ┌─────────────┐     ┌─────────────┐
    │  COMPLETED  │     │   FAILED    │
    └─────────────┘     └─────────────┘
           │                   │
           v                   v
    Write to outbox     Write error to
                        inbox + outbox
```

---

## When to Use This Pattern

### Messaging vs Direct Returns

Most of the time, **you don't need inter-agent messaging**. Direct returns work fine:

```
# DIRECT RETURN (simpler, use this most of the time)
Command → spawns Explore → Explore returns "Found X, Y, Z"
        → Command has findings in memory
        → spawns Skill-Writer with findings as prompt

# MESSAGING (use for complex/persistent workflows)
Command → spawns Explore → Explore writes to inboxes/skill-writer/
        → Command polls, sees message
        → spawns Skill-Writer → reads inbox (structured data)
        → Skill-Writer writes to outboxes/
        → Command reads response
```

**Use direct returns when:**
- Single handoff (Agent A → Agent B)
- Findings fit in a prompt
- No need for persistence
- Simple "do X then Y" workflows

**Use messaging when:**
- Multiple agents in a chain (A → B → C → D)
- Structured data needs to pass between agents
- Workflow might be interrupted and resumed
- You want audit trail of all agent interactions
- Complex conditional routing (if X, send to A; else send to B)

### Good Use Cases

| Scenario | Why It Fits |
|----------|-------------|
| **Multi-agent workflows with distinct phases** | Each agent handles one phase, hands off cleanly |
| **Long-running processes with handoffs** | Persistence survives process interruptions |
| **Research → Creation pipelines** | Explore findings feed skill/agent creation |
| **Audit trails of agent interactions** | Git history captures all communication |
| **Complex refactoring across files** | Coordinate multiple specialist agents |
| **Workflows spanning multiple sessions** | Pick up where you left off via pending messages |

### Not Needed When

| Scenario | Why Not |
|----------|---------|
| **Single agent can handle the task** | Overhead not justified |
| **Simple exploration without handoffs** | No coordination needed |
| **Direct user interaction** | No agent-to-agent communication |
| **Real-time requirements** | Filesystem is too slow |
| **Simple A → B handoff** | Direct return is simpler |

---

## Limitations and Considerations

### Performance

- **Latency**: Filesystem I/O is slower than in-memory messaging
- **Polling**: Orchestrator must actively check for new messages
- **Not real-time**: Batch-oriented by design

### Complexity

- **Orchestrator burden**: Command/orchestrator becomes complex coordinator
- **Message schema**: Must maintain consistent frontmatter format
- **Cleanup**: Completed messages need archiving/deletion strategy

### Failure Modes

- **Orphaned messages**: Agent crashes before writing response
- **Duplicate processing**: Orchestrator restarts, reprocesses pending
- **Version conflicts**: Multiple agents modify shared state

### Mitigations

| Issue | Mitigation |
|-------|------------|
| Orphaned messages | Timeout + status check in orchestrator |
| Duplicate processing | Idempotent agent operations |
| Version conflicts | Optimistic locking via file modification timestamps |
| Message accumulation | Periodic cleanup command |

---

## Evolution Path

### Phase 1: Basic Implementation (Current)
- Manual folder creation
- Simple status tracking
- Single orchestrator

### Phase 2: Automation
- `/workflow-dispatch` command for polling
- `/message-write` helper for consistent formatting
- Auto-cleanup of completed workflows

### Phase 3: Enhanced Workflows
- Workflow templates (predefined multi-agent pipelines)
- Conditional routing (if X then agent A, else agent B)
- Parallel agent execution with fan-out/fan-in

### Phase 4: Cross-Tool Compatibility
- Portable message format works with OpenCode, Cursor, etc.
- Tool-specific adapters for native capabilities
- Shared inboxes across tools (when both read same filesystem)

### Phase 5: Observability
- Dashboard for message flow visualization
- Metrics on agent processing times
- Bottleneck identification

---

## Practical Setup

### Quick Start

```bash
# Create the folder structure
mkdir -p .claude/inboxes .claude/outboxes .claude/shared

# Create agent-specific inboxes
mkdir -p .claude/inboxes/skill-writer
mkdir -p .claude/inboxes/explore
mkdir -p .claude/inboxes/workflow-improver

# Create matching outboxes
mkdir -p .claude/outboxes/skill-writer
mkdir -p .claude/outboxes/explore
mkdir -p .claude/outboxes/workflow-improver
```

### .gitignore Considerations

```gitignore
# Option A: Ignore all messages (ephemeral)
.claude/inboxes/
.claude/outboxes/
.claude/shared/

# Option B: Track messages (audit trail)
# Don't ignore - commit all messages

# Option C: Hybrid (track shared state, ignore messages)
.claude/inboxes/
.claude/outboxes/
!.claude/shared/
```

---

## Related Concepts

| Concept | Relationship |
|---------|--------------|
| **SEACOW** | Folder structure aligns with Capture/Work/Output |
| **Context Funneling** | Agents return compressed results to orchestrator |
| **Actor Model** | Inspiration for message-based isolation |
| **Event Sourcing** | Workflow state as accumulated events |
| **Unix Philosophy** | Files as universal interface |

---

## Related Files

- `.claude/skills/inter-agent-messaging/SKILL.md` - The skill implementing this pattern
- `.claude/ARCHITECTURE.md` - Subagent constraint documentation
- `AGENTS.md` - Agent definitions and invocation patterns
- `research/learnings/2025-12-23-delegation-patterns.md` - Related delegation patterns

---

## Sources and Inspiration

- **Actor Model**: [Hewitt, Bishop, Steiger (1973)](https://en.wikipedia.org/wiki/Actor_model)
- **Unix Philosophy**: [Doug McIlroy](https://en.wikipedia.org/wiki/Unix_philosophy)
- **Event Sourcing**: [Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- **Claude Code Subagents**: [Official Docs](https://code.claude.com/docs/en/sub-agents)
- **Message Queue Patterns**: [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)

---

## Key Takeaways

1. **Filesystem is a message bus** - Simple, persistent, auditable
2. **SEACOW maps naturally** - Inboxes=Capture, Outboxes=Output, Shared=Work
3. **Orchestrator is key** - Commands coordinate, agents process
4. **Async by design** - Don't fight it, embrace batch processing
5. **Git is your friend** - Full history of all agent communication
6. **Start simple** - Manual messages before automation
7. **Same agents, new layer** - Messaging doesn't create agents, it connects them

---

## Future Ideation / Roadmap

### Verbose Role-Based Agent Naming

**Concept:** As agent ecosystems grow, adopt naming conventions similar to Active Directory group naming:

```
# Current (simple, flat)
skill-writer
explore
workflow-improver

# Future (hierarchical, role-based)
org_engineering_backend_codegen_python
org_engineering_frontend_codegen_react
org_research_codebase_explore_deep
org_research_codebase_explore_quick
org_meta_skills_writer_domain
org_meta_agents_writer_specialist
```

**Why This Matters:**

| Benefit | Description |
|---------|-------------|
| **Scoping** | `org_engineering_*` vs `org_research_*` - clear boundaries |
| **Permissions** | Inbox access can be scoped by prefix |
| **Discovery** | Glob `org_engineering_backend_*` to find all backend agents |
| **Hierarchy** | Mirrors organizational structure (like AD groups) |
| **Scaling** | Hundreds of agents become navigable |

**Example Structure:**

```
.claude/
├── agents/
│   ├── engineering/
│   │   ├── backend/
│   │   │   ├── codegen-python.md
│   │   │   └── codegen-go.md
│   │   └── frontend/
│   │       └── codegen-react.md
│   ├── research/
│   │   └── codebase/
│   │       ├── explore-deep.md
│   │       └── explore-quick.md
│   └── meta/
│       ├── skills-writer.md
│       └── agents-writer.md
├── inboxes/
│   ├── engineering-backend-codegen-python/
│   ├── engineering-frontend-codegen-react/
│   └── research-codebase-explore-deep/
```

**Naming Pattern:**
```
{scope}_{domain}_{subdomain}_{action}_{variant}

Examples:
- eng_backend_api_generate_rest
- eng_backend_api_generate_graphql
- research_code_explore_architecture
- research_code_explore_dependencies
- meta_workflow_improve_skills
- meta_workflow_improve_agents
```

**Implementation Notes:**
- Start simple, evolve naming as agent count grows
- Folder structure can mirror naming hierarchy
- Inbox names should match agent names for discoverability
- Consider aliasing (short names → full names) for usability

### Other Future Considerations

- **Agent versioning** - `skill-writer-v2` vs `skill-writer-v1`
- **Agent capabilities registry** - JSON/YAML manifest of what each agent can do
- **Cross-project agents** - Shared agents across multiple workspaces
- **Agent templates** - Scaffold new agents from proven patterns
- **Metrics/observability** - Track agent invocation counts, success rates

---

## See Also

- [03 · Parallel Agent Coordination](../zz-challenges/03-parallel-agent-coordination.md) — practical application when scaling messaging to concurrent agents
- [Agent Workflow Guide](../tools/agent-workflow-guide.md) — mental model for how skills, subagents, and MCP fit together
- [2026-04-25 — Parallel agent coordination findings](../../agent-context/zz-research/2026-04-25-parallel-agent-coordination-findings.md) — synthesis of cross-tool patterns and Claude Code Task-tool semantics
