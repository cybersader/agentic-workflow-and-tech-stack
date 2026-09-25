---
title: Claude Code cloud sessions
description: Rules for using Anthropic-hosted Claude Code cloud sessions alongside the local stack — what they lose (proxy lanes, guard, hooks, tier-3 files), which tasks fit, how to start one, and how to spend a one-time promo credit before it falls back to plan usage.
stratum: 2
status: research
tags:
  - stack
  - ai-coding
  - claude-code
  - cloud
  - delegation
date: 2026-09-24
branches: [agentic]
---

Cloud sessions run Claude Code in an Anthropic-hosted VM against a GitHub repo clone, on their own branch, with the laptop closed. They went GA on 2026-09-23. Existing subscribers got a one-time credit ($100 Pro / $250 Max, claim by 2026-10-07) that cloud sessions spend **before** falling back to normal plan usage. Unconfirmed third-party claims: the credit expires 2026-11-05 and does not cover Routines.

## What a cloud session does not have

| Local stack piece | In a cloud session |
|---|---|
| CLIProxyAPI lanes (Sol, Luna, Astra, OpenRouter GLM) | Absent — Claude models only |
| `~/.claude` global rules, `agent-guard`, flight recorder, user hooks | Absent — only what the repo commits under `.claude/` and `CLAUDE.md` loads |
| `core.hooksPath` git hooks (no-attribution `commit-msg`) | Not active unless the session runs the repo's hook installer |
| Gitignored tier-3 paths, vaults, secrets, `.env` | Absent (a privacy feature, not a bug) |
| WSL, systemd/cgroups, Tailscale, Obsidian, browser/desktop bridges | Absent |

## Rules

1. **Repo-contained tasks only.** The task must be completable and verifiable from the clone plus public package registries. If verification needs the live local environment (launchers, guard, watchdog, proxy), keep it local.
2. **Policy moves into the prompt.** The guard is not there to enforce fan-out caps or leaf rules, and the no-attribution hook may not be either. State them in the task: bounded scope, no mass sub-agent fan-out, no AI attribution in commits or PR text. Check commit messages on every PR before merging.
3. **One task → one branch → one PR.** Every result lands as a PR the human reviews. Never let a cloud session merge.
4. **No secrets in the task.** Do not paste keys, hostnames, or tier-3 details into the prompt; the session does not need them for a repo-contained task.
5. **Track the meter.** The credit is spent first; once it is gone, cloud sessions draw from the same 5h/weekly plan pool as local Opus. Check the balance weekly and stop routing background work to the cloud once the credit is exhausted, unless local capacity is the bottleneck.
6. **Tasks are ephemeral.** Idle VMs are reclaimed and background processes are not restored. Do not use a session as a server or a long watcher.

## Good fits

- Overflow when the local 5h pool is throttled.
- Batches of well-specified issues across repos: tests, dependency bumps, lint/type cleanup, docs-site build fixes, README/index refreshes.
- Second-opinion review of an open PR, or a test-fix loop on a branch.
- Kicking off work from the phone and reviewing the PR later.

## Starting one

- **Web / phone:** open claude.ai/code (or the Claude app's Code tab), connect GitHub, pick the repo, describe the task.
- **CLI:** `claude --cloud "<task description>"` from inside the repo creates a session; `claude --cloud <session-id|url>` attaches to an existing one; `claude --teleport` pulls a cloud session back to local.
- **Claim the promo credit:** the popup on claude.ai/code, or `/claim-credit` in the CLI.

A reusable task template:

```text
Task: <one issue, with acceptance criteria>.
Scope: only files needed for this task. Run the repo's tests/build before finishing.
Rules: open a PR, do not merge. No AI attribution in commits or PR text.
Do not spawn more than 3 sub-agents.
```

## Sources

- ClaudeDevs GA announcement and credit clarification (x.com/ClaudeDevs, 2026-09-23).
- Third-party launch coverage for claim deadline and amounts; expiry/Routines claims unconfirmed.
- `claude --help` (v2.1.276) for `--cloud` and `--teleport`.
