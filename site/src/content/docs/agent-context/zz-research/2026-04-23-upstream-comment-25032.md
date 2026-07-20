---
title: Upstream comment posted on anthropics/claude-code#25032
description: Historical record of the evidence-bearing comment filed on the canonical stale-`sessions-index.json` issue — 14-project cumulative drift distribution, observed `sessions-index.json` schema, mechanism hypothesis tying graceful-shutdown dependency to the Zenn "overwrite-with-cached-state" observation, four prioritized asks for Anthropic. The body below was posted verbatim (YAML frontmatter stripped pre-post) on 2026-04-23.
stratum: 5
status: stable
date: 2026-04-23
tags:
  - meta
  - research
  - claude-code
  - sessions-index
  - upstream
  - posted
---

> **Posted:** [anthropics/claude-code#25032 — comment 4304663073](https://github.com/anthropics/claude-code/issues/25032#issuecomment-4304663073) on 2026-04-23.
>
> This file is kept as the durable local record. The body below matches what's on GitHub verbatim.

---

## Stale `sessions-index.json` — 14 projects drifting up to 93 days on one machine, hypothesized mechanism

Hit this on WSL2, v2.1.118, single-OS (not the cross-platform fragmentation from #17682 / #9668 / #9306). Posting because the cumulative-drift evidence and the mechanism hypothesis tying graceful-shutdown dependency to overwrite-of-cached-state don't appear to be in the thread yet.

### Environment

- WSL2 on Windows (Linux 6.6.87.2-microsoft-standard-WSL2)
- Claude Code v2.1.118 (Bun-bundled binary at `~/.local/share/claude/versions/2.1.118`)
- Single `~/.claude/projects/` bucket per project — not cross-OS-dual-encoded for the projects showing drift

### Symptom

`/resume` picker reports one of my active sessions as a 9-message stub last modified 2026-01-09, with summary "OpenCode permissions setup and Terminal Workspaces bug fix."

Actual state of the `.jsonl`:

- Size: 59 MB
- Last `.jsonl` append: 2026-04-23 02:22 UTC (the current session I was in when I opened the picker)
- Continuous append activity from 2025-12-10 through 2026-04-23 — about four months of real resume-ed work

The `.jsonl` content is clean and picker-loadable via `claude -r <uuid>` (bypass the picker). The index is the only broken artifact.

### Cumulative drift — 14 projects on this machine

Scan of `~/.claude/projects/*/` on 2026-04-23, flagging projects where `sessions-index.json` mtime lags the newest non-subagent `.jsonl` mtime by more than 7 days:

| Project (tail of encoded name) | Lag |
|---|---|
| `-mnt-d-MEDIA` | 93d |
| `home-assistant-projects` | 90d |
| `…tasknotes…obsidian-plugins-tasknotes` (duplicate-encoded) | 84d |
| `…tasknotes-enhancements` | 80d |
| `cynario` | 79d |
| `retake-studio` | 66d |
| `4-VAULTS` | 65d |
| `…terminal-workspaces` | 57d |
| `b-g-33---Home-Lab--Home-Server` | 57d |
| `b-g-15---Family-Planning--Parenthood` | 46d |
| `3d-printing` | 44d |
| `b-g-vault-b-g`, `…tasknotes…plugins-tasknotes` (dot-prefix variant) | 12d each |
| `DFD-Excalidraw-System` | 11d |

This rules out one-time WSL crash. It's consistent with **every ungraceful close dropping an index update**, accumulating across months of normal WSL lifecycle (window-close without typing `/exit`, `wsl --shutdown`, machine suspend, OOM-kill).

### Mechanism hypothesis — graceful-shutdown is necessary but not sufficient

1. **Ungraceful-shutdown path clearly breaks.** SIGKILL / forced WSL shutdown / suspend skip application-side signal handlers and `atexit` — index update is lost, `.jsonl` survives because it's append-on-write.

2. **Clean-exit path also loses entries** per [#41946](https://github.com/anthropics/claude-code/issues/41946). So the bug isn't purely "SIGKILL skips flush."

3. **A Zenn writeup** ([tjst_t](https://zenn.dev/tjst_t/articles/260220-claude-code-oom-session-recovery?locale=en)) notes the index "rolled back two weeks" after a recovery attempt — suggests the rewrite path **re-reads cached in-memory state and overwrites the on-disk index**, rather than merging with the current filesystem state. Combined with racy writes on any abnormal timing, that would produce the cumulative drift pattern I see on this machine.

4. **@agatho's #24729 comment** points to a case-sensitivity bug in the multi-worktree code path (function `xa` in the minified `cli.js`). Other commenters confirm the bug triggers without worktrees too, which is what I observed.

So the fuller mechanism is likely: **the write path is both racy against forced-kill AND regresses state on some graceful closures**, because it re-reads a cached snapshot rather than merging with reality.

### `sessions-index.json` format (as observed — this is not documented publicly)

```json
{
  "version": 1,
  "entries": [
    {
      "sessionId": "uuid-36-chars",
      "fullPath": "/abs/path/to/<sessionId>.jsonl",
      "fileMtime": 1769531155388,
      "firstPrompt": "first 200 chars of first user message",
      "customTitle": "…",          // optional, from type:custom-title records
      "summary": "…",              // optional, LLM-generated on graceful exit?
      "messageCount": 9,
      "created": "2026-01-09T15:38:59.766Z",
      "modified": "2026-01-09T15:48:27.815Z",
      "gitBranch": "",
      "projectPath": "/abs/project/path",
      "isSidechain": false
    }
  ],
  "originalPath": "/abs/project/path"
}
```

Fully undocumented in docs.anthropic.com / docs.claude.com. It would help third parties considerably if the schema were published, even as a footnote.

### Workaround landscape (no Anthropic fix required to use these, but none should need to exist)

Third-party tools converging on two shapes:

- **Rebuild the index.** tirufege's [Python gist](https://gist.github.com/tirufege/0720c288092c1a3a4750f7c198aa524b) is the original; I shipped a Rust port as [`pconv rebuild-index`](https://github.com/cybersader/portaconv) with atomic writes, dated backup, and a `doctor` counterpart for read-only detection. Round-trip tested against the schema above — `pconv rebuild-index --all` followed by `pconv doctor` reports zero stale projects.
- **Replace the picker.** [KirillPuljavin/cres](https://github.com/KirillPuljavin/cres), [riii111/claude-resume](https://github.com/riii111/claude-resume) — both read `.jsonl`s directly and ignore the index.

### Asks for Anthropic

Prioritized:

1. **Rebuild-on-startup-if-stale.** On every launch, if `sessions-index.json` is missing OR lags the newest `.jsonl` in the same dir by >24h, regenerate it from the `.jsonl`s before showing the picker. Cheap (<100 ms for the largest project I have; likely faster than what the picker already does).
2. **Switch write path from overwrite-with-cached-snapshot to merge-with-filesystem.** Addresses the "rolled back two weeks" regressions even on graceful exit.
3. **Document the `sessions-index.json` format publicly.** Footnote-length; enables the third-party ecosystem to operate on stable ground rather than reverse-engineering per-version.
4. **Consider emitting a warning from `/resume` when picker results disagree with `.jsonl` mtimes by more than N days.** Even without an auto-fix, a hint like "the picker may be stale; consider running `claude --rebuild-index` or `pconv rebuild-index`" would close the feedback loop for users.

### Reproducibility hints for whoever picks this up

`strace -fe trace=openat,rename,write,fsync -p $(pgrep -f claude)` through a session, then diff index state across `/exit` vs `wsl --shutdown` vs SIGKILL, would pin the write cadence. I haven't done this myself because `claude -r <uuid>` and `pconv rebuild-index` unblock me today; but the drift pattern I report above is strongly suggestive of the hypothesis above.

---

References:

- Upstream: [#24729](https://github.com/anthropics/claude-code/issues/24729) (@agatho's RE of function `xa`), [#41946](https://github.com/anthropics/claude-code/issues/41946) (clean-exit failures), [#44346](https://github.com/anthropics/claude-code/issues/44346) (WSL2-specific), [#38340](https://github.com/anthropics/claude-code/issues/38340) (picker does not filesystem-scan in v2.1.81)
- Zenn writeup: <https://zenn.dev/tjst_t/articles/260220-claude-code-oom-session-recovery?locale=en>
- Workarounds: [cybersader/portaconv](https://github.com/cybersader/portaconv), [tirufege/gist](https://gist.github.com/tirufege/0720c288092c1a3a4750f7c198aa524b), [KirillPuljavin/cres](https://github.com/KirillPuljavin/cres), [riii111/claude-resume](https://github.com/riii111/claude-resume)
