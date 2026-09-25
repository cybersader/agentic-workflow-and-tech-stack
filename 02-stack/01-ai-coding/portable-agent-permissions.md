---
title: Portable agent permissions
description: Operator guide for genuine-human-approved, time/model/count-bounded worker allowances that remain subordinate to route, source, role, wave, and global delegation controls.
stratum: 2
status: research
tags:
  - stack
  - ai-coding
  - permissions
  - delegation
  - model-routing
  - security
date: 2026-09-06
branches: [agentic]
---

Portable agent permissions let a human approve a bounded **future worker envelope** through a normal native dialog. The model translates ordinary language into exact proposed terms; the human reviews those terms and clicks **Approve** or **Deny**. There is no magic grant phrase and no command-line approval flag.

> [!note] Task23 installation and discovery verified
> A single reviewed rollout completed successfully at `2026-09-06T16:49:29.664885Z`. The installed policy is enabled in `default-local-root` mode while the distributable source policy remains disabled, `registered-only`, with empty activation and opt-out lists. The unregistered main session actually received installed additional context on `UserPromptSubmit`, and its restored `SessionStart` context also reported default-local request availability; both supplied exact shell-quoted `--project-root` and `--transcript` operands with no automatic enrollment, request, or grant. This proves non-interpretive hook delivery and eligible request discovery—not interpretation of a human request, ordinary-language model activation, a genuine human controller decision, paid-worker admission, or browser operation. Existing sessions were not stopped or restarted and keep the instructions they already loaded.

The persistent browser uses the same harness-neutral permission core with a different permission kind. See [Persistent browser bridge](./browser-automation-pilot.md).

## Disabled chat-nonce source path

Task28 adds a packaged but disabled Claude Code transport named `unverified-origin-nonce`. The distributable `chatApproval` block is exactly `mode: disabled`, an empty `kinds` list, and card format version 1. A missing historical installed block migrates to disabled; a malformed present block refuses; a valid installed choice survives a flagless reinstall. There is no user-runnable installer flag that enables this transport, and manually editing installed policy is not an authorized activation procedure. The native controller remains the current operational approval authority.

In a temporary enabled fixture, the transport can be scoped independently to `model_allowance`, `browser_session`, or both. Model permission never grants browser scope, and browser permission never grants a model worker. The only accepted raw decision text is the complete standalone lowercase command `approve-permission <32 lowercase hexadecimal characters>`. The hook matches the entire prompt and does not trim, unwrap quotes, accept uppercase hexadecimal, or accept trailing text. This convenience explicitly does **not** authenticate human authorship: Claude Code's available hook payload does not distinguish typed input from programmatic submission.

The card is complete rather than abbreviated. It shows every enforced term, exact binding, selected-store identity, full request digest, original absolute pending deadline, separate origin root/session, card version, nonce, trust warning, and full escaped unverified purpose. The adapter measures the complete serialized UTF-8 hook response and emits it only below 8,000 bytes. It never truncates a card; an oversized response falls back to a native-controller diagnostic and leaves the original request pending.

Withholding the nonce or closing chat is not denial. A matching decision and a native decision converge on the same atomic grant transaction, and request state remains the sole consumption authority. Replay creates no second grant and does not prove current capacity. If storage cannot confirm whether a transaction committed, the response claims neither success nor denial, returns no grant identity, and instructs no automatic retry. Inspect the exact request independently with the native controller or the public `status` operation. Preparing again would create a second request; it would not renew the first.

All source and packaging checks for this path use synthetic prompts, temporary homes, and temporary SQLite stores. They are not evidence of live hook delivery, a visible UI, human approval, an active allowance, or paid-model admission.

## Eligibility—and what an allowance still does not change

The distributable source policy is deliberately inert: `portableAllowance.enabled: false`, `eligibility: registered-only`, `activatedProjectRoots: []`, and `deactivatedProjectRoots: []`. A reviewed installation may preserve that restricted mode or explicitly select `default-local-root`; neither mode creates a request or grant.

Eligibility is installation state, not something a session guesses:

- **`registered-only`** requires one exact enabled registry match **and** exact membership in `activatedProjectRoots`. Registration alone still grants and activates nothing.
- **`default-local-root`** allows a verified unmatched Claude Code top-level root session to use its own canonical working directory as the project identity without registration or activation-list membership. It does not search for a Git root, decode a harness slug, or inherit an ancestor namespace.
- An exact registered match keeps its existing custom namespace rather than being re-derived. Disabled registry matches and disabled registered ancestors remain disabled. A canonical root in `deactivatedProjectRoots`, or anywhere beneath one by path components, is excluded in either mode; a narrower working directory cannot escape the opt-out. Malformed or ambiguous registry/policy state is refusal, not “unregistered.”
- No mode enumerates directories, mass-enrolls workspaces, writes registry rows automatically, or treats an enabled ancestor as the namespace for a descendant.

A portable `model_allowance` can replace repeated per-call premium approval cards only when **all** of these are true:

