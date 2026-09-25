---
name: delegation-advisor
description: Advises when and how to delegate, including task-shape model selection, quota pressure, worker contracts, and Fable delegate-first orchestration. Use for complex tasks, codebase exploration, research, implementation planning, or worker-model routing.
title: Delegation Advisor
stratum: 2
branches: [agentic]
---

# Delegation Advisor

## Purpose

Choose whether to delegate, what bounded worker shape to use, and the weakest model tier that can complete the work reliably. This skill is the detailed reference; always-loaded `CLAUDE.md` rules are the must-fire trigger.

## Operating modes

### Ordinary sessions

Delegation is discretionary. Ask first when the user's preference materially changes the approach, especially when a fresh worker would add cost or latency without obvious context savings. Direct handling remains valid for simple, already-loaded work.

### Fable top-level orchestrator mode

Routine bounded execution is delegate-first and does not need repeated per-worker permission questions. Fable retains requirements, decomposition, contract freezing, sequencing, approvals, conflict resolution, synthesis, and final communication. Delegate substantive search, multi-file reading, research, edits, implementation, tests/builds, debugging, and independent verification.

Direct execution is limited to genuinely atomic glue, approval/guard handling, unavailable-worker recovery, or an explicit request to work directly. Existing gates remain sovereign: fan-outs above 15, dynamic Workflow approval, destructive or outward-facing actions, lane changes, and every Fable worker launch.

Top-level sessions may delegate. A delegated worker is always a leaf: it must not invoke Agent or Workflow tools and returns bounded evidence to the top-level orchestrator.

## Portable permission routing

Exact one-use `approve-agent` / `approve-workflow` grants remain the default and the normal pre-charge fallback. When installed support permits, a human-approved time/model/count-bounded portable allowance is also a standing option for eligible explicit model-budget Workflows and premium direct Agents; keep both options in view when planning without repeatedly offering one or treating explanation as preparation or approval. The distributable policy stays disabled, `registered-only`, and unscoped. A portable allowance becomes eligible only when reviewed installed support is enabled, its configured mode admits the canonical workspace, the caller is the verified current top-level root session, and the exact route still matches a genuine-human-approved live grant. `registered-only` keeps exact registry-plus-activation eligibility; `default-local-root` admits a verified local root without enrollment unless a disabled registry match or installed subtree opt-out excludes it. Do not infer that mode from source files or a rider: wait for installed guard context.

On a time-only or blanket Workflow approval request, explain the conditional bounded allowance alternative for eligible explicit model-budget Workflows (including routine-only budgets); `inherit-launcher` dynamic Workflows still need exact one-run approval. Restate supplied terms, verify meter/route from installed context, and clarify only missing human-controlled terms (task boundary, models, minutes, total workers, and any premium per-model ceilings) before preparation; do not infer unlimited scope or choose/add models. If the guard just issued a Workflow nonce, stop that turn; do not retry, substitute, or switch paths without explicit human direction on a later turn. When the user asks for a bounded future envelope—for example, “Let this session use Astra for two hours”—the compatible top-level session restates the purpose, meter, exact model mix, duration, total-worker ceiling, per-premium-model ceilings, and task boundary. The source maxima are 120 minutes, 15 total workers, and 6 per premium model, still subordinate to ordinary 15/80 admission caps and >15 disclosure. Use the exact shlex-quoted `--project-root` and `--transcript` arguments supplied by the installed `SessionStart` / `UserPromptSubmit` guard context. If those arguments are genuinely unavailable, use an exact host-supplied transcript path. An unregistered `default-local-root` session cannot be discovered from a Claude Code `/status` session ID: `context`, `status`, and `request` require the exact transcript, with no manual registration needed in the normal flow. Only an already registered project with a recorded project directory may use its current `/status` session ID as a manual fallback. Run the operator from the current workspace. For an unmatched `default-local-root` session only, process cwd must exactly match `--project-root`; a stale or different project root refuses before prepare, and current process cwd plus hook payload `cwd` establish project identity while historical transcript cwd does not. Registered projects retain legacy behavior. Never decode a project slug, pick the newest JSONL, search transcript content, infer an ancestor namespace, auto-enroll a project, or hand-build context IDs/hashes. The context hook and operator `context` / `status` verbs are read-only; none prepares a request. The human alone starts `agent-permissions-controller` and clicks Approve or Deny. No agent starts or clicks it, auto-grants, or renews.

