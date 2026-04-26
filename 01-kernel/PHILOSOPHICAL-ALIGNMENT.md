---
title: Philosophical Alignment & Terminology
description: The philosophical traditions, prior thinkers, and working definitions this scaffold draws on. Where our claims come from and how we use our own terms.
stratum: 1
tier_of_abstraction: 0
status: stable
sidebar:
  order: 2
tags:
  - kernel
  - philosophy
  - concepts
  - terminology
  - lineage
date: 2026-04-18
---

This page is the **backing track** for the scaffold's claims. Every principle, pattern, and convention here traces to prior thinkers, traditions, or working definitions — not because invoking famous names confers authority, but because **being honest about lineage helps readers audit our reasoning**.

We are not philosophers. What follows is our best-effort mapping of the scaffold's ideas to the traditions they inherit from. Corrections welcome.

---

## Author's philosophical tradition (stated openly)

This scaffold is authored from a **Thomistic / Catholic moral-philosophical tradition** — Aquinas on moral acts, virtue ethics (prudence, temperance, justice, fortitude), personalism (John Paul II), natural law (Finnis, Maritain), and Catholic media ecology (McLuhan, Ong, Borgmann, Illich). The author's parallel project [Ministry of Digital Stewardship (MODS)](https://github.com/cybersader) draws on the same lineage and is a worked example of applying this tradition to digital-life problems.

**What this means in practice:**