- the reviewed adapter and context hooks are installed and the adapter is enabled;
- the installed mode admits this exact canonical project after registry and opt-out precedence;
- the caller is a verified **top-level root session**, not a delegated worker;
- the allowance belongs to that exact root session's derived core context;
- the current lane and exact route still match the approved binding;
- the requested premium model and admission shape are eligible;
- the grant is live and has enough total and per-model capacity.

Before anything is charged, an absent, corrupt, expired, revoked, mismatched, out-of-policy, or otherwise unusable allowance fails closed and may lead to the ordinary exact one-use approval card. That card states why the portable path did not apply, carries zero charges from the failed portable attempt, and is **not** portable authorization. Once a charged pending portable reservation exists, any failure is instead a hard denial: no ordinary card, no retry, and no refund. When an exact one-use grant and a portable allowance both match the same call, the guard spends the more specific one-use grant first and leaves the allowance untouched.

An allowance does **not**:

- authorize a task, a new work wave, or a larger fan-out by itself;
- turn a leaf worker into an orchestrator;
- change loaded system, developer, project, or delegation instructions;
- waive launcher locks, route/provider checks, source hashes, canonical Workflow dispatcher validation, or tool permissions;
- raise the default 15-agents-per-prompt or 80-agents-per-rolling-5-hours caps;
- waive the rule that fan-outs expected to exceed 15 need same-turn human confirmation of count, model mix, and rough token cost;
- include the main conversation's own model use;
- approve browser origins, credentials, the full desktop, files, shell actions, messages, purchases, or other consequential operations;
- auto-renew, stack, widen, retry, refund, or add Fable automatically.

This is a Claude Code adapter over a harness-neutral core, not a universal enforcement claim. Another harness can use the core only if it has an equivalent reviewed pre-launch interception point and supplies its own trustworthy identity and route adapter.

### Observed harness coverage

A focused PATH check found only `claude` at the reviewed host's normal command lookup. `codex`, `opencode`, `aider`, and `gemini` were not found there; that is not proof they are absent elsewhere on disk. Compatible Claude Code root sessions using the reviewed guard can receive the configured default eligibility regardless of the top-level model, but active route availability, launcher locks, loaded instructions, provider preflight, containment, and task authorization remain authoritative.

Other local shell-capable agents can use the generic `agent-permissions` CLI/JSON surface and the governed browser interface when those tools are installed. They are **not** promised automatic guidance loading or model-budget enforcement. `agent-permissions-project` is Claude Code-specific, and CLIProxyAPI labels such as `codex` identify a provider route, not proof that the Codex CLI is installed. The approved Task23 scope adds no other harness and performs no downloads.

## Human experience: ordinary language to an approval dialog

The user can ask naturally:

> Let this session use Astra for two hours for the bounded audit, with at most eight workers total and six Astra workers.

The compatible top-level session restates the task boundary, weekly-metered Astra pool, exact models, duration, total-worker ceiling, and each premium-model ceiling. The illustrative request is **120 minutes, 8 total slots, and 6 Astra slots**; it is not a default grant. Adapter policy permits at most 120 minutes, 15 total workers, and 6 of either premium model, while ordinary 15/80 admission limits still apply independently.

On a reviewed installation, the standard `SessionStart` and `UserPromptSubmit` hooks run the read-only guard context command and place exact, shlex-quoted `--project-root` and `--transcript` arguments in `hookSpecificOutput.additionalContext`. The hook grants nothing, prepares nothing, writes no request or state, and does not interpret the user's sentence. The session—not the human—fills in only the finite terms the human actually requested and invokes the existing operator:

```text
agent-permissions-project request --project-root '<exact hook-provided root>' --transcript '<exact hook-provided root transcript>' --minutes 120 --workers 8 --per-model astra=6 --purpose 'bounded audit sweep'
```

The `astra` operator alias expands to the exact model ID `gpt-6-astra` before the core sees it. `fable` similarly expands to `claude-fable-5-1`; Fable is absent unless it is explicitly requested and displayed. Options use ordinary spaced argv (`--minutes 120`), not concatenated pseudo-flags.

If hook context is genuinely unavailable, use an exact transcript path supplied by the host. An unregistered `default-local-root` session must keep using exact `--transcript`; it cannot use `/status` session ID to discover itself and does not need manual registration in the normal flow. Passing the current `/status` session ID is a manual fallback only for an already registered project with a recorded project directory. Never add `--current`, choose the newest transcript, decode a project slug, or search transcript content.

`request` creates a **pending** record and prints the exact terms, derived route, selected store, request ID, creation time, approval deadline, and requested post-approval duration. Newly prepared requests default to a two-hour (7,200-second) approval window; each request keeps the deadline stored when it was filed, so this default does not extend or rewrite older rows. It cannot grant anything. The human separately starts `agent-permissions-controller`; a human deliberately operating a headless terminal may instead run `agent-permissions-controller --terminal`. The controller prefers installed `zenity`, falls back to `kdialog`, and otherwise leaves the request pending. The terminal form is a normal `y/N` prompt. A compatible Portagenty installation can map an existing workspace through `pa permissions roots` and manually open `pa permissions review -w <workspace-file>`; Portagenty forwards only generated workspace roots plus explicit list, context, and store filters. It neither prepares nor approves, and missing/older controller support fails without unfiltered fallback. The agent must never start the controller, select its answer, interact with its UI, or treat tool output as approval. Closing or timing out the dialog yields no grant.