Availability, registration, activation, and a live allowance do not authorize a task or wave, relax leaf rules, raise 15/80 caps, waive >15 disclosure, or change route/source/dispatcher validation, provider preflight, containment, or higher-priority instructions. Each root session has its own derived core context; project-session permissions do not transfer. Model-budget Workflows reserve the full total plus independent overlapping premium ceilings before admission. A leaf worker never requests or spends an allowance on its own and never starts the controller. Before any portable charge, unusable allowance state may produce an explicitly labeled ordinary one-use card with zero charges. After a charged pending reservation, failure is a hard denial with no card or refund. Do not retry-loop or switch lanes implicitly. See `02-stack/01-ai-coding/portable-agent-permissions.md`.

Browser permission is a separate grant kind. For an ordinary-language browser request, a compatible top-level session uses the installed `browser-bridge-request` to prepare exact origins, operations, selectors, duration, and counts; the human decides in the same controller; `browser-bridge` acts only under that grant; and `stop-browser-bridge` performs owned cleanup. A model allowance never grants browser origins, credentials, account state, or blanket desktop access. Other shell-capable local agents can use the harness-neutral core CLI/JSON and governed browser interface if they are installed, but the Claude-specific project operator is not a generic adapter, and no automatic guidance loading or model-budget enforcement is claimed for an unintegrated harness.

## Task-first routing table

“Cost” means quota pressure on the active refill pool, fan-out width, expected tokens, latency, and return size—not nominal API dollar price.

| Task shape | Default bounded delegate | Escalate when | Quota-pressure rule | Example / return contract |
|---|---|---|---|---|
| **Search / research** | Sonnet for scoped gathering and evidence synthesis; Haiku for narrow extraction | Sources conflict, adversarial validation is needed, or findings affect architecture or security | Prefer the Anthropic 5h pool for gathering when available; weekly Sol capacity is deliberate | Return relevant paths/sources, uncertainties, and a concise evidence synthesis |
| **Implementation / coding** | Sol for frozen, bounded implementation and deterministic tests | Consequences cross subsystems, contracts are incomplete, security is involved, or integration judgment dominates | Sol spends the weekly Codex pool; on a native-only Claude lane that cannot route Sol, use available Opus | Implement the frozen scope; return changed paths, tests, and deviations |
| **Language / ecosystem** | Sonnet gathers ecosystem documentation, conventions, and compatibility evidence | Choosing the architecture, security boundary, or consequential interop approach requires judgment | Capability fit comes first; keep gathering separate from implementation authority | Cite sources and unsupported assumptions; hand code ownership to Sol or Opus as the lane permits |
| **Debugging / repair** | Sol for bounded reproduction and deterministic repair; Opus for difficult debugging | The failure is cross-system, nondeterministic, security-sensitive, or bounded Sol attempts fail | Stop on route/quota failure; never retry-loop against an exhausted lane | Reproduce, isolate root cause, make the smallest repair, and return evidence |
| **Architecture / design** | Opus | The task contains a separately bounded hard problem that genuinely requires an Astra or Fable peer | Premium peers require the existing per-launch approval and bounded justification | Compare constraints and alternatives; return a recommendation and rejected options |
| **Verification / evidence** | Sol runs deterministic checks; Sonnet gathers outputs and evidence; Opus performs independent review | Interpretation is ambiguous, the decision is consequential, or failures cross architecture/security boundaries | Fresh reviewer context matters; reserve Opus for independent judgment rather than routine extraction | Separate observation from inference; report failures and repair candidates without self-certification |
| **Mechanical / bookkeeping** | Haiku | Supposedly mechanical work reveals ambiguity | Minimize quota pressure and return size | Update inventories or metadata without redesigning content |
| **Closeout / synthesis** | The top-level orchestrator synthesizes; Sonnet or Haiku prepares evidence, and Opus reviews consequential work | Astra/Fable main must resolve cross-worker conflicts or a hard peer task is separately justified | Preserve orchestrator context for user-visible decisions | Worker returns a status/evidence table; the top-level orchestrator makes the integrated judgment |

