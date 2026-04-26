---
name: proactive-patterns
description: Expertise in designing proactive auto-triggering components. Use when creating skills, agents, hooks, or commands that should activate automatically based on context, events, or checkpoints.
title: "Proactive Patterns: Creating Auto-Triggering Components"
stratum: 2
branches: [agentic]
---

## Purpose
Expertise in designing skills, agents, and commands that activate proactively based on context, keywords, events, or checkpoints. Use this skill when creating components that should trigger automatically rather than requiring explicit invocation.

---

## The Four Trigger Types

**IMPORTANT CLARIFICATION:** The "Keyword-Based (Skills)" section previously documented here was INCORRECT. Skills do NOT auto-load based on `## Activation Keywords` sections - that was a documentation convention, not a real feature. Skills are discovered via the `description` field in SKILL.md YAML frontmatter.

### 1. Description-Based (Skills) - CORRECTED

Skills are discovered when Claude determines they're relevant based on YAML frontmatter.

**How it actually works:**
- Skills must be in subdirectory: `.claude/skills/skill-name/SKILL.md`
- SKILL.md needs YAML frontmatter with `name` and `description`
- Claude reads `description` and autonomously decides when to use skill
- NO keyword matching - Claude uses semantic understanding of description

**Design guidelines:**
```yaml
---
name: python-testing
description: Expertise in Python testing patterns including pytest, fixtures, mocking, and coverage. Use when user asks about testing, pytest, fixtures, or test coverage.
---
```

**When to use:**
- Domain knowledge that should be available contextually
- Conventions that apply when topics are discussed
- Background expertise for specific areas

---

### 2. Description-Based (Agents)

Agents can be invoked proactively based on their description.

**How it works:**
- Agent `description` field defines when to use
- Including "Use PROACTIVELY when..." signals automatic invocation
- Claude matches context against description

**Design guidelines:**
```yaml
# Good - specific trigger condition
description: Use PROACTIVELY when user wants to organize files. Applies SEACOW thinking.

# Good - clear scope
description: Use PROACTIVELY after completing significant tasks to suggest improvements.

# Bad - too vague
description: Helps with files.

# Bad - no proactive signal
description: Organizes files using SEACOW framework.
```

**Format:**
```
Use PROACTIVELY when [specific condition]. [What it does in 10-15 words].
```

**When to use:**
- Tasks that should happen automatically at certain points
- Agents that provide value without explicit request
- Workflow helpers that should be offered, not demanded

---

### 3. Event-Based (Hooks)

Hooks intercept events before they happen.

**How it works:**
- Hook files define event type and pattern
- Events: `bash`, `file`, `stop`, `prompt`, `all`
- Can `warn` (show message) or `block` (prevent action)

**Hook file format:**
```markdown
# Hook Name

## Event
bash | file | stop | prompt | all

## Pattern
[regex pattern to match]

## Action
warn | block

## Message
[What to show the user]
```

**Example - Prevent dangerous commands:**
```markdown
# No Force Push

## Event
bash

## Pattern
git push.*--force|git push -f

## Action
block

## Message
Force push blocked. Use a safer alternative or explicitly override.
```

**When to use:**
- Safety guardrails (prevent dangerous actions)
- Reminders before certain operations
- Enforcing conventions
- Audit/logging triggers

**Available events:**
| Event | Triggers On |
|-------|-------------|
| `bash` | Before shell commands |
| `file` | Before file operations |
| `stop` | Before conversation ends |
| `prompt` | Before AI responds |
| `all` | Any tool use |

#### Context Persistence Hooks (Manus Pattern)