The approval card puts the **actual enforced terms and exact stored binding first**, before any agent-authored description. Every enforced string in the models, scope, context ID, route, and fingerprint is quoted and reversibly escaped without dropping or collapsing stored characters; non-string scalars keep their exact JSON-style spelling. Invisible whitespace, control characters, format characters, quotes, and backslashes are rendered visibly so the text encodes the stored values exactly. The full request ID and the displayed digest prefix receive the same literal treatment.

The untrusted `purpose` appears last under a separate label and quote prefix. It is flattened, blank-line stripped, and capped at 12 content lines and 1,200 displayed characters, with a separate truncation marker when needed. That description cannot change the authoritative terms above it. This is exact-value display fidelity, **not general visual-spoof immunity**: homoglyphs, confusable scripts, fonts, and other human-perception limits remain. The card also displays the main-conversation exclusion, Stop/revoke behavior, same-user trust warning, request identity, and digest prefix. The decision is bound to the immutable full request digest; the core rechecks the digest, policy, clock, and limits when committing.

### FAQ: Why are the request and allowance clocks separate?

**The two clocks answer different questions.** A requested `minutes: 120` means the allowance would run for 120 minutes **starting only after genuine human approval and grant commitment**. The pending request has its own prepare-to-approval deadline, which defaults to two hours for newly prepared requests. In the earlier observed case, a 120-minute request for four Astra workers was filed successfully under the former 15-minute approval default; later, the public controller printed `No pending permission requests`, and exact-request investigation found the request expired with no decision and no grant. That historical row keeps its filed deadline: changing the default neither renews it nor rewrites it.

**An empty pending list does not prove that nothing was filed.** It can mean the controller opened a different store, the request's approval deadline passed, or the request was already decided. The operator prints the actual store and the core-returned creation and expiry times as timezone-bearing timestamps, the approval-window duration, and the requested post-approval allowance duration. It derives the window from those timestamps rather than assuming the current two-hour default. If those returned timestamps cannot form a usable deadline, the receipt preserves the request ID and terms, prints `UNKNOWN`, exits 2, and warns against preparing a duplicate.

**Check the exact request before preparing another one.** A compatible root session should query core `status` by the original request ID, using the same operator-derived binding and store, before calling `request` again. Absence from the controller's pending list is not a retry signal; another prepare creates another request and performs no renewal.

**Expired history is diagnostic only.** The controller prints its selected store and, when useful, a bounded history of requests that expired undecided: up to five detailed entries from a scan of at most 200 rows, with an honest “at least” count when the scan stopped early. Time determines expiry even if a stale stored row still says `pending`. Expired entries never become approval cards, and listing them writes nothing, decides nothing, renews nothing, and performs no cleanup. Unreadable terms or timestamps in dead history are marked unreadable without blocking healthy live requests; corrupt live pending validation still fails closed. A pre-existing defect can roll back an attempted expired-state update when grant commit fails, leaving that dead row marked `pending`; the read-only diagnostics recognize its elapsed deadline but do not repair the row. None of these diagnostics changes the request TTL, grant lifetime, roles, operations, or approval policy.

## Context binding: use observed facts, never guesses

The installed Claude adapter operator is the only supported place to derive a Claude Code allowance binding. It reuses the installed guard's own transcript normalization, session-key, route, eligibility, context, and fingerprint functions. A compatible top-level session should launch the operator from the current workspace and lane that will spend the allowance. For an unmatched `default-local-root` workspace only, actual process cwd must exactly match `--project-root`, the hook's actual payload `cwd` supplies that root during discovery, and a stale or different project root refuses before prepare. Current process/hook cwd is that unmatched default-local project's identity; historical transcript cwd is not. Registered projects retain their legacy cwd behavior. Pass the exact hook-provided project root and root transcript, let the operator revalidate both, and refuse rather than hand-build context IDs, project keys, session keys, route maps, fingerprints, or digests.

The read-only context entry point is `python3 ~/.claude/scripts/agent-guard.py context`. Standard `SessionStart` and `UserPromptSubmit` hooks pipe their existing payload to it. On an eligible verified root it emits a short `additionalContext` string with exact shlex-quoted `--project-root` and `--transcript` operands. An early event with no readable transcript may emit a pending diagnostic so a later prompt can supply valid facts. Conflicting session metadata emits a conflict diagnostic. Disabled, opted-out, malformed, ambiguous, unsupported, or known leaf contexts receive no misleading availability claim. The command always exits without blocking the event and never creates a request, grant, token, descriptor, secret, daemon, ledger row, or other state.

This is discovery, not caller proof. The operator still revalidates the exact root transcript through `observe()`, and PreToolUse admission independently derives the actual calling session. Copying another session's arguments cannot let the caller spend that session's allowance. The same-UID interface does not claim that copied arguments cannot prepare a pending request for another context; preparation is not a grant.

