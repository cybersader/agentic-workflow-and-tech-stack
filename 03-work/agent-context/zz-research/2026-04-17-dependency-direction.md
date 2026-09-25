---
title: Tier Dependency Direction (Extraction Invariant)
description: Higher-tier-number content may reference lower, not the reverse. The single invariant that makes clean extraction possible. Candidate for promotion to kernel/principles once the enforcement tooling is in place.
stratum: 5
status: research
date: 2026-04-17
tags:
  - meta
  - architecture
  - extraction
  - layering
---

## The insight

In a layered scaffold where tier 3 ⊃ tier 2 ⊃ tier 1, cross-tier references must flow in one direction only: **higher tier number can reference lower, never the reverse.**

| From → To | Allowed? | Reason |
|---|---|---|
| Tier 3 → Tier 2 | ✅ | Stack is always present when work is |
| Tier 3 → Tier 1 | ✅ | Kernel is always present when work is |
| Tier 2 → Tier 1 | ✅ | Kernel is always present when stack is |
| Same-tier → Same-tier | ✅ | Self-contained within a tier |
| Tier 2 → Tier 3 | ❌ | Extracting stack leaves work content missing → dead link |
| Tier 1 → Tier 2 or 3 | ❌ | Extracting kernel leaves everything else missing |

**Load-bearing property:** without this rule, extraction requires link rewriting and conditional archaeology. With it, extraction is a `cp -r` of the right folders.

## Why this matters

The three-tier model only pays off if tiers can be extracted **mechanically**:

```bash
# Kernel repo: just tier 1
cp -r 01-kernel/* kernel-repo/

# Stack repo: tier 1 nested + tier 2 content
cp -r 01-kernel/* stack-repo/01-kernel/
cp -r 02-stack/* stack-repo/02-stack/

# Work repo (this one): everything
# no change needed
```

If kernel content hard-links into tier-2 or tier-3 paths, those links 404 the moment kernel is published alone. If stack content hard-links into tier-3 paths, same problem for the stack repo.

Keeping links one-directional means extraction never requires rewriting content. The extraction script becomes a pure composition: copy the tier + all tiers below it.

## Current state

This invariant is NOT yet enforced. Current monorepo likely has violations — principle pages (tier 1) that link into `02-stack/patterns/` or `03-work/memory/` for example material.

Enforcement strategy (planned, not built):

### 1. Sync-time lint

Extend `site/scripts/sync-content.mjs`: when processing a file, inspect every link it emits. If a tier-1 file's resolved link lands in a tier-2 or tier-3 route, flag. Same for tier-2 → tier-3. Build fails on violation.

```text
[sync] ✗ VIOLATION  01-kernel/principles/04-progressive-disclosure.md
        line 47 links to 02-stack/patterns/obsidian-workflow.md (tier 1 → tier 2)
```

### 2. Extraction dry-run

Before publishing kernel/stack repos, run their smoke tests. Any 404s = violation remaining; abort and report.

### 3. Soft-reference convention

When a tier-1 page WANTS to gesture at "here's how this is applied in practice," use **prose references**, not hard links:

```markdown
❌ See [`../../02-stack/patterns/obsidian-workflow.md`](../../02-stack/patterns/obsidian-workflow.md)

✅ For a stack-level implementation, see the `patterns/obsidian-workflow` entry
   in any tier-2 derivative (e.g., `02-stack/` in this scaffold).
```

The prose describes what to look for; the reader finds it in whichever derivative they have.

## Relation to stratum frontmatter

This invariant works with the existing `stratum:` frontmatter convention:

- `stratum: 1` = must only reference other `stratum: 1` files OR external URLs
- `stratum: 2` = may reference stratum 1 or 2
- `stratum: 3 (parametric)` / `stratum: 4 (deterministic)` = same rules as the tier they belong to
- `stratum: 5` = may reference anything (tier 3 is the "top" of the stack)

Stratum is file-level; folder location is derived structure. **The lint checks folder-location, not stratum** — because a `stratum: 1` file misplaced in `03-work/` shouldn't be exported into the kernel extract anyway.

## Related open work

- **Extraction script** (`scripts/extract-tiers.sh`) — Phase 8 of the roadmap. Should encode this invariant in its composition.
- **Tier-direction lint** — a build-time check. Zero-tolerance. Blocks `bun run build` on violation.
- **Audit of existing content** — I likely have violations in current principle pages. First lint run will be a pile of "fix these" items.

## Candidate promotion

When the enforcement tooling is built and the audit is done, this insight graduates to **`01-kernel/principles/`** as a named principle — something like:

> **Tier-Direction Invariant**: In a layered scaffold, cross-tier references must flow from higher tier number to lower. This is the load-bearing property that makes extraction a composition rather than a rewrite.

Until then, lives here.

## See also

- [Meta / Self-Reference principle (09)](../../../principles/09-meta-self-reference/) — the kernel/vault/meta separation rationale this extends
- [Five Strata of Repeatability (07)](../../../principles/07-five-strata/) — the stratum framework
- [ROADMAP — Phase 8](../../../../ROADMAP.md) — extraction phase
