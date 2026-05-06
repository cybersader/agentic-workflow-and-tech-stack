---
title: Single Canonical Addressability
description: Why hierarchy wins despite richer alternatives — single unambiguous addresses beat expressive relations when the primary failure mode is recovery.
stratum: 1
status: stable
sidebar:
  order: 6
tags:
  - principle
  - philosophy
  - foundations
---

## The claim

Organization systems are either **exact** (one correct address, mechanically resolvable) or **ambiguous** (multiple valid paths via tags, links, semantic relations). Exact beats ambiguous when the primary failure mode is *recovery* — "where did I put that?" Ambiguous beats exact when the primary failure mode is *discovery* — "what else exists like this?"

For a user-authored workspace whose owner has to find things again, recovery is the primary failure mode. Hierarchy — single canonical addressability — therefore wins, even against technically richer alternatives. Graphs, tags, links, and semantic layers become navigation aids *within granted hierarchical scope*; they do not replace it.

## The evidence

Rosenfeld, Morville & Arango's *Information Architecture* (the "polar-bear book") formalizes the distinction. Exact organization schemes — alphabetical, chronological, geographic — produce a single correct address, are cheap to build, and fail at ambiguous queries. Ambiguous schemes — topical, task-based, audience-based — are powerful for browse and discovery but produce disagreement about where a thing goes.

Hierarchy is fundamentally exact-over-ambiguous: pick a primary classification, commit to single inheritance, accept that any item has exactly one canonical location. Everything else becomes overlay.

The empirical history is one-sided. Technically richer alternatives that tried to displace hierarchy all lost:

- **Vander Wal's folksonomies** (del.icio.us, Flickr) scaled personal tagging but never produced findable shared ontology. Two users tag the same bookmark "programming" and "software"; neither path reaches the other's item.
- **Berners-Lee's Semantic Web** — the maximalist ambiguous-organization project — never displaced URLs, which are a hierarchy (`scheme://authority/path`).
- **Ted Nelson's transclusion** and ZigZag — elegant, powerful, never adopted at scale.
- **Hans Reiser's semantic filesystems**, **BeFS's attribute queries**, **WinFS** — technically beautiful, all lost to `/home/user/projects/foo/README.md`.

They lost because single canonical addressability is worth more than expressiveness when the question is **"where did I put that."** You can tell a collaborator — human or AI — *where* a thing is in a single sentence. No graph traversal, no disambiguation, no retrieval query.

## The Monica Chin counter-argument, properly read

Chin's 2021 *Verge* piece "File Not Found" caused brief panic by showing that students raised on Google search did not natively understand directory structure. The piece is correct about the observation; the common reading — "hierarchy is obsolete" — is wrong.

The correct reading: hierarchy is a **learned abstraction** that pays off only when you need repeated, addressable, low-cost access to a large user-authored collection. The students who confused Professor Garland had no such collection and no need; they had a search box and a recommender. The moment they do need addressable access — which anyone doing real work eventually does — they recapitulate hierarchy in Notion pages, in Google Drive folders, in Figma project structures.

The abstraction returns because the problem returns.

## Why this matters for agent scaffolds

An AI agent's primary failure mode in a workspace is exactly "where did I put that" — except it is not the agent's own put, but the put of whoever wrote the workspace. Agents navigate by glob, grep, and file read. They benefit from the same affordances humans benefit from:

- **Predictable location** — if `skills/` contains skills, no search needed
- **Compact addresses** — a path fits in a prompt; a search query has to generate, execute, parse
- **Recognizable names** — `01-kernel/principles/04-progressive-disclosure.md` tells you what it is before you open it

An agent in a tag-first or graph-first workspace spends context figuring out the ontology before it can do work. An agent in a hierarchical workspace spends context doing work.

The industry is rediscovering this. Cursor's `.mdc` rules live in `.cursor/rules/` — a hierarchy. Claude Code skills live in `.claude/skills/<name>/SKILL.md` — a hierarchy. AGENTS.md is a single root file — maximal hierarchy at one level. The convergence is not coincidence.

## The complete access model

Hierarchy wins, but four mechanisms coexist and compose:

1. **Hierarchical access** (path-based, default) — access flows downward automatically. Granting `/projects/client-a/` grants all children. This is the primary primitive.
2. **Tag-based access** (metadata-based, cross-cutting) — grants regardless of path. Nested tags create hierarchies within the tag system (`--entity/cybersader/home-lab`).
3. **Graph navigation within scope** (free) — links, backlinks, embeds. No new access; navigation aid within what's already granted.
4. **Explicit edge grants** (relationship-based, configurable) — the escape hatch when navigation needs to cross boundaries.

The principle: hierarchy is default. Tags are cross-cutting. Graph aids navigation. Explicit grants are the exception, not the rule. Implementation varies by technology but the ordering is stable.

## How this scaffold expresses it

- Top-level tier folders (`01-kernel/`, `02-stack/`, `03-work/`, `00-meta/`) with dash-numeric prefixes — exact addressability, sort order preserved.
- Content within each tier arranged hierarchically with named subfolders (`principles/`, `patterns/`, `skills/`).
- Wiki-links and site graph operate *within* granted scope (the repo); they do not replace the path-based addressing.
- Tags in frontmatter are cross-cutting but do not override location — a file with `tags: [foundations]` still lives at one specific path.
- Every principle and pattern has exactly one canonical location. If referenced from elsewhere, it is linked, not duplicated.

## Implications for agents

- When asked where something lives, answer with a single path — never "it could be at X or Y."
- When creating new content, place it at one canonical location, link from others. Never duplicate.
- When tagging, treat tags as discovery overlays, not as location alternatives.
- Resist tool features that encourage many-location storage ("this note also appears in..."). Such features help discovery at the cost of recovery and typically lose the tradeoff.

## See also

- [Capture → Work → Output](01-capture-work-output.md) — flow as one axis of hierarchical decomposition
- [Convention as Compressed Decision](05-convention-as-compressed-decision.md) — how hierarchical conventions compress reader context
- `research/FOUNDATIONS.md` — the "hierarchy is access, graph is navigation" core insight
- `01-kernel/ARCHITECTURE.md` — tool-level access model

## References

- Rosenfeld, Morville & Arango, *Information Architecture: For the Web and Beyond* (the polar-bear book), 4th ed. O'Reilly 2015
- Bergman & Whittaker, *The Science of Managing Our Digital Stuff* (MIT, 2016)
- Monica Chin, "File Not Found" (*The Verge*, September 2021)
- Thomas Vander Wal, folksonomy coinage (del.icio.us/Flickr era)
- Hans Reiser, ReiserFS / Reiser4 semantic filesystem experiments
- Tim Berners-Lee, Semantic Web efforts (W3C 2001–present)