If a reviewed host genuinely provides the exact root transcript path outside the hook, `--transcript` remains supported. For `context`, `status`, and `request`, an unregistered `default-local-root` session requires that exact path: those verbs cannot discover it from `--session-id`. Only an already registered project may use `--session-id` from the current Claude Code `/status` as a manual fallback, because the operator can compose exactly `recordedProjectDir/<session-id>.jsonl` without listing other project directories. The two forms are mutually exclusive on `register`, `context`, `status`, and `request`. For first registration only, `register --session-id` may perform a bounded depth-one exact-filename lookup across at most 512 immediate project directories; the exact `<session-id>.jsonl` match must be unique. That registration-only discovery is not a normal workaround for `default-local-root`, which needs no registration in its ordinary hook/exact-transcript flow. Neither form permits newest-file selection, transcript-content search, project-slug decoding, path guessing, or another session's transcript.

Within the bounded transcript prefix, only the canonical top-level camel-case `sessionId` field participates in session verification. If present, every canonical value must match the verified transcript filename stem; if no canonical value is present, the existing validated filename-based behavior remains available. A separate snake-case `session_id` field is not combined into session identity. This metadata rule does not infer role: installed CLI `bg` is an execution mode, not delegated authority, and the existing root-versus-leaf checks remain unchanged.

Registration remains an explicit operator action for `registered-only` scope or a deliberately named custom namespace; ordinary `default-local-root` eligibility does not require it. The operator can register with the same exact hook-provided root and transcript: `agent-permissions-project register --project-root '<exact hook-provided root>' --transcript '<exact hook-provided root transcript>'`. Registration grants nothing and is never performed by the hook.

For a registered workspace, the stored `contextId` remains only a stable **project namespace seed**, including any existing custom namespace. For a verified unmatched workspace in `default-local-root`, the adapter derives that same kind of seed with the existing `context_id_for()` algorithm from the session's canonical working directory itself—never a guessed ancestor—and writes no registry row. Each root session then derives its own narrower core context ID from the chosen namespace plus its verified root transcript/session key; the core context-ID derivation scheme is unchanged. Two top-level windows in one workspace therefore need separate human-approved allowances, and neither can spend the other's. Project session permissions are not transferable.

The trusted fingerprint contains exactly four keys:

- `projectKey` — adapter-derived hash of the canonical project root;
- `sessionKey` — guard-derived root-transcript session key;
- `projectRoot` — exact canonical absolute project path;
- `sessionName` — exact normalized root-transcript filename stem, the value named by `/status`.

The operator and guard call the same fingerprint helper. Every value must be nonempty and at most 200 characters; an overlong value is refused, never truncated. The approval display therefore shows the same exact project/session facts the core binds and compares.

Adding `projectRoot` and `sessionName` is a one-time source-binding compatibility break from the earlier two-key adapter build: any grant created under that older fingerprint would not match this build. No portable allowance was ever created in the live environment, so no real grant migration, transfer, or revocation was performed. After rollout, binding changes remain fail-closed and require a new request plus a new human decision; they are not migrated automatically.

Useful operator verbs remain fixed: `register`, `list`, `disable`, `context`, `status`, and `request`. For root-bound verbs, reuse the exact hook-provided `--project-root` and `--transcript` operands; `list` takes neither. The only new global option is `--policy`, which lets a reviewed caller point the operator at the installed policy whose eligibility mode and opt-outs it must read. It is not a verb, a grant switch, or a way to override that policy. There is no operator `approve`, `grant`, `yes`, `renew`, or `refund` verb.

## Core status answers only for the exact binding

The core's public `status` operation is read-only and uncharged, but it is not a cross-route discovery interface. It compares a live grant against the supplied binding exactly:

- `contextId` selects candidate rows; a different context ID does not select or reveal the foreign grant;
- for the selected context ID, a changed fingerprint returns `context_mismatch` and a changed route returns `route_mismatch`;
- either binding mismatch is an error response, not an `ok: true` result containing a neighboring binding's `activeGrant`, ID, terms, or counters;
- corrupt grant state is a hard `state_corrupt` failure even when the caller selects a different permission kind—the core does not hide a suspect store behind an apparently healthy neighboring kind.

Liveness is decided before binding comparison. A lapsed row from an older route therefore cannot mask or brick a fresh grant that a human separately approved for the current route: the current route can see and reserve the new grant, while the old route is denied. This is not migration, renewal, or budget transfer. The old grant remains lapsed with its historical charges and receipts, and the fresh grant exists only because a new request received a new genuine human decision.

## Admission and accounting

### Direct premium worker

One eligible direct Astra or Fable worker consumes:

- 1 from the allowance's total-worker counter; and
- 1 from that exact model's independent per-model counter.

Routine standalone workers keep their ordinary admission rules and are never charged against an allowance merely because one exists.

### Model-budget Workflow

An eligible model-budget Workflow reserves its **full declared hard total** before admission, including every routine internal worker. In the same atomic core transaction it also reserves each declared premium-model ceiling.

