---
title: Capture → Work → Output
description: The three-regime flow of knowledge work — an invariant that every serious framework reinvents under different names.
stratum: 1
status: stable
sidebar:
  order: 1
tags:
  - principle
  - philosophy
  - foundations
---

## The claim

All structured cognitive work cycles through three regimes of material: **raw** (unprocessed input), **working** (middle-state artifacts under active manipulation), and **finished** (stable output that is referenced but rarely modified). This is an invariant of any knowledge worker — human, AI, or team — operating under finite attention.

## The evidence

Every serious organizational framework either names these three regimes directly or reinvents them under different words.

| Framework | Capture | Work | Output |
|---|---|---|---|
| David Allen, *Getting Things Done* | Capture + Clarify | Organize + Engage | Finished outcomes |
| Tiago Forte, *Building a Second Brain* (CODE) | **C**apture | **O**rganize + **D**istill | **E**xpress |
| Ryder Carroll, *Bullet Journal* | Rapid logging | Migration | Collections |
| Niklas Luhmann, *Zettelkasten* | Fleeting notes (*Schreibzettel*) | Literature notes + permanent notes (*Zettel*) | Publications |
| Sönke Ahrens, *How to Take Smart Notes* | Fleeting notes | Literature notes → permanent notes | Drafts → manuscripts |
| Nick Milo, *Linking Your Thinking* (LYT) | Atomic notes | MOCs (Maps of Content) | Published output |

The names differ because different thinkers emphasize different bottlenecks — capture discipline, synthesis discipline, expression discipline. The three-regime structure does not.

The flow is iterative but directional: raw material enters capture, is transformed in a working stage, and emerges as output. Finished artifacts sometimes feed back as raw material for new work, but the regime boundaries persist.

## Why this matters for agent scaffolds

A scaffold that does not distinguish the three regimes creates confusion about where things belong:
- Notes-in-progress get mixed with published reference material, so readers waste cycles deciding what's authoritative
- Raw captures clutter output areas, so finished work loses visual weight
- Work-in-progress gets archived prematurely or lost in an inbox, and synthesis never happens

An AI agent consumes these regimes differently. Raw captures are cheap to load but shouldn't influence reasoning about stable patterns; output material is authoritative but should not be re-edited casually. Without explicit regime boundaries, an agent cannot tell which kind of authority any given file carries.

## How this scaffold expresses it

The three tiers of this scaffold (`01-kernel/`, `02-stack/`, `03-work/`) are **not** the three regimes — they are axes of portability, not axes of process. A knowledge-base vault that uses this scaffold will typically expose the regimes via folder structure:

```
capture      → 00-inbox/     (raw, unprocessed)
              → 01-working/   (active synthesis)
work         → 02-learnings/ (distilled, stable insights)
output       → 03-reference/ (actively used stable docs)
              → 04-archive/   (long-term filed)
```

The numeric prefixes preserve order regardless of filesystem sort. The `00-` through `04-` range leaves room for insertion later without renumbering.

An important distinction: **the three regimes are one axis; attention temperature is another**. See [Temperature Gradient](02-temperature-gradient.md) — they correlate but are not the same.

## Implications for agents

- When a new insight is captured in conversation, an agent should deposit it in `00-inbox/` (or equivalent), not the output tier.
- When asked "what's the current state of X," an agent should search from `03-reference/` outward, not from `00-inbox/` in.
- When synthesizing, an agent should treat `01-working/` and `02-learnings/` as sources; `03-reference/` as target only if the synthesis is mature.
- Archival (moving to `04-archive/`) is a human decision, not an agent one — agents should propose, not act.

## See also

- [Temperature Gradient](02-temperature-gradient.md) — the orthogonal attention axis
- [Single Canonical Addressability](06-single-canonical-addressability.md) — why the numeric prefixes matter
- `02-stack/patterns/obsidian-workflow.md` — how this plays out in Obsidian
- `03-work/rebuild/` — example instance of a full capture-work-output pipeline
