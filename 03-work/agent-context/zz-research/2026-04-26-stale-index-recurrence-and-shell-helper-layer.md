---
title: Stale-sessions-index recurrence + cc-resume-here as a shell-helper workaround layer
description: 2026-04-26 follow-up to the 2026-04-23 stale-sessions-index investigation. Bug recurred today on the same project despite portaconv v0.1.0's `pconv doctor` + `pconv rebuild-index` shipping 2026-04-25 — confirms the gap isn't a missing tool but the lack of a launch-time auto-trigger. Captures the cc-resume-here shell helper added to claude-code-helpers.sh as a complementary "FS-direct read at the bashrc layer" workaround, and lists the look-into items for closing the gap (SessionStart hook, portagenty shim, picker replacement) without re-deriving them next time.
stratum: 5
status: research
date: 2026-04-26
tags:
  - claude-code
  - sessions-index
  - resume
  - wsl
  - shell-helper
  - bashrc
  - portaconv
  - recurrence
  - agent-context
  - research
related:
  - "[[2026-04-23-stale-sessions-index-bug]]"
  - "[[../../../research/learnings/2026-04-23-stale-sessions-index-detection-and-recovery]]"
  - "[[../../../02-stack/patterns/claude-code-session-recovery]]"
---

## Why this is captured

The bug from [2026-04-23-stale-sessions-index-bug](./2026-04-23-stale-sessions-index-bug.md) **recurred today, 2026-04-26**, on the same project (mcp-workflow-and-tech-stack). The 2026-04-25 fix landed `pconv doctor` and `pconv rebuild-index` as portaconv v0.1.0 subcommands — they exist and they work — yet the bug surfaced fresh and required manual recovery.

That's the new fact. The fix-by-tooling shipped, but the bug came back anyway, because **nothing automatically runs the tool**. Today's recovery played out as a live demonstration of the gap:

1. Lost in-memory context after a `wsl --shutdown` cycle.
2. `/resume` showed wrong/old session metadata.
3. Recovery via the manual recipe: `pconv list`, `pconv dump --tail 200`, `mv sessions-index.json sessions-index.json.bak-*`. ~5 min, all manual.
4. `pconv doctor` could have detected the staleness automatically. It didn't run because there's no trigger.

The shipped solution is incomplete, not because the tool is wrong, but because the **delivery mechanism** isn't in place. This note captures (a) the workaround added today at the bashrc layer that sidesteps the bug entirely without needing the tool to fire, and (b) the look-into items for closing the delivery gap properly.

## What got added today

### `cc-resume-here` shell function

Added to [`profiles/bashrc-snippets/claude-code-helpers.sh`](../../../profiles/bashrc-snippets/claude-code-helpers.sh). Picks the most-recently-modified `.jsonl` from the encoded-cwd dir under `~/.claude/projects/` and resumes it via `claude -r <uuid>`. Bypasses `sessions-index.json` entirely.

```bash
cc-resume-here() {
    local enc=$(pwd | sed 's|[^A-Za-z0-9]|-|g')
    local proj_dir="$HOME/.claude/projects/${enc}"
    [ ! -d "$proj_dir" ] && { echo "no project dir: $proj_dir"; return 1; }
    local latest=$(ls -t "$proj_dir"/*.jsonl 2>/dev/null | head -1)
    [ -z "$latest" ] && { echo "no sessions in $proj_dir"; return 1; }
    local uuid=$(basename "$latest" .jsonl)
    echo "resuming $uuid"
    claude -r "$uuid"
}
alias ccrh='cc-resume-here'
```

Uses claude's recovery primitive #1 (`claude -r <uuid>`) — the cheapest and most index-immune of the three. Encoded-cwd derivation matches the convention observed empirically (every non-alphanumeric character → single dash; verified against `1 Projects, Workspaces` → `1-Projects--Workspaces`).

### Why this is a useful layer even with `pconv` shipped

| Layer | Where it lives | Trigger | Latency from "I want to resume" to "I'm in" |
|---|---|---|---|
| **`pconv doctor` / `rebuild-index`** | `~/.cargo/bin/pconv` | Manual invocation by user OR by an agent | ~10 sec (fast); requires user awareness of the symptom |
| **`cc-resume-here` / `ccrh`** | `~/.bashrc` (sourced) | One typed command | ~1 sec; no awareness needed — works even when index is fine |
| **`/resume` picker** | Claude Code itself | Auto on launch | ~instant; FAILS when index is stale |

The shell helper composes additively. Daily flow:

1. Type `ccrh` in the project dir.
2. The most recent session opens regardless of `sessions-index.json` state.
3. The index can be stale, accurate, or missing — irrelevant.

It's the bashrc-layer answer to "I just want to get back to work without thinking about which failure mode is active today." The pconv tooling is still the right answer for repair (rebuilding the index for the picker, batch cleanups across projects). The shell helper is the right answer for the daily resume-into-active-session case.

## What the recurrence tells us

The 2026-04-23 evidence — 14 projects with index lag >7 days, max 93 days — was **cumulative**: the result of months of WSL closures. Today's recurrence is **fresh**: the index was clean as of 2026-04-25 (rebuilt by `pconv rebuild-index`), and 1 day later it was stale again.

Conclusion: **the bug fires often enough that 1-day-old fix-state isn't safe**. Whatever shutdown event caused it is reproducible per-WSL-session-close on this machine — not a rare race. So:

- The 2026-04-25 manual-rebuild approach buys you ~1 day of index accuracy, then drifts again.
- A weekly cron rebuilding all projects is overkill for some, undershoot for others.
- The right pattern shape is **rebuild-on-launch-if-stale**, fired automatically every time `claude` starts.

