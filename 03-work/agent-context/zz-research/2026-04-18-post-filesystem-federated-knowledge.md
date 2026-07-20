---
title: Post-Filesystem Federated Knowledge (capture — home TBD)
description: The tier-dependency-direction rule is a symptom of filesystem primitives. A federated / graph-native / permission-aware knowledge system replaces it with typed edges + visibility projections. Captured here for indexing; real home is probably cyberbaser or a sibling "post-library" project.
stratum: 5
status: research
date: 2026-04-18
belongs-elsewhere: true
candidate-destinations:
  - cyberbaser (federation + knowledge-platform vision)
  - a sibling project on "post-library knowledge organization"
tags:
  - meta
  - federation
  - graph-native
  - capture-only
---

## Why this is captured here

This thought surfaced while working on the tier-dependency-direction invariant (see [`2026-04-17-dependency-direction.md`](./2026-04-17-dependency-direction.md)). It doesn't belong in *this* scaffold's long-term content — this scaffold is deliberately filesystem-bound — but the thinking is live and worth indexing before it evaporates.

**Action item: revisit when cyberbaser firms up. Move then.**

## The observation

The tier-dependency-direction rule (higher tier → lower tier only, never reverse) is not a deep truth about knowledge. It's a **workaround for filesystem primitives**:

- Filesystems give each file **one canonical path**
- References are **untyped** (a link is a link)
- References have **no visibility scope** (everyone with read access sees the same link)
- **Extraction = `cp -r` of a subtree**, so links must flow one direction or they break

The one-directional rule makes extraction possible *given* these constraints. Remove the constraints and the rule is no longer load-bearing.

## What a richer system would do

A federated / graph-native / permission-aware knowledge system replaces the invariant with:

| Filesystem approach | Richer system |
|---|---|
| One canonical path per atom | Atom identity; many addresses project onto it |
| Untyped links | Typed edges (cites, contradicts, elaborates, instantiates) |
| No visibility scope | Per-edge + per-atom visibility (public, team, private, role) |
| Extraction = `cp -r` | Extraction = query with visibility + type filters |
| Federation = fork + diverge | Federation = sync protocol over the graph |

In this model, the same knowledge atom can live simultaneously in:

- A **public projection** (blog, external doc site)
- A **team projection** (with team-only context visible)
- A **private projection** (with full personal notes)

No duplication, no "extract this subtree" — it's the same atom, rendered differently per viewer's scope.

## The library-replacement angle

The broader intuition: **hierarchical classification is a physical-library artifact.** A book can only be on one shelf, so Dewey/LCC invented one-true-spine-label-per-book. Digital systems have no such constraint, yet we keep inheriting the idea:

- **Folders** ≈ shelves (one canonical location)
- **Folksonomy (tags)** escapes location but lacks structure, provenance, typed relations
- **Wikis** add linking but flatten hierarchy, have no permissioning-as-first-class
- **Graph databases** have typed edges but no federation standard + no UX for knowledge work
- **ActivityPub** federates but was built for social posts, not structured knowledge
- **IPLD / content-addressed data** solves identity + immutability but lacks the UX layer

No existing system solves:
- Typed, provenance-bearing edges
- Per-edge visibility scopes
- Federation across instances
- A UX non-specialists want to use

Historical lineage worth noting:

- **Vannevar Bush, "As We May Think" (1945)** — Memex, associative trails
- **Douglas Engelbart, NLS (1968)** — structured, cross-referenced docs, the "Mother of All Demos"
- **Ted Nelson, Xanadu** — transclusion, two-way links, micropayments for authors
- **Niklas Luhmann, Zettelkasten** — atomic notes + bidirectional referencing, pre-computer
- **Tim Berners-Lee, Solid / Linked Data** — semantic web + personal data pods
- **Rosenfeld & Morville, "Information Architecture"** — the critique of hierarchy-only thinking
- **Whittaker & Bergman, PIM research** — how people actually organize info

Each chips at the problem. None has integrated the full stack (typed edges + federation + permissions + good UX).

## Relation to cyberbaser

Cyberbaser's vision (from the user's Obsidian vault) includes:

- Federated knowledge bases with connection protocols
- Partially-public / partially-private knowledge platforms
- Role-based access within a single platform
- SEACOW meta-framework applied to knowledge-platform design

**This research entry is basically a cyberbaser concern** — it's about the architectural substrate cyberbaser needs. The filesystem-primitive scaffold (this project) explicitly *doesn't* try to solve this. It takes the constraints as given and builds clean extraction within them.

## Possible destinations

When moving this:

1. **cyberbaser ADR** — if cyberbaser becomes a concrete project, this is its "why we need to go beyond filesystems" motivating doc
2. **Sibling project "post-library knowledge organization"** — if the library-replacement angle deserves its own home (essay/long-form rather than architecture)
3. **Tier-0 `knowledge-work-foundations`** — if tier 0 eventually extracts, it could hold a "historical context & limitations" section including this
4. **Essay / blog post** — just publish it as thinking-in-public

Most likely destination: **cyberbaser ADR**, with a summary/pointer in tier 0 once that extracts.

## What to do now

Nothing. Capture-only. **Do not build on this thought within the current scaffold.** The scaffold is filesystem-primitive on purpose — that's what makes it portable + today-useful.

## See also

- [Tier Dependency Direction (Extraction Invariant)](./2026-04-17-dependency-direction.md) — the filesystem-workaround this entry critiques as "a symptom, not a deep truth"
- [Scope Expansion — Tier 0 Knowledge Work Foundations](./2026-04-18-scope-expansion-knowledge-work-foundations.md) — the upstream project that could hold a "limitations" note
- Cyberbase vault: `4 VAULTS/cyberbase/📁 54 - Obsidian Vault Organization/` — SEACOW origin + knowledge-platform meta-framework
