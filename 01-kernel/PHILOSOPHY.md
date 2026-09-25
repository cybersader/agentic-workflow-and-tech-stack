---
title: Philosophy
description: Invariants of agentic knowledge work expressed as claims about the world. Still being aligned — much of this belongs in an upcoming tier-0 knowledge-work-foundations pillar. The ontological spine of this scaffold, under the umbrella concern of "ontology traversal."
stratum: 1
status: aligning
date: 2026-04-17
last-reviewed: 2026-04-18
tags:
  - philosophy
  - foundations
  - invariants
  - ontology-traversal
would-live-in-tier-0:
  fully:
    - "§1 three-regime flow"
    - "§2 temperature gradient"
    - "§5 convention as compressed decision"
    - "§6 single canonical addressability"
    - "§7 five strata"
    - "§9 kernel / self-reference"
  partially:
    - "§3 passive vs active (cognitive-science half)"
    - "§4 progressive disclosure (UX-level half)"
    - "§10 multi-entity (information-science half)"
  stays-here:
    - "§8 four channels of context (LLM-specific)"
---

:::note[Alignment-in-progress]
This page is actively being refined. Much of the material below is actually **knowledge-work-general**, not agent-specific — it belongs in an upcoming tier-0 pillar (`knowledge-work-foundations`) that this scaffold will reference rather than host. See the "scope expansion" entry in this project's agent-context exploration notes for the principle audit and migration plan. Sections that move upstream are marked in the frontmatter (`would-live-in-tier-0`).
:::

The claims below are invariants of structured cognitive work performed by any entity — human, AI, or team — navigating large abstraction spaces under a finite attention budget.

The finite-attention constraint is what gives this document teeth. The intellect grasping at large collections of abstractions — mathematical structures, code architectures, research literatures, institutional knowledge — is always working against scarcity. Some minds are natively comfortable moving through dense abstraction webs (the kind that carry a research mathematician or systems architect). Most are not, and even those who are still hit the ceiling. Good scaffolding converts attention-scarcity from an individual-talent filter into an affordance anyone can use — a discipline I've started calling **ontology traversal** when the full problem (reason + observation + finite attention, applied to a structured knowledge space) needs naming. Ontology traversal is the umbrella; the invariants below are its load-bearing claims.

These claims hold regardless of which AI system, which editor, which operating system, which year. Opinions and tools on top are dressing; these are the bones.

---

## 1. Knowledge work is a three-regime flow

All structured cognitive work cycles through three regimes of material: **raw** (unprocessed input), **working** (middle-state artifacts under active manipulation), and **finished** (stable output). Every serious organizational framework names these three regimes or reinvents them under different words — GTD's capture→clarify→organize→reflect→engage, Forte's CODE (Capture, Organize, Distill, Express), Luhmann's Zettel stages, Milo's LYT progression.

The names differ. The three-regime structure does not.

---

## 2. Attention decays on a temperature gradient

Material accessed today is qualitatively different from material accessed monthly. This is not a preference — it is an access-frequency fact. Some content is **hot** (referenced daily, modified constantly), some **warm** (referenced weekly, stable but live), some **cold** (referenced monthly or less), some **frozen** (archived).

Filesystem position should align with access probability because recognition is cheaper than recall, and navigation beats search when a task is cognitively loaded. Noguchi's push-left system is the canonical expression; the existence of an `00-inbox/` → `04-archive/` gradient in this scaffold is the same idea made literal.

The gradient is orthogonal to the capture→work→output flow. Together they form a two-axis addressing space: process on one axis, attention on the other.

:::tip
Temperature gradient and capture → work → output are *orthogonal* axes. Together they form a two-axis addressing space — process on one axis (raw / working / finished), attention on the other (hot / warm / cool / cold / frozen). Conflating them collapses the navigation space and degrades discoverability for both humans and agents.
:::

**Author's note (verbatim).** The temperature-gradient framing isn't a deep claim about attention itself — it's how I trivialize a solution enough to be sustainable for managing knowledge spaces that agents would use, since it's not easy to keep them consistently using a progressively disclosed information-retrieval-purposed knowledgebase. The gradient is the minimum structure that survives agent behavior in practice. If there's a richer treatment — and there likely is, in the information-science and PIM literatures — it lives in the `knowledge-work-foundations` pillar upstream. This section's job here is to name the pragmatic version that earns its keep.

---

