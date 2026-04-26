<div align="center">

# Agentic Workflow & Tech Stack

**Rebuild your dev machine from a `git clone`.**

A portable, progressive-disclosure knowledge scaffold for AI-assisted software development and knowledge work.

[Principles](./01-kernel/principles/) · [Philosophy](./01-kernel/PHILOSOPHY.md) · [Alignment](./01-kernel/PHILOSOPHICAL-ALIGNMENT.md) · [Roadmap](./ROADMAP.md)

</div>

---

## The idea in one paragraph

If I lost every machine I own tomorrow, I could clone this repo, run setup, and recreate my entire way of working in an evening — right tools, right configs, right agent memory, right mental model. The scaffold holds **conventions** (portable methodological encodings); the **live running state** — my installed binaries, active Claude sessions, Obsidian vault contents — is generated when the scaffold is *used*, and lives outside this repo.

## The idea visually

```
         ╔══════════════════════════════════════════════════════════╗
         ║   What ports in a git clone        ║   Generated on use  ║
         ╠════════════════════════════════════╬══════════════════════╣
         ║                                    ║                      ║
         ║   Tier 1  →  Kernel                ║   Stratum 4          ║
         ║             universal principles   ║    deterministic     ║
         ║             & patterns             ║    scripts           ║
         ║                    │               ║        │             ║
         ║   Tier 2  →  Stack                 ║   Stratum 5          ║
         ║             opinionated toolkit    ║    live state        ║
         ║             patterns & templates   ║    (my laptop,       ║
         ║                    │               ║     my vault,        ║
         ║   Tier 3  →  Work                  ║     Claude sessions) ║
         ║             parametric templates   ║                      ║
         ║             of my workflow         ║                      ║
         ║                                    ║                      ║
         ╚════════════════════════════════════╩══════════════════════╝
                   (repo)                            (outside)
```

---

## Table of contents

