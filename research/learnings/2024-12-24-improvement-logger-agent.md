---
date: 2024-12-24
type: improvement-request
category: meta-agent
priority: medium
status: planning
tags:
  - /workflow
  - agent-design
  - meta-improvement
  - documentation
source: cynario testing session
---

# Proposed Agent: improvement-logger

## Summary

Create a global agent that captures improvement requests, feedback, and insights in real-time, persisting them as structured markdown files with proper frontmatter and tags.

## Problem It Solves

During workflow usage, ideas for improvements arise naturally but often get lost because:
- They occur mid-task when focus is elsewhere
- No structured way to capture them quickly
- No consistent format for later discovery
- Insights from one project don't flow back to the scaffold

## How It Differs From Existing Agents

| Agent | Role | Timing |
|-------|------|--------|
| `workflow-improver` | *Suggests* improvements proactively | At natural breakpoints |
| `test-improver` | *Analyzes* test findings for fixes | After testing |
| **`improvement-logger`** | *Captures* incoming requests/notes | On-demand, any time |

## Proposed Behavior

### When It Activates

The agent activates via semantic matching on its YAML `description` field when:
- User mentions improvements, feedback, or feature requests for the workflow
- User wants to capture an idea for later processing
- User provides feedback during testing sessions

**Note:** There are no explicit "trigger phrases" - the tool semantically matches user intent against the description field.

### Input Processing
1. Parse the improvement/request from user input
2. Extract context from current conversation/project
3. Infer appropriate tags and priority
4. Ask for clarification only if truly ambiguous

### Output Format

Creates file at configurable location (default: `research/learnings/improvements/`):

```markdown
---
date: YYYY-MM-DD
type: improvement-request | feedback | insight | bug-report
target: [skill/agent/doc being improved]
priority: low | medium | high | critical
status: open | in-progress | completed | wont-fix
tags:
  - [auto-generated based on content]
source: [project/context where captured]
---

# [Type]: [Brief Title]

## Request
[The actual improvement request/feedback]

## Context
[Relevant context from conversation]

## Source
[Where this came from]

## Related
[Links to related files if applicable]
```

### Placement Options

| Scope | Output Location |
|-------|-----------------|
| Global workflow | `~/.claude/learnings/improvements/` or scaffold's `research/learnings/` |
| Project-specific | `./docs/improvements/` or `./feedback/` |

Agent should detect context and ask if unsure.

## Capabilities Needed

```yaml
tools: Read, Write, Glob, AskUserQuestion
skills: seacow-conventions, workflow-guide
model: haiku  # Quick, low-overhead for simple logging
```

## Implementation Notes

- Should be FAST — minimal questions, smart defaults
- Should work globally (available in any project)
- Should use SEACOW-style frontmatter for discoverability
- Could integrate with workflow-improver (improvement-logger captures → workflow-improver processes)

## Open Questions

1. Should it support batch logging (multiple items at once)?
2. Should it auto-create directories if they don't exist?
3. Should it notify when related improvements already exist?
4. What's the handoff to workflow-improver look like?

## Decision

- [ ] Approved for implementation
- [ ] Needs refinement
- [ ] Rejected (reason: ___)

## Next Steps

If approved:
1. Use agent-writer to create the agent definition
2. Place in `~/.claude/agents/meta/improvement-logger.md`
3. Test with real improvement captures
4. Iterate based on usage