The per-model ceilings are independent and may overlap; they are not partitions and are not added on top of the total. For example, a four-worker envelope may reserve `workers=4` with Astra ceiling 4 and Fable ceiling 4: total headcount can never exceed four, while either premium model independently can account for up to four of those slots. Every internal worker still counts toward the total.

The Workflow must still use the canonical shared dispatcher, validated source, exact model IDs, supported route, and literal hard cap. A portable allowance changes the approval source, not Workflow admissibility.

Before the legacy ledger is charged, guard phase 0 revalidates the live grant's **full original envelope** against source-owned adapter ceilings. It checks the exact term shape, original duration, model set, total-worker limit, each per-model limit, issued time span, and counter limits. It does not trust a caller-provided policy ID or digest, and it does not accept a formerly oversized grant merely because little time or capacity remains. An out-of-policy envelope is rejected before phase 1 and may produce the ordinary one-use card with an explicit reason and zero charges.

### Expiry, revocation, and failed attempts

Expiry or revocation blocks **new top-level admissions**. A Workflow already admitted may finish later internal launches inside the envelope it reserved; the guard has no blocking hook around those internal calls, so revoke is not a kill switch.

No reservation is refunded. Before phase 1, an unusable context, absent grant, binding mismatch, status/core-availability denial, or source-ceiling failure can still fall back to an ordinary exact one-use card with an explicit reason and no charge. After phase 0 pins a valid admission and the ordinary 15/80 cap checks pass, the Claude adapter writes a charged pending legacy reservation under the session lock, reserves the portable SQLite allowance, and writes the final adapter commit only after core success. Capacity exhaustion is detected by that core reserve: the overflowing core transaction moves no allowance counters, but the phase-1 legacy charge already exists and remains. A crash, timeout, route drift, core failure, exhaustion, or later denial after that first append can therefore consume legacy prompt/session capacity even when no worker launches. The guard then denies without an ordinary card, refund, automatic retry, or successful legacy replay. A new authorization must be a new call; it cannot complete the already charged admission under different authority.

The public core supports `revoke` and scope narrowing, but the Claude project operator intentionally has no `revoke`, grant, or approval verb. A user can tell the same compatible root session, in ordinary language, to revoke its allowance. The agent then performs this source-supported sequence; the human does not copy identifiers or assemble JSON:

1. Derive the **current** exact root-session binding through the operator:

   ```text
   agent-permissions-project context --project-root '<exact hook-provided root>' --transcript '<exact hook-provided root transcript>' --json
   ```

2. Confirm that this same binding currently owns a live allowance and read its exact grant ID:

   ```text
   agent-permissions-project status --project-root '<exact hook-provided root>' --transcript '<exact hook-provided root transcript>'
   ```

3. The agent serializes the returned context and live grant ID into exactly this core parameter shape:

   ```json
   {
     "context": {
       "contextId": "<exact current context ID>",
       "fingerprint": {"<exact key>": "<exact value>"},
       "route": {"<exact key>": "<exact value>"}
     },
     "grantId": "<exact live grant ID reported by operator status>"
   }
   ```

   The agent preserves every returned binding key and value exactly and submits the serialized object without asking the human to edit the payload:

   ```text
   agent-permissions revoke --params "$AGENT_ASSEMBLED_REVOKE_JSON"
   ```

Omitting the optional `narrow` member is the canonical full-revoke request and matches the shipped JSON schema. A successful outright revoke returns that `grantId`, `state: "revoked"`, resulting terms, and counters.

To narrow rather than revoke, the agent includes a `narrow` **object** that may remove models with a `models` subset and may lower `totalWorkers` or named `perModel` ceilings. The source applies these concrete checks:

- `totalWorkers` cannot be lowered below `workersTotal.used`;
- a named `perModel` ceiling cannot be lowered below that model's recorded used count;
- every resulting per-model ceiling must be at most the resulting total, so lowering `totalWorkers` below an existing per-model ceiling requires an explicit matching `perModel` reduction in the same request;
- an incoherent request is rejected unchanged and never silently clamped;
- a `models` subset may remove a model and its explicit per-model term; existing reservation history and the total used count remain, so removal is not a refund.

The regression suite directly covers below-used total rejection, explicit coherent total/per-model reduction that retains prior spend, and clean removal of an unspent model. No narrow may add a model, raise a ceiling, or otherwise widen a term.

The exact owning context is mandatory: another root session, project namespace, route, or stale hand-built binding cannot revoke the grant. There is no cross-context drain, administrator `revoke all`, refund, or automatic controller launch. The controller decides pending requests only; it is not a revocation UI. Revocation blocks new top-level admissions but is not a kill switch for a Workflow envelope already admitted.

## Core interface and storage

The harness-neutral public CLI is exactly:

```text
agent-permissions <prepare|status|reserve|revoke|receipt|claim_host> [--params JSON] [--store PATH]
```

The Python entry point is `python3 -m agent_permissions.cli`. `claim_host` belongs to `browser_session`; the other operations cover preparation, inspection, charging, revocation/narrowing, and recovery receipts. No public operation creates a grant. The human-only controller is:

