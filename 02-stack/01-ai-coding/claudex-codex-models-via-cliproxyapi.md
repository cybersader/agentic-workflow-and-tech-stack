---
title: claudex — Codex/GPT models inside the Claude Code harness
description: Running Sol, Astra, and Claude models through the Claude Code harness using CLIProxyAPI — including pinned and explicit cross-provider lanes, premium-worker approval, provider preflight, quota asymmetry, and context-window recovery.
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

- On a machine that deliberately opts into provider mixing, `x` and supervised agent entry points may prefer the cross-provider lane. Native `cc` and Fable launchers remain explicit first-party fallbacks rather than disappearing.
- Ban risk is real on *both* accounts. Don't route irreplaceable subscription accounts through it if that risk is unacceptable.
- The proxy is self-hosted on loopback (`127.0.0.1`), source-available, and credentialed with a local random key — better than a hosted wrapper, still an unaudited middleman. Making the lane convenient does not remove that tradeoff.

## Architecture

```
Claude Code ──ANTHROPIC_BASE_URL=http://127.0.0.1:8317──► CLIProxyAPI
                                                            ├─ model claude-*  → Anthropic OAuth
                                                            └─ model gpt-*     → Codex OAuth
```

Claude Code is pointed at the proxy via two env vars; the proxy routes each request by model name to whichever provider credential it holds. `~/.cli-proxy-api/config.yaml` holds host/port/api-keys; `client.key` holds the local bearer token the launchers read.

## Setup and provider preflight

Install the CLIProxyAPI release binary on `PATH` and keep its config/client key under `~/.cli-proxy-api/`. Provider login is otherwise launcher-driven: pinned lanes hard-check every promised route, while flexible mixed-provider lanes hard-check the main model's provider and inspect worker-only providers for repair or explicit degraded continuation.

When a credential is missing, locally expired, or rejected with an authentication failure, the launcher shows the short reason and asks:

```text
Claude OAuth needs attention: invalid_grant: refresh token not found or invalid
Open the Claude login now, then continue this launch? [Y/n]
```

Accepting opens the provider's browser OAuth flow in the foreground. After CLIProxyAPI hot-loads the new credential, the same original launch continues automatically—no long command and no second `x` invocation.

Manual recovery helpers remain available:

```bash
cliproxy-codex-login    # ChatGPT/Codex OAuth
cliproxy-claude-login   # Anthropic OAuth
cliproxy-restart        # confirmed local restart; may briefly interrupt proxy sessions
```

`claudex-login` remains a compatibility name for `cliproxy-codex-login`.

The health check uses CLIProxyAPI's loopback Management API plus redacted local expiry metadata. A private `management.key` is generated with mode `0600` and supplied only when the helper starts the loopback-bound proxy. On systemd-user hosts, startup uses the dedicated transient `cliproxyapi-managed.service`; the service-side bootstrap reads the key file and then `exec`s the exact proxy binary, so the password is not embedded in unit properties and the shared proxy cannot inherit a supervised Portagenty shell's cgroup. If the user manager is unavailable inside a Portagenty service, startup fails closed instead of using `nohup`. Portable fallback startup records an exact PID, and restart refuses to signal any running proxy that is not owned by either the dedicated unit or that PID file. It never sends a model/inference probe, preserving the weekly Codex budget. Tradeoff: an expired access token can occasionally prompt a fresh login even when its refresh token might still have worked.

A single Codex OAuth credential has no alternate candidate during a transient upstream failure. CLIProxyAPI's legacy 60-second `408`/`5xx` cooldown can therefore turn one recoverable error into local `503 auth_unavailable` responses without contacting Codex. The live single-credential configuration sets `transient-error-cooldown-seconds: -1`; hard authentication and quota handling remain intact. Every active proxy launcher also sets `CLAUDE_CODE_MAX_RETRIES=2` by default (override with `CLIPROXY_MAX_RETRIES`) instead of Claude Code's 10-retry default, so a persistent lane failure returns control to the orchestrator promptly rather than holding the session in a long retry loop.

Quota, cooling-down, rate-limit, and temporary upstream failures do **not** trigger automatic credential replacement. Authentication recovery and quota recovery are intentionally different: an ordinary login repairs a missing, expired, or rejected credential; signing back into the same quota-exhausted account does not restore quota. When every enabled account is exhausted, the useful login action is explicitly **sign in with a different account that has available quota**.

### Quota cooldown is proxy-side, and an upstream reset does not clear it

When the provider answers a request with a usage-limit `429`, CLIProxyAPI records the refusal against that credential and opens its own in-memory circuit breaker, honouring the upstream `resets_at` as the retry deadline. Every later request is refused **locally**, without contacting the provider. That is the whole trap: if you clear or top up usage on the provider's side, nothing tells the proxy, and it keeps refusing against a deadline that no longer means anything.

The preflight reports this as its own provider state, `quota-unavailable`, and deliberately does **not** offer the transient "launch anyway" bypass for a required provider, because every request would be refused before it left the machine. The concise hard-gate menu is:

```text
n  sign in with a different account that has available quota for each blocked provider, then recheck once
r  clear only quota-marked proxy cooldowns after the upstream limit reset, then recheck once
c  print native Claude alternatives, then stop (Codex-blocked gates only)
a  abort (default, including with no TTY)
```

The `c` action does not change launchers or start another process. It prints `fablem` and `ccrym` as explicit alternatives and stops. Login and reset paths each perform one bounded recheck; they never retry-loop.

With multiple OAuth accounts, `quota-unavailable` has the stricter meaning **every enabled credential for that provider is quota-blocked**. Credential states are classified separately before they are aggregated. A quota-exhausted primary plus a ready fallback is ready; a quota-exhausted primary plus a temporarily overloaded fallback is `transient-unavailable` and keeps the confirmed launch-through path; a quota credential plus an unrecognized fallback fails closed as `unknown`. The reason reports only redacted counts, never account labels, filenames, email addresses, or auth indexes. This prevents one exhausted account from exposing a provider-wide reset menu while another account still has capacity.

Flexible mixed-provider lanes distinguish the main model's **required** provider from worker-only **optional** providers:

- `claudexm` and `astraxm`: Codex is required; Claude is optional.
- `fablexm` and `opusxm`: Claude is required; Codex is optional.

An unavailable optional provider gets the relevant recovery choices—different-account login or cooldown reset for quota, ordinary login for `login-required`, and no irrelevant repair action for transient/unknown failures—plus `c` to continue without the named workers. Continuing keeps the worker definitions installed but appends a runtime warning naming the unavailable workers and forbidding their selection until a later health check confirms recovery. It never silently switches providers or models. Pinned lanes such as `fablex` and `opusx` retain hard two-provider preflight because their worker promise depends on Codex.

The split is narrower than "anything that says 429". Only genuine **exhaustion** wording — `usage_limit_reached`, `insufficient_quota`, `quota_exceeded`, and the phrases "usage limit", "quota", "out of credits", "credit balance", and "billing hard limit" — reaches `quota-unavailable`. A bare `429`, `rate_limit_error`, "rate limit", and "cooling down" stay `transient-unavailable` and keep the bypass, because a short concurrency throttle clears in seconds and a quota reset does nothing for it. Nothing is lost in the case that matters: when the 429 really was exhaustion, the proxy's own cooldown message carries the upstream `usage_limit_reached` in its `last error:` text, so it still classifies as quota.

```bash
cliproxy-reset-quota          # codex by default
cliproxy-reset-quota claude
```

This asks the running proxy to drop the `Unavailable` / retry-deadline / quota state only for that provider's credentials currently carrying a genuine quota-exhaustion error. Ready, transient, unknown, and disabled siblings are left untouched. It is legitimate in exactly one situation: **the upstream limit has genuinely reset (or been raised) and only the proxy's stale cooldown is still refusing.** It is not a way to push past a live limit — clearing the breaker just sends one real request into the same wall, which re-trips it and spends a request to learn nothing. If no quota-marked credential exists, the helper refuses without posting a reset.

A plain `cliproxy-restart` also clears the state, because the breaker is in memory — but only while the proxy's `save-cooldown-status` is left false. With cooldown persistence enabled, the deadline survives a restart and the reset endpoint is the only in-place fix.

One upgrade note, as a recommendation rather than an instruction: builds from **v7.2.155** onward parse a top-level `resets_at` and preserve cooldown deadlines correctly. Older builds (the field-verified case here ran **v7.2.151**) mishandle that shape, which is part of why deadlines end up stale and unexplained. Upgrading reduces how often the reset helper is needed; it does not remove the proxy-side nature of the cooldown.

If the installed build has no `/v0/management/reset-quota` route, the helper says so explicitly (`HTTP 404`) rather than failing silently — in that case a restart, with `save-cooldown-status` false, is the remaining option.

## Launcher matrix

Claude Opus 5.5 uses the exact pinned ID `claude-opus-5-5`. Claude Code v2.1.280 or newer is required. The model has a native 1M context window, so every launcher uses the plain ID rather than a `[1m]` suffix. The generic `opus55`/`cc` choices still allow independent native main and worker selection, and `ccm opus55`, `ccyo55`, and `ccryo55` retain exact worker pinning.

The named family now parallels Fable's useful option types: `opus55x` is proxy-backed with Sol-locked workers; `opus55xm` is flexible cross-provider; `opus55o`, `opus55f`, and `opus55m` are native Opus/Fable/flexible worker variants. Existing Opus 5 defaults remain unchanged.

CLIProxyAPI v7.2.151 and upstream v7.3.12 did not advertise Opus 5.5 on 2026-09-22. OAuth aliases are not a substitute because they preserve the older provider model ID. Cross-provider support therefore uses the narrow pinned profile in [`profiles/cliproxy-opus55/`](../../profiles/cliproxy-opus55/): v7.3.12 at commit `2eb8dd11d2480c5fd8bc8f2796cec6af534bc3b6`, with an idempotent local catalog override that disappears logically as soon as upstream provides the exact ID. The installer preserves a rollback binary, refuses active client streams, and verifies `/v1/models` without inference. Both proxy launchers also run `_cliproxy_require_exact_model` at launch, so a machine without the verified build fails before session selection, forking, or state persistence and never falls back to Opus 5.

