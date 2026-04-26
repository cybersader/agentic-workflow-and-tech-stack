---
title: Five Strata of Repeatability
description: What is portable in a scaffold decomposes into five layers. Confusing them is the most common scaffold pathology.
stratum: 1
status: stable
sidebar:
  order: 7
tags:
  - principle
  - philosophy
  - foundations
  - repeatability
---

Five layers of what ports from one project to another, sorted most-universal to most-specific. Click any card to jump to its definition; the full rationale is below.

<div class="strata-diagram">
<div class="strata-axis"><span>◄ more abstract · ports everywhere</span><span>more concrete · lives here ►</span></div>
<div class="strata-row">
<a href="#stratum-1" class="strata-card strata-card-1"><span class="strata-level">S1</span><span class="strata-name">Philosophy</span><span class="strata-tag">Always true, everywhere</span></a>
<a href="#stratum-2" class="strata-card strata-card-2"><span class="strata-level">S2</span><span class="strata-name">Pattern</span><span class="strata-tag">Same shape, different content</span></a>
<a href="#stratum-3" class="strata-card strata-card-3"><span class="strata-level">S3</span><span class="strata-name">Parametric</span><span class="strata-tag">Fill-in-the-blank template</span></a>
<a href="#stratum-4" class="strata-card strata-card-4"><span class="strata-level">S4</span><span class="strata-name">Deterministic</span><span class="strata-tag">Drop-in script or fixed file</span></a>
<a href="#stratum-5" class="strata-card strata-card-5"><span class="strata-level">S5</span><span class="strata-name">Instance</span><span class="strata-tag">This specific thing, non-templatable</span></a>
</div>
</div>

> [!note]- What's a "stratum" — and why is this a first principle?
>
> A **stratum** is a *level of repeatability — of a convention*. It measures how much a **methodological encoding** (a file, rule, template, or script we wrote to capture how work happens) transfers to another project unchanged.
>
> It does NOT classify knowledge work itself — the cognitive activity of thinking, writing, building. The strata classify our *attempts to encode patterns* about that work so agents (human or AI) can reuse them.
>
> This is **first-principles thinking** applied to methodology: instead of prescribing *"always use templates"* or *"always scaffold from defaults,"* it asks a more fundamental question — *how much must change when I port this convention to another context?* Five irreducible answers emerge (philosophy → pattern → parametric → deterministic → instance), defined below.
>
> You see this on every page in this site: the colored badge under each page title declares its stratum, so readers (and AI agents) know how universal vs. personal the encoded convention is.

> [!caution]- Caveat: this is an approximation, not a taxonomy
>
> The five strata are an **imperfect way of categorizing the repeatability of conventions**. Real artifacts slide between strata, hybridize, or land at different strata when viewed from different angles:
>
> - A page can be mostly-S2 with S5 examples inline.
> - A script can be "S4 logic wrapping S5 values" — the control flow ports; the data doesn't.
> - A user's personal workflow is simultaneously an **S3 template** ("how I work" with parametric slots) AND an **S5 instance** ("what I actually ran today"). The *encoded* workflow is S3; the *live state* is S5.
>
> Treat the strata as a **lens** for deciding where a convention belongs and catching scaffold-authoring mistakes — not as boxes that content must purely fit into. When in doubt, mark lower-stratum (more generic) and let usage show whether that was right. The five strata themselves are a stratum-2 pattern — a useful shape, not a universal law.

## The claim

The repeatable part of a knowledge-work scaffold is smaller than it looks. The non-repeatable part is more valuable than it looks — as a worked example. The honest decomposition of *what ports where* has five layers, not two, and confusing them is the most common scaffold pathology.

A component in the wrong stratum behaves badly: a stratum-5 instance stored as a stratum-3 template forces every fork to edit cybersader-specific content; a stratum-2 pattern presented as a stratum-4 deterministic script fails when context differs. Naming the stratum makes these failures predictable.

## The five strata

<a id="stratum-1"></a>

### Stratum 1 — Philosophy (always true, everywhere)

Invariants of structured cognitive work. They port to any tool, any workflow, any year.

Examples in this scaffold: capture→work→output flow, hot→cold attention gradient, passive-expertise vs active-executor distinction, progressive-disclosure discipline, convention-as-compressed-decision, single-canonical-addressability, four-channels-of-context, five-strata-of-repeatability itself.