## 3. Passive expertise and active executors are different things

There are two ways knowledge gets used during work:
- **Passive expertise** — knowledge that informs decisions without acting. Loads into the current context, influences responses, returns no artifact of its own. Skills, rules, conventions.
- **Active executor** — a worker that operates in isolated context, performs a task, returns a compressed result. Subagents, composers, workers.

This maps onto Aristotle's dunamis (latent capacity) vs energeia (actuality), onto Tulving's semantic vs procedural memory, and onto MemGPT's main-context vs function-call distinction. These are not metaphors; they are the same structural fact under different names.

A scaffold that conflates the two produces components that try to both inform and execute — and succeed at neither.

---

## 4. Progressive disclosure is the only sustainable response to finite attention

Context windows are finite and non-uniformly attended. Empirically:
- Performance degrades as context grows, even on trivial tasks (context rot)
- Middle positions attract less attention than beginnings or ends (U-shaped recall)
- Prompt caches require byte-exact prefix match — cache miss costs roughly 10× cache hit

These are not quirks of current models; they are expected properties of any attention-allocation system operating under finite resources. The only known architectural response that addresses all three simultaneously is progressive disclosure: a small, stable, high-signal prefix that caches; just-in-time retrieval of detail; delegation of deep work to sub-processes that return summaries.

Progressive disclosure is therefore not a UX flourish. It is the discipline that keeps an agent functioning as a workspace grows. The skills/agents split, the temperature gradient, the stratum tags, the hooks that gate context loading, and the kernel/stack/work tiers are all expressions of this single idea.

---

## 5. Convention is a compressed decision

A convention — Rails's `app/models/user.rb`, React's file-per-component, SEACOW's capture/work/output lens — is not about typing fewer characters. It encodes the thousand small choices that would otherwise have to be made, defended, and re-explained. The saving is not in the bytes; it is in the context that never needs to enter any reader's head.

This is the same resource agentic context engineering optimizes for at a lower level. Convention-over-configuration is not an analogy for agent scaffolding; it is the same phenomenon applied one level up. Conventions are context-window economics for humans; context engineering is convention discipline for language models.

The consequence: a convention cannot be removed without knowing what decision it compressed. This is Chesterton's fence, and it is the most common way scaffolds degrade.

---

## 6. Single canonical addressability beats expressive alternatives

Graph structures, tag folksonomies, semantic filesystems, and the Semantic Web are all technically richer than hierarchical paths. They have all lost to `/home/user/projects/foo/README.md`.

They lost because the primary failure mode of a workspace is "where did I put that." Single canonical addressability — one path, one URL, one unambiguous name — is worth more than expressiveness when the question is recovery rather than relation. Graphs, tags, and links become navigation aids *within* granted hierarchical scope; they do not replace the hierarchy.

Agents inherit this failure mode exactly: they navigate by glob, grep, and file read. Giving them predictable paths and recognizable names is the same affordance that keeps humans productive.

---

## 7. Repeatability decomposes into five strata

What is portable is smaller than it looks, and what is not portable is more valuable than it looks as a worked example. The honest decomposition:

1. **Philosophy** — invariants like these. Always true.
2. **Pattern** — named patterns with examples. Same shape, different content.
3. **Parametric** — files with slots. Fill to instantiate.
4. **Deterministic** — context-free scripts. Drop in.
5. **Instance** — genuinely context-bound. Generate, don't template.

The scaffold that conflates these strata produces artifacts that try to be simultaneously portable and personal — and port poorly in both directions. Separating them makes extraction a grep rather than archaeology, and makes it clear to a reader (human or agent) whether to copy a file, fill it, adapt it, or just read it.

---

## 8. Agent behavior is determined by four channels of context

At any turn, an AI agent's output depends on:
- **(a) Frozen weights** — the trained model
- **(b) Principal-authored tokens** — system prompt, user input, injected docs
- **(c) Environment-authored tokens** — tool returns, retrieved content
- **(d) Model-authored tokens** — reasoning, intermediate plans, self-feedback

Every agent pathology — hallucination, drift, prompt injection, sycophantic agreement with earlier wrong claims — localizes to one or more of these channels. Good scaffolding addresses each deliberately: system prompts shape (b), tool permissions gate (c), compaction launders (d), weight selection informs (a). Treating the channels as one blurs which dial is being turned.

---

## 9. A kernel cannot portably carry the dressing of the vault it was authored in

