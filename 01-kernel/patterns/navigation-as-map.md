---
title: Navigation as a Map, Not a Funnel
description: How to build the discovery overlay well — multiple entry vectors, descriptive links, and hub-as-map pages so a reader or agent arriving cold can navigate by intent rather than follow a prescribed order.
stratum: 1
status: stable
sidebar:
  order: 10
tags:
  - patterns
  - navigation
  - agent-context
date: 2026-04-19
---

[Single Canonical Addressability](../principles/06-single-canonical-addressability.md) settles *where* a thing lives: one hierarchy, one home, tags and links as discovery overlays on top. This pattern is about building that overlay **well** — because a discovery layer that prescribes a single reading order is barely better than no overlay at all.

## The problem

A hub page (a section index, an `agent-context` landing page, a README) has a reader or agent arriving with **no shared context** and a *specific* intent. The failure mode is writing that page as a **funnel** — "read these six docs in this order" — which:

- assumes every arrival has the same goal (they don't),
- forces a reader who needs doc #4 to scroll past 1–3,
- and goes stale the moment the "right order" changes.

The author knows the territory and writes the path *they* would take. But the reader isn't the author, and the next reader isn't this one.

> A funnel optimizes for the author's mental model. A map optimizes for the reader's intent. Hubs are read by strangers — write the map.

## The pattern

Build hub pages as **maps with multiple entry vectors**, not ordered sequences.

### 1. Offer several doors, labelled by intent

Group the outbound links by *what the reader is trying to do* or *what subject they're after* — by-task, by-topic, by-audience, by-platform — and let them pick. The same body of content gets several entrances. An auditor and a developer read the same architecture doc; they should reach it through different doors labelled in their own terms.

```
## Find your way in
- Understand the core idea  → [vision] · [comparison]
- Work on filtering         → [DNS layers] · [strategy] · [blocklists]
- Advance an open question  → [open challenges]
```

Not:

```
## Read these in order
1. vision   2. architecture   3. DNS layers   ...
```

### 2. Describe why, then link

Every link earns a one-line descriptor — what's there and why you'd follow it — so a reader decides *without clicking*. This is what makes a dense link list **scannable** instead of a wall of blue text.

```
[Encryption-resistant strategy](...) — the core bet: control what runs and
renders, not what transits. Why the architecture survives ECH.
```

Not `[Learn more](...)` or `see the [docs](...)`. A bare link forces a click to find out if it was the right one; a described link lets the reader skip it confidently.

### 3. Link at first mention, inline

When a concept appears in prose, link it *there* — not in a far-off "further reading" list. The reader can branch at the exact moment the question forms, or read on. This turns the prose itself into navigation.

### 4. Hub pages map; they don't gate

A section index should answer "what's in here and why would I go to each?" — a labelled directory of its children — not "here's the one path through." Reserve ordered sequences for the rare case of a *genuine* dependency (B literally cannot be understood before A). Name that dependency when it's real; otherwise, show the map.

### 5. Close with sideways jumps

End a page with a short **Related** block — em-dash-described links to adjacent material — so the reader who finished has somewhere lateral to go, not just back.

## Why this works

It aligns with how knowledge actually branches ([principle 06](../principles/06-single-canonical-addressability.md): hierarchy for recovery, overlay for discovery) and with how agents consume context ([principle 08](../principles/08-four-channels-of-context.md): the principal-authored channel is richest when every link is pre-described, so the agent spends fewer turns figuring out which to open). A map lets a finite-attention reader — human or AI — spend their attention on *their* path instead of the author's.

For the cross-cutting axis specifically — "everything about X" that spans several folders — lean on the tag system (`/tags/<topic>/`), which generates those views automatically. The folder tree gives one canonical home; tags give the cross-folder slices the tree can't. Build a topic tag where, and only where, a subject genuinely cross-cuts folders.

## When NOT to use it

- A true linear tutorial with real step dependencies *is* a funnel, correctly. Number it.
- A single-purpose page with one obvious next action doesn't need a map.

## See also

- [Single Canonical Addressability](../principles/06-single-canonical-addressability.md) — the principle this pattern builds the overlay for
- [Four Channels of Context](../principles/08-four-channels-of-context.md) — why pre-described links cost an agent fewer turns
- [Progressive Disclosure](../principles/04-progressive-disclosure.md) — maps disclose breadth; descriptors disclose depth on demand