- When the scaffold says *"convention compresses past decisions,"* it's reaching toward the Thomistic view that virtue is habituated right reason — not merely engineering convenience.
- When we talk about *"subsidiarity"* in technical scaffolding (solve at the smallest competent level first), we are explicitly drawing on Catholic social teaching (CCC 1883–1885), not just pragmatic org design.
- When we say *"tools serve the person, not vice versa"* we are quoting Catholic anthropology (CCC 356–357; *Gaudium et Spes*; *Laudato Si'* on the technocratic paradigm) rather than making a neutral utilitarian claim.

**What this does NOT mean:**

- You do not need to share the author's tradition to use the scaffold. Zero-tier claims (capture → work → output, attention is finite) stand on their own.
- Where a claim depends on moral-philosophical commitments, we flag it so readers can evaluate.
- Alternatives (consequentialist, pragmatist, analytic-tradition) are noted where they'd reach different conclusions.

This tradition is concentrated in the *virtue ethics* and *anthropology-of-technology* sections below.

---

## Why document the backing

Most scaffold-authoring work pretends claims are freestanding. In practice, every claim has **ancestors** — earlier formulations that already settled the conceptual groundwork. Citing them does three things:

1. **Audit surface** — readers can judge whether we inherited faithfully or bent the idea.
2. **Scope** — once you know a principle comes from (say) cognitive psychology, you know where it *doesn't* apply (e.g., not a claim about physical systems).
3. **Forkability** — fork-users can choose to inherit the same ancestors without inheriting our specific synthesis.

See the [tiers of abstraction](../principles/00-tiers-of-abstraction/) meta-principle for how this ties into what we consider "portable."

---

## Working definitions (how we use these terms)

| Term | How we use it | NOT what we mean |
|---|---|---|
| **Knowledge work** | Cognitive activity producing structured, referenceable artifacts | Any office job; manual labor with computers |
| **Convention** | An encoded methodological choice — a file, rule, template, or script capturing how work should happen | A habit; an unwritten norm (though the latter can be encoded into a convention) |
| **First principle** | An irreducible claim from which other claims derive | A self-evident truth; an axiom |
| **Invariant** | A claim that holds across variations of substrate, era, or instance | A constant; a law of physics |
| **Pattern** | A reusable structural shape; fill varies per instance, frame doesn't | A template (which is fill-in-the-blank); an algorithm (which has fixed steps) |
| **Stratum** | A level of repeatability OF A CONVENTION, not of knowledge work itself | A social class; a geological layer (though the metaphor is deliberate) |
| **Tier of abstraction** | How much a principle depends on tech or context to hold. See [00-tiers-of-abstraction](../principles/00-tiers-of-abstraction/) | Same as stratum (orthogonal axes) |
| **Progressive disclosure** | The discipline of revealing information as needed; attention is finite | "Hiding information"; one-shot onboarding |
| **Lens** | A framework that foregrounds certain distinctions; useful without being true | A taxonomy (claims completeness); a theory (claims explanatory adequacy) |

---

## Philosophical lineage — what this scaffold inherits from

Each row names a concept we use, its nearest prior thinker(s), and the principle(s) here that derive from it.

| Our concept | Prior thinker(s) / tradition | Where it shows up in this scaffold |
|---|---|---|
| **Knowledge work** (term, framing) | Peter Drucker, *Landmarks of Tomorrow* (1959); *The Effective Executive* (1967) | [Philosophy](./philosophy/) — the scaffold's subject matter |
| **Pattern language** | Christopher Alexander, *A Pattern Language* (1977) | [Stratum 2 definition](../principles/07-five-strata/#stratum-2); [patterns/](../patterns/) |
| **Parametric template** | Yeoman generators; Cookiecutter; Copier — practical instantiation | [Stratum 3](../principles/07-five-strata/#stratum-3) |
| **Convention as compressed decision** | David Lewis, *Convention* (1969); Donald Norman, *Design of Everyday Things* — affordances | [Convention principle](../principles/05-convention-as-compressed-decision/) |
| **Bounded rationality / finite attention** | Herbert Simon, *Administrative Behavior* (1947); *Sciences of the Artificial* (1969) | [Progressive Disclosure](../principles/04-progressive-disclosure/); temperature-gradient rationale |
| **Ambiguous reference breaks coordination** | Frege, *Sense and Reference*; URL web; Engelbart *Augmenting Human Intellect* (1962) | [Single Canonical Addressability](../principles/06-single-canonical-addressability/) |
| **Hot / cold memory, recency-based tiering** | Marcia Bates, *berrypicking*; LRU caching; information thermodynamics | [Temperature Gradient](../principles/02-temperature-gradient/) |
| **Capture → process → share (three-regime flow)** | David Allen, *GTD*; Niklas Luhmann's Zettelkasten; PARA method (Tiago Forte) | [Capture → Work → Output](../principles/01-capture-work-output/) |
| **Self-reference as a system property** | Douglas Hofstadter, *Gödel, Escher, Bach* (1979); Gödel's incompleteness | [Meta / Self-Reference](../principles/09-meta-self-reference/) |
| **Passive knowledge vs active execution** | Ryle, *knowing-how vs knowing-that*; CS: library code vs running process | [Skills vs Agents](../principles/03-skills-vs-agents/) |
| **Categorization is imperfect** | Wittgenstein, *Philosophical Investigations* — family resemblances | [Five-strata caveat](../principles/07-five-strata/#caveat-this-is-an-approximation-not-a-taxonomy) |
| **Map is not territory** | Alfred Korzybski, *Science and Sanity* (1933) | Informs the "strata are a lens, not a taxonomy" humility throughout |
| **Abstraction ladder / tiers** | S. I. Hayakawa, *Language in Thought and Action* (1949); OSI model (CS) | [Tiers of abstraction](../principles/00-tiers-of-abstraction/); the three-tier scaffold itself |
| **Process philosophy / repeatable form** | Alfred North Whitehead, *Process and Reality* (1929) | The "repeatability of conventions" framing |
| **Context engineering** | RPI (Retrieve-Process-Integrate) literature; Anthropic context-window research | [Progressive Disclosure](../principles/04-progressive-disclosure/); [Four Channels of Context](../principles/08-four-channels-of-context/) |
| **Situated / embodied cognition** | Hutchins, *Cognition in the Wild*; Clark & Chalmers, *extended mind* | The "knowledge work uses technology as a cognitive prosthesis" framing |

### Thomistic & Catholic tradition (the author's primary lineage)

| Our concept / stance | Prior thinker(s) / tradition | Where it shows up |
|---|---|---|
| **Moral acts: object / intention / circumstances** | Aquinas, *Summa Theologiae* I–II q.18–21; CCC 1750–1756 | Framing for how scaffold choices are judged ("does this convention's intention serve the person?") |
| **Virtue ethics — prudence as practical wisdom** | Aquinas, II–II q.47–56; Josef Pieper, *The Four Cardinal Virtues*; CCC 1803–1845 | Informs "convention as compressed prudence" framing |
| **Temperance / studiousness-vs-curiosity** | Aquinas, II–II q.166–167 (temperance applied to info intake) | Temperature-gradient discipline; [progressive disclosure](../principles/04-progressive-disclosure/) as digital temperance |
| **Subsidiarity** | CCC 1883–1885; *Quadragesimo Anno* (Pius XI, 1931) | Smallest-competent-level pattern; rationale for preferring local conventions over global ones |
| **Personalism — person as end, not means** | John Paul II, *Veritatis Splendor*; *Love and Responsibility*; Maritain, *The Person and the Common Good* | "Tools serve the person" framing; critique of tech that instrumentalizes users |
| **Common good & solidarity** | CCC 1905–1912; *Fratelli Tutti* | Why conventions favoring cooperation over efficiency-alone |
| **Natural law (as accessible by reason)** | Aquinas I–II q.94; John Finnis, *Natural Law and Natural Rights*; J. Budziszewski | Ground for zero-tier claims about cognition & coordination |
| **Faith + reason / against technocratic paradigm** | *Fides et Ratio*; *Laudato Si'* (technocratic paradigm critique); Guardini, *Letters from Lake Como* | Why we separate tool-bound claims from substrate-agnostic ones — tech choices aren't value-neutral |
| **Media ecology (Catholic tradition)** | Marshall McLuhan (Catholic media theorist); Walter J. Ong SJ, *Orality and Literacy*; Albert Borgmann, *Power Failure*; Ivan Illich, *Tools for Conviviality* | Lens on how digital tech reshapes attention, community, knowledge work |
| **Virtue-community / practices** | Alasdair MacIntyre, *After Virtue*; *Dependent Rational Animals* | Conventions are practices of a community, not arbitrary rules |
| **Truth & charitable speech** | Aquinas II–II q.109–113 (truthfulness, lying); Augustine, *On Lying*; Pieper, *Abuse of Language, Abuse of Power*; CCC 2464–2513 | Framing for documentation ethics — conventions that clarify vs obscure |
| **Self-critical formation (examining use of tech)** | *Toward Full Presence* (Vatican, 2023); *Inter Mirifica* (Vatican II) | Why we document the philosophical backing openly — formation of tech users, not just function |

**Full cross-reference for this tradition** (for the author's own deep work): see `b&g_vault/32 - Digital Stewardship Ministry` in the MODS project for extensive reading lists, Aquinas citations, and pastoral/practical applications of these principles to digital life.

---

## Stances we take (and contested alternatives)

Every scaffold encodes contested choices. Naming them keeps us honest.

### We treat knowledge work as substrate-agnostic at zero-tier

**Stance:** the fundamentals of knowledge work (capture, refine, produce; attention is finite; convention compresses past decisions) hold whether you use paper or LLMs.

**Contested by:** strong post-human / post-filesystem arguments (e.g., "AI will replace the cognitive substrate, these framings are obsolete"), and hard tech-determinism (Marshall McLuhan "the medium is the message").

**Why we hold it:** if zero-tier principles are substrate-portable, the scaffold survives LLM tooling evolution. If they're not — we've built on quicksand.

### We treat the five strata as a lens, not a taxonomy

**Stance:** artifacts legitimately straddle strata; the framework is useful but imperfect. See [five-strata caveat](../principles/07-five-strata/#caveat-this-is-an-approximation-not-a-taxonomy).

**Contested by:** strict type-theory views that every artifact has one correct classification.

**Why we hold it:** per Wittgenstein, concepts in natural systems usually have fuzzy boundaries. Pretending otherwise creates false certainty.

### We treat convention as a social compression, not an arbitrary rule

**Stance:** conventions encode past collective decisions about tradeoffs. Following them is cheap; rederiving them is expensive.

**Contested by:** "follow no conventions, reason from scratch every time" — first-principles maximalism.

**Why we hold it:** finite attention (Simon) makes constant rederivation impossible at scale. Conventions trade exploration for efficiency.

---

## How this page connects to the rest

- **Up** ← referenced from every principle page via "See also: philosophical alignment" at the bottom
- **Down** → links outward to each [principle](../principles/), [pattern](../patterns/), and [PHILOSOPHY](./philosophy/) page
- **Sideways** ↔ companion to [tiers of abstraction](../principles/00-tiers-of-abstraction/) (how principles classify by scope) and [five strata](../principles/07-five-strata/) (how conventions classify by repeatability)

If you're reading a principle and wondering *"where does this claim come from?"* — check the lineage table above.

If you're reading this page and wondering *"how does this apply?"* — click any row's third column to see the principle it informs.

---

## Contributing to this page

When adding or revising a principle, ask:

1. **Does this claim have a prior thinker or tradition behind it?** If so, add a row.
2. **Are we using a term that needs a working definition?** Add to the glossary.
3. **Are we taking a contested stance?** Name the counter-position and why we hold ours.

The page should stay short and navigable — if a section balloons, promote it to its own page and link from here.

---

## See also

- [Philosophy](./philosophy/) — the scaffold's claims *about* knowledge work
- [Principles](../principles/) — detailed first-principles pages (each links back here)
- [Tiers of abstraction](../principles/00-tiers-of-abstraction/) — when each principle applies
- [Five strata](../principles/07-five-strata/) — how conventions classify by repeatability