These belong in [01-kernel/PHILOSOPHY.md](../../start/philosophy/) and [01-kernel/principles/](../) as **claims about the world**, not as prescriptions about this repo. They are the only things that port to a radically different toolchain without modification.

<a id="stratum-2"></a>

### Stratum 2 — Pattern (same shape, different content)

Structural patterns whose fill differs per project but whose frame is stable. They port as **named patterns with examples**, not as files to copy verbatim — the Christopher Alexander pattern-language form, not the Yeoman scaffold form.

Examples: SEACOW lens (the framework, not a folder structure), the temperature-gradient zones, the skills-vs-agents split, the meta-agent pattern (writer-per-artifact), the hook pattern (deterministic predicates gate context loading), progressive disclosure three-layer reads, Johnny Decimal numeric prefixes.

These live in [01-kernel/patterns/](../../patterns/). They compress less than prescriptive conventions but port further. A pattern page is "when you face problem P, the shape of a solution is S; here are examples."

<a id="stratum-3"></a>

### Stratum 3 — Parametric template (fill-in-the-blank)

Files with a stable skeleton and slots for project-specific content. They port as **templates with declared slots**, instantiated by a manifest or interview.

Examples: `AGENTS.md.tmpl` with `{project_name}`, `{tech_stack}`, `{build_command}`; the directory skeleton; skill and agent frontmatter schemas; the Johnny Decimal numeric ranges (the scheme is universal, the labels are local).

These live in `01-kernel/templates/`. Parametric templates should use a single templating mechanism (e.g., `envsubst` or minimal Mustache) and declare their slots in one manifest rather than scattered across files.

<a id="stratum-4"></a>

### Stratum 4 — Deterministic (context-free, drop-in)

Scripts and fixed-content files that do not depend on project semantics at all. They port verbatim.

Examples: `check-complete.sh`, `read-plan.sh`, `check-knowledge.sh` (the hook scripts); numeric sort prefixes for Johnny Decimal; `.gitignore` defaults; `.editorconfig`; Conventional Commits enforcement; XDG-compliant config placement; the stratum-audit script itself.

These live in `01-kernel/scripts/` (and hook files in `01-kernel/scripts/hooks/`). They are the cheapest stratum to share and the most immediately useful — but also the least valuable *alone*, because without the higher strata they don't know why they exist.

<a id="stratum-5"></a>

### Stratum 5 — Instance (non-templatable, context-bound)

Things that cannot and should not be templated, only **generated** or **authored** per project: the domain ontology (what entities and relations actually exist in this system), the specific SEACOW decomposition of *this* system, project-specific agents whose prompts encode local codebase knowledge, `activeContext` of current work, the user's actual preferences, the mission/product/stack sections of a specific repo's `CLAUDE.md`.

The live-state variant of stratum 5 (the actual laptop, the actual vault, the running Claude session, the installed binaries) lives **outside this repo entirely** — in filesystems, running services, git working trees.

What's *inside* [03-work/](#private-reference) is **mostly stratum 3** (parametric templates of Cybersader's workflow), not raw S5 instance. The agent-context research in [agent-context/zz-research/](../../agent-context/zz-research/) is closer to S5 because it's unprocessed personal thinking, not yet generalized.

In other words: the scaffold repo's **portable payload tops out around S3**. S4 (drop-in scripts) and S5 (live state) are generated or produced when you *use* the scaffold — they're the runtime output, not the scaffold itself.

Attempting to lift an instance into a template is the most common scaffold-authoring mistake: the result is a "generic scaffold" full of `TODO: replace with your values` placeholders, which fork-users edit once and never think about again.

## How to classify a file

Two questions in order:

1. **Is this methodology (how to work) or content (what I worked on)?** Methodology lives in strata 1–4. Content is stratum 5.
2. **If methodology, how specific is it?**
   - Universal → stratum 1 (philosophy) or 2 (pattern)
   - Assumes a specific stack → stratum 2 (stack pattern) or 3 (parametric)
   - Concrete script or config → stratum 4
   - About this user's specific work → stratum 5

The audit is helped by explicit frontmatter:

