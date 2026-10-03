---
title: Guest-session permission kind
description: Draft contract for a human-approved guest_session permission kind governing five sandbox computer-use tools, immutable Podman container identity, per-call containment attestation, root-session binding, independent action and observation budgets, and owned proxy cleanup.
stratum: 2
status: draft
tags:
  - stack
  - ai-coding
  - computer-use
  - sandbox
  - permissions
  - security
date: 2026-10-02
---

## Decision

**Add `guest_session` as a separate permission kind, enforced by a persistent host proxy at `cu-sandbox mcp-launch`.** Approve one verified, running guest instance for one verified root session, bounded time, and bounded actions/observations. Do not widen `desktop_session`, reuse its window policy, or treat a successful startup verification as ongoing authorization.

This is a proposed contract for the permission-core owner, not implemented behavior or a grant. Routine guest use remains blocked until the core kind, truthful approval card, trusted session binding, and per-call host enforcement are implemented and reviewed. Existing desktop, browser, and model permissions remain separate; only the human approves through the native controller.

## Implementation status — 2026-10-02

The persistent host stdio mediator and exact-ID pre-call/post-response drift checks have landed in `profiles/cu-sandbox/bin/cu-sandbox`. It validates the five-tool boundary, withholds results on failed containment attestation, and reaps its guest MCP child. Default operation remains an explicitly ungoverned trial; `--require-grant` refuses every tool call and performs no grant lookup. The `guest_session` permission-core kind and authenticated root-session transport remain open. The proposed authorization contract below is not implemented by this mediator.

## Existing seams and limits

Repository-relative citations below identify the source seams; proposed behavior is explicitly described as new.

- **Kind registration and counting:** `profiles/agent-permissions/agent_permissions/schema.py:KINDS`, `HOST_CLAIM_KINDS`, `COUNTED_STEP_KINDS`, `normalize_terms`, and `normalize_units` explicitly dispatch current kinds. Registering a fourth host-claimed, step-counted kind can reuse the existing action/observation units. `profiles/agent-permissions/agent_permissions/core.py:PermissionCore._counters` selects reservations by grant ID; `PermissionCore._check_ceilings` refuses an over-budget reservation in full. A new kind is not accepted today.
- **Approval identity:** `profiles/agent-permissions/agent_permissions/core.py:PermissionCore.prepare` hashes normalized terms, kind, context, route, policy, purpose, and a fresh request ID. `PermissionCore.commit_grant` checks controller authority, full request digest, stored validity, and no live same-context/same-kind grant. Reuse this pipeline, not a new grant API.
- **Ownership and consumption:** `profiles/agent-permissions/agent_permissions/core.py:PermissionCore._verify_binding`, `PermissionCore.claim_host`, `PermissionCore.reserve`, and `PermissionCore.receipt` provide exact binding equality, one owning host, paired grant pins, atomic charges, payload-bound idempotency, and current receipt authorization. They do not inspect containers or execute tools.
- **Human presentation:** `profiles/agent-permissions/agent_permissions/controller.py:ApprovalController.decide` presents a pending view and commits that view's digest. `profiles/agent-permissions/agent_permissions/renderers.py:render_terms_text` places reversibly escaped enforced fields before unverified purpose. Add an explicit guest branch in `_render_enforced_terms`: its current fallback assumes browser terms.
- **Session derivation precedent:** `profiles/agent-permissions/adapters/claude_code/identity.py:resolve_context`, `derive_core_context_id`, and `binding_fingerprint` derive verified root/workspace facts rather than decoding a project slug or trusting a description. This is an allowance-adapter precedent, not an existing guest identity channel.
- **Consumer precedent, not a drop-in:** `profiles/desktop-bridge/lib/core-permission.mjs:CorePermissionGate.create`, `assertAuthorized`, `reserve`, and `confirmReservation` demonstrate status → claim → per-step status/reserve/receipt checks. Their kind and terms validation are desktop-specific. Implement the equivalent guest boundary without importing desktop policy or editing desktop-bridge.
- **Current sandbox boundary:** `profiles/cu-sandbox/bin/cu-sandbox:Sandbox.contract`, `Sandbox.verify`, `TOOLS`, and `MCP_BOOTSTRAP` check containment and narrow the server to five tools. `Sandbox.mcp_launch` verifies once and then replaces the host with immutable-ID-bound `podman exec`. It leaves no host mediator for permission checks. `Sandbox.mcp_config` freezes configuration, not an approved container identity.