A scaffold that sets up knowledge bases is itself a knowledge base. If kernel and vault are not separated structurally, every kernel artifact is simultaneously a template and documentation about itself. This creates a tar pit where changes to the vault threaten the kernel and changes to the kernel leak into the vault.

The clean resolution — the one programming languages reached for compilers decades ago — is structural separation: source, output, and meta-development each in distinct locations. `rustc` source and user Rust programs live apart even when both are written in Rust. This scaffold adopts the same discipline: `01-kernel/` for universal, `02-stack/` for opinionated tooling, `03-work/` for instance, `00-meta/` for kernel-development tooling.

---

## 10. The filesystem must serve humans and AI agents as first-class consumers simultaneously

Most knowledge bases are designed for humans first; agents scrape them as secondary consumers. This inverts in the agentic setting: the filesystem is consumed at least as often by agents (via glob, grep, read) as by humans (via editor, site, search).

Serving both simultaneously forces discipline that benefits each:
- Humans need navigation, visual hierarchy, recognition over recall
- Agents need predictable paths, parseable frontmatter, stable cacheable prefixes
- Both need single canonical addressability, named conventions, explicit stratification

A scaffold designed for only one audience loses the other. The site view (rendered for humans) and the raw filesystem (consumed by agents) are the same source — rendered twice.

---

## Alignment notes (in progress)

This page is still being aligned. The threads I'm actively thinking about:

**Ontology traversal as the umbrella.** §1, §2, §4, §6 all describe aspects of a single bigger concern: a finite-attention entity navigating a large structured abstraction space by reason and observation. I've been calling this **ontology traversal** in my own notes. It's the candidate subheading — maybe the *organizing* subheading — of the upcoming `knowledge-work-foundations` pillar.

**Epistemology or navigation?** I'm not fully sure whether this is an epistemology question (how we *know*) or a navigation question (how we *move through what's already known*). My working answer: both, interleaved. Reasoning produces new ontology. Observation (via senses, or via tool returns for an agent) updates it. Traversal is how we *use* what's there while simultaneously extending it. This probably runs through the Rosenfeld / Luhmann / Engelbart / Bush lineage and deserves its own treatment in the tier-0 pillar — possibly as the chapter that frames everything else.

**Which sections migrate to `knowledge-work-foundations`.** Per the frontmatter marker:

| Section | Migration |
|---|---|
| §1 three-regime flow | ✅ fully upstream — GTD/CODE/Zettelkasten lineage predates agents |
| §2 temperature gradient | ✅ fully upstream — Noguchi / PIM research predates computers |
| §3 passive vs active | ⚠️ partial — dunamis/energeia is general; LLM framing stays |
| §4 progressive disclosure | ⚠️ partial — Nielsen UX is general; context-rot / cache economics stays |
| §5 convention as compressed decision | ✅ fully upstream — DHH / Chesterton's fence |
| §6 single canonical addressability | ✅ fully upstream — Rosenfeld's polar-bear book |
| §7 five strata | ✅ fully upstream — Alexander's pattern-language form |
| §8 four channels of context | ❌ stays here — LLM inference mechanics only |
| §9 kernel / self-reference | ✅ fully upstream — compiler/interpreter lineage |
| §10 multi-entity design | ⚠️ partial — info-science half upstream; agent half stays |

Once the pillar exists, this page shrinks to the agent-specific invariants (§3 LLM-half, §4 LLM-half, §8, §10 agent-half) and references outward. Other specializations (research methodology, corporate KB, writing workflows) can then inherit the same upstream pillar.

**Open questions I still owe this page.** Whether "ontology traversal" is the right term or my coined placeholder for a named concept elsewhere. How reasoning-via-observation fits alongside reasoning-via-derivation. Whether the filesystem-primitive limitations of this scaffold are worth naming here or only in the scope-expansion research.

---

## Applying these invariants

This scaffold uses these ten claims as invariants that do not negotiate. Every opinion above them (which editor, which terminal, which LLM, which theme) is dressing. The invariants are the reason the dressing can change without breaking the scaffold.

For the expanded, referenced, citation-carrying versions of each claim, see `01-kernel/principles/`.

For how these invariants map to specific tools, see `02-stack/`.

For how this user applies them in practice, see `03-work/`.

For the general knowledge-work material this page rests on — once it exists — see the upstream `knowledge-work-foundations` pillar.
