---
title: 01 · AI Coding CLIs
description: The AI coding tools at the top of the stack — Claude Code (primary), Gemini CLI (free-tier fallback), Codex CLI (alternative). Why I avoid wrappers.
stratum: 2
status: research
sidebar:
  order: 1
tags:
  - stack
  - ai-coding
  - claude-code
  - gemini-cli
  - codex
date: 2026-04-17
branches: [agentic]
---

## The pattern (stratum 2)

An agentic workflow needs an AI coding CLI at the top of the stack. The CLI is the **daily driver** — how intent becomes code, how questions find answers, how exploration happens. Everything else in the stack exists to serve this tool's effectiveness: terminal multiplexing so the session survives disconnects, cross-device access so the tool is reachable from anywhere, knowledge management so context is available when asked for.

The pattern expects you'll pick **one primary CLI** and have at most 1–2 fallbacks. Switching daily drivers is expensive because each has its own prompt conventions, settings paths, and muscle memory. Pick once, stabilize, re-evaluate every 6–12 months.

## Why CLIs (not IDE-integrated assistants)

- **Scriptable** — output pipes into other tools
- **Portable** — run over SSH, in a terminal multiplexer, on a phone
- **Auditable** — all state is files (conversations, agent definitions, hooks)
- **Less lock-in** — the editor is decoupled from the AI tool
- **Cheaper per-token** — no hidden IDE context inflation

IDE assistants (Cursor, Continue, Cline) are fine; they're a different stratum decision. This stack picks terminal-first because the terminal is the universal substrate.

## My current picks

### Primary: Claude Code

- **Why primary:** best agentic execution I've used, strong tool-use, competent at multi-file reasoning, Anthropic's Opus/Sonnet tiers give real headroom.
- **Plan:** Claude Max ($100/mo at time of writing — check current pricing).
- **Install:** `npm install -g @anthropic-ai/claude-code` (or homebrew / curl scripts per platform).
- **Config lives at:** `~/.claude/` (global) and `.claude/` (per-project).
- **Scaffold integration:** this repo's kernel agents and skills are at `.claude/agents/`, `.claude/skills/`, `.claude/commands/`.

### Fallback: Gemini CLI

- **Why fallback:** free tier exists, reasonable for spot tasks, different model family means a sanity check on Claude outputs.
- **Use case:** rate-limited on Claude, or want a second opinion, or just exploring what Google's ecosystem does differently.
- **Install:** per Google's Gemini CLI docs.

### Alternative: Codex CLI

- **Why alternative:** OpenAI's model family fluency matters for some tasks.
- **Use case:** same as Gemini — spot tasks, comparison, ecosystem variety.

## What I avoid (currently)

### OpenCode / OpenClaw / T3Code and other wrappers

- **Why avoid:** three concerns, any one of which is reason enough at this stage.
  1. **Ban risk.** Providers may suspend accounts that route through unauthorized wrappers. Losing a $100/mo plan because of a wrapper is a bad trade.
  2. **Ecosystem instability.** New wrappers churn rapidly; none has proven long-term reliability yet. Depending on a wrapper means your workflow depends on its maintenance pace.
  3. **Security surface.** A wrapper sits between me and the provider; it can see every prompt. Unless I've personally audited the code (which I haven't for most), I'm extending trust blindly.
- **When to revisit:** when one of these has 2+ years of clean operation, verified code audit, and provider cooperation (not just tolerance). Possibly 2027.

:::caution[Wrapper enthusiasm is the wrong default]
The wrapper space looks tempting — feature parity claims, multi-provider routing, slick TUIs. The hidden cost is account-level: a single ToS-flagged commit can suspend a Max plan, and there is no appeal channel that respects the wrapper as a legitimate client. Treat wrappers as research-only until provider cooperation is explicit (not just tolerated).
:::

### IDE-embedded assistants as the *primary* tool

- Cursor, Continue, Cline, GitHub Copilot's agent mode are fine for *editor-scale* tasks. They're a bad fit for *workflow-scale* tasks because they couple AI to the editor. When the editor changes, the AI workflow changes. Bad for portability across devices.

## Install pointers