## Proposed terms: exact target, capabilities, and ceilings

All fields below are required; unknown fields are rejected, lists have unique entries and canonical order, and identity fields have no wildcards. `imageDigest` is explicitly nullable, not omitted. The adapter derives target/attestation fields from trusted host inspection, never model-authored JSON. The core validates their shape and policy; the adapter validates their truth.

| Field | Proposed v1 meaning |
|---|---|
| `termsVersion` | Integer `1`. |
| `containerId` | Complete lowercase 64-hex Podman ID, obtained from verification; never a shortened ID or name alias. |
| `containerName` | Exact inspected name, normalized once without Podman's leading slash; diagnostic identity, not dispatch authority. |
| `containerStartedAt` | Exact inspected start-generation timestamp. A restart of the same ID invalidates approval, not just recreation. |
| `imageId` | Canonical `sha256:<64-hex>` local image configuration ID from the actual container and host image inspection. |
| `imageDigest` | Verified `sha256:<64-hex>` manifest digest, or `null` for a local build with no verified manifest digest. Never substitute a tag or invent a digest. |
| `networkName`, `networkId` | Exact internal bridge name and immutable inspected network ID. A same-name replacement is different scope. |
| `tools` | Exactly the sorted five-tool set listed below; no aliases, vendor extensions, or policy-added tools. |
| `captureScope` | Only `full-guest-desktop`: guest screen and accessibility tree, never a host capture. |
| `safetyContract` | Strict object `{version: 1, profileDigest, facts}` described below; `profileDigest` is `sha256:<64-hex>`. |
| `minutes` | Integer `1..60`, starting at approval, with policy allowed only to reduce the ceiling. |
| `maxActions` | Integer `1..40`; independent guest action ledger. |
| `maxObservations` | Integer `1..60`; independent guest observation ledger. |

The proposed ceilings are conservative pilot choices, not existing guest defaults. They follow the source-ceiling pattern in `profiles/agent-permissions/agent_permissions/schema.py:DESKTOP_MAX_MINUTES`, `DESKTOP_MAX_ACTIONS`, and `DESKTOP_MAX_OBSERVATIONS`; guest constants and guest policy checks must be added separately. No approval stacks, auto-renews, refunds failed calls, or inherits another host's unused budget.

| Tool | Reservation before forwarding |
|---|---|
| `computer_click` | `{actions: 1, observations: 0}` |
| `computer_type` | `{actions: 1, observations: 0}` |
| `computer_press_key` | `{actions: 1, observations: 0}` |
| `computer_screenshot` | `{actions: 0, observations: 1}` |
| `computer_get_accessibility_tree` | `{actions: 0, observations: 1}` |

One admitted tool call is one unit, including a tool failure. A tool that returns an extra screenshot/tree also charges an observation; otherwise strip/refuse that extra observation. Validate the actual schemas and result shapes before releasing v1. Initialization must not perform hidden user actions or captures. Protocol-only initialize/ping/tool-list messages consume no unit and confer no execution authority.

### Host-owned safety attestation

**Extend `verify --json`; do not hash its entire current response.** Today `Sandbox.verify` returns `ok`, `container`, `container_id`, check booleans, and diagnostic details, with some image-dependent checks. It is not a complete versioned target attestation. New output must expose the terms' target identities and a strict, stable `safetyContract` projection alongside separate fresh check results.

Required `facts` keys and values:

