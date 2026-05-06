---
title: My Agentic Stack
description: Opinionated toolkit — AI tools, terminals, cross-device setup, knowledge management — forkable by people with similar setups.
stratum: 3
status: research
sidebar:
  order: 0
tags:
  - stack
  - tier-2
branches: [agentic]
---

This is tier 2 of the three-tier scaffold. It sits between the universal [`kernel`](../01-kernel/) and the personal [`work`](#private-reference) layer. If your setup looks like the user's (WSL + Claude Code / OpenCode + Obsidian + Zellij), forking this tier gives you a working agentic-development toolkit without the personal content.

Think of it as **dotfiles for agentic development** — not code, but the configs, install scripts, and patterns that make a specific tool stack work together.

## Contents (being filled out in Phase 4)

| Layer | Purpose |
|---|---|
| [`01-ai-coding/`](./01-ai-coding/) | Claude Code + OpenCode + oh-my-opencode install & config |
| [`02-terminal/`](./02-terminal/) | Zellij, WezTerm, Alacritty setup + keybindings |
| [`03-cross-device/`](./03-cross-device/) | Tailscale SSH + Termux + SSH config |
| [`04-knowledge-mgmt/`](./04-knowledge-mgmt/) | Obsidian + Obsidian CLI + recommended plugins |
| [`05-homelab/`](./05-homelab/) | General homelab patterns (user's TrueNAS specifics live in `03-work/homelab/`) |
| [`06-dev-infra/`](./06-dev-infra/) | Docker, Git, utility tooling |
| [`07-editor-ext/`](./07-editor-ext/) | VS Code extensions for agentic work |
| [`profiles/`](./profiles/) | Bashrc helpers (`z`, `zk`, `cc`, `ccy`), keybinding configs |
| [`patterns/`](./patterns/) | Stack-level patterns — cross-device SSH, parallel agents via worktrees, Obsidian workflow |
| [`install/`](./install/) | Install scripts for the stack (WSL-aware) |
| [`decisions/`](./decisions/) | Decision matrices — Claude Code vs OpenCode, tmux vs Zellij, etc. |

## Stratum map

The stack holds mostly strata 2–4:

- **Stratum 2** (pattern, opinionated but general): `patterns/`, `decisions/`
- **Stratum 3** (parametric, fill-in for this stack): install guides per layer
- **Stratum 4** (deterministic, drop-in for this stack): install scripts, config files, bashrc snippets

The personal opinions live here. The universal truths live in [`01-kernel/`](../01-kernel/). The user-specific instance lives in [`03-work/`](#private-reference).

## Boundary with tier 3

A useful boundary example: when building an Astro + Starlight docs site,

- **Tier 2 (this layer) says:** "I use Astro + Starlight + Flexoki theme" — the tool choice
- **Tier 3 (`03-work/`) says:** "For MY docs sites, I use these layout conventions, custom components, `zz-` utility-page prefix" — the conventions within the stack

General rule: **stack = the tools picked. Work = the conventions within those tools.**

## Status

This tier is a placeholder at Phase 3 of project init. The content per layer is being populated in Phase 4. The `profiles/` subfolder is already populated from migration; other layers are scaffold directories awaiting content.

## See also

- [`../01-kernel/principles/05-convention-as-compressed-decision.md`](../01-kernel/principles/05-convention-as-compressed-decision.md) — why conventions pay off
- [`../01-kernel/principles/07-five-strata.md`](../01-kernel/principles/07-five-strata.md) — how this tier maps to the repeatability strata
- [`../03-work/`](#private-reference) — how the user applies this stack
