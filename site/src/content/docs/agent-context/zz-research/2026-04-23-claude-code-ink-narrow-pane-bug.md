---
title: Claude Code TUI corrupts in narrow panes (Ink renderer, not Zellij)
description: When a Zellij pane is narrow (phone-SSH reattach, ~30-80 cols), Claude Code's Ink TUI breaks — mid-word splits, mis-aligned columns, characters wrapping one-per-line. Observed on v2.1.118 in Zellij 0.43.1, but reproduces identically in tmux and macOS Terminal.app, so the fault is upstream Claude Code / Ink, not the multiplexer. Multiple open upstream issues, no fix. Workaround is to zoom the pane (Alt+f in Zellij) before reading long output.
stratum: 5
status: observed
priority: low
date: 2026-04-23
tags:
  - claude-code
  - ink
  - zellij
  - tui
  - cross-device-ssh
  - narrow-pane
  - rendering
  - bug
  - agent-context
---

## The pattern

Reattaching a Claude Code session from a phone (via the cross-device SSH + Zellij pattern) produces a ~36-column pane. At that width, the Ink TUI fragments: tool-call labels wrap at the wrong boundaries, table column headers break apart, and individual words split mid-letter across successive lines. Easy to mistake for "phone terminal weirdness" — it's actually a specific, well-reported, unfixed upstream Claude Code bug. Worth capturing so re-investigation isn't needed the next time anyone hits it from a narrow pane.

## Observed corruption pattern

- **Environment:** Claude Code v2.1.118, Zellij 0.43.1, WSL2 on Windows, `TERM=xterm-256color`. Narrow pane via phone-over-Tailscale-SSH reattach (see [cross-device SSH pattern](/agentic-workflow-and-tech-stack/stack/patterns/cross-device-ssh/)).
- **Symptoms:** mid-word splits in `pconv list` session-id columns; `Bash(pconv list --workspace-toml auto` tool-call labels wrapping mid-argument; `gh auth status` output splitting long words (account names, usernames) across three lines each — one to three characters per line.
- **Reproduces in tmux.** Confirmed via upstream issue evidence — not a Zellij-specific bug.

:::caution[Don't blame the multiplexer]
This reproduces identically in tmux, Zellij, and macOS Terminal.app — the bug is upstream in Claude Code's Ink renderer, not the mux. Time spent retuning Zellij configs, forcing pane minimums, or swapping multiplexers will not fix it. Skip straight to the workarounds below (`Alt+f` zoom or `claude -p`) and avoid filing on `zellij-org/zellij`.
:::

## Diagnosis — it's Ink + Claude Code, not the multiplexer

Multiple converging upstream issues on `anthropics/claude-code`:

| Issue | Status | Relevance |
|---|---|---|
| [#42010](https://github.com/anthropics/claude-code/issues/42010) | **open, v2.1.88** | Deep RCA of Ink rendering corruption: DECSTBM scroll mutating prev-frame buffer, style-pool cache collisions, wrapped-text style-segment desync. Fingerprint: "resize fixes it." Exact match. |
| [#43113](https://github.com/anthropics/claude-code/issues/43113) | open | Feature request confirming Claude Code emits hard newlines at word boundaries instead of letting the terminal wrap. Directly explains the `cybersad\ner` split. |
| [#22222](https://github.com/anthropics/claude-code/issues/22222) | closed | Context indicator wraps character-by-character in narrow terminals. Same per-character shattering pattern. |
| [#42231](https://github.com/anthropics/claude-code/issues/42231) | closed, v2.1.89 | `!` shell escape reports `COLUMNS=80` regardless of actual PTY width. Proves Claude Code hardcodes widths in some code paths. |
| [#21037](https://github.com/anthropics/claude-code/issues/21037) | closed (dup of [#20825](https://github.com/anthropics/claude-code/issues/20825)) | Multiple-choice prompts don't line-break correctly in narrow tmux panes. |

**Zellij tracker is clean** — zero matching issues on zellij-org/zellij. The one unrelated hit ([zellij#4390](https://github.com/zellij-org/zellij/issues/4390)) is about Claude Code's `/ide` detection, not rendering.

## Probable regression window

**v2.1.113** switched Claude Code's CLI to a **native per-platform binary** (large render-path change). The class of Ink bugs existed before this (#21037 lands at v2.1.19) but the native-binary transition is the most recent disturbance to the render pipeline and the most likely point where phone-narrow-pane usage started failing visibly. Not traceable to a specific changelog entry — the changelog doesn't call out Ink changes.

Current: v2.1.118. No fix yet.

## Workarounds (by cost)

| Workaround | Effect | Caveat |
|---|---|---|
| **`Alt + f`** (Zellij pane fullscreen zoom) | Forces a repaint at full width. Most-cited fix. | Needs un-zoom to see other panes. |
| Drag to resize the pane | Triggers SIGWINCH → full repaint | Same as above, works in tmux too |
| Keep pane ≥ 80 columns | Avoids the hardcoded-80 threshold in #42231 | Not practical on a phone in portrait |
| **`claude -p "..."`** (print mode, non-interactive) | Bypasses the Ink renderer entirely | Single-turn only; no interactive tooling |

## What doesn't help (don't waste time)

- `CLAUDE_CODE_NO_FLICKER=1` — tried by others in [#46898](https://github.com/anthropics/claude-code/issues/46898), didn't fix.
- `export COLUMNS=120` before launching — Claude Code ignores the env in some paths (#42231 proves this).
- Wider Zellij config / forced pane minimums — Claude Code is the one mis-detecting; forcing the layout doesn't reach the hardcoded-80 code paths.

## Why low priority

- Pure UX annoyance; no data loss, no silent corruption of anything persistent.
- Single-keystroke workaround in Zellij (`Alt + f`).
- Multiple open upstream issues already carry thorough evidence; adding another report would be noise.
- Narrow-pane access (phone-reattach, small side panes) is a small fraction of typical Claude Code usage.

If it ever escalates — a layout that can't zoom, or a regression that breaks the `Alt + f` workaround — revisit, repro on the latest build, and file upstream with the fresh evidence.

## Promotion candidates

- **Stack pattern (tier 2):** belongs as a "gotchas" subsection of [cross-device SSH](/agentic-workflow-and-tech-stack/stack/patterns/cross-device-ssh/) rather than its own pattern — the bug is situational to that pattern's narrow-pane workflow, not a standalone decision tree. Fold in when the next pass through that doc lands.
- **Challenge (`research/zz-challenges/`):** only if upstream drops the class of bugs without fixing the mid-word wrap. Unlikely — track record suggests one of the open issues will land a patch eventually.

## See also

- [cross-device SSH stack pattern](/agentic-workflow-and-tech-stack/stack/patterns/cross-device-ssh/) — the workflow that exposes this bug
- [#42010](https://github.com/anthropics/claude-code/issues/42010) — deepest existing RCA of the Ink rendering corruption
- [#43113](https://github.com/anthropics/claude-code/issues/43113) — feature request to let the terminal handle wrapping (would fix the class of bugs)