Catalog presence is not route proof. CLIProxyAPI rewrites the upstream `User-Agent` and billing `cc_version` to its measured Claude Code fingerprint, and v7.3.12 pinned that fingerprint at 2.1.258. Anthropic rejects Opus 5.5 below 2.1.280 (`400 Claude Code 2.1.258 does not support this model`), so the first catalog-only build advertised the model yet failed every Opus 5.5 main and subagent request. A second patch moves the baseline identity to 2.1.280. The software tuple (`@anthropic-ai/sdk` 0.112.1, Node v26.3.0) and the billing-hash algorithm are unchanged, and the algorithm reproduces native 2.1.280 captures. Launchers also run `_cliproxy_require_opus55_identity`, which requires the running binary's SHA-256 to match an active receipt recording that identity.

OpenAI released GPT-6 Sol (`gpt-6-sol`) and GPT-6 Luna (`gpt-6-luna`) on 2026-09-22. On 2026-09-23 one minimal request per model through the local proxy confirmed that the exact model was served. `gpt-6-sol` replaces `gpt-5.6-sol` as the default Sol model on every Sol-main lane, Sol worker lock, and `sol-worker` definition. The guard still admits explicit `gpt-5.6-sol` as a legacy identity. Luna is exposed only as an explicit `luna-worker` for clerical and lighter bounded work (bulk reading, summarizing, formatting, simple edits). No lane defaults to it. Both models bill the weekly OpenAI/Codex pool and are routine, not premium. A session last run on `gpt-5.6-sol` and resumed on a Sol lane takes the full-history fork path, the same as a resume between Opus 5 and 5.5. The OpenRouter `sol-or-high` alias remains on 5.6 Sol until that route is verified separately.

The bashrc snippet (`profiles/bashrc-snippets/claude-code-helpers.sh`) wraps everything. House letter scheme: `y` skip-perms and `r` continue/resume. Some older pinned lanes retain explicit `u` ultracode-opening aliases; flexible cross-provider lanes intentionally do not auto-submit an orchestration opener.

| Launcher | Main model | Subagents | Notes |
|---|---|---|---|
| `cc` (+`y/ry`…) | native Claude, including explicit Opus 5.5 | selected native tier, including Opus 5.5, guard-locked | First-party route; Opus 5.5 requires Claude Code v2.1.280+ and uses its native 1M window without `[1m]`; no proxy preflight |
| `opus55x` (+`y/ry`) | Opus 5.5 | GPT-6 Sol, guard-locked | Proxy route; hard-gates Claude + Codex and exact `claude-opus-5-5` catalog support |
| `opus55xm` (+`y/ry`) | Opus 5.5 | Sol/Sonnet/GLM/Astra, no default or lock | Proxy route; model-neutral workers inherit Opus 5.5, direct Astra is approval-gated, exact catalog support is mandatory |
| `opus55o` / `opus55f` | Opus 5.5 | native Opus 5 / approval-gated Fable 5.1 lock | Native Anthropic; no proxy preflight |
| `opus55m` | Opus 5.5 | native Claude tiers, no default or lock | Model-neutral workers inherit Opus 5.5; Sol is unavailable |
| `claudex` (+`y/ry`) | GPT-6 Sol | GPT-6 Sol, guard-locked | Preflights Codex only |
| `claudexm` (+`y/ry`) | GPT-6 Sol | cross-provider, no default or lock | Hard-gates Codex; offers repair or degraded continuation when optional Claude workers are unavailable; session-scoped `sonnet-worker` selects Claude Sonnet 5 |
| `claudexma` (+`y/ry`) | GPT-6 Sol | direct Sol/Astra, no default or lock | OpenAI/Codex-only; model-neutral workers inherit Sol, direct Astra requires `approve-agent`, and declared Astra model-budget Workflows are one-run approvable; preflights Codex only |
| `astrax` (+`y/ry`) | GPT-6 Astra | GPT-6 Sol, guard-locked | OpenAI-only premium lane; both use the weekly Codex pool; preflights Codex only |
| `astraxm` (+`y/ry`) | GPT-6 Astra | direct Sol/Sonnet/Opus/Fable, no default or lock | Fable and model-neutral Astra direct workers require `approve-agent`; a Workflow declaring an approved model-budget envelope is one-run approvable; hard-gates Codex and offers repair or degraded continuation for optional Claude workers |
| `fablex` (+`y/ry`) | Fable 5.1 | GPT-6 Sol, guard-locked | Active exact `claude-fable-5-1` route; preflights Claude + Codex |
| `fablexm` (+`y/ry`) | Fable 5.1 | direct Sol/Sonnet/Astra, no default or lock | Astra and model-neutral Fable direct workers require `approve-agent`; a Workflow declaring an approved model-budget envelope is one-run approvable; hard-gates Claude and offers repair or degraded continuation for optional Sol/Astra workers |
| `opusx` (+`y/ry`) | Opus 5 | GPT-6 Sol, guard-locked | Preflights Claude + Codex |
| `opusxm` (+`y/ry`) | Opus 5 `[1m]` | explicit cross-provider; no default or lock | Normal `x`/Portagenty lane; hard-gates Claude and offers repair or degraded continuation when optional `sol-worker` is unavailable |
| `claudexo` (+`y/ry`) | GPT-6 Sol | Opus 5, guard-locked | Preflights Codex + Claude; cost-inverted fan-out |
| `fableo` / `fablef` | Fable 5.1 (`claude-fable-5-1`) | native Opus/Fable 5.1 lock | Native Anthropic; no proxy preflight |
| `fablem` / `ccrym` | Fable 5.1 / native Claude | native Claude tiers, no default or lock | Per-delegation choice on Anthropic only; Sol is unavailable |
| `glmxm` (+`y/ry`) | GLM 5.3 Flash (`glm-flash`) | cross-provider, no default or lock | Metered OpenRouter lane; main and model-neutral workers spend prepaid OpenRouter credit; session-scoped `glm-worker`/`sonnet-worker`/`sol-worker`/`opus-worker`; **hard**-gates on the OpenRouter provider, only **reports** Codex/Claude health |

