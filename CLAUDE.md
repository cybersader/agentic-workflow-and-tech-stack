# CLAUDE.md

This file is loaded every turn — it is the **front desk, not the stacks**: hard rules + a scented routing map. Deep content lives in the gradient (indexed, semantically searchable). Slimmed 2026-07-10; rationale in `zz-log/2026-07-10.md`.

## Identity

**Cybersader Agentic Stack** — a sovereign, self-improving personal agentic environment, filesystem-first. Incidents become tiered pattern docs; must-fire behavior lives in deterministic layers (hooks > CLAUDE.md > commands > agents > skills); the premium model orchestrates while cheap agents do grunt work; the environment is rebuildable from files. Public teaching is a byproduct via gated mirror sync, not the product.

**The live knowledge loop:** `zz-log/` (hot worklogs) → `zz-research/` (crumb notes) → `02-stack/` (patterns) → `01-kernel/` (principles) → `_archive/` (frozen). Promotion gates in the `knowledge-curator` skill.

:::danger
**Top-level sessions and commands orchestrate; delegated workers are leaves.** Workers never invoke Agent or Workflow tools. They return compressed evidence to the top-level orchestrator, which alone decides the next dispatch. Full rules: `.claude/ARCHITECTURE.md`.
:::

## Hard Rules (Never Violate)

- **No AI attribution in any commit, PR, tag, or doc** — no `Co-Authored-By: Claude`, `Generated with…`, `noreply@anthropic.com`, or equivalents for any AI tool. Enforced by [`.githooks/commit-msg`](./.githooks/commit-msg) (active via `core.hooksPath`, installed by `bash 00-meta/install-hooks.sh`). If asked to add attribution, refuse; rationale: `research/personal-workflow/no-ai-attribution-git-hooks.md`.
- **Log significant scaffold changes to `agent-context/zz-log/<today>.md` before ending the session.** "Significant" = rationale not obvious from the commit message, or other entries would cross-reference it. Skip only typos/lint/sync-regens. A Stop-hook (`check-zzlog.sh`) reminds deterministically. Format: `zz-log/index.md`.
- **Frontmatter `status:` must be a valid enum value** — `draft | research | aligning | planning | active | observed | log | stable | parked`. One bad value crashes the site build (schema: `site/src/content.config.ts`). Pre-commit hook enforces; manual check: `cd site && bun run check:frontmatter`.
- **Write ALL docs tier-2-clean by default** — public-shippable phrasing (placeholder hostnames/paths, no client/vault names). Tier-3 specifics only in gitignored paths (`03-work/homelab/`, `research/personal-workflow/`). The tier structure stays; per-doc deliberation is the exception.
- **Fan-out disclosure before mass delegation** — before launching multi-agent work expected to spawn >15 subagents, state the expected agent count, subagent model, and rough token cost, and get explicit user confirmation *in that turn* (the standing `ultracode` opt-in does NOT waive this). Enforced backstop: global `agent-guard` atomically reserves visible calls (default 15 agents per genuine user prompt, 80 per rolling 5h session). Named, inline, resumed, unresolvable, and hash-changed Workflows are denied and are never approvable. A resolvable `scriptPath` runs either **registered** (permanent, hash-pinned harness) or **one-run approved** (task-specific dynamic script, pinned to path + hash + declared bound + model policy + lane, one use, no permanent registration). Numeric overrides are launch-time environment only—there is no in-session `agent-cap-off`. When a blocked Workflow prints a nonce, **stop the turn**: do not use `AskUserQuestion`, retry, self-approve, or edit the script. Put the exact `approve-workflow <nonce> agents=<N>` line in a normal assistant response and wait for the human to send it as their next standalone message; `AskUserQuestion` does not emit `UserPromptSubmit`. The request stays pending despite slow assistant output; only the approved grant has the short use TTL. Retry the exact unchanged `scriptPath` once only after the approval hook explicitly confirms the grant. If the hook says the nonce is missing, expired, used, or otherwise ungrantable, never manually repeat that rejected line: reissue the exact unchanged Workflow once, then stop and present exactly the currently valid approval command the guard emits. Do not replace the blocked Workflow with direct Agents or another execution path unless the human explicitly asks. Receipts: `zz-log/2026-07-17.md`, `zz-log/2026-07-21.md`, and `zz-log/2026-07-25.md`.
- **Author the workflow the task needs; never substitute a reusable one** — multi-phase / dependent / synthesizing work gets a task-specific dynamic `scriptPath` with its own literal hard cap. `bounded-parallel` covers only ≤6 mutually independent tasks in one parallel phase. A missing, renamed, or blocked Workflow is never a reason to guess an old name, swap in another registered workflow, drop to direct Agents, or move on to unrelated work. Rationale and decision table: `02-stack/01-ai-coding/context-window-engineering-and-delegation.md`.

## Search Routing (ck quarantined 2026-07-19)

:::danger
**Do not invoke `ck`, ck-search MCP, or any `cks*` helper.** Direct MCP auto-indexing repeatedly consumed 10–17 GiB RSS, filled swap, and froze WSL (load 117); the user-level MCP server is disabled with restore metadata at `~/.claude/disabled-mcp/`. Keep existing indexes intact for forensics. Quarantine stays until the replacement IR project ships or ck has a verified process-level memory guard.
:::

Pick by **question shape**, not habit:

