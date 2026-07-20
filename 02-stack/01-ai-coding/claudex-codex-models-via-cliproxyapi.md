---
title: claudex — Codex/GPT models inside the Claude Code harness
description: Running non-Anthropic models (GPT-5.6-Sol via Codex OAuth) through the Claude Code harness using CLIProxyAPI as a loopback translation proxy — launcher matrix (Sol brain vs Fable-orchestrator-with-Sol-subagents), the dual-login requirement, and the context-window wedge that proxied models hit (auto-compact never fires, /compact self-seals) with two field-tested rescue recipes.
stratum: 2
status: research
sidebar:
  order: 7
tags:
  - stack
  - ai-coding
  - claude-code
  - claudex
  - cliproxyapi
  - codex
  - context-window
  - proxy
date: 2026-07-16
branches: [agentic]
---

## The pattern in one sentence

Keep the Claude Code *harness* (hooks, skills, agents, CLAUDE.md, muscle memory) while swapping the *model* underneath — a loopback proxy ([CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)) speaks the Anthropic API to Claude Code and translates to other providers' OAuth backends, routing by model name.

## ⚠️ Reconcile with the anti-wrapper caution first

[The index doc](./index/) warns against wrappers for three reasons: **ban risk, ecosystem churn, security surface**. This pattern is exactly that class of thing — the proxy sees every prompt and both provider accounts are routed through an unofficial client. The reconciliation, not a reversal:

- This is an **experimental lane**, not the daily driver. The primary Anthropic workflow stays native (`cc*` launchers, no proxy).
- Ban risk is real on *both* accounts. Don't route irreplaceable subscription accounts through it if that risk is unacceptable.
- The proxy is self-hosted on loopback (`127.0.0.1`), source-available, and credentialed with a local random key — better than a hosted wrapper, still an unaudited middleman.

## Architecture

```
Claude Code ──ANTHROPIC_BASE_URL=http://127.0.0.1:8317──► CLIProxyAPI
                                                            ├─ model claude-*  → Anthropic OAuth
                                                            └─ model gpt-*     → Codex OAuth
```

Claude Code is pointed at the proxy via two env vars; the proxy routes each request by model name to whichever provider credential it holds. `~/.cli-proxy-api/config.yaml` holds host/port/api-keys; `client.key` holds the local bearer token the launchers read.

## Setup (one-time)

```bash
# 1. Install the release binary (the install script wants an interactive TTY; manual is fine)
#    → drop cli-proxy-api on PATH (e.g. ~/.cargo/bin/)

# 2. Login BOTH providers into the proxy — this is the #1 gotcha:
cli-proxy-api -config ~/.cli-proxy-api/config.yaml -codex-login    # ChatGPT/Codex OAuth
cli-proxy-api -config ~/.cli-proxy-api/config.yaml -claude-login   # Anthropic OAuth

# 3. Restart the proxy so it picks up new credentials:
pkill -f cli-proxy-api    # launchers autostart it on next use
```

**Failure signature of a missing login:** `502 unknown provider for model claude-fable-5` (or the gpt equivalent) — the proxy has nowhere to route that model family. Each launcher only exercises the credentials its models need, so `claudex` works fine with only the Codex login while `fablex` 502s.

## Launcher matrix

The bashrc snippet (`profiles/bashrc-snippets/claude-code-helpers.sh`) wraps everything. House letter scheme: `y` skip-perms, `r` continue/resume, `u` submit the ultracode opener (multi-agent Workflow opt-in, budget rider included).

| Launcher | Main model | Subagents | Notes |
|---|---|---|---|
| `cc` (+`y/ry/ryu`…) | native Claude | sonnet floor | The default lane, no proxy |
| `claudex` (+`y/ry/yu/ryu`) | GPT-5.6-Sol | GPT-5.6-Sol | Pure Codex lane |
| `fablex` (+`y/ry/yu/ryu`, `fxyru`) | Fable 5 | GPT-5.6-Sol | Premium orchestrator, cheap-lane grunts |
| `ccrym` | native Claude | **you say per-delegation** | Unsets the subagent floor; named model wins |

Both proxy launchers bake in `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1` so `/effort` drives Sol's reasoning level.

### Which launcher when — the quota-lane decision table

The two subscriptions refill on very different clocks (Claude ≈ 5 h session window; Codex = weekly pool). Pick the launcher by **which pool you can afford to spend**:

| Situation | Use | Bills against |
|---|---|---|
| Normal work (default) | `cc` / `ccy` / `ccry` / `ccryu` | Claude only |
| **Codex pool exhausted** | same native `cc*` family — nothing changes | Claude only |
| **Claude session exhausted** | `claudexy` / `claudexryu` | Codex only |
| Both pools healthy, want premium orchestration with cheap grunts | `fablexy` / `fablexryu` (`fxyru`) | **Both** — Fable main burns Claude, Sol subagents burn Codex |
| Either pool running low | avoid `fablex*` (it needs both alive) | — |
| Manual per-delegation model control | `ccrym` | Claude (native, no proxy — Sol not reachable) |

