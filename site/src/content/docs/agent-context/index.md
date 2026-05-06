---
title: Agent Context & Exploration
description: Research, decision logs, open challenges, and half-baked thoughts. The working surface for in-progress thinking before it's promoted into polished kernel/stack/work content.
stratum: 5
status: research
sidebar:
  order: 0
tags:
  - meta
  - agent-context
date: 2026-04-17
---

This section is the **working surface** for ongoing thinking about this scaffold. Modeled on the `agent-context/` pattern from my other projects ([cyberbaser](https://github.com/cybersader/cyberbaser), [crosswalker](https://github.com/cybersader/crosswalker)): freeform research, decision logs, open problems, and exploration writing that doesn't yet belong in the polished principles / patterns / stack layers.

Everything here starts at **stratum 5** (work-tier, personal). Some entries graduate:

- **Graduates to kernel (stratum 1/2)** — the insight turns out to be universal. Move the file into `01-kernel/principles/` or `01-kernel/patterns/`, bump the stratum, add citations if needed.
- **Graduates to stack (stratum 2/3)** — the insight applies to my opinionated toolkit. Move into `02-stack/patterns/` or a layer folder.
- **Stays here** — still developing, or turns out to be cybersader-specific / situational.

The `zz-` prefix on subfolders sorts this section to the bottom of the tier-3 sidebar — it's working material, not reference.

## What goes here

| Subfolder | Purpose |
|---|---|
| [`zz-inbox/`](/agentic-workflow-and-tech-stack/agent-context/zz-inbox/) | Raw idea capture — hottest surface; quick bullets in `INBOX.md` or per-idea `YYYY-MM-DD-topic.md` files before they've earned a full write-up |
| [`zz-research/`](/agentic-workflow-and-tech-stack/agent-context/zz-research/) | In-progress thinking on principles, patterns, architecture — bullets from the inbox graduate here once they're paragraph-length |
| [`zz-log/`](/agentic-workflow-and-tech-stack/agent-context/zz-log/) | Per-day worklog of significant scaffold changes — `YYYY-MM-DD.md` files appended to as work happens. The narrative thread across many commits ("what direction the day took") rather than per-commit imperative messages. |
| `zz-challenges/` (future — currently lives at [`research/zz-challenges/`](/agentic-workflow-and-tech-stack/research/zz-challenges/)) | Hard open problems that need exploration before they can be decided |

Entries are dated (`YYYY-MM-DD-topic.md` for inbox/research, `YYYY-MM-DD.md` for log) so the evolution of work is navigable chronologically. The [`zz-inbox/INBOX.md`](/agentic-workflow-and-tech-stack/agent-context/zz-inbox/INBOX/) running list is the one exception — append-a-bullet format, no per-entry frontmatter.

## Promotion workflow

When an entry feels solid enough to graduate:

1. **Copy** the file to its target tier/folder
2. **Update `stratum:`** in frontmatter (5 → 1 or 2 or 3 as appropriate)
3. **Rewrite** to remove tier-3 voice (neutral claims at tier 1; opinionated pattern at tier 2)
4. **Leave a stub** in `zz-research/` pointing to the promoted location (so history is traceable)
5. **Update the extraction direction lint** (once built) if the promotion affected cross-tier references

## See also

- [Philosophy & Principles](/agentic-workflow-and-tech-stack/principles/) — what crystallized research looks like
- [Patterns](/agentic-workflow-and-tech-stack/patterns/) — stack-level patterns (tier 2)
- [Roadmap](/agentic-workflow-and-tech-stack/kernel/roadmap/) — tracks the bigger-picture phases
