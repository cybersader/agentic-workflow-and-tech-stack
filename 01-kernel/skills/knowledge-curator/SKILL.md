---
name: knowledge-curator
description: The maintenance program for this scaffold's live knowledge gradient — where captures go (zz-log → zz-research → 02-stack → 01-kernel), the promotion gates between stages (evidence-gating, second-user test, supersession rules), decay review, and retrieval-friendly writing (description-as-semantic-key, one concept per file). Use when capturing insights, promoting notes between stages, deciding where knowledge lives, or reviewing stale docs.
---

# Knowledge Curator — the live gradient's maintenance program

This skill is **procedural memory**: the rules the agent executes to keep the knowledge base healthy. It is content, not a trigger — the triggers are the Stop-hook (`check-zzlog.sh`), CLAUDE.md's Hard Rules, and the user asking for capture/promotion/review.

## The live gradient

Temperature falls as the directory number falls. Promotion = moving *down* in number, *up* in distillation.

| Stage | Location | What lives here | Cadence |
|---|---|---|---|
| **HOT** | `agent-context/zz-log/<date>.md` | Session worklogs — what happened, why it mattered, receipts | Every significant session (Stop-hook enforced) |
| **WARM** | `agent-context/zz-research/<date>-<topic>.md` | "Trail of crumbs" — tool sweeps, deferred evals, orientation notes. Explicitly NOT commitments | When a thread outlives one session |
| **COOL** | `02-stack/` (patterns + section docs) | Distilled, reusable recipes and decision frameworks tied to this stack | On promotion (gated — see below) |
| **CANON** | `01-kernel/` | Tool-agnostic principles that survive a harness swap | Rarely; highest gate |
| **FROZEN** | `_archive/<YYYY-MM>/` | Retired implementations and superseded docs — preserved, out of the live namespace | On decay review |

The site mirrors (`site/`, public repos) are **views generated from these stages**, not stages themselves.

The underlying theory (Bergman & Whittaker's navigation-over-search, Noguchi's push-left, Zettelkasten fleeting-vs-permanent) lives in [`01-kernel/principles/02-temperature-gradient.md`](../../../01-kernel/principles/02-temperature-gradient.md). The numbered-zones `knowledge-base/` tree that previously instantiated this gradient is retired (template projects may still use it — the zone model remains valid for greenfield scaffolds); THIS repo's instantiation is the pipeline above.

## Write policy (promotion gates)

A knowledge base needs a **write policy, not just a read gradient** — inaccurate writes become recurrent errors an agent will confidently repeat.

1. **zz-log → zz-research**: promote when a thread spans sessions or needs topic-findability. No evidence gate — crumbs are allowed to be wrong.
2. **zz-research → 02-stack** (the big gate): requires **evidence** — at least one of:
   - the recipe was executed and verified in this environment (command output, test pass), or
   - the **second-user test**: the pattern got used a second time, unchanged, or
   - primary-source citations for every load-bearing claim.
   New promotions start `status: research`.
3. **`research` → `stable`** (within 02-stack): the doc survived contact with reality — reused without needing correction.
4. **02-stack → 01-kernel**: only if tool-agnostic — would this survive swapping Claude Code for another harness, or Tailscale for another mesh? If it names specific tools as load-bearing, it stays stack-tier.
5. **Supersession, never silent duplication**: a doc that replaces another must link it, and the superseded doc gets `status: parked` + a pointer forward. Two live docs claiming the same ground is a bug.
6. **Decay review**: any `status: research` doc untouched ~90 days gets one of: re-verify (bump), `parked` (still plausible, not active), or `_archive/` (dead). Stale confidence is worse than an honest gap.

## Retrieval duties (make knowledge findable by machines)

- **`description:` frontmatter is the semantic key** — it's what embeddings index and what agents match on. Write it keyword-rich, specific, self-contained (the existing zz-research descriptions are the house style).
- **One concept per file**; H2/H3 sections self-contained enough to be retrieved alone.
- **Update the directory's `index.md`** when adding a doc — index-first navigation is the primary retrieval path; semantic search (`cks-sem`, ck MCP) is the deep tier.
- **Frontmatter `status:` must use the site enum**: `draft | research | aligning | planning | active | observed | log | stable | parked` (pre-commit enforced).
- **Tier-2-clean by default** (CLAUDE.md Hard Rule): placeholder hostnames/paths; tier-3 specifics go to gitignored paths (`03-work/homelab/`, `research/personal-workflow/`).

## Capture heuristics (what's worth writing at all)

Capture when: rationale isn't obvious from the diff; a failure cost >30 min and has a reusable diagnosis; a decision forecloses alternatives; an external tool/fact was verified the hard way. Skip: typos, lint, sync regenerations, anything fully re-derivable in under a minute.

## Anti-patterns

- Promoting to `stable` without evidence ("it looks right") — calcifies hallucinations into canon.
- Blanket-trusting old docs — check `date:`/`status:` before citing a `research` doc as fact.
- Creating a new note when an existing one should be updated (supersession rule).
- Padding always-loaded files (CLAUDE.md) with content that belongs in a gradient stage — the always-loaded layer is a map, not a warehouse.