The interactive `x` picker puts `opusxm` first for new directories. Saved launcher choices use a versioned `routing=cross-provider-v1` record: one-time migration maps native/Opus/Fable choices to `opusxm`, maps Sol-main choices to `claudexm`, preserves permission mode, and writes a private `.pre-cross-provider.bak` before the atomic update. A native lane selected after rollout is already versioned and remains an intentional persistent choice. `cc-handoff` also falls back to `opusxm` when no saved state exists.

Portagenty and other process supervisors cannot invoke a non-exported Bash function directly. The installed `claude-cross-provider` executable enters the normal interactive Bash environment, verifies that `opusxm` resolves, and forwards the original argv to that canonical function. This keeps provider preflight, containment, quota riders, and model policy in one implementation rather than cloning them into workspace files.

Since Claude Code v2.1.251, subagent model precedence is: per-invocation model, agent-definition frontmatter (including built-in `Explore`/`Plan` inheritance), `CLAUDE_CODE_SUBAGENT_MODEL`, then the main model. Pinned launchers therefore require Claude Code v2.1.257+ and use three aligned controls: `CLAUDE_CODE_SUBAGENT_MODEL` names the worker route, `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` makes that route outrank agent definitions, and `AGENT_GUARD_SUBAGENT_MODEL_LOCK` independently enforces the same declared route at tool admission. The guard refuses every Agent or Workflow when a lock exists without the force marker; flexible launchers clear all three controls so explicit peer workers remain selectable. A flexible lane can still pin individual routine agent definitions: `claudexma` supplies session-scoped same-name `Explore` and `Plan` overrides with exact Sol models, rather than globally forcing every worker and making Astra unreachable. On a locked lane, the outer guard blocks conflicting direct Agent models and admits registered workflows only when their manifest policy is `inherit-launcher`. An unregistered task-specific script can still be approved once, but only if it declares a single literal agent bound and a literal `subagentModelPolicy: 'inherit-launcher'` attestation with no worker-model selection or nested `workflow()` call; opaque shapes (named, inline, resumed) remain unapprovable at any count. The registered bounded-parallel and deep-research workflows are therefore model-neutral and inherit the selected lane. Flexible Astra/Fable launchers additionally set `AGENT_GUARD_INHERITED_SUBAGENT_MODEL`, allowing the guard to identify model-neutral direct workers that would inherit the premium main. Direct workers resolving to `gpt-6-astra` or `claude-fable-5-1` require an exact standalone `approve-agent <nonce>` grant bound to the session and full Agent payload; the grant is atomically consumed once and expires after ten minutes.

