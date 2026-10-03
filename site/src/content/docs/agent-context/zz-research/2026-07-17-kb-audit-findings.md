---
title: 2026-07-17 — KB coherence audit findings (claudex arc) — raw
description: Verified findings from the 28-agent KB coherence audit (workflow wf_1236a310-ee4) — staleness/contradictions vs the claudex/proxy/context-wedge developments. Raw JSON preserved from the ephemeral task output; application pending. Top items are CLAUDE.md delegation-bullet precision, AGENTS.md agent-spawning contradiction, delegation-advisor model-selection gap.
stratum: 5
status: research
date: 2026-07-17
tags:
  - research
  - audit
  - claudex
  - meta
---

## Raw per-agent results (journal reconstruction)

Scan agents returned candidate findings; verify agents returned {real, reason, revisedFix} verdicts in matching order per cluster. Confirmed = verdict.real true.

```json
[
 {
  "label": "a455439988dd7e35c",
  "result": {
   "findings": [
    {
     "file": "<repo>/profiles/bashrc-snippets/claude-code-helpers.sh",
     "line": 150,
     "issue": "The claudex setup comment says, `One-time: claudex-login`, implying Codex OAuth alone is sufficient. The proxy now requires both Codex and Anthropic logins; following this comment can leave the reader with `502 unknown provider for model X`.",
     "fix": "Replace line 150 with: `# One-time: run claudex-login AND cli-proxy-api -config ~/.cli-proxy-api/config.yaml -claude-login; missing either login can cause \"502 unknown provider for model X\".`",
     "severity": "high"
    },
    {
     "file": "<repo>/profiles/bashrc-snippets/claude-code-helpers.sh",
     "line": 148,
     "issue": "The claudex header has no warning that Claude Code's Anthropic-window auto-compact assumptions can let a GPT-5.6-Sol session exceed Sol's actual context limit. At that point both normal requests and `/compact` fail with `400 input exceeds context window`, so a reader may continue a long Sol session without the required early-compaction discipline or knowing the recovery path.",
     "fix": "Insert after the login/setup comments: `# Sol context warning: use /context early and /compact around half-window; auto-compact may fire too late. If the session wedges with a 400 context-window error, resume it on native Fable/Opus, compact there, then hand it back to claudex; otherwise salvage only the pconv tail into a fresh session.`",
     "severity": "high"
    },
    {
     "file": "<repo>/profiles/bashrc-snippets/claude-code-helpers.sh",
     "line": 182,
     "issue": "The ccrym comment says, `In proxy sessions ... gpt-5.6-sol is a valid delegation target too`, but the alias launches plain `claude` after only unsetting the model floor; it neither starts CLIProxyAPI nor sets the proxy URL/token. A reader could reasonably expect `ccrym` itself to make Sol reachable, when Sol is unavailable unless proxy routing is already present.",
     "fix": "Replace lines 182-183 with: `# ccrym is floorless but does NOT configure or start the proxy. gpt-5.6-sol is reachable only when the session already has CLIProxyAPI routing; plain ccrym supports native-provider models only.`",
     "severity": "medium"
    }
   ]
  }
 },
 {
  "label": "ac1d95fba2e40060f",
  "result": {
   "real": true,
   "reason": "Confirmed in <repo>/profiles/bashrc-snippets/claude-code-helpers.sh: the claudex block at lines 148–162 explains the proxy, login, and model selection but contains no context-limit warning, prevention guidance, recovery recipe, or pointer to the deep-dive document; the only nearby pconv comments concern stale session indexes, not oversized proxied contexts. This is operationally misleading rather than cosmetic because the launcher presents claudex as ready to use while omitting a field-verified failure mode that can make both ordinary requests and /compact unusable. The mechanism and both recoveries are explicitly documented in <repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md at lines 73–108 and corroborated by <repo>/agent-context/zz-log/2026-07-16.md at lines 26–35 and 50. The proposed fix is directionally correct, minimal, tier-2-clean, uses a valid recovery sequence, and introduces no forbidden status or attribution. Its only weakness is that “the pconv tail” is slightly ambiguous; it should say to dump the session and feed only the dump’s tail. Adding the existing deep-dive path would also prevent the shell comment from becoming the sole recovery documentation.",
   "revisedFix": "# Sol context warning: use /context early and /compact around half-window; auto-compact may fire after Sol's real limit. If requests and /compact wedge with a 400, resume the same session on native 1M Fable/Opus, compact there, then resume with claudexry; otherwise run pconv dump <uuid> and feed only the dump's tail to a fresh claudex session.\n# Details: 02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md"
  }
 },
 {
  "label": "a81abcfb65f10fb96",
  "result": {
   "real": false,
   "reason": "The finding conflates proxy-wide setup with the requirements of the specific `claudex` launcher. `<repo>/profiles/bashrc-snippets/claude-code-helpers.sh:148-161` defines `claudex` as a GPT-5.6-Sol main model with GPT-5.6-Sol subagents, so it routes only to the Codex provider; `claudex-login` correctly performs only `-codex-login`. The same file separately and explicitly documents both logins for `fablex` at lines 164-175 because that launcher combines a Claude main model with Codex subagents. The cross-reference `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md:49-57` confirms the intended nuance: both credentials are needed to support both model families, but “`claudex` works fine with only the Codex login while `fablex` 502s” without Anthropic OAuth. `<repo>/agent-context/zz-log/2026-07-16.md:39-41` records the observed 502 specifically for `fablexryu` requesting `claude-fable-5`, not for `claudex`. Therefore line 150 is not genuinely misleading in its local context, and the proposed replacement would introduce a new inaccuracy by claiming Anthropic login is required for pure-Codex `claudex` use. It would also duplicate the already-correct `fablex` setup immediately below.",
   "revisedFix": ""
  }
 },
 {
  "label": "aea331ff35a4057ae",
  "result": {
   "findings": [
    {
     "file": "<repo>/CLAUDE.md",
     "line": 62,
     "issue": "The per-delegation rule says to pass `sol` \"exactly\" and only notes that the environment floor overrides it; this can send an invalid target outside a proxy session and omits the documented resolution order (`CLAUDE_CODE_SUBAGENT_MODEL` > per-invocation > agent frontmatter > main model).",
     "fix": "Replace the bullet with wording that states the full resolution order, identifies `gpt-5.6-sol` as a valid target only in `claudex`/`fablex` proxy sessions, maps a user's `sol` shorthand to that exact model ID there, and retains `ccrym` as the native floorless option when a named Anthropic model must win.",
     "severity": "high"
    },
    {
     "file": "<repo>/AGENTS.md",
     "line": 121,
     "issue": "The `project-bootstrapper` definition says it \"Can invoke seacow-scaffolder,\" and step 3 later says to \"Use seacow-scaffolder,\" directly contradicting the document's critical rule that Claude Code agents cannot spawn agents.",
     "fix": "Change the capability to \"Can recommend a seacow-scaffolder handoff to the orchestrator\" and change step 3 to \"Return a handoff request so the command/main session can invoke seacow-scaffolder.\"",
     "severity": "high"
    },
    {
     "file": "<repo>/CLAUDE.md",
     "line": 48,
     "issue": "The routing map has no entry for running Codex/GPT models through the Claude Code harness, so readers are not directed to the new launcher matrix, dual-login troubleshooting, context-window wedge, and rescue procedures.",
     "fix": "Add a row such as `| Running Codex/GPT models through the Claude Code harness; claudex/fablex launchers; proxy or context-window failures | 02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md |`.",
     "severity": "medium"
    },
    {
     "file": "<repo>/AGENTS.md",
     "line": 5,
     "issue": "The document claims Claude Code references this file via `@AGENTS.md` in `CLAUDE.md`, but the current `CLAUDE.md` only contains an ordinary Markdown link and an instruction to read it before agent work; it does not contain an `@AGENTS.md` import.",
     "fix": "Change the sentence to say Claude Code reads this file on demand through the routing instruction in `CLAUDE.md`; alternatively, add a real `@AGENTS.md` import to `CLAUDE.md` if automatic loading is intended.",
     "severity": "medium"
    }
   ]
  }
 },
 {
  "label": "a505afe2583f9560e",
  "result": {
   "real": false,
   "reason": "The underlying ambiguity is directionally valid, but the proposed replacement is not precise enough to approve as written. In `<repo>/profiles/bashrc-snippets/claude-code-helpers.sh`, only `claudex` and `fablex` call `claudex-proxy` and inject `ANTHROPIC_BASE_URL` plus `ANTHROPIC_AUTH_TOKEN`; those command-scoped assignments do not persist in the parent shell. `ccrym` merely unsets `CLAUDE_CODE_SUBAGENT_MODEL` and starts plain `claude`. This agrees with `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md`, whose launcher table labels `ccrym` as `native (no proxy)`. However, the existing comment already conditions Sol availability on being in a proxy-routed environment; it does not explicitly claim that `ccrym` creates that environment. More importantly, the proposed sentence `plain ccrym supports native-provider models only` is literally too broad: `env -u` preserves other inherited variables, so `ccrym` can route Sol if its invoking shell already exports valid proxy URL/auth settings and the proxy is running. The wording should distinguish default behavior from inherited routing rather than state an unconditional native-only limitation.",
   "revisedFix": "# ccrym only removes the subagent-model floor; it does not start or configure\n# CLIProxyAPI. Sol is available only when the invoking environment already has\n# valid proxy routing and the proxy is running; otherwise ccrym uses native models."
  }
 },
 {
  "label": "a1c314f06a8d5bfab",
  "result": {
   "real": true,
   "reason": "The finding is confirmed. `<repo>/AGENTS.md` line 5 explicitly says Claude Code references the file via an `@AGENTS.md` entry in `CLAUDE.md`, while `<repo>/CLAUDE.md` contains no such import. Its actual references are an ordinary Markdown link plus the task-scoped instruction at line 54 to read `AGENTS.md` before writing or modifying agents, and an unlinked mention at line 60. This is genuinely misleading because an `@AGENTS.md` import implies the file is loaded into context automatically, whereas the current routing rule calls for reading it only when relevant. Changing the sentence in `AGENTS.md` is the correct minimal fix and remains tier-2-clean. Adding an import instead would broaden every-turn context loading and conflict with `CLAUDE.md`'s stated “front desk, not the stacks” design, so that alternative should not be preferred without a deliberate architecture decision.",
   "revisedFix": "Replace line 5 with: `> **Convention:** AGENTS.md is an open standard supported by 20+ AI tools (Codex, Copilot, Cursor, Cline, etc.). Claude Code does not natively read this file; in this repository, the routing instruction in \\`CLAUDE.md\\` directs it to read [\\`AGENTS.md\\`](/agentic-workflow-and-tech-stack/agent-context/zz-research/AGENTS/) before writing or modifying agents.`"
  }
 },
 {
  "label": "a73e9c3ba3456932b",
  "result": {
   "real": true,
   "reason": "Confirmed. `<repo>/CLAUDE.md` has no routing-map entry for the proxied Codex/GPT workflow. Its delegation row mentions the model floor and `ccrym`, but does not direct readers to the proxy launchers, authentication failures, context-window wedge, or rescue procedures. The directory index at `<repo>/02-stack/01-ai-coding/index.md` does link the deep dive, but CLAUDE.md does not route this task to that directory, so the index link does not cure the front-door omission. The proposed target exists at `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md` and contains the launcher matrix, dual-login troubleshooting, wedge explanation, two rescue recipes, and prevention guidance. Adding one routing row is minimal, accurate, tier-2-clean, and introduces no frontmatter or attribution issue.",
   "revisedFix": ""
  }
 },
 {
  "label": "a8c24b0be80eee597",
  "result": {
   "findings": [
    {
     "file": "<repo>/02-stack/patterns/claude-code-session-recovery.md",
     "line": 23,
     "issue": "The guide still defines only “two failure modes” and its decision tree starts from “/resume shows wrong sessions,” so it gives no route for the field-verified proxied-model context-window wedge. A reader seeing `400 ... input exceeds the context window` may keep retrying `/compact`, although compaction itself also fails once the oversized context must be sent to the same model; the existing large-JSONL fallback also does not warn that pasting the full dump can immediately re-wedge the fresh session.",
     "fix": "Add a third failure-mode section for the proxied-model context-window wedge and make it the first classifier in the decision tree. The YES branch should offer: (1) window-swap — resume the same session on a native 1M-window model (`ccry`), run `/compact`, exit, then resume the compacted session with `claudexry`; or (2) clean-slate salvage — `pconv dump <uuid>`, start a fresh session, and feed only the tail/state summary, explicitly warning not to feed the full dump. Update the title/description, “two failure modes,” and “three recovery primitives” wording to match the expanded scope.",
     "severity": "high"
    },
    {
     "file": "<repo>/02-stack/patterns/claude-code-session-recovery.md",
     "line": 139,
     "issue": "The current decision-tree order contradicts the document's own cross-OS warning: knowing the UUID sends the reader directly to `claude -r <uuid>` before asking whether they are crossing WSL and Windows, even though lines 52–61 explain that resuming poisoned cross-OS content in place fails. The other path reaches `pconv dump --rewrite` only after answering that the UUID is unknown, but `dump` requires an ID and `--rewrite` requires a direction.",
     "fix": "After the new context-wedge check, ask “Crossing WSL ↔ Windows?” before “Know the session UUID?”. Route YES to `pconv list` if the ID must be found, then `pconv dump <uuid> --rewrite <wsl-to-win|win-to-wsl|strip>` and paste into a fresh session. Route NO onward to the direct-resume/index-rebuild choices.",
     "severity": "medium"
    },
    {
     "file": "<repo>/02-stack/patterns/claude-code-session-recovery.md",
     "line": 61,
     "issue": "The “challenge 02” links at lines 61 and 187 and the “Research learning” link at line 186 target `research/...` files that no longer exist there; both documents were moved under `_archive/2026-07/`, so readers following the recovery rationale get broken links.",
     "fix": "Change the challenge target to `../../_archive/2026-07/research/zz-challenges/02-claude-code-conversation-fragmentation.md` in both places, and change the learning target to `../../_archive/2026-07/research/learnings/2026-04-23-stale-sessions-index-detection-and-recovery.md`.",
     "severity": "low"
    },
    {
     "file": "<repo>/02-stack/patterns/index.md",
     "line": 25,
     "issue": "The pattern-table description presents Claude Code session recovery only as a stale `/resume`-picker decision tree, so after the recovery guide gains the context-window branch, a reader scanning the index still would not discover that it covers the `400 input exceeds context window` failure and its two rescues.",
     "fix": "Replace the purpose text with a concise expanded description, for example: “Decision tree for stale `/resume` indexes, cross-OS fragmentation, and proxied-model context-window wedges — direct resume/index repair, native-window `/compact` swap, or tail-only `pconv` salvage.”",
     "severity": "low"
    }
   ]
  }
 },
 {
  "label": "a312cb1bd91be77b8",
  "result": {
   "real": true,
   "reason": "Confirmed in <repo>/AGENTS.md: line 121 says `Can invoke seacow-scaffolder for structure creation`, and line 142 directs a fresh-start bootstrapper to `Use seacow-scaffolder to design from scratch`. Those unqualified instructions conflict with the same file's Claude Code rule at lines 25-47 that Agent → Agent is forbidden and orchestration must return through command/main. The canonical cross-reference, <repo>/.claude/ARCHITECTURE.md, reinforces this at lines 11-21 and 170-205: Claude Code agents cannot spawn children, and the main context must perform sequential handoffs. The actual <repo>/.claude/agents/meta/seacow-scaffolder.md also says at lines 20-30 that multi-agent work returns to the orchestrator. This is genuinely misleading, not cosmetic, because a Claude Code implementation following the bootstrapper process would attempt an unsupported nested delegation. The proposed two-line fix is accurate and minimal: it preserves the intended bootstrapper-to-scaffolder workflow while moving invocation to the orchestrator. Although AGENTS.md is portable and OpenCode may support recursive agents, requiring a handoff remains valid there and introduces no false capability claim. It also touches no frontmatter, private identifiers, or attribution, so it complies with the stated house rules.",
   "revisedFix": ""
  }
 },
 {
  "label": "acf487c437bfc4739",
  "result": {
   "real": true,
   "reason": "The finding survives adversarial review. `<repo>/CLAUDE.md:62` explicitly gives `sol` as an example and says to pass the named model “exactly,” while only mentioning the environment-floor caveat; it omits the remaining precedence chain. The repository’s canonical model-tiering documentation at `<repo>/.claude/skills/agent-patterns/SKILL.md:134-146` states `CLAUDE_CODE_SUBAGENT_MODEL` > per-invocation `model` > agent `model:` frontmatter > main model, and lists Anthropic aliases or full model IDs—not `sol`—as accepted forms. The actual launchers at `<repo>/profiles/bashrc-snippets/claude-code-helpers.sh:155-184` use the full ID `gpt-5.6-sol`, enable CLIProxyAPI routing only for `claudex`/`fablex`, and define `ccrym` as the native floorless launcher. The tier-2 doc at `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md:63-69` corroborates that launcher split. This is operationally misleading, not cosmetic: literal `sol` can be an invalid target, a GPT model is unavailable through the native Anthropic route, and an active environment floor can silently defeat a user’s named per-invocation model. The proposed fix is directionally correct and house-rule-compliant, but “only in claudex/fablex sessions” should be phrased in terms of active proxy routing so it does not falsely imply that launcher names themselves are the protocol boundary; it should also make clear that `ccrym` is native and therefore not a Sol launcher.",
   "revisedFix": "Replace the bullet with: `- **Per-delegation model control:** effective subagent model precedence is \\`CLAUDE_CODE_SUBAGENT_MODEL\\` → per-invocation \\`model\\` → agent \\`model:\\` frontmatter → main model (\\`inherit\\`). For named Anthropic tiers (\\`haiku\\`/\\`sonnet\\`/\\`opus\\`/\\`fable\\`), pass the requested tier; if an environment floor is active, say that it wins and use/resume with \\`ccrym\\` when the named Anthropic model must win. Treat a user’s \\`sol\\` shorthand as \\`gpt-5.6-sol\\` only when CLIProxyAPI routing is active (normally via \\`claudex\\`/\\`fablex\\`); it is not a native Claude Code target. Default tiering when unspecified: grunt/read → haiku, reason/write → sonnet, premium only on explicit request.`"
  }
 },
 {
  "label": "ab68aab5c81dfc856",
  "result": {
   "findings": [
    {
     "file": "<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md",
     "line": 57,
     "issue": "The setup says to log in to both providers, but then claims “`claudex` works fine with only the Codex login.” That contradicts the field-verified prerequisite supplied for this audit and can leave readers diagnosing the documented `502 unknown provider for model X` failure after following an incomplete setup.",
     "fix": "Delete the launcher-specific exception and replace the paragraph after the failure signature with: “Treat both `-codex-login` and `-claude-login` as prerequisites for proxy use. If either credential is missing, requests routed to that provider family fail with `502 unknown provider for model X`; restart the proxy after adding the missing login.”",
     "severity": "high"
    },
    {
     "file": "<repo>/02-stack/01-ai-coding/index.md",
     "line": 3,
     "issue": "The overview still presents only “Codex CLI (alternative)” and categorically says “Why I avoid wrappers,” while the stack now has a field-used, explicitly research-only `claudex` proxy lane. The deep-dive link at the bottom partially reconciles this, but the page description and “My current picks” section still give readers the wrong current topology.",
     "fix": "Update the description to distinguish wrapper use from daily-driver adoption, add an “Experimental: claudex” subsection after “Alternative: Codex CLI” that points to `./claudex-codex-models-via-cliproxyapi/`, and rename “What I avoid (currently)” to “What I avoid as daily drivers (currently).” Also qualify “When to revisit” as “When to revisit as a daily driver.”",
     "severity": "medium"
    },
    {
     "file": "<repo>/02-stack/decisions/index.md",
     "line": 22,
     "issue": "The decision matrix linked from the AI-coding index still routes every wrapper choice to “Avoid until 2027+” and lists all wrappers as avoid-only. That contradicts the current decision: native Claude Code remains primary, but `claudex` is an accepted research-only exception for running GPT models inside the existing harness.",
     "fix": "Change the rejection branch and wrapper revisit text to apply to daily-driver use, then add a separate `claudex via CLIProxyAPI` option marked “research-only / experimental” with the reasons “retains Claude Code harness; unofficial proxy, dual-account and context-window risks.”",
     "severity": "medium"
    },
    {
     "file": "<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md",
     "line": 67,
     "issue": "The launcher matrix says `ccrym` makes a named per-delegation model win, but it never states the governing precedence. Readers can therefore reasonably expect a named model request to override `claudex` or `fablex`, even though those launchers set `CLAUDE_CODE_SUBAGENT_MODEL=gpt-5.6-sol`, which overrides per-invocation and frontmatter choices.",
     "fix": "Add immediately below the launcher matrix: “Subagent model resolution is `CLAUDE_CODE_SUBAGENT_MODEL` > per-invocation model > agent frontmatter > main model. Consequently, `claudex` and `fablex` pin every subagent to Sol; a named delegation model only takes effect after removing that floor. `ccrym` is the native floorless launcher, and `gpt-5.6-sol` is a valid named target only in a floorless session that still uses the proxy.”",
     "severity": "medium"
    },
    {
     "file": "<repo>/02-stack/01-ai-coding/index.md",
     "line": 81,
     "issue": "The install pointer links to `../../01-kernel/scripts/install.sh`, but that file does not exist, so the rendered documentation sends readers to a dead target.",
     "fix": "Remove the nonexistent script link and reduce the sentence to: “See the [rebuild flow](#private-reference) for the integrated installation used by this stack.”",
     "severity": "low"
    },
    {
     "file": "<repo>/02-stack/01-ai-coding/index.md",
     "line": 176,
     "issue": "The deep-dives list links to `../patterns/parallel-agents-worktrees.md`, but no such file exists; the repository’s generated link report also records this route as “page not found.”",
     "fix": "Remove this bullet until the planned canonical tier-2 pattern doc exists. Do not redirect the public tier-2 index to the current tier-3 research notes.",
     "severity": "low"
    }
   ]
  }
 },
 {
  "label": "af7e2e8346e920918",
  "result": {
   "real": true,
   "reason": "Confirmed in `<repo>/02-stack/patterns/claude-code-session-recovery.md`: line 61 and line 187 link to `../../research/zz-challenges/02-claude-code-conversation-fragmentation.md`, and line 186 links to `../../research/learnings/2026-04-23-stale-sessions-index-detection-and-recovery.md`. Those resolved files do not exist. Git history confirms both were renamed 100% into `_archive/2026-07/research/` on 2026-07-10. The proposed paths resolve to existing files at `<repo>/_archive/2026-07/research/zz-challenges/02-claude-code-conversation-fragmentation.md` and `<repo>/_archive/2026-07/research/learnings/2026-04-23-stale-sessions-index-detection-and-recovery.md`, whose contents match the link descriptions. This is genuinely misleading because all three contextual/rationale links are dead, not merely mislabeled. The proposed replacements are correct, minimal, modify only the live tier-2 document rather than frozen archive content, introduce no frontmatter or attribution issue, and comply with the house rules.",
   "revisedFix": ""
  }
 },
 {
  "label": "adb9a586f7ae02209",
  "result": {
   "real": true,
   "reason": "Confirmed. `<repo>/02-stack/01-ai-coding/index.md:176` contains the stated link, while `<repo>/02-stack/patterns/parallel-agents-worktrees.md` does not exist and is not tracked in Git. Although `<repo>/site/scripts/link-report.md` is dated 2026-06-12, its line 75 records this exact route as page-not-found, and current filesystem/Git checks independently confirm the failure. This is genuinely misleading rather than cosmetic: a public tier-2 “Deep dives” entry promises a navigable how-to but sends readers to a missing page and contributes a CI-failing broken content link. The available material remains explicitly pre-promotion: `<repo>/agent-context/zz-research/2026-04-18-parallel-agentic-work.md` calls the canonical tier-2 file planned, `<repo>/agent-context/zz-research/2026-04-25-parallel-agent-coordination-findings.md` says graduation is still the user's decision, and `<repo>/ROADMAP.md` leaves the pattern doc unchecked. Removing this bullet is therefore the minimal, accurate, tier-boundary-compliant fix; redirecting it to tier-3 research would misrepresent research notes as the canonical public pattern. The separate broken references to the same planned page elsewhere are additional cleanup scope, not a refutation of this finding.",
   "revisedFix": ""
  }
 },
 {
  "label": "ad3a4eeed6b37c63d",
  "result": {
   "real": true,
   "reason": "The finding survives adversarial review, but its “wrong current topology” wording is somewhat broader than the defect. In `<repo>/02-stack/01-ai-coding/index.md`, line 3 still summarizes the page as “Codex CLI (alternative). Why I avoid wrappers,” and lines 55–66 categorically frame wrappers as avoided until a later revisit. That conflicts with the field-backed, research-only proxy lane documented in `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md` lines 25–31 and implemented in `<repo>/profiles/bashrc-snippets/claude-code-helpers.sh` lines 148–204. The strongest refutation is that the index defines its picks around a daily driver and the deep-dives entry at lines 172–176 already calls claudex an experimental exception, so claudex need not be promoted to a primary/fallback pick. Nevertheless, summary readers encounter an unqualified “avoid wrappers” claim that no longer describes actual use, making the inconsistency substantive rather than merely stylistic. The proposed fix is minimal and preserves the anti-wrapper doctrine by distinguishing experimental use from daily-driver adoption. It complies with the status enum and tier-2-clean rules and introduces no attribution. The experimental subsection should explicitly remain research-only and should mention the fablex variant as part of the same proxy lane so the update does not create a new topology omission.",
   "revisedFix": "Update the description to say that wrappers are avoided as daily drivers while a research-only claudex/fablex proxy lane is being tested. After “Alternative: Codex CLI,” add “Experimental: claudex/fablex proxy lane” with one concise sentence: native Claude Code remains the primary daily driver; this deliberate, risk-accepted exception runs GPT models inside the Claude Code harness and is documented at `./claudex-codex-models-via-cliproxyapi/`. Rename “What I avoid (currently)” to “What I avoid as daily drivers (currently),” and change “When to revisit” to “When to revisit as a daily driver.” Keep the existing ban-risk, ecosystem, and security cautions intact."
  }
 },
 {
  "label": "aa7e521e145a7cd7c",
  "result": {
   "real": true,
   "reason": "The finding survives adversarial review. `<repo>/02-stack/patterns/claude-code-session-recovery.md` explicitly claims “Two distinct failure modes” in frontmatter (lines 2–4), repeats “The two failure modes” (line 23), defines its promise only around a lying `/resume` picker (lines 19–25), and starts the decision tree at “/resume shows wrong sessions” (lines 133–145). It contains no classifier for `400 ... input exceeds the context window`, no warning that `/compact` also fails after the context is already oversized, and no warning against reinjecting a full conversation dump. The mechanism and both field-tested rescues are independently recorded in `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md` (lines 73–108) and `<repo>/agent-context/zz-log/2026-07-16.md` (lines 26–35), while the actual aliases exist in `<repo>/profiles/bashrc-snippets/claude-code-helpers.sh` (lines 12–17, 148–204). The dedicated claudex page partially mitigates the omission, but does not refute it: that page itself sends readers to the generic session-recovery pattern for pconv mechanics, and the target’s broad “Session Recovery” title makes the incomplete classifier operationally misleading rather than merely cosmetic. The proposed direction is house-rule-compliant: the evidence is field-verified, `status: research` is valid, the commands contain no private hostname/client data, and no attribution is introduced. However, the clean-slate command should use pconv’s existing `--tail` length control rather than generate a full dump and rely on the reader to select only its tail, and `ccry` should be qualified because it resumes only the most-recent session and does not itself pin a large-window model.",
   "revisedFix": "Expand the page scope, but keep the edit concise and avoid duplicating the full claudex deep dive. Add the proxied-model wedge as the decision tree’s first, exact-signature classifier: if the reader sees `400 ... input exceeds the context window`, say not to retry `/compact` on the same proxied model. Add two wedge-specific rescue paths before the existing picker/path primitives: (1) window-swap—immediately use `ccry` only when the wedged session is still the most recent and the native default is a sufficiently large-window Fable/Opus model; otherwise resume the known UUID explicitly on a native large-window model, run `/compact`, exit, then use `claudexry`; (2) clean-slate salvage—prefer `pconv dump <uuid> --tail 50 > /tmp/wedged-session-tail.md` (adjust N as needed), start a fresh session, and provide only that tail plus a short state summary. Explicitly warn that `pconv dump <uuid>` is full-conversation by default and can immediately re-wedge the fresh session. Cross-link `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md` for mechanism and prevention. Update the frontmatter description, promise, “two failure modes” wording, and `<repo>/02-stack/patterns/index.md` summary. Rename the existing “three recovery primitives” section to “Picker and path recovery primitives” rather than inaccurately forcing all five tactics into one count."
  }
 },
 {
  "label": "a1d721536155fe2f6",
  "result": {
   "real": false,
   "reason": "I read 100% of the generated search output (characters 0–72,324) and directly inspected the relevant files. `<repo>/02-stack/patterns/index.md` line 25 does describe only stale `/resume` recovery, but that is currently accurate: `<repo>/02-stack/patterns/claude-code-session-recovery.md` still documents exactly two failure modes—stale `sessions-index.json` and cross-OS fragmentation—and three corresponding primitives. It contains no `400 input exceeds context window` branch, native-model `/compact` window-swap, or tail-only wedge salvage. Those newer procedures instead live in `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md`, which is already discoverable as “context-window wedge documented” from `<repo>/02-stack/01-ai-coding/index.md` line 175. Therefore the current pattern-table text is not misleading relative to its linked guide, while the proposed replacement would introduce a concrete inaccuracy by claiming that guide covers rescues it does not yet contain. The proposed wording is otherwise concise and tier-2-clean, but its sequencing assumption is false in the actual working tree.",
   "revisedFix": "Do not apply the index-only replacement yet. First add the proxied-model context-window failure mode, window-swap rescue, and tail-only `pconv` salvage branch to `<repo>/02-stack/patterns/claude-code-session-recovery.md`; only then expand the line-25 purpose text. If that guide remains unchanged, keep the current scoped description and rely on the existing AI-coding index link to the claudex deep dive."
  }
 },
 {
  "label": "a24032f4b73fbb19c",
  "result": {
   "real": true,
   "reason": "Confirmed in <repo>/02-stack/patterns/claude-code-session-recovery.md. Lines 52–61 say cross-OS sessions have different encoded buckets and OS-specific absolute paths, and that extract-and-paste is the resolution. Yet lines 139–142 ask for the UUID first and route every known-UUID case directly to `claude -r <uuid>`, bypassing the cross-OS test. That is operationally misleading: direct resume can either miss the session because it is in the other encoded-cwd bucket or resume content containing unusable paths. The cross-OS node is also not executable as written: the installed CLI confirms bare `pconv dump --rewrite` fails because `--rewrite` requires one of `wsl-to-win`, `win-to-wsl`, or `strip`, and a dump also requires a session ID unless `--latest` is supplied. `pconv list` does expose the needed IDs. The archived cross-reference at <repo>/_archive/2026-07/research/zz-challenges/02-claude-code-conversation-fragmentation.md explicitly says not to resume cross-OS content in place and documents the complete dump/rewrite flow, but the target's current challenge link points to a path that no longer exists, so it does not mitigate the bad decision-tree node. Reordering the checks and spelling out the command is minimal and house-rule-compliant. One qualification: the actual target currently has no context-wedge check, and direct resume is also cwd-strict even without crossing operating systems, as documented in <repo>/agent-context/zz-inbox/2026-04-25-claude-r-cwd-strict-vs-portaconv-wedge.md.",
   "revisedFix": "If the separate context-window-wedge branch is being added, put this immediately after it; otherwise make it the first decision: ask “Crossing WSL ↔ Windows?” before “Know the session UUID?”. For YES, ask whether the UUID is known; if not, run `pconv list`, then run `pconv dump <uuid> --rewrite <wsl-to-win|win-to-wsl|strip>` and paste the output into a fresh session. For NO, continue to the UUID/index-rebuild branches, but qualify `claude -r <uuid>` as valid only when launched from the same cwd/encoded bucket that contains the JSONL; otherwise use `pconv dump <uuid>` and paste into a fresh session. Update the stale challenge-02 link to an existing target."
  }
 },
 {
  "label": "afdbd08b1b7ec061b",
  "result": {
   "real": false,
   "reason": "The dead-link defect is confirmed: `<repo>/02-stack/01-ai-coding/index.md` line 81 links to `<repo>/01-kernel/scripts/install.sh`, which does not exist, and the generated link report also records it as missing. However, the proposed replacement is not fully accurate. `<repo>/03-work/rebuild/05-install-kernel.md` lines 49–55 still instruct readers to run that same nonexistent script, while lines 19–37 describe the installer as future/aspirational. Calling this the “integrated installation used by this stack” therefore preserves a misleading claim and merely moves the failure one click deeper. The wording is tier-2-clean and requires no frontmatter change, but it fails the accuracy requirement, so the finding as a defect-plus-fix package is not real.",
   "revisedFix": "Delete line 81 entirely. The install table already supplies valid per-tool installation pointers, and there is currently no accurate integrated-installer target to replace the missing script link. Repair `<repo>/03-work/rebuild/05-install-kernel.md` separately before adding a broader rebuild-flow pointer."
  }
 },
 {
  "label": "a99ee69b5713bc605",
  "result": {
   "real": false,
   "reason": "The precedence is omitted from <repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md, but the claimed misleading behavior is already resolved by the matrix itself: `claudex` and `fablex` explicitly list GPT-5.6-Sol for subagents, while only `ccrym` says “Unsets the subagent floor; named model wins” and is explicitly marked “native (no proxy).” The implementation in <repo>/profiles/bashrc-snippets/claude-code-helpers.sh confirms that both proxy functions set `CLAUDE_CODE_SUBAGENT_MODEL=gpt-5.6-sol`, and `ccrym` unsets it. The documented precedence is corroborated in <repo>/.claude/skills/agent-patterns/SKILL.md. Adding the precedence would improve completeness, but the existing table does not reasonably promise that a named request overrides the proxy launchers, so this is cosmetic rather than a genuine documentation defect. The proposed final sentence is also not ideal: it introduces a “floorless session that still uses the proxy” even though the matrix exposes no such launcher and `ccrym` is explicitly native, creating a new setup ambiguity. The edit would otherwise comply with the status enum, tier-2 cleanliness, and no-attribution rules.",
   "revisedFix": "Optional clarity addition below the matrix: “Subagent model resolution is `CLAUDE_CODE_SUBAGENT_MODEL` > per-invocation model > agent frontmatter > main model. Because `claudex` and `fablex` set that environment variable to `gpt-5.6-sol`, named delegation requests do not override Sol. `ccrym` unsets the floor for native, non-proxy sessions.” Omit the proxy-target sentence unless a floorless proxy launcher or manual invocation is documented."
  }
 },
 {
  "label": "a9d53f9096bf7d573",
  "result": {
   "real": true,
   "reason": "Confirmed. `<repo>/02-stack/decisions/index.md` is categorical: line 22 sends the only `wrapper` branch to `Avoid until 2027+`, line 44 marks every named wrapper avoid-only, line 47 applies the 2027 revisit gate without a daily-driver qualifier, and line 117 broadly prefers official tools until wrappers prove long-term stability. That is no longer merely stale wording: `<repo>/02-stack/01-ai-coding/index.md` links this page as “which CLI when” at line 174, while lines 65–66 explicitly permit wrappers as research-only and line 175 identifies `claudex` as a deliberate experimental exception. The new deep dive at `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md` likewise says the native workflow remains primary but `claudex` is an experimental lane (lines 25–31). Therefore the decision matrix currently gives a misleading all-or-nothing answer and should distinguish daily-driver rejection from experimental use. The proposed direction is minimal and house-rule-compliant, but “dual-account risk” is imprecise for `claudex` itself: the deep dive says pure `claudex` works with only Codex OAuth (line 57), and `<repo>/profiles/bashrc-snippets/claude-code-helpers.sh` defines `claudex-login` as Codex-only; both provider logins are required for the mixed `fablex` route. Use credential/account exposure rather than claiming that the `claudex` option inherently requires two accounts.",
   "revisedFix": "In the flowchart, change the existing branch to `wrapper as daily driver` → `Avoid for primary use / revisit 2027+`, and add a distinct `experimental model-routing` → `claudex via CLIProxyAPI — research-only` branch. In the AI Coding CLI table, add `claudex via CLIProxyAPI | ◐ research-only | Retains the Claude Code harness; unofficial proxy adds provider-account/credential exposure, ban/ToS uncertainty, and a documented context-window wedge` with a link to the existing deep dive. Qualify both “When to revisit wrappers” and general rule 2 as applying to primary/daily-driver adoption. Do not describe dual-provider login as intrinsic to pure `claudex`; mention it only for the mixed `fablex` route if that detail belongs in this summary."
  }
 },
 {
  "label": "a498d7da94857996a",
  "result": {
   "real": false,
   "reason": "The target file really does contain the quoted launcher-specific exception at <repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md:57, but the claimed defect is not substantiated and the proposed fix would overstate the requirement. The setup already tells readers to log in to both providers at lines 49–54, so following it is not incomplete. More importantly, <repo>/profiles/bashrc-snippets/claude-code-helpers.sh:155-175 shows that `claudex` pins both the main model and subagents to `gpt-5.6-sol`, while only `fablex` combines `claude-fable-5` with GPT subagents and is explicitly marked as requiring both logins. The incident receipt at <repo>/agent-context/zz-log/2026-07-16.md:39-41 likewise verifies only that `fablexryu` failed because its `claude-*` request lacked an Anthropic credential; it does not show a Codex-only `claudex` request needing Anthropic authentication. CLIProxyAPI's provider documentation also presents `--codex-login` and `--claude-login` as separate provider flows with no cross-provider prerequisite. The existing paragraph's provider-family failure explanation is therefore consistent with the implementation and evidence. Replacing it with “both ... prerequisites for proxy use” would introduce an unsupported blanket claim, even though the proposed second sentence about requests failing only for the missing provider family is accurate.",
   "revisedFix": ""
  }
 },
 {
  "label": "aee8c74b59b7a5868",
  "result": {
   "findings": [
    {
     "file": "<repo>/.claude/skills/delegation-advisor/SKILL.md",
     "line": 50,
     "issue": "The Claude Code section explains how to choose an agent type but gives no model-selection guidance, so a reader can fan out from a premium Fable/Opus session without learning that `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` is the default floor, that the floor overrides a requested per-invocation model, or that `ccrym` is required for floorless manual selection. It also omits `gpt-5.6-sol` as a valid delegation target in proxy sessions.",
     "fix": "Insert a short “Model selection” subsection after `### Claude Code`: premium Fable/Opus is orchestrator-only; default delegated reasoning to Sonnet and scans/extraction to Haiku; document resolution order as `CLAUDE_CODE_SUBAGENT_MODEL` > per-invocation model > agent frontmatter > main model; when the user names a model, pass it exactly but warn that the env floor wins; use `ccrym` for floorless manual control; and note that `gpt-5.6-sol` is valid under `claudex`/`fablex`. Link to `02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md` for proxy/session caveats.",
     "severity": "high"
    },
    {
     "file": "<repo>/.claude/skills/workflow-scaffold/SKILL.md",
     "line": 76,
     "issue": "The navigation map says the live shell helpers are under `02-stack/profiles/`, but the field-updated launcher matrix (`claudex`, `fablex`, variants, and `ccrym`) is in root `profiles/bashrc-snippets/claude-code-helpers.sh`; the `02-stack/profiles` copy lacks those launchers. Following this map hides the current launch surface.",
     "fix": "Move the `profiles/` row to the Root Level table and describe root `profiles/bashrc-snippets/` as the live shell-helper source. If `02-stack/profiles/` is intentionally retained, label it explicitly as a legacy/stale copy or remove it in a separate cleanup rather than presenting it as canonical.",
     "severity": "high"
    },
    {
     "file": "<repo>/.claude/skills/delegation-advisor/SKILL.md",
     "line": 79,
     "issue": "“Parallel Delegation (OpenCode Only)” conflates parallel fan-out with recursive agent spawning. Claude Code’s main/orchestrating session can dispatch independent subagents in parallel; only agent-to-agent recursive spawning is forbidden. This would steer readers away from the now-used Claude Code fan-out workflows.",
     "fix": "Rename the section to `Parallel Delegation` and state: Claude Code may fan out parallel agents from the main/command orchestrator but agents cannot spawn agents; OpenCode additionally supports recursive child sessions. Add one sentence that large Sol-backed fan-outs should start in a fresh session and follow the linked `/context` and half-window `/compact` discipline.",
     "severity": "medium"
    },
    {
     "file": "<repo>/.claude/skills/workflow-scaffold/SKILL.md",
     "line": 81,
     "issue": "The Tier 3 navigation table omits `agent-context/`, even though `zz-log/` and `zz-research/` are now the hot and warm stages of the repo’s live knowledge loop. The later reminder at lines 205–206 still frames capture as “methodology or external vault,” which contradicts the current `zz-log → zz-research → 02-stack → 01-kernel` routing.",
     "fix": "Add an `agent-context/` row identifying `zz-log/` as significant-session worklogs and `zz-research/` as threads that outlive a session. Replace the lines 205–206 reminder with the actual routing: capture significant work in today’s `zz-log`, promote persistent threads to `zz-research`, and apply the evidence gates before promotion to `02-stack` or `01-kernel`.",
     "severity": "medium"
    },
    {
     "file": "<repo>/.claude/skills/workflow-scaffold/SKILL.md",
     "line": 195,
     "issue": "The maintenance instructions tell readers to update a nonexistent CLAUDE.md “Available Agents” section and place skills only under `01-kernel/skills/`. Current runtime inventory is under `.claude/agents/meta/` and `.claude/skills/`, while CLAUDE.md is deliberately a slim routing map rather than a static component catalog.",
     "fix": "Replace the agent reminder with: update the runtime definition under `.claude/agents/meta/` and the portable definition/inventory in `AGENTS.md`; change CLAUDE.md only when its routing map or hard behavior changes. Replace the skill reminder with `.claude/skills/<name>/SKILL.md` as the active path, mentioning `01-kernel/skills/` only if it remains the maintained portable source copy.",
     "severity": "medium"
    },
    {
     "file": "<repo>/.claude/skills/workflow-scaffold/SKILL.md",
     "line": 219,
     "issue": "The sample frontmatter restricts `status` to `research | planning | stable | parked`, contradicting the enforced site enum and omitting statuses used by this repo, including `log` for worklogs and `active`/`observed` for operational docs.",
     "fix": "Replace the status placeholder with the complete enforced enum exactly: `draft | research | aligning | planning | active | observed | log | stable | parked`.",
     "severity": "medium"
    }
   ]
  }
 },
 {
  "label": "a0834859589be0986",
  "result": {
   "real": true,
   "reason": "Confirmed in `<repo>/.claude/skills/workflow-scaffold/SKILL.md`: the Tier 3 table at lines 81–89 has no `agent-context/` row, and lines 205–206 still route “knowledge work” to an external vault. That conflicts with the live repo policy in `<repo>/CLAUDE.md` lines 9, 18, and 38; `<repo>/01-kernel/skills/knowledge-curator/SKILL.md` lines 14–39; and the `agent-context/` index files. Because `workflow-scaffold` is explicitly the navigation/placement concierge, this can route durable research away from the repo’s active knowledge loop; it is genuinely misleading, not cosmetic. Adding one navigation row and replacing the stale reminder is minimal and tier-2-clean. The proposed fix is directionally correct, but “evidence gates before promotion to `02-stack` or `01-kernel`” slightly conflates two distinct gates: evidence gates entry into `02-stack`, while promotion from `02-stack` to `01-kernel` additionally requires tool-agnosticity.",
   "revisedFix": "Add this Tier 3 row: `agent-context/` — Live knowledge surface: `zz-log/` records significant-session work and rationale; `zz-research/` holds topic-findable threads that outlive a session. Replace lines 205–206 with: “Capture significant work in today’s `agent-context/zz-log/<date>.md`; spin out persistent or topic-findable threads into `zz-research/<date>-<topic>.md`; promote to `02-stack/` only after verified execution, second use, or primary-source support (new promotions start `status: research`), and promote onward to `01-kernel/` only when the principle is tool-agnostic.”"
  }
 },
 {
  "label": "ab3e38659792cc7f7",
  "result": {
   "real": true,
   "reason": "The finding survives adversarial verification. `<repo>/.claude/skills/workflow-scaffold/SKILL.md:76` directs readers only to `02-stack/profiles/` for Bash helpers. The current launcher surface is instead in `<repo>/profiles/bashrc-snippets/claude-code-helpers.sh:148-204`, including `claudex`, `fablex`, `ccrym`, and the y/r/u variants; `<repo>/02-stack/profiles/bashrc-snippets/claude-code-helpers.sh` ends at line 38 and lacks all of them. This is operationally misleading, not cosmetic: the tier-2 claudex doc names the root helper at line 61, the root installer emits that path at `<repo>/install.sh:175-176`, and git history shows every recent launcher commit updating only the root file. However, moving the entire row and labeling all of `02-stack/profiles/` stale would introduce a new inaccuracy: that directory still contains unique stack assets such as `bashrc-snippets/osc7-cwd.sh` and `keybindings/wezterm/`, and the site sync explicitly ingests it. The issue is real, but the fix should distinguish the stale duplicated Claude helper from the still-useful tier-2 profile assets.",
   "revisedFix": "Keep a `02-stack/profiles/` row in the Tier 2 table, but describe it narrowly as stack profile documentation/keybindings and note that its duplicated `bashrc-snippets/claude-code-helpers.sh` is not the current launcher source. Add `profiles/` to the Root Level table (renaming the column from `File` to `Path` if needed) as the live shell-helper source, explicitly pointing to `profiles/bashrc-snippets/claude-code-helpers.sh` for the current launcher matrix. Reconcile or remove only the duplicated stale helper in a separate cleanup rather than declaring the whole `02-stack/profiles/` tree legacy."
  }
 },
 {
  "label": "a03c5c27626e532a8",
  "result": {
   "real": true,
   "reason": "I read the target section in `<repo>/.claude/skills/workflow-scaffold/SKILL.md`, the full status schema in `<repo>/site/src/content.config.ts`, the corroborating convention in `<repo>/01-kernel/skills/knowledge-curator/SKILL.md`, representative `log`/`active`/`observed` frontmatter matches, and the complete saved 164-match status search result. The finding is confirmed: line 219 presents `research | planning | stable | parked` under “Every markdown file in a tier should have,” while the enforced schema accepts nine values: `draft`, `research`, `aligning`, `planning`, `active`, `observed`, `log`, `stable`, and `parked`. This is genuinely misleading, not merely cosmetic, because the sample is authoring guidance and omits statuses that carry distinct repository semantics and are actively used—for example, daily worklogs use `log`, live indexes use `active`, and empirical captures use `observed`. The proposed one-line replacement exactly matches the schema and the repository’s canonical convention, introduces no new status, is minimal, and complies with the house rules.",
   "revisedFix": ""
  }
 },
 {
  "label": "a01871f53a728c8ca",
  "result": {
   "real": true,
   "reason": "Confirmed. `<repo>/.claude/skills/delegation-advisor/SKILL.md` lines 50–61 covers agent types and dispatch mechanics but says nothing about model selection, the Sonnet floor, precedence, named-model handling, `ccrym`, or proxy-backed Sol delegation. This is materially misleading, not cosmetic: root `CLAUDE.md` explicitly routes “picking subagent models” to this skill, and `<repo>/agent-context/zz-log/2026-06-13.md` records an actual premium-fan-out incident caused by this trap. The doctrine and precedence are corroborated by `.claude/skills/agent-patterns/SKILL.md` lines 128–148 and `03-work/rebuild/04-ai-tools.md` lines 75–87. The July proxy claims are corroborated by `profiles/bashrc-snippets/claude-code-helpers.sh` lines 148–184 and `02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md` lines 59–108. The proposed direction is correct and house-rule-compliant, but two distinctions should be made explicit: `ccrym` is a convenience alias for unsetting the floor, not the only possible mechanism, and it is native/no-proxy; meanwhile `claudex` and `fablex` deliberately force every subagent to `gpt-5.6-sol`, so Sol is not merely an optional per-invocation choice in those launchers.",
   "revisedFix": "Add a compact `#### Model selection` subsection within `### Claude Code`, after the built-in-types list:\n\n- Reserve Fable/Opus for the main orchestrator. When unspecified, use Sonnet for reasoning/writing and Haiku for scans/extraction.\n- State effective precedence: `CLAUDE_CODE_SUBAGENT_MODEL` > explicit per-invocation model > agent `model:` frontmatter > inherited main model. When the user names a model, pass it exactly, but disclose when the active env floor will override it.\n- Say the normal shell floor is Sonnet. For floorless native per-delegation control, use `ccrym` or equivalently launch after unsetting `CLAUDE_CODE_SUBAGENT_MODEL`; do not imply `ccrym` is the only mechanism.\n- Clarify that `claudex` and `fablex` are proxy sessions whose launchers deliberately set the floor to `gpt-5.6-sol`, so all delegated agents run on Sol; `ccrym` itself is native/no-proxy.\n- Link the canonical tiering details in `../agent-patterns/SKILL.md` and the proxy/context caveats in `../../../02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md`."
  }
 },
 {
  "label": "a53b18a4cd04f7457",
  "result": {
   "real": true,
   "reason": "The finding is substantively real. `<repo>/.claude/skills/workflow-scaffold/SKILL.md` lines 186–200 explicitly tell maintainers to update a nonexistent CLAUDE.md “Available Agents” section and “skills list,” and identify only `01-kernel/skills/<name>/SKILL.md`. The actual `<repo>/CLAUDE.md` is intentionally a routing map: lines 54–60 direct readers to `AGENTS.md` and identify `.claude/agents/`, `.claude/agents/meta/`, and `.claude/skills/` as the runtime inventories; it has neither static catalog section. This is operationally misleading, not cosmetic, because Claude Code discovers components from `.claude/`, so following the current reminder can leave a new component undiscoverable. The proposed correction is directionally right and house-rule-compliant, but it is incomplete: `01-kernel/agents/` and `01-kernel/skills/` are still tracked, maintained portable/public copies (the recent agent consolidation changed `.claude/agents/meta/`, `01-kernel/agents/`, `AGENTS.md`, and `CLAUDE.md` together), and the same stale path/symlink claims recur in this skill’s File Conventions and Troubleshooting sections. A minimal complete fix should align those occurrences too.",
   "revisedFix": "Replace the maintenance reminders with: after adding or changing an agent, update the active runtime definition at `.claude/agents/meta/<name>.md`, the maintained portable/public copy at `01-kernel/agents/<name>.md`, and the portable inventory/definition in `AGENTS.md`; change `CLAUDE.md` only when its routing map or hard behavior changes. After adding or changing a skill, update the active runtime file at `.claude/skills/<name>/SKILL.md` and, when it is a kernel-portable component, its maintained copy at `01-kernel/skills/<name>/SKILL.md`; change `CLAUDE.md` only for routing or hard-behavior changes. Apply the same active-versus-portable distinction to the File Conventions and Troubleshooting entries, removing the nonexistent `.claude/...` symlink claim."
  }
 },
 {
  "label": "a65f3c12b46b98185",
  "result": {
   "real": false,
   "reason": "The narrow defect is real: `<repo>/.claude/skills/delegation-advisor/SKILL.md:79` labels parallel delegation “OpenCode Only,” even though Claude Code’s main session can run independent subagents in parallel. That is materially misleading, not cosmetic. However, the proposed replacement introduces a current capability error: installed Claude Code is 2.1.211, and the current official subagent documentation states that parallel subagents are supported and, since 2.1.172, subagents may also spawn nested subagents when granted the Agent tool, up to a fixed depth of five. Thus “agents cannot spawn agents” is only defensible as this scaffold’s local leaf-agent policy/tool restriction, not as a general Claude Code limitation; `<repo>/.claude/ARCHITECTURE.md` and `<repo>/AGENTS.md` currently make the same now-outdated capability claim. The Sol-session sentence is supported by `<repo>/02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md:104-108` and is tier-2-clean. Also, `<repo>/01-kernel/skills/delegation-advisor/SKILL.md:80` contains the same heading, so changing only the reported copy may leave documentation drift.",
   "revisedFix": "Rename the section to `Parallel Delegation`. State: “Claude Code can fan out independent subagents in parallel from the main/command orchestrator. Claude Code 2.1.172+ can also permit bounded nested subagents when the `Agent` tool is granted, but this scaffold deliberately treats agents as leaves and routes multi-agent work through the main/command orchestrator. OpenCode also supports recursive child sessions.” Add: “For large Sol-backed fan-outs, start a fresh session and follow the [`/context` and half-window `/compact` discipline](/agentic-workflow-and-tech-stack/stack/01-ai-coding/claudex-codex-models-via-cliproxyapi/#prevention-session-discipline-on-proxied-models).” Update the mirrored section in `<repo>/01-kernel/skills/delegation-advisor/SKILL.md` and reconcile the categorical capability statements in `.claude/ARCHITECTURE.md` and `AGENTS.md`."
  }
 }
]
```
