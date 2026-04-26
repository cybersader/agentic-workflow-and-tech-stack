---
title: Temperature Gradient
description: Access frequency is a load-bearing organizational signal. Filesystem position should align with attention probability.
stratum: 1
status: stable
sidebar:
  order: 2
tags:
  - principle
  - philosophy
  - foundations
---

## The claim

Material accessed today is qualitatively different from material accessed monthly. Some content is **hot** (referenced daily, modified constantly), some **warm** (referenced weekly, stable but live), some **cold** (referenced monthly or less), some **frozen** (archived, touched only on demand). Filesystem position should align with this access probability, because recognition is cheaper than recall and navigation is cheaper than search.

The gradient is not a nicety. It is the primary affordance that lets a large personal workspace remain navigable as it grows.

## The evidence

Bergman and Whittaker's *The Science of Managing Our Digital Stuff* (MIT Press, 2016) demonstrates through years of personal information management research that people reliably prefer **navigation over search**, even when search is objectively faster. The reason: navigation relies on *recognition*, which is cognitively cheaper than *recall*. Recognition says "yes, that's the thing"; recall says "I must produce the name from nothing."

Noguchi's *push-left filing system* is the purest empirical expression of this insight. Instead of classifying documents by topic, Noguchi files them by **recency of access**: the most recently touched item goes to the far left; older items push right. When you need something, it's almost always on the left. This exploits the fact that access patterns are Zipfian — a small number of items are accessed constantly, a long tail almost never. LRU-by-position outperforms any semantic scheme a human can sustain manually.

The academic-knowledge literature has similar instincts. Luhmann's Zettelkasten distinguished fleeting notes (which decay and exit) from permanent notes (which accrue and connect). LYT's MOC (Map of Content) pattern gives hot working areas their own navigation index. All of these are temperature-gradient moves.

## Two axes, not one

A common confusion: the capture→work→output **flow** (see [previous principle](01-capture-work-output.md)) and the hot→cold **gradient** look similar and correlate, but they are not the same axis.

- **Flow** is about *process* — where a piece of information is in its lifecycle
- **Gradient** is about *attention* — how often a piece of information is actually accessed

An `03-reference/` document is output (flow-finished) but can still be hot (referenced daily). An `01-working/` draft is mid-flow but can be cold (abandoned for a month). Conflating the two produces folders that accumulate stale items and miss high-frequency patterns.

This scaffold therefore encodes them on two axes:
- **Process axis → folder position** (`00-inbox/` through `04-archive/`, numeric prefixes)
- **Attention axis → frontmatter field** (`status: hot | warm | cold | frozen`, updatable by a hook that tracks `mtime`)

The folders stay stable; the frontmatter drifts with usage.

## Why this matters for agents

Finite context demands the same triage agents give files: prefer hot (cached, recently updated) over cold (stale, expensive to load). A scaffold that encodes temperature makes this triage mechanical. An agent looking for "current state of X" can prefer files with `status: hot` and short mtime distance, falling back to cold only when the hot layer is exhausted.

Without explicit temperature, an agent has to probe the whole workspace to discover what's current — which is exactly what context rot punishes.

## How this scaffold expresses it

Inside a knowledge vault (outside the three-tier methodology), the folder structure carries the flow axis:

```
00-inbox/        # Capture (hot entry)
01-working/      # Work (hot middle)
02-learnings/    # Work output (warm / stable)
03-reference/    # Output (cold / reference)
04-archive/      # Output (frozen)
```

Frontmatter carries the attention axis:

```yaml
---
title: ...
status: hot | warm | cold | frozen
last_accessed: 2026-04-17
---
```

A hook (`update-attention.sh`) can cron-run or fire on edit to update `last_accessed` and compute `status` from mtime thresholds. Folder moves are human decisions; temperature updates are automatic.

## Implications for agents

- When recommending where to put a new capture, default to `00-inbox/` regardless of topic; let the user distill later.
- When searching for current state, prefer warm+ files; skip inbox unless explicitly asked.
- When an inbox has accumulated beyond N items, surface that fact at session-end hooks (`check-knowledge.sh`).
- Do not move files between folders without confirmation; the flow axis is human-owned.

## See also

- [Capture → Work → Output](01-capture-work-output.md) — the orthogonal process axis
- [Progressive Disclosure](04-progressive-disclosure.md) — why attention-aware loading matters
- `01-kernel/patterns/knowledge-base-example.md` — reference implementation of the gradient
- `knowledge-curator` skill — keeps the gradient healthy in practice

## References

- Bergman & Whittaker, *The Science of Managing Our Digital Stuff* (MIT Press, 2016)
- Noguchi Yukio, *push-left filing system*
- Luhmann, Zettelkasten method
- Nick Milo, *Linking Your Thinking* (LYT)