- `rootless: true`, `privileged: false`, `guestUid: 1000`, `noNewPrivileges: true`.
- `memoryBytes: 4294967296`, `cpuNano: 2000000000`, `shmBytes: 536870912`.
- `internalNetwork: true`, `networkDriver: "bridge"`, `egressBlocked: true`; exactly the approved network attachment.
- `share: {source, destination: "/trial-share", readOnly: true, soleBind: true}`; `source` is the exact canonical host directory. No runtime socket, home directory, or additional bind is admitted by this profile.
- `ports`: exactly two `{guestPort, hostAddress: "127.0.0.1", hostPort}` entries, for guest ports `6901` and `8000`; host ports are approved integers `1..65535`, distinct, with no additional bindings/listeners.
- `telemetryEnabled: false`, `clipboardToGuest: false`, `clipboardToHost: false`, `primaryClipboardEnabled: false`, `modelKeysPresent: false`.
- `toolset`: the exact five names; `toolSchemaDigest`: canonical digest of the approved tool schemas; `accessibilityBackend`: `"stub"` or `"at-spi2-dbus"`, pinned to the verified image/profile and clearly displayed.

Reject unknown/missing facts or failed required checks. Hash `{version, facts}` using the canonical algorithm in `profiles/agent-permissions/agent_permissions/canonical.py:canonical_json` and `digest_of`. Runtime target identity is separately pinned by the terms. Exclude timestamps, readiness duration, error text, screenshot pixels, and mutable accessibility content from this stable digest; keep those in bounded diagnostics, not the grant.

The host recomputes the projection and independently evaluates required checks at preparation, pickup, and **every fresh call**, including observations. Check names/counts must come from the installed versioned profile, not the response's own inventory: “all returned booleans are true” can hide a missing check. Reject an unrecognized verifier/profile version. Guest probe output is supplementary evidence, not an authority signature; inspect rootless runtime/network/mount/port/kernel facts from the host. Full guest compromise can falsify in-guest probes and results.

## What the approval controller shows

Add a dedicated card headed **“Sandbox guest desktop — not your real desktop.”** In the enforced portion, show:

1. Exact guest name, complete container ID, start generation, image ID, manifest digest or “local image; no manifest digest,” and network name/ID.
2. All five tool names, full-guest capture semantics, accessibility backend, action/observation mapping and budgets, minutes from approval, and no renewal/transfer.
3. All safety facts and profile digest, with exact share source/destination and both loopback bindings. Distinguish host-inspected facts from guest-probed evidence. Offer no unsupported promise that a compromised guest is trustworthy.
4. Exact workspace, root session identity/name, host/runtime binding, route/version, request ID, and request digest using the common reversible display rules.
5. Stop behavior and trust limits: GUI typing may execute code **inside the guest**; the grant admits no host shell, real-desktop input/capture, browser grant, network opening, clipboard, or model inference. A read-only share prevents writes, not reading sensitive files mounted there.

Only then show the quoted unverified purpose. Unknown kinds must fail closed rather than fall through to a browser card. Workspace-scoped review needs a `guest_session → workingDirectory` entry in `profiles/agent-permissions/agent_permissions/controller_cli.py:_request_workspace_path`. Keep the existing native decision pipeline; do not add guest to `profiles/agent-permissions/adapters/claude_code/chat_approval.py:CHAT_KINDS`.

## Session binding and cross-kind isolation

Use one verified top-level root-session context and exact canonical working directory. The guest adapter must receive an authenticated host-supplied session locator and derive it through the reviewed root-session identity seam above. Preparation and MCP launch independently verify the same identity. Never select a transcript by newest file, decode a project slug, accept a model-supplied session claim, or rely only on UID plus workspace.

Proposed fingerprint keys: `projectKey`, `sessionKey`, `projectRoot`, `sessionName`, `workingDirectory`, `uid`, `hostBootId`, and `engineStoreDigest`. Derive `engineStoreDigest` from the canonical local rootless Podman executable/storage identity; disallow remote Podman endpoints. Route keys identify the guest adapter, adapter/verifier versions, and installed enforcement-code digest. Respect the core's bounded string-map limits; refuse overlong facts, never truncate them. Extend the identity helper only through owner review; its allowance-specific policy/role rules must not silently become guest rules.

The request handle records request identity/context only, in a guest-only private runtime directory, with exclusive creation, descriptor-based nonsymlink reads, owner/mode/size checks, and bounded scanning. It is not a bearer grant. Pickup asks the core for the exact kind and binding, checks request ID plus grant ID/fingerprint, and claims with a fresh random host identity **before** spawning/exposing the guest child. Refuse zero or multiple matching grants; never choose the newest. A restarted proxy needs a new grant.

