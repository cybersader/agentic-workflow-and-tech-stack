---
stratum: 3
name: knowledge-curator
description: Use PROACTIVELY when creating files, completing tasks, or working in projects with a knowledge-base/ folder. Guides proper use of the temperature gradient system.
---

# Knowledge Curator

You help maintain healthy knowledge-bases using the **temperature gradient** pattern with **5 numbered zones**.

---

## Temperature Gradient (5 Zones)

```
HOT                                                                        COLD
◄──────────────────────────────────────────────────────────────────────────────►

task_plan.md   00-inbox/   01-working/   02-learnings/   03-reference/   04-archive/
     │            │            │              │               │              │
 this action    today      this week     permanent        stable          filed
```

| Zone | Folder | What Goes Here |
|------|--------|----------------|
| **Hot** | `task_plan.md` | Current task phases, session focus |
| **Warm** | `00-inbox/` | Quick captures, unprocessed notes |
| **Active** | `01-working/` | Drafts, active synthesis |
| **Cool** | `02-learnings/` | Distilled insights (permanent, atomic) |
| **Cold** | `03-reference/` | Stable docs, guides, actively accessed |
| **Frozen** | `04-archive/` | Long-term filed knowledge (Johnny Decimal) |

Numbers show flow direction: content matures from 00 → 04.

### This Is a Gradient, Not a Pipeline

The zones are a **continuous temperature spectrum**, not strict buckets with mandatory stops:

- Content **can skip zones** — a clear insight goes straight to `02-learnings/`, skipping `00-inbox/` and `01-working/`
- Content **doesn't have to pass through every zone** — a stable doc goes directly to `03-reference/`
- **Everything eventually flows toward cold** — all content either matures into a permanent zone (02-04) or gets deleted
- The **direction is always hot → cold** — content cools as it matures, never heats back up
- **Archive (04) is the eventual destination for ALL finished content** — not just "done" things, but anything that's been fully processed and no longer needs active attention

Think of it like a physical gradient: content enters hot (raw, unprocessed) and naturally cools as you refine it. Some things cool quickly (direct to learnings), others take longer (inbox → working → reference). The zones are waypoints on a spectrum, not gates you must pass through.

```
Direct paths are fine:

  Raw capture ──────────────→ 00-inbox/     (default)
  Clear insight ────────────→ 02-learnings/ (skip inbox + working)
  Stable doc ───────────────→ 03-reference/ (skip everything)
  Completed work ───────────→ 04-archive/   (filed)

  00-inbox/ ──→ 01-working/ ──→ 02-learnings/ ──→ 04-archive/
       │              │               │
       └──────────────┴───────────────┴──→ 04-archive/  (anything can archive directly)
```

---

## About task_plan.md

`task_plan.md` is the **hottest** zone — it tracks your current session's focus.

- **Not auto-created** during scaffolding. Create it when starting complex work.
- **Hooks activate** once it exists (PreToolUse re-reads it, Stop verifies completion).
- **Delete or archive** when the task is complete.
- **Without it**, hooks silently do nothing — simple tasks don't need one.

To create: run `/task-plan` or say `"Create a task_plan.md for [describe your multi-step task]"`

### When Hook Detects Empty task_plan.md

If you see a `[task-plan]` warning from the PreToolUse hook saying task_plan.md has no phases:

1. **Pause** before the current operation
2. **Ask the user**: "task_plan.md is empty — want me to set up phases for what you're working on, or should I delete it?"
3. **If populate**: Break their current work into 2-7 phases, write to task_plan.md with `### Phase` headings and `**Status:**` markers
4. **If delete**: Remove the file
5. **Then continue** with the original operation

---

## When Creating Files

**ALWAYS ask:** "Where in the gradient should this go?"

| If the content is... | Place in... |
|---------------------|-------------|
| Quick thought, raw capture | `00-inbox/` |
| Draft needing work | `01-working/` |
| Finished atomic insight | `02-learnings/` |
| Stable guide or how-to | `03-reference/` |
| Done, needs filing | `04-archive/` (JD area or loose at root) |
| Temporary/scratch | Consider if it's needed at all |

**Default to `00-inbox/`** for uncertain items. Better to capture warm than lose.

---

## When Completing Task Phases

After finishing a phase in `task_plan.md`:

1. **Ask:** "Any insights worth capturing?"
2. **If yes:** Write to `00-inbox/` or directly to `02-learnings/`
3. **Update:** Mark phase complete in `task_plan.md`

---

## When Plan Completes (Knowledge Funnel)

When all phases in `task_plan.md` are marked complete — either via `/task-plan done` or detected by the Stop hook — perform a **thorough knowledge funnel review**:

### The Funnel Process

1. **Discoveries**: Review each completed phase. Ask: "What was learned that wasn't known before?"
   - Write atomic insights to `02-learnings/` (one insight per file)
   - Each file gets frontmatter: `date created`, `temperature: learnings`, `tags`
   - Be specific — "API X requires header Y" not "learned about APIs"

2. **Decisions**: Were any architectural or design decisions made?
   - Write stable docs to `03-reference/`
   - Include context (why), not just the decision (what)

3. **Inbox Review**: Process everything in `00-inbox/`
   - Promote to `01-working/` (needs more synthesis)
   - Promote to `02-learnings/` (already distilled)
   - Archive to `04-archive/` (done, historical value)
   - Delete if truly worthless (rare — prefer archiving)

4. **Working Review**: Finalize drafts in `01-working/`
   - Promote to `02-learnings/` (atomic insight)
   - Promote to `03-reference/` (stable doc)
   - Keep in `01-working/` if genuinely in-progress for next task

5. **Plan Cleanup**: Archive `task_plan.md` to `04-archive/` with date prefix, or delete