Flexible means something different by endpoint. `fablem`, `opus55m`, and `ccrym` are native-Anthropic flexible lanes: they unset both the default and lock, so workers can choose among Claude tiers but cannot reach Sol. Exact Opus 5.5 pinning is also available through the `ccx` `opus55` worker tier, `ccm opus55`, `ccyo55`, and `ccryo55`; each fails closed below Claude Code v2.1.280. `opus55xm` is the proxy-backed Opus 5.5 counterpart: model-neutral workers inherit Opus 5.5, while session-scoped Sol, Sonnet, GLM, and approval-gated Astra workers provide the cross-provider choices. It requires an exact runtime catalog match before state or session handling. `opusxm` routes the entire session through CLIProxyAPI and also unsets both variables. Model-neutral workers inherit Opus; the launcher adds a session-scoped `sol-worker` definition whose full model ID is `gpt-6-sol` (plus `luna-worker` on `gpt-6-luna`), making the foreign route explicitly selectable without an environment default. `claudexm` has Sol as the main model with the same unlocked policy: unspecified workers may inherit Sol, while a session-scoped `sonnet-worker` explicitly selects `claude-sonnet-5`. `claudexma` is the Codex-only counterpart: session-scoped same-name `Explore` and `Plan` definitions keep automatic repository search and planning on Sol, other model-neutral workers inherit Sol, `sol-worker` selects it explicitly, and `astra-worker` exposes GPT-6 Astra behind the existing one-use `approve-agent` gate; it never preflights or falls back to Claude or OpenRouter. `astraxm` supplies direct `sol-worker`, `sonnet-worker`, `opus-worker`, and approval-gated `fable-worker` definitions; `fablexm` supplies direct Sol/Sonnet and approval-gated `astra-worker`. The premium peer workers remain top-level direct Agent operations by default. A Workflow on the flexible premium-main lanes, or a `claudexma` Workflow that declares an Astra ceiling, is one-run approvable when it declares an approved model-budget workflow — a single literal hard total agent cap plus exact per-model ceilings labeling Astra and/or Fable, with every worker (routine and premium) routed through one shared reserving dispatcher; that approval covers only the exact script, its initial arguments, and the full declared envelope, and undeclared model-neutral inheritance of a premium main into a Workflow still fails closed. Use `astrax` or `fablex` when a premium-main Workflow should inherit guard-locked Sol, and `claudex` when the Sol main needs Sol-locked Workflow execution without an Astra budget. `--agents` definitions are additive to built-in, project, user, managed, and plugin agents. Every flexible mixed-provider `*xm` lane also carries a session-scoped `glm-worker` selecting `glm-flash`; the OpenAI/Codex-only `claudexma` lane deliberately omits it — see the OpenRouter lane below.

Native Fable launchers and the generic `ccx` native branch explicitly unset inherited `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` before invoking `claude-contained`. A native launch therefore returns to first-party Anthropic authentication even when its parent shell was started through CLIProxyAPI; a deliberately configured direct `ANTHROPIC_API_KEY` remains available.

For an exact UUID, `ccx` reads the latest real top-level assistant model from pconv's JSONL source, ignoring worker sidechains and internal markers such as `<synthetic>`. A compatible session resumes directly. A model mismatch uses Claude Code's supported `--fork-session -r <uuid>` path: the target launcher model gets a new UUID with full retained history, while the source transcript remains byte-for-byte untouched. Receipt generation now considers both the nested launch return code and whether pconv can identify a new UUID: a preflight cancellation with no UUID reports that no new session was created instead of claiming the fork completed; an identified UUID still receives a receipt. If the installed Claude Code lacks `--fork-session`, or the recorded model cannot be established safely, `ccx` aborts before launch and asks for `handoff` or `fresh` instead of guessing. The bounded pconv handoff remains an explicit recovery choice for oversized or damaged conversations; it is no longer the normal model-migration path.

Before a plain exact-UUID resume, `ccx` checks whether Claude Code already has that conversation open. A background session can be stopped and resumed under the selected launcher, forked, attached as-is, or left untouched; attaching retains the background process's limited worker set because daemon restarts do not preserve launcher-supplied worker definitions. An interactive session is never stopped: `ccx` offers only a full-history fork or cancellation.

### OpenRouter lane (metered)

`glm-flash` is a **third provider on the same proxy**: an `openai-compatibility` block pointing at OpenRouter, mapping the upstream `z-ai/glm-5.3-flash` to the client-visible alias `glm-flash`. The alias is the only name the harness ever sends — it appears in `--model`, in agent definitions, and in the guard's model enum; the upstream name appears nowhere outside the provider manifest.

Key setup, state table, and the smoke test live in [`profiles/cliproxy-openrouter/README.md`](../../profiles/cliproxy-openrouter/README.md): create the key with a credit limit and `limit_reset` never, run `openrouter-set-key`, then `cliproxy-restart`. **The cap is OpenRouter's per-key credit limit, and nothing local enforces it.** That makes it a fourth meter alongside the weekly Codex pool, the Anthropic 5h pool, and the premium Anthropic 5h pool — labelled `prepaid OpenRouter credit` in the guard's pools, the policy, and every approval card. It is not premium and never approval-gated: `glm-worker` is a routine worker on the flexible mixed-provider lanes. It is intentionally absent from the OpenAI/Codex-only `claudexma` lane. OpenRouter credit also never refills: when the key's credit is spent the route stops rather than degrading, and no reset helper can revive it (`cliproxy-reset-quota` addresses OAuth credentials by auth index and does not apply).

**`glmxm` preflights asymmetrically, and that asymmetry is the point.** Every other proxy lane blocks on the OAuth providers it needs. This one is the lane you reach for *because* a subscription pool is exhausted, so blocking on an exhausted pool would refuse exactly the situation it exists to serve. Order is: proxy up → OpenRouter hard gate → soft OAuth report → launch.

The **hard** half is the OpenRouter provider, because the main model rides on it. There is no login to offer, so the check is structural, through the proxy's Management API (`GET /v0/management/openai-compatibility`, per [the management API docs](https://help.router-for.me/management/api)) — provider present, enabled, holding a non-empty key, and mapping the alias the lane needs. It never reads `config.yaml`, which stores the raw key. A failure prints one actionable line and aborts:

```text
glmxm: openrouter provider not configured — run: openrouter-set-key
```

`cliproxy-auth-check.py` gives this its own state (`provider-unconfigured`, exit 15) precisely so a caller cannot offer `cliproxy-<provider>-login` for something that has no such command. A build predating that management route reports `unknown` instead, because "cannot tell" is not "not configured".

The **soft** half is Codex and Claude. An unhealthy OAuth provider there disables only the session-scoped workers that route to it, so `_cliproxy_warn_providers` names each one once and continues — no prompt, no login offer, no quota reset, no "launch anyway" question:

```text
glmxm: Codex provider is quota-unavailable — sol-worker will fail if selected
glmxm: Claude provider is login-required — sonnet-worker/opus-worker will fail if selected
```

The session still starts, on prepaid OpenRouter credit, with those workers simply not worth selecting. No other lane uses the soft report.

Official CLIProxyAPI `v7.2.151` advertises exact `claude-fable-5-1` and `gpt-6-astra`, but neither it nor upstream v7.3.12 advertised `claude-opus-5-5` when checked on 2026-09-22. The pinned `profiles/cliproxy-opus55/` build supplies that one missing catalog entry while preserving remote refresh and deferring to upstream once upstream owns it. `opus55x` and `opus55xm` still verify the running catalog on every launch, so policy support cannot create a dead route on an unpatched machine. No active launcher silently downgrades Fable 5.1 to Fable 5, Opus 5.5 to Opus 5, or Astra to another GPT model. `fablex`, `opus55x`, `astrax`, and `claudex` run model-neutral Workflows on guard-locked Sol without extra approval. `fablexm`, `opus55xm`, and `astraxm` are flexible cross-provider steering lanes, while `claudexma` keeps Sol as main and exposes Astra explicitly; each can run a Workflow declaring the applicable model-budget envelope alongside the existing per-worker `approve-agent` path.

The active native and proxy Fable-main lanes compose one shared Fable-orchestrator rider with their lane-specific quota/default/lock facts. The shared rider activates delegate-first execution, task-shape model selection, atomic exceptions, and leaf workers; each lane fragment determines which provider and meter every worker spends. Direct Fable-model workers require separately bounded scope, an explanation of why Sol/Sonnet/Opus is insufficient, quota disclosure, and deterministic one-use approval. A generic `ccx` launch that selects Fable 5.1 is covered by the always-loaded global actual-model rule rather than shell-name detection.

### Move current chats without another summary handoff

Provider environment variables and session-scoped `--agents` definitions are process-startup state, so an already-running Claude Code process must be exited and relaunched. The conversation itself does not need another bounded summary:

```bash
source ~/.bashrc
ccx-migrate-cross-provider-state --dry-run
ccx-migrate-cross-provider-state --apply
```

Then, for each chat, exit the running process, run `x` in the same project, choose `last` (or `opusxm`/`claudexm` explicitly), and choose `latest`. A compatible exact-UUID chat resumes directly; an incompatible main model gets the full-history fork described above. The original remains available, and `~/.claude/fork-receipts/` records the source-to-fork UUID when pconv can identify it after exit. Use `ccx-migrate-cross-provider-state --rollback` only while the migrated state still matches the untouched post-migration value.

This avoids handoff truncation, but it cannot make model/provider switching free: the first substantive request may need to reprocess or recache retained history. There is no zero-token way to change the process-level route while preserving an already-warm model cache.

The proxy launchers bake in `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1` so `/effort` drives Sol's reasoning level where applicable.

### Which launcher when — the quota-lane decision table

The two subscriptions refill on very different clocks (Claude ≈ 5 h session window; Codex = weekly pool). Pick the launcher by **which pool you can afford to spend**:

| Situation | Use | Bills against |
|---|---|---|
| Normal mixed-provider work (default) | `x` → `opusxm`, or `claude-cross-provider` from Portagenty | Main and ordinary workers use Anthropic; named `sol-worker` uses weekly Codex |
| **Codex pool exhausted** | continue `opusxm`/`fablexm` without Sol/Astra workers, or choose an explicit native Claude lane | Claude only |
| **Claude session exhausted** | `claudexy` / `claudexryu` | Codex only |
| Sol main with flexible Sol/Astra workers and no Claude dependency | `claudexmay` / `claudexmary` | Sol and approval-gated Astra use weekly Codex; Codex-only preflight |
| OpenAI-only Astra orchestration with Sol workers | `astraxy` / `astraxry` | Astra and Sol both use weekly Codex; no Claude preflight |
| Astra main with explicit direct Sol/Sonnet/Opus/Fable choice | `astraxmy` / `astraxmry` | Astra/Sol use weekly Codex; Claude workers use Anthropic; Fable requires `approve-agent` |
| Fable 5.1 orchestration with pinned Sol workers and Workflow support | `fablexy` / `fablexry` | Fable main uses Anthropic; Sol workers use weekly Codex |
| Fable 5.1 main with explicit direct Sol/Sonnet/Astra choice | `fablexmy` / `fablexmry` | Fable/Sonnet use Anthropic; Sol/Astra use weekly Codex; Astra requires `approve-agent` |
| Opus 5 main with explicit Claude/Sol worker choice | `opusxmy` / `opusxmry` | Main and ordinary workers use Anthropic; named `sol-worker` uses weekly Codex |
| Sol main with per-worker Claude/Sol choice | `claudexmy` / `claudexmry` | Main and unspecified workers use weekly Codex; explicit Claude workers use Anthropic |
| **Both subscription pools exhausted**, or cheap bulk work | `glmxmy` / `glmxmry` | Main and model-neutral workers use prepaid OpenRouter credit; explicit `sol-worker` uses weekly Codex; explicit Sonnet/Opus workers use Anthropic. Launches even when Codex/Claude are quota-blocked or logged out — it only reports them |
| One optional worker pool unavailable | use the flexible mixed lane's explicit degraded continuation; avoid the named unavailable workers | Main model's healthy provider only |
| Manual native-Claude model control | `ccrym` / `fablem` | Claude only; Sol is not reachable |

