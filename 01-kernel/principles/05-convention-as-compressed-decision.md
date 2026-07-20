---
title: Convention as Compressed Decision
description: A convention is a compressed decision that saves context, not keystrokes. Removing one without knowing what it compressed is how scaffolds degrade.
stratum: 1
status: stable
sidebar:
  order: 5
tags:
  - principle
  - philosophy
  - foundations
  - conventions
---

## The claim

A convention — `app/models/user.rb`, `components/Button.tsx`, `docs/ADR/`, `00-inbox/` — is not primarily a typing shortcut. It is a **compressed decision**: the hundred small choices that would otherwise have to be made, justified, and re-explained are collapsed into a single established answer. The saving is not in keystrokes. It is in the context that never has to enter any reader's head.

A convention can be removed, but only after recovering what decision it compressed. Removing one without that recovery is the most common way scaffolds degrade.

## The evidence

David Heinemeier Hansson's argument for Rails's "convention over configuration" in 2005 is often misread as a productivity pitch ("type less"). His actual argument is sharper: when a Rails project uses `app/models/user.rb` by default, the convention is carrying **every decision about where models live, how they're named, how they're loaded, how they relate to tables, and how they're tested**. Any developer opening the file already knows all of that. None of it has to be communicated, defended, or reviewed.

The saving is on the *reader* side, not the writer side. And it compounds: ten conventions in place means a reader can open any file and orient instantly; ten conventions absent means every file requires re-derivation from scratch.

This is the same resource that **context engineering** optimizes for agents at a lower level — finite working memory that has to re-derive what isn't explicit. Conventions are context-window economics for humans; context engineering is convention discipline for language models. They are the same phenomenon one level apart.

## Chesterton's fence

G. K. Chesterton gave the classical warning: if you find a fence in a field with no obvious purpose, **do not tear it down until you understand why it was put there**. Someone decided to build it, probably in response to something. Removing it may free the field for other uses; or it may let the bull through.

Conventions are Chesterton fences. Examples from software:

- `app/models/` vs `app/entities/` — Rails chose `models`; what decision did that compress? (Answer: that the domain-data layer corresponds to ActiveRecord-style records, not domain-driven-design aggregates. Change the convention and you change the architecture.)
- `# noqa: E501` — tolerates a long line; what decision did that compress? (Answer: that this specific long line is the right tradeoff. Remove it silently and you undo that judgment.)
- `00-inbox/` — a numeric-prefixed inbox folder; what decision did that compress? (Answer: that the temperature gradient's entry point should sort first and be visually unmistakable.)

Tearing any of these out *might* be correct — if the decision they compress has changed. But it has to be a **deliberate** tear-out, with the compressed decision recovered first. Silent removal is the failure mode.

## Why this matters for agent scaffolds

Agent scaffolds accumulate conventions faster than human frameworks because agents read more files per task. Every convention that lands saves context on every future turn an agent spends in the workspace. Every convention that drifts or vanishes silently costs context on every future turn.

Two common anti-patterns:

1. **Convention creep without documentation** — new patterns get introduced in one file and propagate by copy-paste. After six months, nobody (human or agent) can tell which of the dozen similar patterns is canonical. The agent loads all of them "just in case" and burns context deciding.

2. **Convention removal without recovery** — a pattern looks outdated, so someone removes it. The tests still pass (conventions rarely have test coverage). Six months later, a subtle coupling that the convention was silently preventing surfaces as a bug. The convention was load-bearing; nobody knew.

The discipline: **conventions enter explicitly, leave explicitly, and are documented in place**. A scaffold is a collection of documented decisions; the documentation is what separates a convention from a habit.

## The descriptive-lens alternative

A subtler move: sometimes the right convention is not a prescription but a **lens**. SEACOW in this scaffold is deliberately not "put things in `Capture/`, `Work/`, `Output/` folders." It is an analytical lens that asks: *where does information enter? where does it get processed? where does it exit?* The answers depend on context; the questions don't.

Descriptive lenses compress less than prescriptive conventions — they don't give you a folder name — but they port further. A prescriptive convention for a React project doesn't help a data-pipeline project. A descriptive lens asking "where does state enter this system" does.

This scaffold mixes both intentionally:
- **Prescriptive** (inside `01-kernel/`): skill file structure, frontmatter schema, hook file format
- **Descriptive** (inside `01-kernel/patterns/`): SEACOW lens, meta-agent pattern, Johnny Decimal
- **Opinion** (inside `02-stack/` and `03-work/`): specific tool picks, naming choices

The strata respect the portability gradient: prescription compresses more but ports less; description compresses less but ports further.

## How this scaffold expresses it

- Every convention introduced in `01-kernel/` has a named-pattern doc in `01-kernel/patterns/` or a principle page in `01-kernel/principles/` explaining the compressed decision.
- Deprecations remove the convention AND record what replaced the compressed decision.
- The stratum frontmatter is itself a convention (format: `stratum: 1–5`). Its compressed decision: every reader should know instantly whether a file is a template, pattern, or instance without having to read the file.
- `CLAUDE.md` at root is the living registry of active conventions. A convention not in `CLAUDE.md` is a habit, not a convention.

## Implications for agents

- When proposing to remove a pattern, first surface "this appears to encode decision X. Is that still current?" and require confirmation.
- When proposing a new pattern, write a one-line description of the compressed decision alongside the pattern itself — not after.
- When unsure whether something is a convention, treat it as one. False positives cost little; false negatives cost a future bug.

## See also

- [Single Canonical Addressability](06-single-canonical-addressability.md) — the convention that hierarchy-wins builds on
- [Five Strata of Repeatability](07-five-strata.md) — prescription vs description at each stratum
- `01-kernel/patterns/seacow-lens.md` — the canonical descriptive lens in this scaffold
- `CLAUDE.md` — the living convention registry

## References

- David Heinemeier Hansson, Rails documentation and talks on convention over configuration
- G. K. Chesterton, *The Thing: Why I Am a Catholic* ("The Drift from Domesticity") — the original fence passage
- Yukihiro Matsumoto, *The Philosophy of Ruby* — language-level conventions
- Christopher Alexander, *A Pattern Language* — descriptive pattern form
