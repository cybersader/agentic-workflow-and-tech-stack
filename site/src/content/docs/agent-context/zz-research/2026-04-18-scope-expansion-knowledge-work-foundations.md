---
title: Scope Expansion — A Tier 0 "Knowledge Work Foundations"
description: Half of this project's "agentic kernel" is actually knowledge-work-general, not agentic. Captures the decision to eventually extract that material into an upstream project (`knowledge-work-foundations`) where this scaffold becomes one specialization among several. Documents the current project's tier-0-candidate audit.
stratum: 5
status: research
date: 2026-04-18
tags:
  - meta
  - architecture
  - scope
  - seacow
  - knowledge-engineering
---

## The insight

The scaffold's "agentic kernel" is about half **agent-specific** and half **knowledge-work-general**. The general half has roots in cyberbase's original SEACOW formulation and the broader knowledge-engineering / information-science literature. Those roots deserve their own home — as a **tier 0** upstream project that this agentic-workflow project (and potentially others) inherits from.

**Provisional name for the upstream:** `knowledge-work-foundations`.

Decision status: **accepted in principle, not yet executed**. Execute after Phase 8 extraction of this project's current kernel/stack.

## Evidence

### Cyberbase is where SEACOW actually came from

`4 VAULTS/cyberbase/📁 54 - Obsidian Vault Organization/Knowledge Platform Organization Meta-Framework/Knowledge Platform Organization Meta-Framework.md` (dated March 2025) contains:

- The original SEACOW(r) derivation — S(ystem), E(ntity), A(ctivities: C/O/W/r)
- An earlier "WORCS" formulation the user iterated toward SEACOW from
- The `r` in SEA(COW**r**) deliberately marked as **debatable** — relation may or may not be first-class
- The "Isn't PARA enough?" debate — why PARA misses Output, Relation, and Entity
- Naming conventions (MojiDex, folder-level-purpose rules)
- Component synonyms — Capture/Input, Work/Processing, Output/Communication/Delivery/Publishing, System/Platform/Technology

Adjacent material in the same vault:

- `📁 54/Information Organization Systems/` — PARA, Zettelkasten, LYT MOCs, Johnny Decimal comparisons
- `📁 54/Folders vs Tags vs Links vs Metadata/` — the hierarchy-vs-graph-vs-tag debate
- `📁 54/Ideas for Knowledge Organization/` — terminology and ontology discussion
- `CybersaderNotion/04 Cybersader's Arsenal/Building a Knowledgebase.md` — terminology map (ontology, taxonomy, epistemology, knowledge graph, symbolic knowledge distillation, semantic embeddings, NLP, philosophical research methods)

**None of this material is agent-specific.** It's information architecture and knowledge-engineering thinking applicable to any knowledge platform — Obsidian, Notion, wiki, file share.

### Principle audit — which of my 10 kernel principles belong upstream?

| # | Principle | Agent-specific? | Tier-0 candidate? |
|---|---|---|---|
| 01 | Capture → Work → Output | No — GTD/CODE/Zettelkasten predate agents by decades | ✅ yes |
| 02 | Temperature Gradient | No — Noguchi's push-left filing predates computers | ✅ yes |
| 03 | Skills vs Agents | Framed agentic, but dunamis/energeia is general cognitive science | ⚠️ partially — the *distinction* is general; the *LLM framing* is tier 1 |
| 04 | Progressive Disclosure | Nielsen UX version is general; LLM cache/context-rot framing is tier 1 | ⚠️ partially — keep UX-level in tier 0, LLM specifics in tier 1 |
| 05 | Convention as Compressed Decision | No — DHH/Rails, Chesterton's fence, convention-over-configuration | ✅ yes |
| 06 | Single Canonical Addressability | No — Rosenfeld polar-bear, Bergman-Whittaker PIM research | ✅ yes |
| 07 | Five Strata of Repeatability | No — Alexander's pattern-language form, software layering | ✅ yes |
| 08 | Four Channels of Context | **Yes — LLM inference mechanics** | ❌ stays tier 1 |
| 09 | Meta / Self-Reference | General — compiler/interpreter separation (Rust analogy) | ✅ yes |
| 10 | Multi-Entity Design | Dual-framed — info science (Rosenfeld) + agents | ⚠️ partially — the info-science half belongs in tier 0 |