Corollaries worth internalizing:

- Native lanes never touch OpenAI. `claudex` is pure Sol, `claudexma` is flexible Sol/Astra, and `astrax` is Astra + Sol; all three preflight Codex only. Pinned cross-provider lanes such as `fablex`, `opusx`, and `claudexo` keep hard provider requirements because their locked worker contract cannot be degraded safely.
- Flexible mixed lanes hard-gate only their main route: `claudexm`/`astraxm` require Codex and can continue without Claude-backed workers; `fablexm`/`opusxm`/`opus55xm` require Claude and can continue without Codex-backed workers. Opus 5.5 additionally requires the exact runtime catalog entry. Use `claudexma` when the worker surface must remain OpenAI/Codex-only rather than merely degraded.
- Flexible cross-provider lanes pair per-worker steering with one-run Workflow approval where premium peers are declared: use `astraxm`, `fablexm`, or `opus55xm` for direct worker selection or a declared model-budget Workflow envelope, and use `astrax`, `fablex`, or `opus55x` when a model-neutral Workflow should run on guard-locked Sol workers instead.
- Recovery is explicit and bounded. Add a different account only when every enabled account is quota-blocked; ordinary login repairs authentication, not quota; cooldown reset is valid only after upstream quota recovered; degraded continuation appends a worker warning. On a runtime 429, authentication, cooling-down, routing, or unexpected-model failure, stop rather than retry-loop.
- Check the meters: `/context` + Claude's own usage UI for the Anthropic side; `claudex-usage` (proxy request counts) + the provider's usage page for the Codex side.

**Verifying the routing:** `tail -f /tmp/cliproxy.log` — each request logs its `"model"` and status; eight `"model":"gpt-6-sol"` → 200 lines means the Sol lane is live.

## The context-window wedge (will bite you; read this)

Claude Code's **auto-compact math is calibrated for Anthropic windows** (Fable 5.1 = a native 1M-token window with no `[1m]` suffix). Foreign model ids fall back to a 200k metadata assumption, and gateways don't advertise real context size — so the harness's belief and the route's actual limit diverge in both directions. Unmanaged, a long Sol session sails past the true limit until the upstream rejects the request:

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