`PermissionCore._verify_binding`, `claim_host`, and `reserve` cited above supply comparison and ownership, not verification of the calling harness. An unforgeable root-session transport is a release prerequisite; a copied handle or caller-chosen environment variable alone is insufficient. The prototype must fail closed if that identity cannot be established.

A guest consumer hardcodes `kind=guest_session`; the real-desktop consumer keeps `kind=desktop_session`. Their grant IDs, host claims, runtime directories, counter ledgers, tools, and target validators differ. Never translate kinds or fall back to a desktop grant. Even equal workspace facts cannot change the kind authenticated in approval/reservation. Test cross-kind pins, not merely differently named directories.

## Per-call enforcing consumer

Replace the final `os.execvp` in `Sandbox.mcp_launch` with a persistent guest-only stdio mediator. Preserve the existing rootless safety checks and `MCP_BOOTSTRAP` narrowing. Spawn `podman exec` only against the approved **full ID**, never a second name-based dispatch. Do not expose the raw child channel as an alternate MCP endpoint.

Serialize calls; each fresh call follows this order:

1. Verify current root-session/runtime binding and read core status. Require the pinned request/grant/fingerprint, owning host claim, live terms, and installed policy/enforcement digest. A changed fingerprint, including narrowing, closes this pilot session; it is not silently accepted as a replacement grant.
2. Inspect the approved ID directly. Require `Running=true`, unchanged `StartedAt`, exact image ID/digest, name→ID mapping, network name→ID mapping/attachment, and full approved safety projection. Re-resolve the configured image reference: a changed tag resolution also closes the session; it cannot retarget the grant. Perform all mandatory live checks against the ID. Replace name/port-only readiness trust with ID-bound endpoint attribution.
3. Require an allowlisted tool and pinned schema. Strictly validate bounded text, key names, coordinates, and arguments. Reject backend selectors, host paths, container overrides, shell/API passthrough, unknown MCP methods, sampling/elicitation, and nonallowlisted guest notifications. Keep guest content out of control-plane messages.
4. Reserve the mapped units with paired grant pins and the host identity. Use a guest-prefixed, proxy-owned idempotency key. Bind scalar payload fields `operation`, `argumentsDigest`, `containerId`, `containerStartedAt`, and `profileDigest` to the exact forwarded call. Hash arguments, not raw typed text, into the receipt; `profiles/agent-permissions/agent_permissions/schema.py:normalize_payload` accepts bounded scalars/scalar lists, not arbitrary nested arguments.
5. Check `receipt.authorizationCurrent=true` and exact receipt/request/grant/payload identity; then immediately recheck target generation, essential containment facts, and event-watch health before dispatch. Do not forward after any discrepancy. Preserve the charged receipt on failure; there is no refund.
6. Forward only to the owned ID-bound child. Bound output/time, validate result shape and observation count, then recheck authorization/target before releasing results. If authorization ended, suppress new observation delivery and report failure, not success. Already-executed actions cannot be undone.

Subscribe to target/network lifecycle events, reject an unhealthy/disconnected event stream, and invalidate on stop/start, removal, rename, network replacement, or relevant mutation. Owned reset/down/image-maintenance commands take the mediator's lock and invalidate authority before changing state. No reset/recreate, restart, image swap, or same-name reattachment inherits approval; safe replacements still need fresh preparation and human approval.

**Proof boundary:** these are fresh host-verifiable snapshots and fail-closed generation checks, not a continuous cryptographic proof. Podman inspection, guest probes, core authorization, and side effects are not one transaction. Event watching and serialized owned maintenance narrow races but cannot defeat a malicious concurrent same-UID host administrator or fully compromised runtime. If a required drift check cannot be implemented reliably, keep the affected capability blocked rather than claiming “verified at every call.”

## Expiry, revocation, replay, and Stop

Reuse `profiles/agent-permissions/agent_permissions/clock.py:build_envelope` and `check_envelope` for approval-started wall/monotonic/boot-bound lifetime; reuse `profiles/agent-permissions/agent_permissions/core.py:PermissionCore.revoke` for owning-context revocation. Request TTL is not grant lifetime. The core denies new reservations; it does not kill a process or revoke an already-executed side effect.