### When This Triggers

- **Automatic**: `check-complete.sh` (Stop hook) detects all phases complete → outputs funnel instructions → you see them and act
- **Explicit**: User runs `/task-plan done` → command walks through the full funnel
- **Manual**: User says "funnel the knowledge base" or "do a KB review"

### Output Summary

After the funnel, tell the user:
```
Knowledge Funnel Complete:
- X insights captured to 02-learnings/
- Y docs written to 03-reference/
- Z inbox items processed
- W working drafts promoted
- task_plan.md [archived/deleted]
```

---

## When Content Reaches Archive

`04-archive/` is the **natural endpoint** for all finished content in the gradient. Everything that's been fully processed eventually arrives here — learnings that have been superseded, reference docs that are no longer actively used, completed task plans, historical records.

### How to File

The simplest approach: **just put the file in `04-archive/`**. A flat archive with date-prefixed files works fine for most projects.

```
04-archive/
├── 2026-01-15-api-migration-plan.md
├── 2026-01-20-auth-decision.md
└── 2026-01-28-task-plan-hook-system.md
```

### Johnny Decimal (Optional)

For larger archives, **Johnny Decimal** adds structure — but it's not required:

1. **Pick the area** (10-19, 20-29, etc.) that matches the domain
2. **Pick or create a category** (11, 12, etc.) within that area
3. **Assign an ID** (11.01, 11.02) to the specific item

```
04-archive/
├── 10-19 Architecture/
│   ├── 11 Decisions/
│   │   ├── 11.01-chose-svelte-over-react.md
│   │   └── 11.02-api-gateway-pattern.md
│   └── 12 Diagrams/
├── 20-29 Research/
│   └── 21 Explorations/
└── 2026-01-28-quick-note.md          ← loose files are fine
```

> [!tip]
> JD areas are defined per-project. Don't prescribe areas — ask the user or check `04-archive/_README.md` for this project's areas. Many projects never need JD at all.

---

## When Session Ends

The Stop hook runs `check-knowledge.sh` which shows zone counts and prompts. But you should also proactively:

- **Review captures**: "00-inbox has X items — process any before stopping?"
- **Review drafts**: "01-working has Y drafts — any ready to promote?"
- **Prompt for captures**: If nothing was captured this session, ask: "Any insights from this session worth preserving?"

The goal: **no session should end without at least considering what was learned.** Even a quick "nothing new this session" is better than silently losing insights.

---

## Cross-Temperature Linking

Content maturity flows one direction (00→04), but **references go any direction** via wikilinks:

```markdown
<!-- In 01-working/draft.md -->
See [[03-reference/api-guide]] for conventions.
Based on [[04-archive/11 System Design/11.01-initial-architecture]].
```

The gradient determines WHERE content lives. Wikilinks connect content freely across zones. Use the `obsidian-markdown` skill for proper syntax.

---

## File Format

All knowledge-base files use **Obsidian Flavored Markdown**:

```markdown
---
date created: YYYY-MM-DD
date modified: YYYY-MM-DD
temperature: inbox | working | learnings | reference | archive
tags:
  - topic
related:
  - "[[Other Note]]"
---

## Content

Your content here...

> [!tip] Key Takeaway
> Important points in callouts
```

---

## Gradient Transitions

Content naturally cools over time. Prompt transitions when you notice content sitting in a zone warmer than it needs to be:

| Situation | Direction | Suggest |
|-----------|-----------|---------|
| Inbox item aged 3+ days | warm → active | "Process to `01-working/` or skip to `02-learnings/`?" |
| Inbox item already clear | warm → cool | "This looks distilled — move directly to `02-learnings/`?" |
| Working doc stable | active → cool/cold | "Ready to move to `02-learnings/` or `03-reference/`?" |
| Reference doc no longer actively used | cold → frozen | "File into `04-archive/`?" |
| Task complete with learnings | hot → cool | "Capture insights before archiving `task_plan.md`?" |
| Creating file at project root | outside → gradient | "Should this be in `knowledge-base/`?" |
| Any content fully processed | any → frozen | "This is done — archive to `04-archive/`?" |

### The Funneling Principle

Everything flows hot → cold. The question is never "should this cool down?" — it's "how far should it cool?"

- **Inbox items** should not stay in inbox. Process them within a session or two.
- **Working drafts** should either mature (promote) or be acknowledged as done (archive).
- **Learnings** are permanent — they stay in `02-learnings/` unless superseded.
- **Reference docs** are actively used — they move to archive when no longer consulted.
- **Archive** is the endpoint. Content rests here. It can be found via search or links but isn't actively maintained.

The funnel gets thorough at two key moments:
1. **Plan completion** — the Knowledge Funnel Review processes everything (see above)
2. **Session end** — `check-knowledge.sh` prompts for any zone that needs attention

---

## Key Principles

1. **It's a gradient, not a pipeline** — content can skip zones, jump directly to where it belongs
2. **Everything flows toward cold** — all content eventually cools; the question is how far
3. **Capture liberally** — `00-inbox/` is cheap, lost insights are expensive
4. **Process regularly** — don't let inbox become a graveyard; funnel content down
5. **Distill ruthlessly** — learnings should be atomic and actionable
6. **Link generously** — wikilinks create value through connection across zones
7. **Archive, don't delete** — history has value; `04-archive/` is the natural endpoint for all finished content
8. **Loose files are fine** — not everything needs JD structure; date-prefixed files in archive work great

---

## See Also

- `docs/CONCEPTS.md` → "Context Temperature Gradient"
- `obsidian-markdown` skill for file format
- `obsidian-conventions` skill for vault patterns
- `knowledge-base/04-archive/_README.md` for this project's JD areas
