---
title: Multi-Entity Design
description: Humans and AI agents are both first-class consumers of this scaffold. Serving both simultaneously forces discipline that benefits each.
stratum: 1
status: stable
sidebar:
  order: 10
tags:
  - principle
  - philosophy
  - foundations
  - dual-audience
---

## The claim

Most knowledge bases are designed for humans first; agents scrape them as secondary consumers. This default inverts in the agentic setting: the filesystem is consumed at least as often by AI agents (via glob, grep, read) as by humans (via editor, site view, search). A scaffold designed for only one audience loses the other.

Designing for both simultaneously forces discipline that benefits each. The site view (rendered for humans) and the raw filesystem (consumed by agents) must be the same source — rendered twice, not authored twice.

## The SEACOW Entity axis, applied

SEACOW's Entity axis asks "who interacts with this system?" For this scaffold, the honest answer is **dual**:

- **Humans** — the user, future versions of the user, fork users, readers arriving via the site. They consume via navigation (editor, Obsidian, Starlight site), rely on visual hierarchy, prefer recognition over recall.
- **AI agents** — Claude Code, OpenCode, Cursor, Cline, future agents. They consume via glob/grep/read, rely on predictable paths and parseable frontmatter, prefer small stable cacheable prefixes.

Both are *primary* consumers. Neither is an afterthought.

## What each entity needs

| Need | Humans | Agents |
|---|---|---|
| Navigation | Visual hierarchy, sidebar, site graph | Predictable paths, index files |
| Discovery | Search, recognition | Description-based semantic match |
| Load | Reading top-to-bottom | Cached prefix + just-in-time retrieval |
| Memory | Recognition beats recall | Stratum tags for selective loading |
| Feedback | Clear error messages | Parseable output, exit codes |
| Time | Sessions with breaks | Single turn, no persistence between |

These needs are **not contradictory** — but they are non-trivially different. A convention that helps one and hurts the other is poor design; a convention that helps both is scaffold discipline.

## Disciplines that serve both

### 1. Single canonical addressability

Humans recognize one-path-per-thing because it reduces cognitive load. Agents prefer it because it fits in a cache prefix and requires no disambiguation query. The hierarchy principle ([06](06-single-canonical-addressability.md)) serves both directly.

### 2. Explicit frontmatter

Humans skim frontmatter for status cues. Agents parse it deterministically without burning reasoning tokens. Every markdown file with `title`, `description`, `stratum`, `status`, `tags` serves both audiences from the same source.

### 3. Named conventions over ad-hoc structure

A documented convention ([05](05-convention-as-compressed-decision.md)) saves humans from re-deriving "where does this go" and saves agents from re-discovering the workspace ontology each session.

### 4. Progressive disclosure

Humans do not read everything on arrival; they navigate to what's relevant. Agents cannot load everything; they retrieve on demand. The same progressive-disclosure discipline ([04](04-progressive-disclosure.md)) serves both.

### 5. Stable prefix, volatile tail

Cache economics force agents to keep prefixes stable. Document-design for humans does similar: top matter stays (title, orientation), body evolves. A scaffold that disciplines the prefix to be stable serves both.

## What serves only one audience

Some choices genuinely trade off. When they do, the tradeoff should be deliberate:

### Serves humans, costs agents
- Rich HTML rendering with custom components — humans see visual emphasis, agents see `<PageTitle status="stable">...` which isn't parseable unless components degrade to markdown
- Long prose narrative — humans follow the argument; agents burn tokens summarizing
- Assumed context from earlier pages — humans remember; agents don't

### Serves agents, costs humans
- Overly-terse frontmatter — agents parse it fast; humans can't infer what the file is
- Numeric prefixes without explanation — agents sort correctly; humans wonder why files are numbered
- Very short skill files (optimized for cache) — humans want more context

Handling: render differently for each audience. Starlight transforms markdown into rich human-friendly pages with navigation; agents read the raw markdown directly. Both start from the same source.

## Why this matters beyond this scaffold

The dual-audience design discipline is **generalizable**: any knowledge system that will be consumed by AI agents in addition to humans benefits from it. The principles above aren't scaffold-specific; they're a response to the underlying fact that finite-attention consumers need single-source, multi-rendered content.

Industry convergence is partial evidence. AGENTS.md is an agent-first root file; `.mdc` rules files parse cleanly for agents but render poorly for humans; CLAUDE.md is human-friendly prose that agents also read. The scaffolding world is still early-phase on this — most systems optimize for one audience and accept collateral damage on the other. Over the next several years, multi-entity design will move from "discipline few projects practice" to "expected baseline."

## How this scaffold expresses it

- **Same source** — `01-kernel/`, `02-stack/`, `03-work/` are read by agents directly; the Starlight site in `site/` renders the same content for human browsing. No double-authoring.
- **Frontmatter badges** — the site renders `stratum:` as a colored badge for humans; agents read the same YAML field for programmatic filtering.
- **Wikilinks** — Obsidian-style `[[file]]` resolves for humans in Obsidian; `remark-wiki-link` resolves it for the site; agents follow the same path syntax.
- **Hooks** — deterministic scripts that fire for agents, emit console messages for humans. Same script, two audiences.
- **Stratum tags** — humans skim the badges; agents filter on the field for selective loading.

## Implications for agents

- When authoring new content, write for both audiences: explicit frontmatter *and* clear prose narrative.
- When considering a format that helps only one audience, flag the tradeoff explicitly and consider a render-time transformation.
- Avoid features that silently serve only one audience (e.g., inline HTML that humans see and agents must decode).
- Treat parseable structure (frontmatter, headings, wikilinks) as the agent-facing API. Keep its schema stable.

## See also

- [Progressive Disclosure](04-progressive-disclosure.md) — the mechanism that lets both audiences scale
- [Single Canonical Addressability](06-single-canonical-addressability.md) — the hierarchy that serves both
- [Convention as Compressed Decision](05-convention-as-compressed-decision.md) — disciplines that save both audiences context
- `site/` — the human-rendering layer built on the same source
- SEACOW Entity axis — the framework element this principle addresses

## References

- W3C discussions on multi-audience content (HTML + ARIA)
- Anthropic Skills documentation — agent-facing metadata schemas
- Obsidian community on human-first + machine-parseable markdown
- AGENTS.md open standard (Agentic AI Foundation, 2025) — convergence on dual-audience root file