The guest mediator adds a local deadline and a bounded live authorization watchdog (proposed one-second polling). It stops fresh admission synchronously on an authorization/containment failure, closes the guest child transport, empties tool listing, and discards replay/result caches. Core outage or an unverifiable clock is denial, not offline grace. Idle revocation detection is bounded by polling; fresh calls always recheck. Exhaustion of either budget closes the pilot rather than leaving a misleading active tool list.

Owned Stop first disables forwarding, then attempts exact-grant revocation, terminates only its verified child/process group, clears its private handle/run/cache, and reports any revocation failure. Shutdown/stdin EOF/signals/child exit use the same idempotent path. Check UID, process start time, process group, and expected target argv before signaling. Never signal by container name or broad process match. **Stop closes the agent's channel, not the guest container or human's desktop.** Container down/reset remain separate explicit management commands. Host-only watchdog/cleanup probes cannot inject GUI input and run under the installed containment profile, not an agent tool grant.

For replay, `PermissionCore.reserve` and `receipt` above provide nonduplicating charges/current standing, but not exactly-once guest execution. Never automatically repeat an action after an ambiguous child timeout/disconnect. A previously completed logical call may use its prior result only while current binding, authorization, and containment still pass; otherwise deny, including cached screenshots. A recovered historical receipt is not fresh authority. Proxy restart cannot reclaim another host identity or reuse remaining budget.

Guest narrowing initially permits only reducing `maxActions`/`maxObservations` without falling below spent counts; all target/safety/tool/lifetime fields remain fixed. Changing any of those requires revocation and a new approval. Add that strict branch to `profiles/agent-permissions/agent_permissions/schema.py:normalize_narrow`; the consumer's changed-pin shutdown still applies.

## Threat model and fail-closed outcomes

| Threat/failure | Required boundary |
|---|---|
| Agent fabricates an approval object, receipt, or handle | Treat local/model objects as hints only; query core authority, verify complete binding/pins/receipt, and require owning host claim. The agent cannot call a grant API. |
| Another session in the same workspace copies a handle | Verified root-session identity must differ before pickup; exact binding and single-host claim prevent legitimate concurrent consumers sharing authority. Caller-supplied identity is not proof. |
| Replay across guests/kinds, ID/name substitution, restart/reset | Kind, ID, image/network identities, generation, attestation digest, arguments digest, and per-host keys are pinned; mismatch closes admission without retargeting. |
| Compromised guest sends forged checks or extra tools | Host owns enforcement/core state; no grant files, runtime sockets, writable host bind, or model keys in the guest. Host checks containment independently; guest probes/results remain untrusted. Reject unexpected protocol/control messages. |
| Screenshot/tree contains “approve,” shell, or credential instructions | Observation content is untrusted task data, never approval, policy, session identity, or tool arguments. The human controller decision cannot be supplied by screenshot text. |
| Contract drift, malformed/partial JSON, unknown schema/verifier, unavailable inspect/core/watch, ambiguous grants, exceeded limits, clock failure | Refuse dispatch; deactivate and clean up the owned channel. No unsafe fallback, guessed defaults, grace period, auto-approval, or receipt-based revival. |

Trust the installed host enforcer, native controller/core store, root-session identity channel, rootless runtime, and host kernel. This permission kind does **not** sandbox unrestricted host Bash, a same-UID process capable of altering the trusted installation/store, a stolen human account, or container/kernel exploits. Do not advertise ledger fingerprints as protection against those principals. Loopback viewer/API access by unrelated host processes is also outside the grant; the proxy cannot govern direct access it does not mediate.

## Minimal implementation plan by owner

**Permission core owner**

1. Add `guest_session` constants/classification, strict terms/policy ceilings and reduction-only narrow handling in `schema.py`; export the new constant/helpers in `agent_permissions/__init__.py`. Keep shared prepare/status/claim/reserve/receipt/revoke behavior and per-grant storage unchanged, using the cited core seams.
2. Add `schemas/guest_session-terms-v1.json`; update kind enums, term selection, policy limits, host-claim descriptions, and narrowing in `request-v1.json`, `policy-v1.json`, and `response-v1.json`. Reuse their single action/observation `units` branch, not a duplicate `oneOf` branch.
3. Add the guest renderer and workspace attribution; document the fourth kind and adapter responsibilities in `API-CONTRACT.md`. Keep native human approval, request digest verification, and private controller authority unchanged. Do not add chat approval or a public grant/pickup API.
4. Review the trusted root-session adapter seam and caller transport with the sandbox owner. No new DB table or canonical hashing algorithm is proposed.