```text
agent-permissions-controller [--context CTX] [--terminal] [--workspace-root PATH]... [--store PATH]
```

The default SQLite store is:

```text
${AGENT_PERMISSIONS_HOME:-${XDG_STATE_HOME:-~/.local/state}/agent-permissions}/permissions.sqlite3
```

Changing the store path changes where empty or existing state is read; it never creates permission. In workspace-filtered controller mode, a missing selected store is refused rather than created. Each repeatable workspace root must be an existing canonical absolute directory. Model requests are attributed only by stored `fingerprint.projectRoot`, browser requests only by stored `fingerprint.workingDirectory`; context filtering intersects rather than replaces that scope. Invalid attribution and valid requests outside the roots are counted without exposing their details. Expired request views carry no fingerprint, so filtered review omits expired details and does not fabricate a count. The SQLite database is authoritative for portable allowance counts. The legacy JSONL ledger remains authoritative for the existing prompt/session caps. The design does not claim a distributed transaction between them.

The installed CLI's location helpers treat an explicitly supplied environment mapping—including an empty mapping—as authoritative, resolve `HOME` only when a selected default actually needs it, and never fall back to ambient process variables behind the caller's mapping. Explicit whitespace is preserved, and tilde expansion remains limited to the path inputs that support it. Omitting the mapping preserves the normal environment-derived defaults. This is location-selection isolation only, **not a subprocess sandbox**.

This is **same-user accident prevention**, not protection against a hostile process with unrestricted access to the same user's files, processes, or desktop.

## Reviewed installation-state controls

Task23 changes installation selection and discovery, not the permission core or public protocol. The source policy always ships `enabled: false`, `eligibility: registered-only`, `activatedProjectRoots: []`, and `deactivatedProjectRoots: []`. The installer derives an effective installed policy without editing those source defaults.

A flagless reinstall now preserves all four fields **only after validating them**: enabled state, eligibility mode, activation roots, and subtree opt-outs. Unknown modes, malformed roots, corrupt registry/policy state, contradictory mode/rules, or an enabled `registered-only` installation with no activated root abort before writes and leave the installation unchanged. A flagless update is no longer an off switch and never resets valid installed scope.

The frozen state-changing flags are exact:

- `bash profiles/claude-global/install-agent-budget.sh --enable-default-local-allowance` enables the adapter and selects `default-local-root`.
- `bash profiles/claude-global/install-agent-budget.sh --disable-portable-allowance` disables the adapter while preserving the valid mode, activation roots, and opt-outs for later review.
- `bash profiles/claude-global/install-agent-budget.sh --use-registered-only-allowance` selects `registered-only` without implicitly enabling, disabling, adding, or removing scope. If the resulting state would be enabled with no activated root, it refuses rather than guessing.
- `bash profiles/claude-global/install-agent-budget.sh --add-portable-allowance-opt-out /canonical/root` adds one canonical subtree opt-out.
- `bash profiles/claude-global/install-agent-budget.sh --remove-portable-allowance-opt-out /canonical/root` removes one exact opt-out.
- Existing `bash profiles/claude-global/install-agent-budget.sh --enable-portable-allowance /canonical/project` remains additive: it enables the path and adds that exact registered root while preserving the installed eligibility mode and opt-outs.

Use at most one state-changing option per invocation. Repeated or incompatible state-changing options fail before writes. These switches replace the old flagless-reset behavior; none creates a request, grant, allowance row, reservation, receipt, registry entry, transcript record, controller process, or model call.

The same reviewed installer owns the Claude Code integration: it stages and verifies its managed files, preserves the existing hook behavior, and adds the read-only guard context command to standard `SessionStart` and `UserPromptSubmit` through the existing working-recorder JSON hook-composition mechanism. Context emission does not prepare on the user's behalf. The human must still ask for finite terms, the agent prepares one pending request using the exact hook-provided arguments, and the human separately starts the controller and decides. The reviewed rollout verified this hook wiring in the installed settings and then observed real `UserPromptSubmit` delivery to an unregistered root.

Registration, default eligibility, activation, opt-outs, and hook discovery still grant nothing. A live allowance exists only after a genuine human approves displayed terms. Enabling this integration does not authorize a new project work wave or restart, stop, or rewrite an existing session. An already running session keeps the system/developer/project instructions it loaded; a voluntary fresh compatible top-level root context may be required to use newly installed routing guidance. Task23 installation and hook discovery are verified; genuine human approval and model use remain separate follow-up demonstrations, not installation prerequisites.

### Two-hour pending-request deployment

A scoped core reinstall on 2026-09-07 raised only the default prepare-to-approval deadline for newly filed requests to two hours (7,200 seconds). The installed package/schema distribution verified at `751b88e584bc31289a5e4591d39bad076e88ba6e30023081c33c362911115967`; its complete preimage was preserved at `b08539d8f0ef946664d17c5105a8f6d06f37c2c2fdae6869d1e633810f6a1ee3`, and both launcher bodies remained byte-identical. Five isolated-store regressions imported the installed package and proved the shared default for both request kinds, approval after the former 15-minute boundary, refusal after the new boundary, grant lifetime starting at approval, and preservation of a tighter deadline already stored on an older request.