- [What this is / what it isn't](#what-this-is--what-it-isnt)
- [Directory structure](#directory-structure)
- [Reading paths](#reading-paths)
- [Tier ≠ Stratum ≠ Tier-of-abstraction](#tier--stratum--tier-of-abstraction)
- [Ten principles, one screen](#ten-principles-one-screen)
- [Philosophical grounding](#philosophical-grounding)
- [Running the site locally](#running-the-site-locally)
- [Status](#status)
- [Security & visibility](#security--visibility)
- [Contributing](#contributing)

---

## What this is / what it isn't

| Is | Is NOT |
|---|---|
| A **portable scaffold** (strata 1–3) that fork-users can inherit | A turnkey product with a setup.sh that runs end-to-end |
| A **progressively-disclosed memory system** for AI agents working alongside me | A general-purpose AI agent framework |
| A **worked example** of applying universal principles to a real agentic stack | A minimal, universal-only kernel (that extraction is planned) |
| An **honest record** of one author's philosophical + technical choices | A prescription for how everyone should work |

---

## Directory structure

```
agentic-workflow-and-tech-stack/
│
├── 01-kernel/     Universal scaffold — philosophy, principles, patterns,
│                  templates, meta-agents. Forkable as-is.
│
├── 02-stack/      Opinionated toolkit — Claude Code, Zellij, Obsidian,
│                  Tailscale, bashrc helpers. Forkable with adaptation.
│
├── 03-work/       Parametric templates of MY workflow — tool picks, rebuild
│                  flow, project-type patterns. Worked example, not payload.
│
├── 00-meta/       Tooling for developing the scaffold itself — stratum
│                  audit classifier, PII scanner, sync helpers.
│
├── site/          Astro + Starlight site (reads all tiers, renders with
│                  stratum badges + site graph + Flexoki theme).
│
└── .github/       CI for build, link-check, and gated deploy.
```

The three folder prefixes (01, 02, 03) correspond to **organizational tiers**, not strata. See below.

---

## Reading paths

Pick the lane that matches why you're here.

### If you're **me, restoring a machine**

→ [`03-work/rebuild/`](#private-reference) — 11 step-by-step pages, ~90 minutes.

### If you're **me, starting a new project**

→ Invoke the `seacow-scaffolder` meta-agent:
```
Use seacow-scaffolder to set up a new project at <path>.
```

### If you're **someone else exploring this repo**

| You want to… | Go to |
|---|---|
| Understand the **why** | [`01-kernel/PHILOSOPHY.md`](./01-kernel/PHILOSOPHY.md) + [`01-kernel/principles/`](./01-kernel/principles/) |
| See the **thinkers** behind each claim | [`01-kernel/PHILOSOPHICAL-ALIGNMENT.md`](./01-kernel/PHILOSOPHICAL-ALIGNMENT.md) |
| Understand **"tier" vs "stratum"** (they're different!) | [`01-kernel/principles/00-tiers-of-abstraction.md`](./01-kernel/principles/00-tiers-of-abstraction.md) + [`07-five-strata.md`](./01-kernel/principles/07-five-strata.md) |
| See a **universal pattern** worth adopting | [`01-kernel/`](./01-kernel/) |
| See my **opinionated toolkit** (fork-worthy for similar setups) | [`02-stack/`](./02-stack/) |
| See how **I apply** all of this | [`03-work/`](#private-reference) — worked example |

---

## Tier ≠ Stratum ≠ Tier-of-abstraction

Three orthogonal classification axes. They travel together in practice but are *conceptually* independent — each answers a different "what-if" question.

> [!TIP]
> **The one-sentence crib:**
> **Tier asks *who*. Stratum asks *how portable*. Tier-of-abstraction asks *what's assumed*.**

| Axis | The question it answers |
|---|---|
| **Tier** (1 / 2 / 3) | **WHO** is this for? (anyone → people-like-me → me) |
| **Stratum** (1–5) | **HOW MUCH** of this transfers if copied to another project? |
| **Tier of abstraction** (0 / 1 / 2) | **WHAT** does this claim assume about the substrate? |

A single file — say `03-work/rebuild/02-terminal-stack.md` — carries all three: **tier 3** (lives in work/), **stratum 3** (parametric template with slots), **tier-of-abstraction 2** (assumes agentic stack). Different classifications, same file.

### Axis 1: **Tier** (organizational section)

Where in the repo a page lives.

| Tier | Section | Portability contract |
|---|---|---|
| **1** | `01-kernel/` | Portable as-is — universal |
| **2** | `02-stack/` | Portable with adaptation — opinionated |
| **3** | `03-work/` | Worked example, not verbatim payload |

### Axis 2: **Stratum** (repeatability of a convention)

How much of a page's content ports to another project without change.

| Stratum | Name | In practice |
|---|---|---|
| **1** | Philosophy | Invariants — holds everywhere |
| **2** | Pattern | Same shape, different content |
| **3** | Parametric | Template with fill-in slots |
| **4** | Deterministic | Drop-in script — runs as-is |
| **5** | Instance | Live state — not portable |

**The scaffold ends at stratum 3.** Stratum 4 (scripts) and stratum 5 (live state) are *generated when the scaffold is used* — they're outputs, not contents.

Rendered on every page as a colored badge under the title.

### Axis 3: **Tier of abstraction** (substrate a claim assumes)

What has to be true for a principle to apply. Use the **paper-and-pencil test**.

| Tier-of-Abstraction | Assumes | Example |
|---|---|---|
| **0** | Any cognizer (paper + pencil) | *Attention is finite*; *capture → work → output* |
| **1** | Digital tech (filesystems, networks) | *Single canonical addressability* |
| **2** | LLM / agentic architecture | *Skills vs agents*; *context window management* |

Tagged in frontmatter as `tier_of_abstraction`.

> [!NOTE]
> **Both axes are lenses, not taxonomies.** Real artifacts slide between strata and between tiers-of-abstraction. The labels help agents weight "how stable is this advice" without pretending certainty. See the [five-strata caveat](./01-kernel/principles/07-five-strata.md#caveat-this-is-an-approximation-not-a-taxonomy) and the [tiers-of-abstraction imperfection note](./01-kernel/principles/00-tiers-of-abstraction.md#imperfection-caveat) for the humility side.

---

## Ten principles, one screen

Each has a deep-dive in [`01-kernel/principles/`](./01-kernel/principles/).

| # | Principle | One-line |
|---|---|---|
| 00 | [Tiers of abstraction](./01-kernel/principles/00-tiers-of-abstraction.md) | *What substrate a claim assumes (paper / digital / agentic)* |
| 01 | [Capture → Work → Output](./01-kernel/principles/01-capture-work-output.md) | *Knowledge work has three regimes; name them explicitly* |
| 02 | [Temperature Gradient](./01-kernel/principles/02-temperature-gradient.md) | *Access frequency is a load-bearing organizational signal* |
| 03 | [Skills vs Agents](./01-kernel/principles/03-skills-vs-agents.md) | *Passive expertise and active executors are structurally different* |
| 04 | [Progressive Disclosure](./01-kernel/principles/04-progressive-disclosure.md) | *The only sustainable response to finite attention* |
| 05 | [Convention as Compressed Decision](./01-kernel/principles/05-convention-as-compressed-decision.md) | *Why Chesterton's fence protects scaffolds* |
| 06 | [Single Canonical Addressability](./01-kernel/principles/06-single-canonical-addressability.md) | *Why hierarchy wins despite richer alternatives* |
| 07 | [Five Strata of Repeatability](./01-kernel/principles/07-five-strata.md) | *What ports where — every file tagged* |
| 08 | [Four Channels of Context](./01-kernel/principles/08-four-channels-of-context.md) | *How agent behavior is actually determined* |
| 09 | [Meta / Self-Reference](./01-kernel/principles/09-meta-self-reference.md) | *Kernel, stack, and work must be structurally separate* |
| 10 | [Multi-Entity Design](./01-kernel/principles/10-multi-entity-design.md) | *Humans and AI agents are both first-class consumers* |

---

## Philosophical grounding

> [!IMPORTANT]
> This scaffold is authored from a **Thomistic / Catholic moral-philosophical tradition** — Aquinas on moral acts, virtue ethics (prudence, temperance, justice, fortitude), personalism (John Paul II), natural law (Finnis, Maritain), Catholic media ecology (McLuhan, Ong, Borgmann, Illich).
>
> You do not need to share the author's tradition to use the scaffold — **zero-tier claims** (attention is finite, capture → work → output) stand on their own.
>
> Moral framings where the tradition influences choices are **flagged as such** and traceable via [`PHILOSOPHICAL-ALIGNMENT.md`](./01-kernel/PHILOSOPHICAL-ALIGNMENT.md).

:::tip
The philosophical grounding is *explicitly named* so it can be evaluated. Tier-0 principles (universal to any cognizer) hold across worldviews; tier-2 specifics inherit the author's lineage. You don't need to share that lineage to adopt the structural patterns — but knowing it exists prevents surprise when a design choice reflects a value premise you would make differently.
:::

The alignment page cites: Drucker, Simon, Wittgenstein, Alexander, Korzybski, Hofstadter for structural framings · Aquinas, Pieper, MacIntyre, USCCB documents, *Laudato Si'*, *Fratelli Tutti* for moral framings · Engelbart, Frege, Hayakawa for addressability + abstraction-ladder framings.

Related parallel project (worked example of same tradition applied to a ministry context): [Ministry of Digital Stewardship](https://github.com/cybersader).

---

## Running the site locally

```bash
cd site
bun install
bun run dev                  # http://localhost:4321/agentic-workflow-and-tech-stack/
bun run dev:host             # Tailscale-accessible
bun run build                # static build → site/dist/
bun run check-links          # validate internal links (requires prior build)
```

See [`site/PREVIEW.md`](./site/PREVIEW.md) for full Tailscale preview + cross-device review setup.

---

## Status

First-iteration init complete (2026-04-17). **Active and in continuous refinement.**

| Tier | Files | Notable content |
|---|---|---|
| `01-kernel/` | ~100 | `PHILOSOPHY.md` + `PHILOSOPHICAL-ALIGNMENT.md` + 11 principle pages + 13 skills + 10 agents + templates |
| `02-stack/` | 20+ | 7 stack layers + patterns + decisions + keybinding profiles (WezTerm, Zellij, OpenCode) + bashrc helpers |
| `03-work/` | 25+ | Tool picks, preferences, project-types, rebuild flow (11 pages), known-issues log, terminal workflow |
| `00-meta/` | scripts + reports | Stratum audit classifier, PII scanner, sync helpers |
| `site/` | 98 HTML pages | Astro + Starlight + Flexoki theme + stratum badges + link-check CI |

Live deploy gated on PII audit + repo visibility decisions.

---

## Security & visibility

- This repo is **private** until a PII audit confirms no personal info is exposed.
- Homelab IPs, MCP endpoints, and Tailscale MagicDNS names live only in `03-work/homelab/` (currently placeholder; real content stays local-only).
- Before any public-visibility change: run `bun 00-meta/stratum-audit/pii-scan.mjs` and resolve all critical findings.
- GitHub Actions deploy workflow exists but won't publish publicly until repo visibility + Pages settings explicitly allow.

---

## Contributing

Contributions welcome, but this is a personal scaffold — I'm selective. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidance.

The publicly-forkable portion is the **kernel tier** (and eventually a standalone `agentic-kernel` repo once extracted). PRs against the kernel — new principles, pattern writeups, corrections — welcomed.

---

## See also

- [`01-kernel/PHILOSOPHY.md`](./01-kernel/PHILOSOPHY.md) — ontological foundation
- [`01-kernel/PHILOSOPHICAL-ALIGNMENT.md`](./01-kernel/PHILOSOPHICAL-ALIGNMENT.md) — thinkers behind each claim
- [`01-kernel/README.md`](./01-kernel/README.md) — kernel-tier inventory
- [`02-stack/README.md`](./02-stack/README.md) — opinionated toolkit
- [`03-work/README.md`](#private-reference) — worked example scope
- [`ROADMAP.md`](./ROADMAP.md) — planned evolution
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — how to help