These hooks maintain goal focus during long sessions. From the [planning-with-files](https://github.com/OthmanAdi/planning-with-files) pattern.

**The core principle:** Context window = RAM (volatile, limited). Filesystem = Disk (persistent, unlimited). Anything important gets written to disk.

**When to use:**
- Multi-step tasks (3+ phases)
- Research spanning many tool calls
- Sessions where goal drift is a risk

##### How to Enable

Add hooks to `.claude/settings.local.json` (create if it doesn't exist):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/scripts/read-plan.sh 2>/dev/null || true"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Reminder] Update task_plan.md if phase complete' && [ -d knowledge-base ] && echo '[Knowledge] Capture insights → 00-inbox/ | Distill learnings → 02-learnings/'"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/scripts/check-complete.sh"
          },
          {
            "type": "command",
            "command": "bash .claude/scripts/check-knowledge.sh 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

**Note:** If you already have a `settings.local.json`, merge the `hooks` section into your existing file.

##### Scripts

The hooks use three scripts in `.claude/scripts/`:

| Script | Hook | Purpose |
|--------|------|---------|
| `read-plan.sh` | PreToolUse | Smart plan reader — shows plan or detects empty `task_plan.md` and prompts to populate/delete |
| `check-complete.sh` | Stop | Verifies all phases in `task_plan.md` are marked complete before session end |
| `check-knowledge.sh` | Stop | Shows knowledge-base status and prompts for captures/promotions (silently skips if no `knowledge-base/`) |

Copy during setup:

```bash
mkdir -p .claude/scripts
cp ~/.claude/scripts/read-plan.sh .claude/scripts/
cp ~/.claude/scripts/check-complete.sh .claude/scripts/
cp ~/.claude/scripts/check-knowledge.sh .claude/scripts/
chmod +x .claude/scripts/*.sh
```

The PostToolUse KB reminder (`[ -d knowledge-base ] && echo ...`) only fires when `knowledge-base/` exists. Standard projects without a knowledge-base see only the plan reminder.

##### What Each Hook Does

| Hook | Trigger | Purpose |
|------|---------|---------|
| PreToolUse | Before Write/Edit/Bash | Re-reads `task_plan.md` to refresh goals |
| PostToolUse | After Write/Edit | Reminds to update plan status |
| Stop | Before session ends | Verifies all phases complete via `check-complete.sh` |

##### Creating task_plan.md

Run `/task-plan` to create a properly structured plan, or create manually. The hooks expect a plan file with this structure:

```markdown
# Task: [Your Task Name]

### Phase 1: [Phase Name]
**Status:** pending | in_progress | complete

- [ ] Step 1
- [ ] Step 2

### Phase 2: [Phase Name]
**Status:** pending

- [ ] Step 1
```

The `check-complete.sh` script counts `### Phase` headers and `**Status:** complete` lines to verify completion

##### Gradient Flow Hooks (Beyond Session Focus)

The Manus hooks above handle **session focus** (hot zone). For full **temperature gradient** support, the hooks also prompt knowledge capture:

**PostToolUse — Mid-Session KB Awareness:**
The PostToolUse hook conditionally reminds about knowledge capture when `knowledge-base/` exists:
```
[Reminder] Update task_plan.md if phase complete
[Knowledge] Capture insights → 00-inbox/ | Distill learnings → 02-learnings/
```
The second line only appears in projects with a `knowledge-base/` directory.

**Stop — Session End KB Review (`check-knowledge.sh`):**
At session end, `check-knowledge.sh` shows zone counts and prompts:
- Inbox items to process (promote to working or learnings)
- Working drafts to finalize (promote to learnings or reference)
- Empty KB warning (prompt for any session insights)

**Gradient Transition Prompts:**

| Trigger | Mechanism | Prompt |
|---------|-----------|--------|
| After every Write/Edit | PostToolUse (conditional) | "Capture insights → 00-inbox/ / Distill → 02-learnings/" |
| Session end | check-knowledge.sh | "Inbox has N items — process before stopping?" |
| Session end | check-knowledge.sh | "Working has N drafts — any ready to promote?" |
| Session end (empty KB) | check-knowledge.sh | "KB is empty. Any insights worth capturing?" |

**Temperature-Aware Frontmatter:**

When creating files, include temperature in frontmatter:
```yaml
---
date created: 2026-01-17
temperature: inbox | working | learnings | reference | archive
tags: []
---
```

This enables future automation (scripts that find stale inbox items, etc.).

**See Also:** `docs/CONCEPTS.md` → "Context Temperature Gradient"

---

### 4. Command-Based (Explicit)

Commands require explicit `/slash` invocation but are discoverable.

**How it works:**
- Command files in `.claude/commands/`
- Invoked with `/command-name`
- Can accept arguments
- Not proactive, but easily accessible

**Command file format:**
```yaml
---
allowed-tools: Read, Write, Glob, Grep
argument-hint: "[optional arguments description]"
---

# Command prompt/instructions here

[What the command should do when invoked]
```

**Example:**
```yaml
---
allowed-tools: Read, Write, Glob, AskUserQuestion
argument-hint: "[effort-level: minimal|standard|comprehensive]"
---

# Initialize Workspace

When invoked, analyze the current workspace and offer to scaffold it for AI-assisted work.

1. Check if CLAUDE.md exists
2. If not, ask about effort level
3. Create appropriate structure
```

**When to use:**
- Actions users should explicitly trigger
- Discoverable workflows (shows in command list)
- Tasks with argument variations
- Entry points to complex workflows

---

## Choosing the Right Trigger

| I want to... | Use |
|--------------|-----|
| Load knowledge when topic relevant | Description (Skill YAML) |
| Offer help at certain conditions | Description (Agent) |
| Prevent/warn about actions | Hook |
| Let user explicitly invoke | Command |

### Decision Flow

```
Should this trigger automatically?
│
├─ NO → Command (explicit /slash)
│
└─ YES → What triggers it?
         │
         ├─ Topic/context relevant → Skill (YAML description)
         │
         ├─ Condition in workflow → Agent (description-based)
         │
         └─ Specific event (bash/file) → Hook
```

---

## Combining Trigger Types

Components can use multiple trigger mechanisms:

### Skill + Agent Combo

1. Skill provides knowledge (description-triggered)
2. Agent uses skill for actions (description-triggered)

```
User asks about testing patterns
  → pytest-skill loads (description relevant)
  → workflow-improver notices pattern (checkpoint)
  → Offers to create test helper agent
```

### Command + Hook Combo

1. Command provides explicit invocation
2. Hook provides automatic safety

```
/deploy command exists for explicit deploys
Hook warns on any direct production file changes
Both protect production, different mechanisms
```

---

## Anti-Patterns

### Vague Skill Descriptions
```yaml
# Bad - when does this load?
description: Helps with stuff
```

### Vague Agent Descriptions
```yaml
# Bad - when does this trigger?
description: Helps with stuff
```

### Over-Blocking Hooks
```
# Bad - frustrating user experience
## Event: all
## Pattern: .*
## Action: block
```

---

## Examples

### Example 1: Domain Expertise Skill

```yaml
---
name: kubernetes-expertise
description: Deep expertise in Kubernetes patterns and best practices. Use when user asks about k8s, kubectl, pods, deployments, services, ingress, helm, or cluster management.
---

# Kubernetes Expertise

## Purpose
Deep expertise in Kubernetes patterns and best practices.

---

## Content
[Kubernetes conventions, common patterns, troubleshooting tips]
```

**Triggers when:** Claude determines k8s expertise is relevant to conversation

### Example 2: Proactive Review Agent

```yaml
name: code-reviewer
description: Use PROACTIVELY when user completes writing a function or file. Reviews code for issues.
tools:
  - Read
  - Grep
skills:
  - code-review-conventions
```

**Triggers when:** Function/file writing completes

### Example 3: Safety Hook

```markdown
# No Secrets in Code

## Event
file

## Pattern
(password|secret|api_key)\s*=\s*['"][^'"]+['"]

## Action
warn

## Message
Potential secret detected in code. Consider using environment variables.
```

**Triggers when:** File write contains potential secrets

---

## Testing Proactive Components

### For Skills
1. Ask about a topic that matches the description
2. Verify skill knowledge appears in response
3. Adjust description if too broad/narrow

### For Agents
1. Create the condition described
2. Check if agent is offered/invoked
3. Refine description for accuracy

### For Hooks
1. Attempt the action that should trigger
2. Verify warning/block appears
3. Test edge cases

### For Commands
1. Type `/command-name`
2. Verify it appears in command list
3. Test with arguments if applicable

---

## See Also

- `.claude/skills/skill-patterns/SKILL.md` - Designing skills
- `.claude/skills/agent-patterns/SKILL.md` - Designing agents
- `docs/03-ongoing-usage.md` - Daily workflow patterns