```yaml
---
stratum: 1 | 2 | 3 | 4 | 5
---
```

A scaffold with stratum tags on every file makes extraction a `grep`, not archaeology.

## Why confusing strata breaks things

- **Stratum 1 content stored as stratum 5** — philosophy buried in a personal file, so forks can't find it.
- **Stratum 5 content stored as stratum 3** — cybersader's specific TrueNAS IP ends up in a template; every fork has to edit the same spot.
- **Stratum 2 pattern presented as stratum 4 script** — a pattern that assumes a specific context gets automated, works for the author, fails everywhere else.
- **Stratum 4 script placed in stratum 2** — a context-free script surrounded by prose as if it required interpretation; users who just want to copy-paste have to read first.

Naming the stratum prevents these silently.

## How this scaffold expresses it

- [01-kernel/PHILOSOPHY.md](../../start/philosophy/) + `principles/` = **stratum 1** — invariants as claims
- [01-kernel/patterns/](../../patterns/) = **stratum 2** — named patterns
- `01-kernel/templates/` = **stratum 3** — parametric templates
- `01-kernel/scripts/` = **stratum 4** — deterministic scripts
- [03-work/](#private-reference) (and any fork's equivalent) = **stratum 5** — instance

The tier structure ([01-kernel/](../../kernel/) / [02-stack/](../../stack/) / [03-work/](#private-reference)) is orthogonal to strata but correlates:

- **Kernel** (tier 1): strata 1–3 dominant — philosophy + patterns + templates that fork-users inherit. Some S4 scripts.
- **Stack** (tier 2): strata 2–3 dominant — opinionated patterns + tech-specific templates. Personal dressing visible.
- **Work** (tier 3): mostly stratum **3** (parametric templates of *my* workflow). Some S5 research sits in `agent-context/`.
- **Live state** (outside the repo entirely): stratum 5 — my actual laptop, my actual vault, active sessions.

The portable payload of this scaffold is approximately strata 1–3. Strata 4 and 5 are generated when the scaffold is *used* (run, rebuilt, instantiated).

## The minimum viable kernel

The research session that identified this framework also identified that a truly portable scaffold reduces to **seven artifacts**:

1. `PHILOSOPHY.md` — invariants (stratum 1)
2. `AGENTS.md.tmpl` + skeleton directory (stratum 3)
3. Three generalized hook scripts (stratum 4)
4. `skill.md.tmpl` + `agent.md.tmpl` with frontmatter schema (stratum 3)
5. `seacow-scaffolder` meta-agent as an executable interview (stratum 2 + 4)
6. One example vault — a filled-in instance (stratum 5 as exemplar)
7. `install.sh` for stratum-3 instantiation (stratum 4)

Everything else is downstream or is vault-specific dressing. This is the seven-artifact kernel target that [01-kernel/](../../kernel/) optimizes toward.

## Implications for agents

- When classifying a file, use the two-question test above before writing frontmatter.
- When asked "can I reuse this?", check the stratum. Strata 1–4 are designed for reuse; stratum 5 is for reference only.
- When copying from an instance (stratum 5), first identify whether the pattern being copied is actually stratum 2 (and should be lifted to `patterns/` for generic reuse).
- When in doubt, mark lower-stratum (more generic). Drifting a stratum-2 pattern down to stratum 3 or 4 is cheap; lifting a stratum-5 instance up to stratum 2 requires re-authoring.

## See also

- [Meta / Self-Reference](09-meta-self-reference.md) — how the three-tier structure enforces strata separation
- [Convention as Compressed Decision](05-convention-as-compressed-decision.md) — prescription vs description at each stratum
- [01-kernel/README.md](../../kernel/) — the minimum-viable-kernel inventory target
- [SEACOW Conventions](../../.claude/skills/seacow-conventions/SKILL.md) — the organizational lens (system, entity, activities, relation) that builds atop the strata
- [03-work/README.md](#private-reference) — practical example of stratum labeling applied to user-specific (tier-3) content

## References

- Christopher Alexander, *A Pattern Language* (Oxford 1977) — the named-pattern form
- David Heinemeier Hansson, Rails documentation on convention over configuration
- Yeoman generators, Cookiecutter, Copier — parametric template tools
- Anthropic research on context engineering — scaffold portability discussion