**cu-sandbox owner**

1. Add versioned ID-targeted attestation output and required-check inventory; preserve every existing containment invariant. Add a pending-request preparation command and private guest handle schema, without approving anything.
2. Implement the persistent mediator, verified root identity, grant pickup/host claim, strict five-tool protocol/argument gates, per-call attest/reserve/receipt/dispatch pipeline, and replay ambiguity handling. Keep rootless immutable-ID child launch and bootstrap allowlist.
3. Add lifecycle event invalidation, local/watchdog shutdown, and owned Stop; make reset/recreate/image maintenance invalidate before mutation. Update MCP configuration/CLI documentation so raw ungoverned launch is not presented as routine use.

**desktop-bridge owner: no changes.** Preserve its kind, window-only captures, input classes, pending/runtime state, and real-desktop approval contract. Consumer precedents are design references, not permission to refactor that owner's package. `browser_session` and model allowances likewise stay unchanged.

## Acceptance tests and rollout gate

Tests below are future work; this proposal performs no grant simulation, controller launch, container execution, or live smoke test.

- Core/schema parity: reject unknown fields/kinds/tools, malformed/short IDs, tag-as-digest, absent checks, altered safety facts, excessive ceilings, widening, expired requests, and incomplete display. Update schema inventory/parity fixtures and workspace-scoped review; add guest cases alongside `profiles/agent-permissions/tests/test_desktop_session.py`.
- Isolation/counts: test all six pairings among the four kinds; guest↔desktop pins/claims/receipts fail in both directions. Verify one host, no stacking, independent ledgers, no charge on rejected reservations, exact replay without recharge, changed arguments/grant conflicts, reduction preserving spent counts, and restart requiring fresh approval.
- Runtime mediation with offline fakes: zero/multiple grants, copied same-workspace handle from another root, unverified session locator, core timeout, corrupt receipt, malformed guest JSON, tool/schema drift, unexpected methods, extra observations, and output/time bounds all prevent forwarding/delivery.
- Generation/drift with deterministic fake Podman/event data: same name/new ID; same ID/new `StartedAt`; changed image tag/config/manifest; replaced network ID; share/ports/resources/clipboard/telemetry drift; missing probe; disconnecting event watcher; replacement between check, reservation, dispatch, and result. Never reattach or keep cached observations available.
- Lifecycle/recovery: wall/monotonic expiry, reboot, revocation while idle and during a call, budget exhaustion, signal/EOF/child exit, cleanup PID reuse, failed revoke, and ambiguous action timeout. Prove bounded closure and no wrong-process/container kill or duplicate action.
- Only after owner review and separate human authorization: human-native approval against an actual guest, run representative tools, then reset/image/expiry/revocation/Stop checks. Re-run the full containment suite before and after replacement; the reported 22/23-check scout smoke is context, not evidence that this permission flow works.

## Open decisions before implementation

1. Who provides the authenticated calling-root identity to request preparation and MCP launch? Until that transport is demonstrated, another same-workspace session cannot be securely distinguished and release stays blocked.
2. Confirm source ceilings `60/40/60`, one-second idle revocation polling, close-on-either-budget exhaustion, and close-on-any-narrowing. These choices favor a small pilot over seamless continuation.
3. Freeze attestation/tool-schema canonicalization and manifest-digest acquisition. A local image ID is required even when no manifest digest exists. Decide whether real accessibility is mandatory or the card may explicitly grant a stub backend.
4. Determine which mutable clipboard/backend/egress facts can be independently re-attested and hardened against guest tampering; measure per-call full verification cost without replacing it with startup-only authorization. Specify readiness endpoint attribution and event-watch race limits.
5. Confirm owner boundaries and controlled live test authority. This document does not request, approve, or activate any permission and makes no claim of independent security approval.
