---
title: Meta / Self-Reference
description: A scaffold that sets up knowledge bases is itself a knowledge base. Keeping kernel, instance, and kernel-development separate is structural hygiene, not bureaucracy.
stratum: 1
status: stable
sidebar:
  order: 9
tags:
  - principle
  - philosophy
  - foundations
  - architecture
---

## The claim

A scaffold that sets up knowledge bases is itself a knowledge base. If the kernel (the portable scaffold) and the vault (the filled-in instance) are not separated structurally, every kernel artifact is simultaneously a template and documentation-about-itself. This creates a tar pit where vault changes threaten the kernel and kernel changes leak into the vault.

The clean resolution is the one programming-language toolchains reached for compilers decades ago: **separate the compiler's source from the compiler's output**, even when both are written in the same language. This scaffold adopts the analogous separation: kernel, work (instance), and meta (kernel-development) live in structurally distinct locations.

## The problem made concrete

Consider a scaffold with a `CLAUDE.md` at the root. What does it describe?

- If the scaffold is **just a kernel** (template to install elsewhere), `CLAUDE.md` describes how a forked project should configure itself — placeholders, slots, conventions.
- If the scaffold is **just a vault** (one instance), `CLAUDE.md` describes this specific repo — its domain, its projects, its state.
- If the scaffold is **both at once** — which this one is by its nature — `CLAUDE.md` has to be both descriptions simultaneously, which it cannot.

Same applies to:
- `AGENTS.md` at root — template for forks, or description of this repo?
- Skills — reusable patterns, or tuned for this user's work?
- Examples folder — portable exemplars, or this user's actual work?

Without structural separation, every file has to mentally branch between "kernel mode" and "vault mode" on every read, and the two modes subtly contaminate each other.

## The compiler analogy

Rust's toolchain solves an identical problem at scale. The `rustc` compiler is itself written in Rust — it is both a Rust program and the tool that compiles Rust programs. If the `rustc` source and a user's `hello_world.rs` lived side by side in the same directory with the same conventions, every change would risk collision:

- Adding a new language feature requires updating `rustc`'s source *and* the standard library *and* potentially the test suite — all separate concerns that share the same toolchain
- User programs need different tooling (the stable compiler) than compiler development (the beta/nightly compiler)
- Changes to compiler internals should not accidentally break user code

The separation is structural: `rust-lang/rust` (the compiler source) is one repo; user projects are separate; stable toolchain vs nightly toolchain are separately installed. Each lives in its own filesystem scope. Development conventions for compiler work (`x.py`, bootstrap stages, `compiler/` directory) do not leak into user projects.

The scaffold analogy:

| Rust toolchain | Agentic scaffold |
|---|---|
| `rust-lang/rust` source | `01-kernel/` |
| A user's Rust program | `03-work/` (the instance / vault) |
| `x.py`, bootstrap, compiler tests | `00-meta/` (kernel-dev tooling) |
| stable/nightly channel selection | `02-stack/` (toolkit choice) |

The mental model: **kernel defines, stack configures, work instantiates, meta develops.**

## The three-zone structure

This scaffold materializes the separation as top-level folders:

### `01-kernel/` — the scaffold itself
Everything that is universal, pattern-level, parametric, or deterministic. Strata 1–4 per the [Five Strata](07-five-strata.md) principle. A fork of just this directory is what a new project gets.

### `03-work/` — the instance
Stratum 5 content — this specific user's project patterns, agent memory, homelab specifics, rebuild flow. It is a **case study demonstrating that the kernel works**, not a template. Readers should know it is an example to study, not content to copy.

### `00-meta/` — kernel-development tooling
Scripts, audits, and test-workspace content that exists to **develop the kernel itself**, not to be part of the kernel. The stratum-audit script that classifies files belongs here because its job is to maintain the kernel, not to ship with it.

### `02-stack/` — the middle layer (not strictly part of the meta-split)
The user's opinionated tool picks (WSL + Claude Code + Obsidian + Zellij). Fork-worthy for similar setups. Neither pure kernel (too opinionated) nor pure work (not this user's specific output). This is the layer the user wears — dotfiles-for-agentic-development.

## Two AGENTS.md files, two jobs

A consequence of the separation: this scaffold has — and needs — **two AGENTS.md files** with distinct jobs.

- **Root `AGENTS.md`** (stratum 5) — describes THIS repo to an agent navigating it: what's in each tier, where specific things live, what commands exist, what this specific project cares about.
- **`01-kernel/templates/AGENTS.md.tmpl`** (stratum 3) — a parametric template describing what a *derivative project's* AGENTS.md should look like, with slots for `{project_name}`, `{tech_stack}`, etc.

These are not the same file. Conflating them is the source of the meta-confusion that prompted the kernel/work split in the first place. Same applies to `CLAUDE.md` — the root version describes this repo; a kernel template describes what a fork should produce.

## Why bureaucracy-like separation pays off

Separating kernel, work, and meta looks like over-engineering until one of them changes. Then it becomes cheap:

- **Change the kernel** — bump a convention, improve a template — and the work is unaffected. Forks of the kernel get the benefit; this user's instance migrates at its own pace.
- **Change the work** — add a new project, update homelab, record a new preference — and the kernel is unaffected. The change is clearly stratum 5, tagged as such, and does not leak.
- **Change the meta** — improve the stratum audit, adjust test tooling — and neither kernel nor work ships with it. The dev tooling stays internal.

Without separation, every change is a decision about which of the three audiences it affects. With separation, the filesystem answers the question before you have to.

## Implications for agents

- When an agent modifies a file, it should note (or check frontmatter for) the file's tier/stratum before reasoning about consequences. A change to `01-kernel/PHILOSOPHY.md` is publishable; a change to `03-work/memory/preferences.md` is personal.
- When copying patterns from work to kernel (distillation), the copy is a deliberate lift and should rewrite personal references.
- When a fork of the kernel is contemplated, the fork path is simply "extract `01-kernel/` as its own repo" — no archaeology needed because the separation is already structural.

## See also

- [Five Strata of Repeatability](07-five-strata.md) — the stratum framework the tier structure implements
- [Convention as Compressed Decision](05-convention-as-compressed-decision.md) — why explicit separation compresses reader context
- `00-meta/stratum-audit/` — the tooling that maintains the separation
- `03-work/memory/research/2026-04-17-kernel-and-dressing.md` — the research session that identified this split

## References

- Rust project, `rust-lang/rust` repo structure and bootstrap model
- *The Compiler Construction Toolkit* — general pattern of separate-source-from-output
- W. V. Quine, "On What There Is" (1948) — philosophical roots of self-reference management
- G. Spencer-Brown, *Laws of Form* (1969) — the formal structure of distinction-making
