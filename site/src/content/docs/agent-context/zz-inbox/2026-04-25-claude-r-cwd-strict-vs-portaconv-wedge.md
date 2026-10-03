---
title: "claude -r is cwd-strict — sharpens portaconv's wedge"
description: Empirically verified that claude --resume <uuid> only finds sessions whose JSONL lives under the encoded-dir of the current cwd. An agent claimed otherwise during a recovery session; the empirical test, plus three open upstream issues + Anthropic's own docs, all confirm cwd-strictness. portaconv's "directory moving" framing was loose; the accurate framing is sharper and stronger.
stratum: 5
status: active
sidebar:
  order: 1
tags:
  - claude-code
  - portaconv
  - session-recovery
  - tier-2
date: 2026-04-25
---

## What another agent claimed

During a recent recovery session, an agent told me:

> `claude -r <uuid>` bypasses the picker and reads the jsonl directly.
> It'll resume with the original cwd recorded in the session (the
> placeholder path), but once resumed you can just cd to wherever you
> actually want — the session appends new messages with the updated cwd.
> Jsonls already tolerate multi-cwd …

If true, this would have meant `claude -r <uuid>` covered most of the
"folder moved" case portaconv was built for.

## What's actually true

`claude -r <uuid>` is **cwd-strict**. It looks for the session JSONL
*only* under `~/.claude/projects/<encoded-current-cwd>/<uuid>.jsonl`,
where `<encoded-current-cwd>` is your shell's current cwd with
non-alphanumerics replaced by `-`. If you're not in that exact dir,
you get `No conversation found with session ID`.

### Empirical reproduction (2026-04-25)

Picked a real session whose JSONL lives at:

```
~/.claude/projects/-mnt-c-Users-<user>-Documents-<workspace>-<project>-dev-vault/<uuid>.jsonl
```

(an Obsidian-plugin-dev project under `4 VAULTS/plugin_development/`)

| Run from | Result |
|---|---|
| `/tmp` | `No conversation found with session ID: <uuid>` |
| Parent of original (`.../plugin_development/`) | `No conversation found...` |
| Sibling project dir (different plugin, same parent) | `No conversation found...` |
| Original cwd (`.../<project>-dev-vault/`) | ✓ resumed, replied `RESUMED_OK_FROM_ORIG` |

Used `--fork-session --no-session-persistence --print` so no disk writes
to the original or any new JSONL.

### Upstream confirmation

- [anthropics/claude-code#5768](https://github.com/anthropics/claude-code/issues/5768)
  — "**[BUG] Resuming sessions only works from the directory in which
  they were started**" — open as of 2026-04-25, has reproducer + open PR
  #39148. Exactly the bug I just reproduced.
- [#28745](https://github.com/anthropics/claude-code/issues/28745) —
  "Allow resuming conversations from different directories" — open
  feature request asking for `--force` / `--ignore-directory` /
  `--cwd` flags. None exist today.
- [#36937](https://github.com/anthropics/claude-code/issues/36937) —
  "Add ability to change session working directory with `/cd` command
  and `--cwd` resume flag" — confirms there's no such flag.
- Anthropic's own
  [Work with sessions](https://code.claude.com/docs/en/agent-sdk/sessions)
  docs explicitly say: *"Sessions are stored under
  `~/.claude/projects/<encoded-cwd>/*.jsonl` … if your resume call runs
  from a different directory, the SDK looks in the wrong place."*

## Why this sharpens portaconv's wedge

The original portaconv framing — "for when folder moves break the cache"
— was loose. It conflated two separate things:

1. The picker (`sessions-index.json`) being stale — solved by
   `pconv doctor` + `pconv rebuild-index`.
2. `claude -r <uuid>` being cwd-strict — solved by `pconv dump <id>`
   from any cwd (paste into a fresh `claude`).

Both are real bugs in upstream Claude Code. portaconv addresses **both**
plus the cross-OS content layer. Calling that out specifically makes
the value prop sharper, not narrower.

The corrected README + commands.md docs in portaconv now name `#5768` /
`#28745` directly and add a "When `claude -r` is enough" section so
people aren't surprised when the cheap move doesn't work.

## Implications for the workflow stack

- **`claude-code-session-recovery.md` pattern** (in
  [`02-stack/patterns/`](/agentic-workflow-and-tech-stack/stack/patterns/claude-code-session-recovery/))
  should mention the cwd-strict bug explicitly when comparing
  `claude -r <uuid>` against `pconv dump`. The decision tree currently
  treats them as roughly equivalent for "I know the UUID" cases —
  they're not.
- **Practitioner advice when an agent suggests `claude -r <uuid>`:**
  always verify the cwd matches the encoded-dir holding the JSONL.
  `find ~/.claude/projects -name "<uuid>.jsonl"` is the one-liner.
- **Tool-comparison framing for future tools:** portaconv's wedge isn't
  "directory moving" broadly — it's specifically (a) cross-encoded-dir
  discovery, (b) cross-OS content rewriting, (c) picker-index repair,
  (d) committable artifacts, (e) MCP self-healing surface, (f) length
  control via `--tail`. Each is a thing `claude -r` doesn't do.

## Tier classification

This is a **tier-2 problem** — a cross-cutting bug in the substrate
(Claude Code itself) that practitioner tooling has to work around. The
right home isn't a one-off zz-research entry; it's a permanent
qualifier on the session-recovery pattern.

## Action items

- [x] **portaconv README** updated to name #5768 + #28745 + add a
      "When `claude -r` is enough" decision table.
- [x] **portaconv `reference/commands.md`** doctor section qualified
      with the cwd-strict caveat where it suggests `claude -r <uuid>`
      for picker-bypass recovery.
- [ ] **Stack pattern** `02-stack/patterns/claude-code-session-recovery.md`
      should get a small edit pointing at this finding (deferred —
      lives in this repo, separate change).
- [ ] **Watch upstream** #5768 / #28745 / #36937 — if Anthropic ships
      `--cwd` or makes resume cwd-agnostic, portaconv's positioning
      narrows again, and this entry should be revisited.