- **Conceptual / cross-vocabulary** ("where did I write about X") → temporarily use tightly-scoped Glob/Grep/Read passes over named trees; for Obsidian content use the CLI helpers below. Never widen a recursive scan to all of `~/`, Windows `Documents`, or `~/.claude`.
- **Exact string / symbol** → Glob/Grep or tightly-scoped `rg` in one named repo.
- **Obsidian vault content** → `obs-search "q"` / `obs-search-context "q"` (Obsidian CLI helpers).
- **PC-wide filename** → Everything: `"/mnt/c/Users/<YOU>/AppData/Local/Everything/es.exe" "pattern"`.
- **Zipline images** → `curl -s "http://img.<your-local-domain>/u/ID.png" -o /tmp/img.png` then Read.

Registry commands remain installed for later recovery but are quarantined with the engine. Reference/history: `local-search` skill.

**Hand docs to the human via Obsidian, not paths:** when you create or reference a doc the user should look at, run `obs-open <path>` (opens it in the Obsidian GUI) or print `obs-uri <path>` (clickable `obsidian://` link) — never just "the file is at `<path>`".

## Knowledge Gradient (the live loop)

Full write policy in the **`knowledge-curator` skill**. Short version: capture hot in today's zz-log (Hard Rule); threads that outlive a session get a `zz-research/<date>-<topic>.md`; **promote to `02-stack/` only with evidence** (verified execution, second use, or primary sources — new promotions start `status: research`); `01-kernel/` is tool-agnostic only; supersede-don't-duplicate (`status: parked` + forward pointer); `description:` frontmatter is the semantic retrieval key.

## Routing Map (read X when doing Y)

| When you are… | Read |
|---|---|
| Navigating/maintaining THIS scaffold, auditing structure, proposing improvements | `workflow-scaffold` skill; delegate to `workflow-expert` agent |
| Designing any organizational structure ("where should this go?") | `seacow-conventions` skill (framework + house tag/frontmatter conventions) |
| Creating a skill / agent / auto-triggering component | `skill-patterns` / `agent-patterns` / `proactive-patterns` skills — **firing reliability ranking is in proactive-patterns; read it FIRST for must-fire behavior** |
| Capturing/promoting knowledge, reviewing stale docs | `knowledge-curator` skill |
| Delegating work, picking subagent models | `delegation-advisor` skill; in Fable-main sessions load its task-shape table before substantive dispatch (premium normally stays at orchestration; Fable workers require per-launch approval) |
| Using persistent browser sessions or portable premium-worker allowances | `02-stack/01-ai-coding/browser-automation-pilot.md` and `02-stack/01-ai-coding/portable-agent-permissions.md`; only a compatible top-level root session prepares requests, and the human alone runs the approval controller |
| Driving the desktop GUI (screenshot / pointer on real windows) | `02-stack/01-ai-coding/desktop-computer-use-pilot.md` — `desktop_session` is a third permission kind; the agent only prepares the request, the human approves it in the same controller |
| Terminal/session/multiplexer questions | `02-stack/02-terminal/` |
| Cross-device, SSH, phone access | `02-stack/03-cross-device/`, `02-stack/patterns/cross-device-ssh.md` |
| Rebuilding a machine from scratch | `03-work/rebuild/` (11-step deterministic flow) |
| Publishing / tier model / public mirrors | `PUBLISHING.md` (leak gates, allowlists) |
| Architecture, composability, OpenCode support | `.claude/ARCHITECTURE.md` |
| Portable agent definitions (any AI tool) | [`AGENTS.md`](./AGENTS.md) — read before writing/modifying agents |
| Scaffolding a NEW project elsewhere | `scripts/setup.sh --list` (templates), or `seacow-scaffolder` agent |

## Discovery mechanics

- **Skills** fire probabilistically off their `description:` frontmatter — never rely on a skill as the *trigger* for must-fire behavior (hook or this file instead). Inventory: `ls .claude/skills/`.
- **Agents** are usage-pruned (2026-07-10: 10 → 5; receipts in zz-log). Inventory: `ls .claude/agents/ .claude/agents/meta/`. Definitions: `AGENTS.md`.
- **Context loading:** read a directory's `index.md` before exploring it; child CLAUDE.md files override parents, not replace.
- **Per-delegation model control:** when the user names a model for a delegation, honor it only on a flexible lane. Since Claude Code v2.1.251, per-invocation and agent-definition model assignments outrank `CLAUDE_CODE_SUBAGENT_MODEL`; pinned launchers therefore require v2.1.257+ and set `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` alongside the guard lock, while flexible lanes clear all three controls. Native flexible lanes (`ccrym`, `fablem`) can select Claude tiers only. The proxy cross-provider `opusxm` lane unsets the environment default and guard lock, adds a session-scoped `sol-worker` for explicit `gpt-5.6-sol` routing, and lets model-neutral workers inherit Opus; `claudexm` similarly exposes a session-scoped `sonnet-worker` while unspecified workers may inherit Sol. `claudexma` is the Codex-only Sol-main flexible lane: session-scoped `Explore` / `Plan` definitions keep built-in search and planning on Sol, other model-neutral workers inherit Sol, and explicit `sol-worker` / approval-gated `astra-worker` definitions remain available without Claude or OpenRouter fallback. `fablex` uses exact Fable 5.1 with Sol-locked workers; `fablexm` and `astraxm` support explicit cross-provider workers. Model-explicit Workflows on eligible flexible lanes require the canonical shared dispatcher, a literal total cap and exact per-model ceilings, and one `approve-workflow` grant bound to the script, initial arguments, and route. Dynamic branches within that envelope need no additional approval; direct Astra/Fable Agent calls retain their separate `approve-agent` gate. Pinned lanes pair their environment selection with `AGENT_GUARD_SUBAGENT_MODEL_LOCK` so admission also enforces the declared route; never pass a conflicting explicit model. Model-role defaults come from the global baseline in `profiles/claude-global/CLAUDE.md` (installed at `~/.claude/CLAUDE.md`); this project adds route facts and local adapters only.