Corollaries worth internalizing:

- The native `cc*` family never touches OpenAI, and the `claudex*` family never touches your Anthropic quota — they are true fallbacks for each other.
- `fablex*` is the *most fragile* launcher, not the most powerful default: a 429 on either side degrades it (main-model errors if Claude is out; every delegation fails if Codex is out).
- Check the meters: `/context` + Claude's own usage UI for the Anthropic side; `claudex-usage` (proxy request counts) + the provider's usage page for the Codex side.

**Verifying the routing:** `tail -f /tmp/cliproxy.log` — each request logs its `"model"` and status; eight `"model":"gpt-5.6-sol"` → 200 lines means the Sol lane is live.

## The context-window wedge (will bite you; read this)

Claude Code's **auto-compact math is calibrated for Anthropic windows** (Fable = 1M tokens). Through the proxy it has no idea what the foreign model's real window is, so a long Sol session sails past the true limit until the upstream rejects the request:

```
API Error: 400 Your input exceeds the context window of this model.
```

The wedge is **self-sealing**: `/compact` fails too ("summarization produced empty response") because compaction itself must send the oversized context to the same model. Retries just burn hours against the same wall.

### Rescue recipe 1 — window-swap (preserves the live session)

The session file is local; which model resumes it is just a flag:

```bash
cd <project-dir>
ccry          # resume the SAME session on a native 1M-window Anthropic model — it fits
/compact      # the big model does the summarization the small one couldn't
# exit, then:
claudexry     # hand the now-compacted session back to Sol
```

### Rescue recipe 2 — pconv salvage (clean slate)

```bash
pconv dump <uuid> > /tmp/wedged-session.md
claudexy      # fresh session → have it read the TAIL of the dump only
```

Feeding the full dump back re-wedges a fresh session instantly — extract the last findings/state, not the corpus. Completed work products (workflow journals, files) survive on disk regardless of the conversation's fate.

### Prevention (session discipline on proxied models)

- `/context` early and often — the gauge works regardless of model.
- `/compact` manually at ~half of the foreign model's estimated window; don't wait for auto.
- **Fable = long-haul context tank; Sol = sprint sessions.** Fresh `claudexyu` per big fan-out; big synthesis stays on the native 1M lane. Don't run mega-workflows in an already-long Sol session.

## The quota asymmetry (the expensive lesson)

Claude subscription quota refills on a ~5-hour window; **Codex draws from a weekly pool with no short-cycle refill**. That changes the blast radius of mistakes: a runaway fan-out on the Anthropic side costs you the afternoon — the same fan-out through the Codex lane eats *the week*. Field receipt (2026-07-16): a Fable-orchestrator session with a standing multi-agent opt-in spawned ~800 Sol research subagents in two hours — 50% of the Codex weekly quota plus a full Claude session, in one sitting.

Mitigations now standing in this stack:

- **`agent-guard` PreToolUse hook (global)** — hard cap of `CLAUDE_AGENT_CAP` (default 40) spawned subagents per session per rolling 5 h; fires even under `--dangerously-skip-permissions`. Raise per-session via the env var, or `agent-cap-off` for a deliberate 1 h window.
- **Disclosure rule** — any planned fan-out >15 agents must be stated (count, model, rough tokens) and confirmed before launch; a standing "ultracode" opt-in authorizes orchestration, *not* unbounded scale.
- Treat the Sol lane as **weekly budget**: deep-research and other mass fan-outs belong on the Anthropic side (5 h refill) or need an explicit budget cap.

## Cosmetic gotchas (ignore these)

- *"claude.ai connectors are disabled because ANTHROPIC_API_KEY or another auth source is set"* — expected; the injected proxy token shadows claude.ai auth.
- Banner says **"API Usage Billing"** — Claude Code only sees a bearer token; actual metering follows whatever OAuth the proxy holds (subscription logins meter as subscription usage).
- Codex-side usage doesn't show a Claude-style 5-hour window in OpenAI's settings; check the provider's own usage page for its actual quota model.

## Cross-references

- [`index.md`](./index/) — the anti-wrapper caution this pattern deliberately trades against
- [`local-search-ck-and-obsidian-cli.md`](./local-search-ck-and-obsidian-cli/) — sibling stack doc
- `02-stack/patterns/claude-code-session-recovery` — pconv mechanics the salvage recipe builds on
- Worklog: `zz-log/2026-07-16.md` (incident receipts)
