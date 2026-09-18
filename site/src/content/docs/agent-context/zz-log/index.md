---
title: Worklog — what changed and why
description: Per-day worklog of significant scaffold changes. Lower-friction than zz-research (which captures investigations) and zz-inbox (which captures unprocessed ideas) — this is the "what shipped today + why" trail. Convention is one file per active day, named YYYY-MM-DD.md, appended to as work happens. Logs are tier-2-clean and ship to the agentic public mirror.
stratum: 5
status: active
sidebar:
  order: 0
tags:
  - meta
  - agent-context
  - log
  - worklog
date: 2026-04-25
---

The third surface in `agent-context/`, alongside [zz-research](/agentic-workflow-and-tech-stack/agent-context/zz-research/) (investigations + findings) and [zz-inbox](/agentic-workflow-and-tech-stack/agent-context/zz-inbox/) (unprocessed ideas). This one captures **what shipped today and why** — a chronological trail that's faster to scan than reading every commit message but more durable than memory.

## Convention

**One file per active day, named `YYYY-MM-DD.md`.** Append throughout the session as significant changes ship; finalize before ending the session.

A day file gets created the first time meaningful scaffold work happens; on quiet days, no file appears. Skipping days is fine — this is not a daily journal, it's a record of substantive activity.

## What counts as "significant"

A change worth logging is one whose **rationale** wouldn't be obvious from the commit message alone, OR one that other entries would want to cross-reference. Rules of thumb:

- **Log:** scaffold-structure changes (new sections, new conventions), publishing-config tweaks, decisions that shaped the day's direction, reversed assumptions, "we tried X then pivoted to Y" pivots, anything that future-you will want to find without re-reading commits.
- **Skip:** typos, formatting fixes, lint/sync regenerations, single-file edits with self-explanatory commit messages.

If in doubt, log it. The log is cheaper to write than to wish-existed.

## Entry shape

Each day's file groups by session (when sessions are distinct enough to matter) or just by topic. Bullet form, not prose.

```markdown
---
title: YYYY-MM-DD — Worklog
description: Significant scaffold changes on YYYY-MM-DD.
stratum: 5
status: log
date: YYYY-MM-DD
tags:
  - log
  - worklog
  - meta
---

## <session or topic header>

- `<commit-hash>` — <one-line summary>. <why it shipped, if non-obvious>
- ...

## Cross-references
- Research notes / inbox graduations / challenges that got touched

## Notes / observations
- Anything that didn't make it into a commit but is worth remembering
```

## Lifecycle

```
  significant change ships
        │
        ▼
  zz-log/YYYY-MM-DD.md  (append)
        │
        ├─► zz-research/YYYY-MM-DD-topic.md  if a thread becomes a deeper dive
        ├─► research/zz-challenges/N-topic.md  if the day surfaced an open challenge
        ├─► 02-stack/patterns/...md  if a pattern crystallized that day
        └─► (stays as the trail)  in all other cases
```

The log is **append-only** in spirit — entries don't get rewritten retroactively. If understanding changes, write a new entry on a later date that references the older one.

## Why this exists separately from commit messages

Commit messages are imperative-mood capture of what code/doc changes happened. Worklog entries are the **narrative thread** across many commits — what *direction* the day took, what got decided and why, what dead-ends got rejected, what cross-cuts became visible. Searching commit messages tells you `what`; searching the log tells you `why`.

Tier-2-clean by default — these logs ship to the agentic public mirror.

## See also

- [`zz-research/`](/agentic-workflow-and-tech-stack/agent-context/zz-research/) — investigations + findings (deeper than logs)
- [`zz-inbox/`](/agentic-workflow-and-tech-stack/agent-context/zz-inbox/) — raw idea capture (lower-friction than logs)
- [Agent Context root](/agentic-workflow-and-tech-stack/agent-context/) — the broader working surface this folder sits inside