**Counted: ~6 fully upstreamable + 3 partially = majority of kernel material has a more-general home.**

## Proposed model

```
┌──────────────────────────────────────────────────────────────────┐
│  Tier 3: Work (this user's instance)                              │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Tier 2: Stack (opinionated agentic toolkit)                │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │  Tier 1: Agentic Kernel                               │  │   │
│  │  │  (4 channels, skills-vs-agents LLM framing,           │  │   │
│  │  │   progressive disclosure for context windows,         │  │   │
│  │  │   kernel/stack/work meta-self-reference, etc.)        │  │   │
│  │  │  ┌────────────────────────────────────────────────┐  │  │   │
│  │  │  │  Tier 0: Knowledge Work Foundations              │  │  │   │
│  │  │  │  SEACOW framework, capture/work/output,         │  │  │   │
│  │  │  │  temperature gradient, single canonical          │  │  │   │
│  │  │  │  addressability, convention as compressed        │  │  │   │
│  │  │  │  decision, five strata of repeatability,         │  │  │   │
│  │  │  │  knowledge-engineering lexicon                   │  │  │   │
│  │  │  └────────────────────────────────────────────────┘  │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Composition rule extends upward

The dependency-direction invariant (see [`2026-04-17-dependency-direction.md`](/agentic-workflow-and-tech-stack/agent-context/zz-research/2026-04-17-dependency-direction/)) applies to the 4-tier model identically:

| From → To | Allowed? |
|---|---|
| Any higher tier → lower tier | ✅ |
| Any lower tier → higher tier | ❌ (extraction breaks) |

Tier 0 is the most universal; it only references itself + external literature (Rosenfeld, Luhmann, DHH, Alexander, etc.). Tier 1 references tier 0 freely. And so on.

## Name choice

**Working name: `knowledge-work-foundations`.**

Alternatives considered:

| Name | Pros | Cons |
|---|---|---|
| `knowledge-work-foundations` | Clear, broad, self-explanatory | Maybe too generic — "foundations" of what? |
| `kb-engineering-foundations` | Tighter tie to knowledge engineering | "KB" is jargon; less inviting |
| `information-architecture-foundations` | Directly cites the Rosenfeld polar-bear book lineage | Too academic; narrows the scope |
| `second-brain-foundations` | Forte/PKM resonance | Tiago Forte owns the branding; confusing |
| `seacow` | Brand consistency with cyberbase origin | Obscure; requires lookup; loses the opportunity to be explicit |
| `knowledge-platform-foundations` | Matches the cyberbase doc's phrasing | Still a bit jargony |

Final pick holds unless a better name surfaces in review. **Provisional — can rename before the actual extraction happens.**

## What stays in this project (agentic-workflow) after tier 0 extraction

Strictly agent-specific material:

- **Principle 08: Four Channels of Context** — LLM inference mechanics (weights, principal, environment, self)
- **Principle 03: Skills vs Agents** (LLM-framed version) — with a pointer to tier 0 for the general cognitive-science foundation
- **Principle 04: Progressive Disclosure** (LLM-framed version) — context rot, cache economics, lost-in-the-middle
- **Principle 10: Multi-Entity Design** (agent half) — humans + AI agents as dual first-class consumers
- Meta-agents, meta-skills, hooks, templates — all still tier 1/2/3
- The 3-zone kernel/stack/work model (still load-bearing for extraction; only the name of the upstream tier changes)

Reduced from ~10 principles in tier 1 → maybe 4-5, each tighter and more focused.

## Other potential specializations of tier 0

Once `knowledge-work-foundations` exists, it's a parent to arbitrary sibling specializations:

- `agentic-workflow-and-tech-stack` ← **this project** (agentic specialization)
- `research-methodology-foundations` ← for grad students / academics doing literature synthesis
- `corporate-kb-foundations` ← for enterprise knowledge teams
- `personal-productivity-foundations` ← for non-agent PKM (Tiago Forte / Milo audiences)
- `writing-foundations` ← for book-writing / long-form essay workflows

The key property: tier 0 is general enough that it pays rent for all of these. That's the test of whether a piece belongs in tier 0 vs tier 1+: does a non-agentic audience benefit from it? If yes, tier 0.

## Execution plan (rough)

### Now (this research entry, done)

Capture the decision. Don't execute.

### During KB review

Add to each `01-kernel/principles/*.md` frontmatter a hint:

```yaml
would-live-in-tier-0: true  # for 01, 02, 05, 06, 07, 09; partial for 03, 04, 10
```

Makes the later extraction a grep.

### After Phase 8 (this project's kernel/stack/work extraction)

1. Scaffold `cybersader/knowledge-work-foundations` as a new private repo
2. Site structure: Starlight, similar to current, but NO `02-stack/` or `03-work/` tiers — just principles/, patterns/, and a lexicon (the cyberbase-derived terminology map)
3. Source material to pull in:
   - Cyberbase's `Knowledge Platform Organization Meta-Framework` → `principles/01-seacow-framework.md`
   - Cyberbase's `Information Organization Systems` → `patterns/knowledge-systems-comparison.md` (PARA, Zettelkasten, LYT, Johnny Decimal)
   - Cyberbase's `Folders vs Tags vs Links vs Metadata` → `principles/02-hierarchy-vs-graph-vs-tag.md`
   - Cyberbase's `Building a Knowledgebase` terminology → `reference/knowledge-engineering-lexicon.md`
   - This project's tier-0-candidate principles (from the audit above) → rewritten in neutral voice, with agentic framing stripped
4. Rework this project's kernel to reference tier 0 + hold only truly agent-specific content
5. Update `ROADMAP.md`, `CONTRIBUTING.md`, `README.md` to describe the relationship
6. Same stratum framework, same extraction approach, just one level up

### Eventual consequences

- `agentic-workflow-and-tech-stack` becomes a specialization, not a generalist scaffold
- Non-agentic audiences (researchers, writers, PKM enthusiasts) benefit from `knowledge-work-foundations`
- Tier 1 becomes smaller + more focused on agentic concerns
- The 4-level stack is explicit: tier 0 → tier 1 → tier 2 → tier 3

## What this doesn't change

- Current monorepo organization (still 01-kernel/, 02-stack/, 03-work/, 00-meta/)
- Phase 8 extraction plan for this project's current tiers
- The stratum frontmatter or dependency-direction invariant
- Anyone's current reading of the principles — they're still valid; they just find better homes later

## Candidate promotion

This research entry itself is **candidate for promotion** to the future `knowledge-work-foundations` project as an "architecture decision record" (ADR) explaining why that project exists.

When tier 0 is extracted, move this file to `knowledge-work-foundations/adr/` or similar and update its frontmatter.

## See also

- [Tier Dependency Direction (Extraction Invariant)](/agentic-workflow-and-tech-stack/agent-context/zz-research/2026-04-17-dependency-direction/) — the composition rule that extends to 4 tiers identically
- [Principle 07: Five Strata of Repeatability](/agentic-workflow-and-tech-stack/principles/07-five-strata/) — the portability axis; tier 0 is where strata 1 content gravitates even more naturally than tier 1
- [Principle 09: Meta / Self-Reference](/agentic-workflow-and-tech-stack/principles/09-meta-self-reference/) — the kernel/vault/meta separation, which itself is a form of layered composition
- [ROADMAP — future Phase](/agentic-workflow-and-tech-stack/kernel/roadmap/) — should gain a phase entry for "Extract tier 0"
- Cyberbase: `📁 54 - Obsidian Vault Organization/Knowledge Platform Organization Meta-Framework/Knowledge Platform Organization Meta-Framework.md` (the direct intellectual ancestor)