The deployment did not open or inspect the live permission database, start a controller, prepare or decide a live request, renew an expired request, change any grant duration or worker/model/browser ceiling, invoke a model or browser, or restart another process. Already-filed requests remain governed by their own stored `expiresEpoch`; installing the longer default does not migrate, extend, or revive them.

## Immutable installer transition candidate

The canonical core installer now uses retained content-addressed generations beneath the same
stable share root. The package/schema digest formula is unchanged. A complete candidate is
staged and validated on the destination filesystem, then published as
`generations/<distribution-sha256>/`; `active-generation` is an atomic strict 64-hex pointer.
Each stable regular-file launcher starts one isolated `python3 -I -c` interpreter, performs cheap
structural checks, reads the pointer, and imports only the selected concrete generation. Existing
launcher paths and adapter binding identity therefore remain stable. Full content-hash verification
is an integrity check during install, `--check`, and explicit activation; launchers and adapter hot
paths do not rehash the distribution, and unsigned hashes are not content attestation.

Managed generations have a strict compatibility shape: their only top-level entries are
`agent_permissions/` and `schemas/`, and the package contains exactly the 13 required modules
`__init__.py`, `canonical.py`, `client.py`, `cli.py`, `clock.py`, `controller_cli.py`,
`controller.py`, `core.py`, `errors.py`, `policy.py`, `renderers.py`, `schema.py`, and `store.py`.
The adapter resolves below stable `CoreBinding` identity and process-caches one concrete generation
per canonical stable root. For only the exact built-in fallback identity
`("python3", "-m", "agent_permissions.cli")`, execution replaces ambient `PYTHONPATH` with the
selected generation, enables safe path, disables user-site, removes `PYTHONHOME`, and uses the
selected generation as cwd; custom argv behavior remains unchanged. Chat-backend source applies the
same generation pin and refuses stale parent or child modules without purge or reload, but chat
approval remains disabled and that source is not installed.

The first transition snapshots the verified legacy flat distribution as an immutable rollback
generation and never edits or removes the flat package/schema trees. Activation precedes launcher
replacement, so either launcher implementation remains coherent if installation stops between
rewrites. Explicit `--activate-generation <id>` switches only to a validated retained generation.
There is no generation deletion, pruning, garbage collection, or automatic rollback decision.
A malformed or missing managed pointer/target fails rather than falling back to legacy bytes.
`--check` accepts the old flat layout only when no managed pointer or marker exists.

This is accepted source behavior verified in temporary roots. It has not been applied to the live
installation, opened a permission store, launched the controller beyond temporary `--help`,
prepared or decided a request, changed policy/settings, started a browser/model, or executed the
held Task 32 deployment helpers.

## Historical prototype

[`premium-window-prototype.md`](../../profiles/claude-global/premium-window-prototype.md) records the disabled session-local predecessor. It is source-only historical evidence and must not be activated. The portable core/adapter supersedes its mechanism while preserving the reviewed outer ceilings. Exact one-use grants remain the default and fallback.

## Installed default-local rollout evidence and remaining proof

A single authorized apply exited 0 at `2026-09-06T16:49:29.664885Z`. The private deployment receipt is stored beneath `${CLAUDE_STATE_HOME}/task24-default-local-rollout/` and has SHA-256 `aa5d5a66b2f53689ea0d6f30f9eef429fe69e79bf6fd6451a0443f1395e844b9`; the actual state-home path is intentionally omitted here. A private backup directory beneath that same rollout root contains 28 managed preimages plus one copied preflight receipt, with all 29 files verified.

The installed policy is enabled with `eligibility: default-local-root` and `requiresRegisteredProject: false`. One pre-existing activated root was preserved, zero opt-outs were preserved, and the one-entry registry remained byte-identical at `3b192b65a7740d5ebc646537dcac02778577df2a9443ae3a698dbfe37c33198a`. Compatible unregistered local roots therefore need no mass enrollment. Installed hashes are:

- effective policy `447f4b0fa7ef52696123f89418cb4c441c862c2cc38259c86e7aa14db51f2482` (prior registered-only policy `b1ce2a36039a9ae3e1a8d97a6d25e2e40807702147aa79c5aa4a37cbf8119390`);
- manifest `fa7955595f2997950690281ad5d4fe4f376df5e97e27bae3533a7b39612673b7`;
- global guidance `301efbf542d1bdd9853762ba86c80a514e8bf157b5db345a3afbccca8efe27d7`;
- delegation advisor `4a87ec83d5cbc878e897a298e0d88b42491cb3fbde85c517003495df888f24bf`;
- Claude Code settings `9f92c8f90e6a9b1e26ab58ee69a3a56172c109fd955b738389ebc6b9450085ce`.