## Look-into items (the gap-closing options)

### 1. SessionStart-style hook in Claude Code's `settings.json`

Claude Code supports lifecycle hooks. If there's a "before-session-start" hook surface, dropping `pconv doctor --auto-fix` (or equivalent) into it would close the gap completely — every launch self-heals before the picker reads.

Open questions:

- Does Claude Code have a SessionStart hook (or analogue) that fires *before* the picker reads the index? Or only post-session-load? If only post, this approach is too late.
- Would this hook fire on `claude -r <uuid>` invocations or only on plain `claude` launches?
- What's the latency budget — pconv doctor is fast (<1s on this corpus) but a heavier fix path could push session start time noticeably.

Worth investigating: read `.claude/settings.json` schema docs, check for hook events with the right timing.

### 2. portagenty shim auto-runs `pconv doctor` on entry

[portagenty](https://github.com/cybersader/portagenty)'s `pa convos` shim is already a wrapper around `pconv` for workspace scoping. A `pa cc` or `pa launch claude` shim that runs `pconv doctor --auto-fix` *then* execs `claude` would work for any user who's onboarded to portagenty.

Tradeoff: requires user adoption of portagenty as the launch surface. Bashrc helper has lower onboarding cost (just source one file), works for users who don't want a wrapper layer.

Worth considering as an additional layer, not as a replacement.

### 3. Replacement picker (cres / claude-resume)

Per the 2026-04-23 doc, two replacement-picker tools exist that read `.jsonl` directly. If `/resume`'s picker behavior remains contested across versions (#38340 vs #44346), a replacement that always-FS-scans is the surgical fix at the picker layer.

Tradeoff: another binary to install + an alias to remember. The cc-resume-here helper achieves "always FS-scan" without needing a separate picker, just at the cost of opening into the most-recent session rather than offering a list.

Worth comparing: would cybersader actually use a list-picker, or is "open the most recent" sufficient 95% of the time? If the latter, the shell helper is enough; if the former, install one of the replacements.

### 4. Upstream rebuild-on-startup

The 2026-04-23 upstream comment on #25032 already requested this from Anthropic. No timeline. Slow path; depends on Anthropic prioritizing.

Status to monitor: any acknowledgment or PR linking to #25032 since the comment was posted.

### 5. Promote to research/zz-challenges/03

The 2026-04-23 zz-research note plus this follow-up plus the existing `research/learnings/2026-04-23-stale-sessions-index-detection-and-recovery.md` plus the `02-stack/patterns/claude-code-session-recovery.md` are starting to feel like a tracked challenge in the same shape as Challenge 02 (fragmentation). The bug:

- Has a documented mechanism (graceful-shutdown-dependency + cached-state overwrite)
- Has multiple workarounds (pconv tooling, shell helper, replacement pickers, upstream fix)
- Recurs on this machine reliably
- Is upstream-tracked but unfixed

That's the challenge shape. Worth promoting to `research/zz-challenges/03-claude-code-stale-sessions-index.md` to consolidate and stop scattering across zz-research notes. Defer until a clear "what changed since the last challenge promotion" trigger fires (or just do it — the cost is one consolidation pass).

## Cadence of recurrence — empirical tracking

Since the bug appears reliable per WSL terminal-session close on this project, worth a small accumulation of data points to corroborate the "every shutdown" hypothesis:

| Date | Trigger | Recovered via | Latency |
|---|---|---|---|
| 2026-04-23 | `wsl --shutdown` (suspected) | `mv sessions-index.json` + portaconv investigation | ~30 min (initial dive) |
| 2026-04-26 | WSL terminal close (suspected) | `pconv dump --tail 200` + `mv sessions-index.json` + new shell helper | ~5 min (well-trodden path) |
| _next_ | _track here_ | _ideally `ccrh` if helper is in place_ | _< 5 sec_ |

Append future occurrences as they happen. If `ccrh` is in place by then, the latency should be near-zero — proof of the helper's value layered on top of pconv.

## Why this is research-flavored, not challenge-flavored (for now)

zz-challenges is for **systemic problems being actively worked**. zz-research is for **investigations and follow-ups**. This note is the latter:

- The mechanism is mostly understood (per 2026-04-23).
- The workarounds are mostly built (pconv, shell helper).
- What's open is *delivery* — getting a workaround to fire automatically — and that's a "look into options, decide, then promote" shape.

When one of the look-into items above is committed to (e.g., "we're going to ship a SessionStart hook"), then it graduates to a challenge. Until then, this is a research note tracking the gap.

## See also

- [2026-04-23 stale-sessions-index bug](./2026-04-23-stale-sessions-index-bug.md) — the original investigation
- [2026-04-23 upstream comment 25032](./2026-04-23-upstream-comment-25032.md) — what got pushed upstream
- [research/learnings/2026-04-23-stale-sessions-index-detection-and-recovery.md](../../../research/learnings/2026-04-23-stale-sessions-index-detection-and-recovery.md) — distilled insight, generalizes past Claude Code
- [02-stack/patterns/claude-code-session-recovery.md](../../../02-stack/patterns/claude-code-session-recovery.md) — practitioner decision tree
- [profiles/bashrc-snippets/claude-code-helpers.sh](../../../profiles/bashrc-snippets/claude-code-helpers.sh) — where `cc-resume-here` / `ccrh` live
- [research/zz-challenges/02-claude-code-conversation-fragmentation.md](../../../research/zz-challenges/02-claude-code-conversation-fragmentation.md) — sibling tracked challenge for shape comparison