| Tool | Command (or link) |
|---|---|
| Claude Code | `npm install -g @anthropic-ai/claude-code` |
| Gemini CLI | [Google's install docs](https://github.com/google-gemini/gemini-cli) |
| Codex CLI | [OpenAI's install docs](https://github.com/openai/codex) |

See [`../../01-kernel/scripts/install.sh`](../../01-kernel/scripts/install.sh) for the integrated install used by the [rebuild flow](#private-reference).

## Per-tool config cascade (Claude Code)

```
~/.claude/settings.json         # global, all projects
~/.claude/agents/*.md           # global agents available everywhere
~/.claude/skills/*/SKILL.md     # global skills
./.claude/settings.local.json   # per-project, overrides global
./.claude/agents/*.md           # per-project agents
./.claude/skills/*/SKILL.md     # per-project skills
./CLAUDE.md                     # per-project conventions document
```

Global config travels with me; per-project config stays with the repo. The rebuild flow recreates both.

## Session recovery across path changes (portaconv)

Claude Code keys conversation history to the **absolute filesystem path of the
cwd at launch** — sessions live under `~/.claude/projects/<encoded-cwd>/`. Any
time that absolute path changes, `/resume` stops finding the old history. Three
common ways this breaks:

- **Folder moved or renamed.** Reorganizing your workspace, renaming the
  project directory, or checking it out at a different path all create a new
  encoded bucket. The old sessions are still on disk; they're just invisible
  from the new cwd.
- **OS encoding differs.** Same project opened from WSL (`/mnt/c/…`) and
  PowerShell (`C:\…`) produces two separate encoded directories. `/resume`
  from either only sees half the history.
- **Content poisoning.** Session bodies bake absolute paths into `cwd`,
  `file_path`, and prose — one real 54 MB session held 9999+ `/mnt/c/…` refs
  and 72 `C:\…` refs. File-level copy or symlink merges the storage layer but
  the content still carries the OS/path it was authored on, so a
  PowerShell-launched Claude resuming a WSL-authored session fails the first
  time it tries to `Read /mnt/c/…`.

**[portaconv](https://github.com/cybersader/portaconv)** (`pconv`) is the
content-aware fix. The mental model is **not** "resume in place" — it's extract,
optionally rewrite paths, paste into a fresh session at whatever cwd is current,
and continue from there.

- Read-only terminal-native extractor — `pconv list` across every encoded
  project directory (both path encodings, all cwds), `pconv dump <id>` to
  paste-ready markdown or JSON.
- Optional path rewriting (`--rewrite wsl-to-win` / `win-to-wsl` / `strip`) so
  a dump produced at one path/OS is usable at another.
- Per-file list cache + workspace-TOML scoping (`--workspace-toml auto` walks
  up from cwd to the nearest `*.portagenty.toml`), time-window filtering
  (`--since 2d`), grep on title / cwd.
- Ships an MCP server (`pconv mcp serve`) so MCP-aware agents can query past
  conversations directly as `list_conversations` / `get_conversation` tools.

Paired with [Portagenty](../02-terminal/#launcher-on-top-portagenty): the `pa
convos` shim forwards to `pconv` with the current workspace TOML auto-injected,
and `pa init --with-agent-hooks` wires `pconv mcp serve` into the project's
`.mcp.json` so Claude itself can reach prior history as a tool.

**Install:**

| Tool | Command |
|---|---|
| portaconv (`pconv`) | `cargo install --git https://github.com/cybersader/portaconv` — see [portaconv README](https://github.com/cybersader/portaconv) |

## Integration with the rest of the stack

| Expects | From |
|---|---|
| A terminal multiplexer | [02 · Terminal](../02-terminal/) — Zellij or tmux |
| SSH + cross-device | [03 · Cross-Device](../03-cross-device/) — Tailscale + Termux |
| Knowledge to reference | [04 · Knowledge Mgmt](../04-knowledge-mgmt/) — Obsidian vault |
| Image-in-terminal paste | [06 · Dev Infra](../06-dev-infra/) — Zipline + ShareX |

## Deep dives

- [Decision matrix — which CLI when](../decisions/index.md)
- [`../patterns/parallel-agents-worktrees.md`](../patterns/parallel-agents-worktrees.md) — running multiple Claude Code sessions simultaneously
- [`../../01-kernel/principles/04-progressive-disclosure.md`](../../01-kernel/principles/04-progressive-disclosure.md) — why context engineering matters for these tools