The installed guard, operator, all ten adapter modules, and both managed Workflow sources matched reviewed source, with no unexpected extra Python module. Hook order is `context` then recorder on `SessionStart`, and existing approval handling then `context` on `UserPromptSubmit`. The unregistered main session actually received installed additional context on `UserPromptSubmit`, and the restored `SessionStart` context independently reported the same default-local request availability; both supplied exact shell-quoted project-root and transcript operands without enrolling the root or creating a request or grant. These hook receipts contain deterministic discovery context and do not interpret a human request.

The distributable policy remains inert at `1eaf8dc9931f5fe5ddc50495d1b29cee80812c985cf7287c7a027bb3107eadd0`. Final installer source and test-file hashes begin `e698c4` and `b9e0be`; the installer suite passed 68 tests. Independent receipts also passed core 218, adapter 88, core CLI 57, operator 113, legacy guard 182, portable guard 77, core end-to-end 41, policy 15, launcher-model 30, proxy launcher 27, browser bridge 32, browser smoke 17, and wrapper 3. These suites overlap and must not be summed into one coverage number.

A genuine isolated-home test used paths containing both a space and an apostrophe. It verified exact generated hook commands plus operator `context`, `request`, and `status` without explicit `--policy`, from the actual working directory; the only pending request existed in a synthetic store and no grant was created. Independent review closed D1/D2 cwd transitions, behavior after more than 250 rows, registered-project continuity, D3 fallback scoping, and runtime/kernel advisor parity. Two low-severity robustness items are deferred: deleting the runtime cwd can produce an uncaught fail-closed traceback before prepare, and a pre-existing regex-based operator-verb allowlist gap does not expose a grant operation.

The rollout only performed `lstat` on the live SQLite store; observed metadata was unchanged, which is not row-level proof. It did not open, hash, copy, restore, or modify that store, and it wrote no legacy ledger, transcript, request, or grant. No existing session was stopped or restarted. A fresh compatible launch is still needed for sessions that loaded older per-launch premium rules.

### Earlier registered-only evidence

The receipts below belong to the earlier `registered-only`, one-project installation and diagnostics update. They remain useful historical evidence, but they do not certify the Task23 mode-aware installer, context hooks, global guidance, or `default-local-root` selection. Independent Opus source review found no blockers in that earlier build. A targeted activation-preserving update then installed it, and Sol ran the post-update deterministic checks below; those execution checks are not a second independent review:

- portable core 218, including its 35-test diagnostics subset; Claude adapter 61; core CLI 57; operator CLI 98; adapter-to-real-core fixtures 36; portable guard 39; legacy guard 182; installer 49; launcher locks 30; and proxy launchers 27, with zero failures, errors, or skips;
- core/controller distribution `b08539d8f0ef946664d17c5105a8f6d06f37c2c2fdae6869d1e633810f6a1ee3`, adapter bundle `d99a4d1e655212292e69a34dfd016b8df88c6bc534b9e641aecfaf6e046f5016`, operator `ce5dd4e58ea919e14c6811a054be45b5c41dea544d196567df76313e9697c3ae`, and unchanged CLI core `9f48d44b8b373256958c840613e5c8e3dff8e7ec0ac6f6e13d3412932f16277b`;
- effective policy `b1ce2a36039a9ae3e1a8d97a6d25e2e40807702147aa79c5aa4a37cbf8119390` and manifest `2f135e8426b6effde44f6b81665998502815ab0ef3c86b7b449438fa7e24b6e1` remained unchanged, as did the single registered-and-activated canonical scope and installed settings;
- no plain budget reinstall or reregistration ran, no request or grant was created, and verified core-installer backups plus a task-specific private backup protect the replaced bytes;
- the live SQLite digest `82d6cff377e0508a946a5b13cb56407f45de6b1cdb921153b5248744f038e7b2` was identical before and after the update, the installer never connected to that live database, and the 144-file one-use state tree retained digest `e3da86d18ea048e0ecc59191a617e216a935fabfb07f8fa24b37dca1241c97b7`;
- installed synthetic outputs separately confirmed a 15-minute request deadline versus a 120-minute post-approval grant, the selected store, corrupt expired-history warnings that do not block a healthy request, and `UNKNOWN` handling for unusable timestamps without an automatic retry.

These historical receipts are separate; the 35-test diagnostics subset is already included in the 218-test core total, and none of the suites should be added into one coverage number. Synthetic controller and real-core outputs are not evidence of a genuine human controller invocation, decision, or grant. The current rollout and actual hook delivery now verify Task23 installation and discovery, but still do not verify ordinary-language model activation, a genuine native approval decision, an active allowance, paid Astra/Fable admission, visible browser observe → act → observe, a public-origin browser visit, or model-budget enforcement by any non-Claude harness. A PATH-only check not finding another harness is not proof of machine-wide absence or incompatibility; generic CLI/browser callability is not a model-enforcement claim. Task23 installation/discovery closeout is complete; the final documentation checks passed.

## Source contract

The frozen wire and Python contract is [`profiles/agent-permissions/API-CONTRACT.md`](../../profiles/agent-permissions/API-CONTRACT.md). It remains authoritative for field names, error codes, clock liveness, exact binding comparisons, overlapping ceilings, receipts, host claims, and the six-operation public surface.