- **Managed compaction now standing (2026-07-20):** the `claudex` launcher loads `profiles/claude-global/sol-settings.json` — a 300k managed window (`CLAUDE_CODE_MAX_CONTEXT_TOKENS` + `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, both required: the harness clamps `autoCompactWindow` to its 200k unknown-model fallback without the former). Auto-compact fires ~267k, ~100k below the measured ~345–372k upstream failure region.
- `/context` early and often — the gauge works regardless of model, and confirms the profile loaded (should read `x/300k`, not `x/200k`).
- **Fable 5.1 = long-haul context tank; Sol = sprint sessions.** Fresh `claudexyu` per big fan-out; big synthesis stays on the native 1M lane. Don't run mega-workflows in an already-long Sol session.

## Authoring a model-budget Workflow (concrete, partial example)

A Workflow declaring an **approved model-budget workflow** is one-run approvable on a flexible premium-main lane (`astraxm`, `fablexm`) instead of being denied outright. The canonical, hash-attested dispatch block lives at `profiles/claude-global/workflows/model-budget-dispatch.js` and is installed to `~/.claude/workflows/model-budget-dispatch.js`. Authors do not reinvent this contract — they **copy the whole fragment verbatim** into their task-specific dynamic `scriptPath`, placed immediately after two outside declarations:

```js
const HARD_CAP = 8                                          // single literal total; the guard reserves ALL of it, once
const MODEL_BUDGET = { 'claude-sonnet-5': 4, 'gpt-6-astra': 1 }   // exact model IDs only, no aliases

// ==== BEGIN agent-guard canonical model-budget dispatch v1 - DO NOT EDIT ====
// … paste profiles/claude-global/workflows/model-budget-dispatch.js verbatim here …
// ==== END agent-guard canonical model-budget dispatch v1 ====

export const meta = {
  name: 'review-astra',            // kebab-case; must include 'astra' and/or
  description: '...',              //   'fable' tokens when those models are declared
}

phase('Audit')
const found = await dispatch('claude-sonnet-5', 'Audit X ...', { label: 'audit' })
if (found && found.needsDeepPass) {
  await dispatch('gpt-6-astra', 'Resolve the contradiction ...', { label: 'deep', phase: 'Escalate' })
}
```

**This snippet is NOT executable as shown** — the fenced-off middle section is a placeholder marker, not real code; a working script requires the real fragment pasted in verbatim (byte-for-byte, from the canonical file) between those markers. Never invent a fake safety-looking placeholder body and paste that into an executable workflow — an unmodified copy of the real fragment is what the guard's admission check hashes against, so a paraphrase or stub fails closed rather than silently running unguarded.

Every worker call, routine or premium, goes through `await dispatch(exactModelId, prompt, opts)`:

- `exactModelId` is one of the nine supported IDs: `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`, `gpt-5.6-sol` (legacy), `claude-fable-5-1`, `claude-opus-5-5`, `claude-opus-5`, `claude-sonnet-5`, `glm-flash`. Native (non-proxy) routes support the four Claude IDs; `gpt-*` and `glm-flash` are proxy-only and a native-route budget declaring one is denied. The local proxy route supports all nine after the verified Opus 5.5 catalog override is installed. Launcher runtime preflight remains the machine-level proof; policy admission alone does not claim an arbitrary proxy binary has that entry. Proxy budgets require the session to be routed through the configured allowed origin — currently `http://127.0.0.1:8317`, normalized and checked as an exact match, not "any loopback/localhost server." A pinned/locked lane rejects this explicit model-budget form entirely.
- `opts` accepts only `effort`, `label`, `phase`, `schema`, `isolation`, `agentType` — there is no `model` override key in `opts`; the model is fixed by the first argument. The **actual Workflow worker API** takes `agent(prompt, { model, effort, label, phase, schema, isolation, agentType })` — note it is `opts.model`, not the interactive tool's `subagent_type` field.
- There are no direct `agent()` calls anywhere else in the script — the guard's admission check rejects a raw `agent()` reference found outside the pasted block.

Budget semantics: **one shared total counter plus one shared per-model counter map for the whole run**, fixed concurrency of 4, a stop latch with no retry and no fallback model on any failure or null result. Per-model ceilings may overlap and may each equal `HARD_CAP` — they are not additional agents stacked on top of the total; the shared total always wins even when every per-model ceiling is individually satisfiable. All internal workers are covered by the single `approve-workflow` grant issued for that run; there is no separate per-worker `approve-agent` step inside an approved model-budget script.

The approval itself is bound to the exact script content, its initial invocation arguments, and the declared `HARD_CAP`/`MODEL_BUDGET`/route — not to a predetermined sequence of calls. Dynamic branching, conditional escalation, and early exits taken *inside* that envelope need no further approval; changing the source, the initial arguments, or the declared ceilings does. See `profiles/claude-global/CLAUDE.md` rule 7 for the exact approval-card and re-grant contract, and `model-budget-dispatch.js`'s own header comment for the authoritative field-by-field description this section summarizes.

No live Workflow call, delegated agent, or model inference was run to write this section — treat the snippet above as illustrative wiring, not a tested transcript.

**Source-only standing-allowance prototype.** [`premium-window-prototype.md`](../../profiles/claude-global/premium-window-prototype.md) is **SOURCE-ONLY / INACTIVE**. It documents a disabled design for authorizing a bounded set of future premium calls; it is not installed or available as a live command, and the exact-payload approvals above remain the active policy.

## The quota asymmetry (the expensive lesson)

Claude subscription quota refills on a ~5-hour window; **Codex draws from a weekly pool with no short-cycle refill**. That changes the blast radius of mistakes: a runaway fan-out on the Anthropic side costs you the afternoon — the same fan-out through the Codex lane eats *the week*. Field receipt (2026-07-16): a Fable-orchestrator session with a standing multi-agent opt-in spawned ~800 Sol research subagents in two hours — 50% of the Codex weekly quota plus a full Claude session, in one sitting.

Mitigations now standing in this stack:

- **`agent-guard` admission hook (global)** — atomically reserves visible Agent calls and approved Workflow maxima before launch: `CLAUDE_AGENT_CAP` defaults to 15 per genuine user prompt and `CLAUDE_AGENT_SESSION_CAP` to 80 per rolling 5h session. It fires under `--dangerously-skip-permissions`. Because Workflow-internal `agent()` calls do not pass through a blocking outer hook, only exact hash-registered `scriptPath` workflows whose code self-enforces the same maximum are admitted normally. Pinned launchers add a guard-owned model lock, so their registered workflows must also be attested as `inherit-launcher`; conflicting Agent models and opaque workflows fail before launch. On a flexible lane, an approvable block prints an exact `approve-workflow` command that the human must send as a new standalone message—never through `AskUserQuestion`. Numeric overrides are human-set launch environment only—there is no in-session `agent-cap-off`.
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
