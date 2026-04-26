---
allowed-tools: Read, Write, Edit, AskUserQuestion
argument-hint: "[task description | 'done' | 'status']"
title: /task-plan — Create or Manage task_plan.md
stratum: 3
branches: [agentic]
---

Create, check, or complete task plans for multi-phase work. This command manages the full lifecycle of `task_plan.md`.

## Process

### Argument: "done" or "complete"

1. Read task_plan.md
2. If phases are incomplete:
   - Show which phases are still in_progress or pending
   - Ask: "Mark remaining phases complete, or continue working?"
3. If all phases are complete, run the **Knowledge Funnel Review** (if `knowledge-base/` exists):
   a. **Discoveries**: Review each completed phase. What was learned? What wasn't known before?
      - Write atomic insights to `knowledge-base/02-learnings/` (one insight per file)
      - Use proper frontmatter: date created, temperature: learnings, tags
   b. **Decisions**: Were any architectural or design decisions made?
      - Write stable docs to `knowledge-base/03-reference/`
   c. **Inbox Review**: List items in `knowledge-base/00-inbox/`
      - For each: promote to `01-working/` (needs work), `02-learnings/` (distilled), or `04-archive/` (done)
   d. **Working Review**: List drafts in `knowledge-base/01-working/`
      - For each: promote to `02-learnings/` (insight) or `03-reference/` (stable doc)
   e. **Summary**: Show what was captured/promoted during the funnel
4. Archive or delete task_plan.md:
   - Ask the user: "Delete task_plan.md or archive to knowledge-base/04-archive/?"
   - If archive: move with date prefix (e.g., `2026-01-28-task-plan.md`)
   - If delete: remove the file

### Argument: "status"

1. If task_plan.md doesn't exist: "No task plan active. Run /task-plan to create one."
2. If exists but empty: "task_plan.md exists but has no phases. Want me to populate it or delete it?"
3. If valid: Show summary — X/Y phases complete, list each phase with status

### Argument: task description (or no argument)

1. Check if task_plan.md already exists:
   - **Has phases**: "A plan already exists with N phases. Replace it, add phases, or check status?"
   - **Empty/no phases**: "task_plan.md exists but is empty. I'll populate it now."
   - **Doesn't exist**: Proceed to creation

2. If no task description was provided, ask:
   "What are you working on? Describe the task and I'll break it into phases."

3. Analyze the task and create phases:
   - Break into 2-7 phases (prefer fewer, more meaningful phases)
   - Each phase gets `### Phase N: [Name]`
   - Each phase gets `**Status:** pending` (first phase: `in_progress`)
   - Add 2-5 checklist items per phase

4. Write task_plan.md at the **project root** (not inside knowledge-base/ or .claude/):

   ```markdown
   # Task: [Task Name]

   ### Phase 1: [Name]
   **Status:** in_progress
   - [ ] Step one
   - [ ] Step two

   ### Phase 2: [Name]
   **Status:** pending
   - [ ] Step one
   - [ ] Step two
   ```

5. Confirm to the user:
   "Plan created with N phases. Hooks will now:
   - Show your plan before each Write/Edit/Bash (PreToolUse)
   - Remind you to update status after edits (PostToolUse)
   - Check all phases are complete before stopping (Stop)"

## Important

- **Never create an empty task_plan.md.** Always populate with at least one phase.
- **task_plan.md goes at the project root**, not inside .claude/ or knowledge-base/.
- The `### Phase` heading format and `**Status:**` markers are required — hooks parse these exact patterns.
- Valid statuses: `pending`, `in_progress`, `complete`