These are operating defaults for this environment, not universal model benchmarks; no tier is infallible. They are capability defaults, not permission to escape a launcher contract:

- A launcher model lock wins. If the required capability is unavailable, stop and recommend a lane change rather than silently violating it.
- Sol performs bounded implementation and deterministic tests, but it spends the weekly Codex pool with no short-cycle refill.
- A native-only Claude lane cannot select Sol; use available Opus for bounded execution rather than inventing a provider route or weakening preflight, defaults, or containment.
- A flexible lane may leave its guard lock unset; inspect the requested/resolved worker model rather than inferring cost from one environment variable.
- Opus is the per-invocation default for consequential design, difficult debugging, and independent review, and it spends the Anthropic 5h pool.
- Astra and Fable must never become standing routine-worker frontmatter. For each premium peer worker, state the bounded hard problem, why Sol, Sonnet, and Opus do not fit, expected quota pressure and scope, then obtain the existing per-launch approval.
- Project instructions may adapt tasks, conventions, and evidence requirements; they do not override global safety rules, model locks, route eligibility, or approvals.

## Worker contract

Every delegated prompt should specify:

1. **Read first** — ordered authoritative context, not a whole repository dump.
2. **Bounded role and authority** — one role, one deliverable, and the decisions the worker may or may not make.
3. **Allowed and prohibited writes** — one owner for every shared file.
4. **Frozen inputs** — briefs, hashes, interfaces, fixtures, or acceptance facts.
5. **Local adapter** — project tasks, conventions, and required evidence, without overriding global safety, model locks, route eligibility, or approvals.
6. **Acceptance commands** — what proves completion.
7. **Stop conditions** — open decisions, route/auth/quota failure, unexpected model, or scope conflict.
8. **Leaf rule** — “Do not spawn sub-agents or invoke Agent/Workflow tools.”
9. **Return schema** — concise findings, changed paths, evidence, deviations, and unresolved questions.

Builders should not self-certify runtime, visual, security, or consequential correctness claims. Sonnet may gather and organize verification evidence but does not serve as the final independent reviewer; assign Opus independent review and keep repair as a separate bounded role.

## Execution shapes

| Need | Mechanism |
|---|---|
| One bounded search or implementation task | Direct `Agent` call with an explicit role/model where the lane permits |
| Up to six mutually independent tasks in one phase | Registered `bounded-parallel` workflow |
| Dependencies, pipelines, barriers, conditional stages, synthesis, or split build/verify/repair roles | Task-specific bounded `scriptPath` with one-run approval |
| Wide research using the established graph | Registered bounded deep-research workflow, preferably on the faster-refilling lane |

Never substitute a reusable workflow when the task needs a different graph. Workers never recursively delegate; orchestration stays at the top level.

## Quick task-to-agent reference

| Task | Suggested worker |
|---|---|
| Locate code or trace behavior across files | `Explore` |
| Design a multi-file implementation | `Plan` |
| Execute a bounded implementation or repair | `general-purpose` or the relevant specialist |
| Audit this workflow scaffold | `workflow-expert` |
| Create a project structure | `seacow-scaffolder` |
| Create a skill or agent definition | `skill-writer` / `agent-writer` |
| Capture a workflow improvement | `improvement-logger` |

## See also

- `profiles/claude-global/CLAUDE.md` — must-fire budgets and Fable orchestration rule
- `02-stack/01-ai-coding/context-window-engineering-and-delegation.md` — context, quota, and wave rationale
- `02-stack/01-ai-coding/claudex-codex-models-via-cliproxyapi.md` — launcher/provider matrix
- `.claude/ARCHITECTURE.md` — context funneling and worker return contracts
