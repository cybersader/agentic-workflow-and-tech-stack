---
title: Governed desktop computer use
description: Operating guide for permission-bound GUI computer use on a KDE Plasma Wayland host — the computer-use-linux MCP server behind a desktop-bridge proxy, a desktop_session grant approved by the human, window-targeted captures, bounded pointer arguments, and owned cleanup.
stratum: 2
status: research
tags:
  - stack
  - ai-coding
  - computer-use
  - mcp
  - wayland
  - permissions
  - security
date: 2026-09-13
branches: [agentic]
---

Desktop computer use here is **an MCP server behind a permission proxy**, not a vendor desktop app. Claude Code talks to `desktop-bridge mcp`, registered under the MCP server name `computer-use-linux`; the proxy talks to the real [`agent-sh/computer-use-linux`](https://github.com/agent-sh/computer-use-linux) binary it spawns as a child. Every tool call is checked against one human-approved `desktop_session` grant in the harness-neutral permission core, charged to that grant's own counters **before** the side effect, and refused when it falls outside.

> [!note] Build reviewed and calibrated; the governed pilot has not run
> The §5a smoke test on 2026-09-13 exercised the **raw binary** on this host and settled its real protocol shapes. The governed §5b pilot — a prepared request, a human approval, and a tool call through the proxy — has not happened. Nothing below claims an end-to-end governed desktop session succeeded.

Model-worker allowances are a different permission kind with different counters: see [Portable agent permissions](./portable-agent-permissions.md). The browser equivalent of this document is [Persistent browser bridge](./browser-automation-pilot.md).

## What it is

Three permission kinds now share one core: `model_allowance`, `browser_session`, and `desktop_session`. Three ledgers, three cards, three separate human decisions. **An approved model allowance authorizes worker admission and nothing else** — no window, no pointer, no capture, no shell. A live desktop grant equally admits no Astra or Fable worker, and no browser step.

The pieces:

- `~/.local/bin/computer-use-linux` — the upstream Rust stdio MCP server, **never registered as an MCP server itself**;
- `desktop-bridge` — the stdio MCP proxy and the **authority**: it rewrites `tools/list` to exactly the granted operations, validates every argument against the window it verified for itself, reserves a counter before forwarding, and owns the child's process group;
- `desktop-bridge-request` — prepare only; it produces a pending request and never a grant;
- `stop-desktop-bridge` — `/proc`-validated owned cleanup;
- a `PreToolUse` hook on `mcp__computer-use-linux__.*` — the fail-closed backstop for the case where the raw binary is registered directly, bypassing the proxy.

The proxy exists because a hook cannot do the load-bearing work: a hook returns allow/deny and has no transaction with the permission core's counters, cannot hide denied tools from the advertised list, and cannot own a process group.

## Lifecycle: who may do what

1. **The agent prepares one request.** `desktop-bridge-request` reads exactly one strict JSON object, `{purpose, terms}`, on stdin and takes no arguments. The caller cannot supply a policy, a context, a store, an executable, a controller, a grant, `captureScope`, or `anyWindow`. It derives a fresh `ctx-desktop-task-<hex>` context from the canonical working directory and UID, applies this package's source-owned policy, and calls the core's public `prepare`. The result is `pending`. It grants nothing.

   ```text
   printf '%s' '{"purpose":"click into the scratch document","terms":{}}' | desktop-bridge-request
   ```

   Omitted terms take the frozen pilot scope. Because the MCP registration line is fixed, the proxy cannot be told which request the human approved: the launcher writes an owned mode-0600 **binding handle** (a lookup key carrying no grant, no fingerprint, no approval), and the proxy requires exactly one handle to resolve to a live grant — zero refuses, and two or more refuses rather than choosing between two approved sessions on the human's behalf.

2. **The human approves.** The human alone runs `agent-permissions-controller` and clicks Approve or Deny on the displayed card. The agent never starts the controller, never answers it, never renews or extends a grant, and never reads anything on screen as approval. There is no grant phrase.

3. **The proxy becomes the authority.** `desktop-bridge mcp` resolves the grant at startup, mints a fresh host identity, claims the grant, revalidates the **complete** terms against its own policy, and only then spawns the upstream server as a child in its own process group. The child opens the portal handles; the bridge never opens one itself. Tools appear in the session only for the granted operations.

4. **The agent works inside the grant.** Each call re-reads the grant (a grant narrowed mid-session narrows the next call), reads the focused window's identity and geometry from the child, decides scope, checks every argument against that verified window, reserves the counter, then forwards.

5. **Cleanup is owned, and it releases the grant.** `stop-desktop-bridge --session <id>` (or `--list` / `--latest`) validates run id, PID, PGID, process start time, server command, and real UID through `/proc` **before signalling**, `SIGTERM`s the owned group, waits a bounded grace, then `SIGKILL`s that same validated group. No `pkill`, no process-name matching. Killing the child is also how the portal session closes — those handles belong to that process. Pre-existing host services are not touched. Since 2026-09-14 **every** end of the child also calls the core's own `revoke` with the exact context the request was filed under — the CLI, a crash, a ceiling, the proxy shutting down, and an open that fails after the claim — so "the session ended" and "the grant ended" are the same fact. The first cut of that repair released only on the CLI path, reasoning that a crashed child was not the human ending the session and the next proxy would take the grant up; that is impossible, because a host claim is immutable (API-CONTRACT §3.6) and every open mints a fresh host identity, so a second claim is `host_claim_conflict`. A grant left behind is stranded, not handed on. The rule: **any end of the child ends the grant; the next session needs a new approval, and the waiting proxy picks that up without a reconnect.** The release is best-effort and reported in the command's JSON — the child is already dead by then, so an unreachable core (or a grant that had already expired) is logged, not raised.

## Pilot scope and ceilings

The bridge's source policy is deliberately **narrower than the core ceilings**, and a policy that tried to widen them would be rejected — for this kind the ceilings are core-owned, the reverse of the model and browser kinds.

| | Bridge pilot policy | Core ceiling |
|---|---|---|
| Minutes | 30 | 60 |
| Actions | 30 | 40 |
| Observations | 45 | 60 |
| Window allowlist entries | 4 | 16 |
| `anyWindow: true` | refused | allowed by schema, rendered loudly |

The envelope was 15 / 20 / 30 until 2026-09-14 and was raised because the **budget**, not the scope, was what ended real sessions: twenty actions is roughly ten deliberate clicks once each one's refused neighbours are paid for, and fifteen minutes is shorter than the round trip of preparing a request, finding the controller, reading the card and approving it — before any work happens. Each number is still strictly under the core ceiling, which is the only direction a policy may move, and nothing about **what a step may touch** changed.

Input classes in the pilot are `screenshot` and `pointer` only — **no keyboard, no clipboard**, no `set_value`, no `activate_window` (activating a window is precisely how focus moves onto one the human never approved). Default pilot operations are `screenshot`, `get_app_state`, `click`, and `focused_window` — the last so an agent can learn the exact `app_id` and `wm_class` of the window the human has focused instead of guessing one into an allowlist that matches exactly.

**What `focused_window` discloses.** It is metadata, so no window allowlist is asked about it: a granted `focused_window` returns the `app_id`, `wm_class`, **title**, `pid` and absolute `bounds` of whatever window currently has focus, **including a window that is not on the allowlist**. A title is often the most identifying thing on a screen. What bounds it is the observation budget — one per call, on a ceiling the human set — and it returns no pixels and widens nothing a step may touch. Drop it from `operations` for a session where knowing what else the human has open is not acceptable; it is a default, not a fixture. `captureScope` has exactly one value, `allowlisted-window-only`; `full-screen` is not a spelling in v1.

**What a refused step costs.** The approval card carries this fixed sentence, printed immediately after the budget line:

> Before each step the bridge reads which window has focus, and its title and position. A step that is allowed costs only its own action or observation; a step the bridge refuses after that check costs one observation.

That is not an accounting quirk. A refusal that costs nothing and can be repeated is a free activity tracker: loop `screenshot` and the pass/fail pattern reports when the human switches windows without a counter ever moving. So refusal text names no window, and the lookup a refusal consumed is charged. The budget is a ceiling on **steps, refusals included** — not on how often the session learns what is on screen.

## What the agent must know to use it

These come from the §5a calibration against the real v0.5.0 binary, and several of them invalidated build-time assumptions.

**Two coordinate spaces.** Window bounds and untargeted captures are in the **absolute multi-monitor union desktop space** (on the calibration host, three displays forming a 4000×3440 union). `relative: true` switches `x`/`y` into the targeted window's own 0-based space — the same space as a window-cropped screenshot — and therefore **requires an identity selector**, because upstream ignores the flag without a window target and would read the coordinates as desktop ones. Both spellings were verified to press the same button.

**Selectors.** The real vocabulary is `app_id`, `wm_class`, `title` (`window_title` on `click` and `scroll`), `pid`, plus opaque ones. The bridge requires any client-supplied selector to equal the verified window exactly. `app_id` and `wm_class` were identical for every window observed, but they stay separate facts and are never compared to each other.

**Which window an allowlist entry names (2026-09-14).** An entry's `appId` matches **either** identity the compositor reports — `app_id` **or** `wm_class` — folded for case and trimmed, and exact otherwise: no substring, no prefix, no wildcard. Which spelling a human has in front of them when the request is written is not the bridge's to choose; an Electron app whose `app_id` was `com.vendor.app` reported a plain binary name as its `wm_class`, and matching only `app_id`, case-sensitively, refused every step of a session the human had approved — while the refusal correctly named no window, so nothing in the transcript said which fact had been wrong. `titleContains` is unchanged. A `wm_class` that arrives as a list is normalised to its first entry. This is the one place the bridge is deliberately wider than the core's pure scope helper, and the divergence is an enumerated list in the parity test rather than a loosened comparison. A window's `title` can be `null`, and a null-titled window satisfies no title selector. A selector miss is a JSON-RPC **error**, not an empty result.

**Refused argument keys.** `window_id` is a u64 past 2^53 that `JSON.parse` silently rounds, so it can be neither compared nor forwarded — refused. So are the terminal selectors (`tty`, `terminal_pid`, `terminal_command`, `terminal_cwd`), the accessibility matchers (`element_index`, `name`, `role`, `text`, `states`), and every keyboard-shaped key (`text`, `key`, `value`, `action`) — the pilot carries no keyboard class, and an element matcher names a target inside a window the bridge cannot see. `full_screen` and `raise_window` accept `false` only. **A key the bridge has not classified refuses**, which is the load-bearing default: a key a later upstream release adds must be read, classified, and re-reviewed before it can be spoken through this bridge.

**Screenshots are always window-targeted.** The bridge does not crop; it makes the server crop and then checks. The verified `pid` is injected, `raise_window` is pinned to `false`, and the reply must say `cropped_to_window: true`, carry the verified title when the window has one, report `coordinate_*` equal to the window's own bounds, and report pixel dimensions equal to that region at the reported downscale factor. Any mismatch refuses the whole result; the image itself is forwarded unchanged. **`scale` is a downscale factor in (0, 1]**, not a HiDPI multiplier — `1.0` for a small targeted window, `0.4799…` for a whole desktop squeezed under `max_bytes`.

**Refused by name, whatever the grant says:** `run_shell`, `setup_accessibility`, `setup_window_targeting`, and — for the pilot — `list_windows` and `list_apps`, because one `list_windows` answer is every window on the desktop including titles, hidden and minimised, with no window rule to break. `move_window` and `resize_window` refuse as *undesigned*: what a safe move or resize means is an open question, not a missing implementation.

**Errors carry no text from the child.** The upstream failure string names what it could not find, and an app controls its own window title and accessibility labels — the prompt-injection channel. Refusals return a stable code and a sentence written in this package; the child's text goes to stderr only.

**The first capture on a fresh host needs the human at the screen.** The initial portal use raises KDE's "Allow Apps to Take Screenshots?" dialog and the capture hangs until someone answers it. After "allow and remember", no further prompt appeared in that session.

**Pointer input is the server's uinput absolute pointer.** The design assumed portal RemoteDesktop; the verified `click` response attests `Action sent through the uinput absolute pointer`. That matters because the host already had `/dev/uinput`, `input`-group membership, and a running `ydotoold` user service before any of this existed — the governance work bounds a capability that was already present rather than introducing one. Nothing in this package starts, stops, or reconfigures that host state.

## Install and registration

- **The installer never downloads anything** — no `npm`, no `cargo`, and never upstream's `install.sh` (which installs system packages and would take ownership of a pre-existing host service). The human fetches the pinned upstream v0.5.0 x86_64 release; the installer prints the pinned URL, refuses while its `PINNED_SHA256` is empty, and refuses again if the installed binary does not match that digest. A checksum proves the download matches what that publisher uploaded; it does not make an unaudited MIT Rust binary trustworthy.
- Same review discipline as the browser bridge: `--check-source`, `--dry-run`, `--check`.
- The installer merges exactly one `PreToolUse` hook entry for the matcher `mcp__computer-use-linux__.*` into `~/.claude/settings.json`, preserving every existing hook; a conflicting entry already present for that matcher is reported and nothing is written.
- **Registration is the proxy, at user scope, never the raw binary:**

  ```text
  claude mcp add --scope user computer-use-linux -- ~/.local/bin/desktop-bridge mcp
  ```

  Registering the proxy under the name `computer-use-linux` is what keeps the hook matcher correct while the real binary stays unregistered — at any scope, anywhere.
- **User scope is decided, not open (2026-09-13).** The earlier draft said project scope and treated user scope as forbidden without a stated reason. Probed from an unrelated working directory, a grantless proxy is *refusal-only*: no `computer-use-linux` child is spawned, no portal session is opened, `initialize` answers with the proxy's own refusal `instructions` ("The desktop bridge is refusing this session: no approved desktop_session grant is active …", `serverInfo.version` `desktop-bridge/0.1.0`), `tools/list` is empty, and no raw-binary process survives the probe. A grant is also bound to the workspace its request was prepared from — `desktop-bridge-request` derives the context from the canonical working directory, and the proxy skips a `CONTEXT_MISMATCH` rather than resolving it — so another project cannot borrow an approval. The `PreToolUse` backstop is already global in `~/.claude/settings.json`.

  So the human-approved `desktop_session` card is the control and registration is plumbing. The cost is one idle Node process per session and a refusal-only tool group in every tool list; the benefit is that every current and future workspace can prepare a request with no per-project `.mcp.json` and no per-project MCP-approval prompt — the same shape as premium-agent approval: globally available, individually granted. Project scope remains possible and buys nothing. The repo's committed `.mcp.json` was removed as redundant.
- **A request must be filed from the session's own working directory (2026-09-14).** The proxy compares each handle's recorded `workingDirectory` to its own resolved cwd for **exact** equality, same uid. The earlier ancestor rule — a handle filed anywhere beneath the session's directory was eligible — widened the wrong way: the deeper the session root, the more requests it collects, while the card the human read named one directory. A request filed from a subdirectory now refuses, as does one filed from a parent.
- **No reconnect after approval (2026-09-14).** This used to read "the proxy resolves its grant once, at startup … after approval, reconnect the server or start a fresh session", and the advice did not work: `/mcp` reconnect does not respawn a stdio server, so the only recovery was a fresh `claude`. A refusal-only proxy now **re-runs the whole opening sequence while it waits** — on a 2.5 s timer, on every `tools/list` and on every `tools/call`, throttled to one full attempt every 2 s — and announces the new tool list with `notifications/tools/list_changed` when it takes an approval up. The timer reads the binding-handle directory and stops there; the permission core is asked only when that scan finds a fresh handle this workspace filed. A handle whose grant cannot be claimed, spawned for, or attested is marked failed and skipped until a new request replaces it. The child exiting returns the proxy to waiting rather than to a dead session or an exit, so the session after next needs no reconnect either.

## Authority boundary

This is **same-user accident prevention**, not hostile-agent isolation, and the gap is wider here than in the browser bridge. A process already running as this UID has `/dev/uinput`, the `input` group, a live injection socket, and compositor scripting — and can equally edit the installed files, the runtime records, or the permission store. Every check the backstop hook performs is satisfiable by that same user: the `/proc` facts prove two processes exist with the recorded pids, start times, group leadership, and argv; nothing they show proves a grant was approved. The owned process group, the mode-0600 records, the `/proc` identity checks, and the native dialog are controls against mistakes.

Two consequences are structural rather than fixable at this layer:

- **A desktop capture cannot be masked.** There is no node to mark sensitive in a pixel buffer. Target-or-refuse is the substitute, and everything inside the approved window is still captured.
- **Prompt injection arrives with a pointer attached.** On-screen text is untrusted data, and `get_app_state` returns accessibility trees an attacker-influenced app controls.

## Status

**Done.** Wave 1 added the `desktop_session` core kind (schema, policy limits, renderer card, scope helper, tests). Wave 2 built `profiles/desktop-bridge/`. Waves 3 and 4 were independent read-only Opus reviews of the build and then of the repairs, each followed by a repair pass; the findings that mattered were verbatim argument forwarding, free-refusal activity oracles, a wrong-region crop, and a decompression bomb — all closed, several with the closing mechanism reverted to prove its test. The core suite went 278 → 350 → 365 and the bridge suite 58 → 127 → 139 → 144. §5a passed end to end against the raw binary on 2026-09-13: targeted and untargeted captures, real `tools/list`, `focused_window`, `list_windows`, and a click that really pressed a button.

**Not done.** The governed §5b pilot — prepared request, human approval, tool call through the proxy, counter movement, expiry, and `stop-desktop-bridge` — has not run. Nothing is claimed about a genuine approval card being read by a human for this kind.

**Repaired after first field use (2026-09-14, decision 13).** The first attempt to actually use this in another workspace failed on lifecycle, not on scope: the human approved while the proxy was already running and refusing, the proxy only resolved at startup, `/mcp` reconnect did not respawn it, and the backstop hook insisted no grant had been approved. Earlier in the same session a `stop-desktop-bridge` had killed the child and left the grant live. Five changes closed it — lazy grant pickup, child-exit-returns-to-waiting, grant release on **every** end of the child, an honest second denial sentence in the hook, and `app_id`-or-`wm_class` matching — plus a larger default envelope and `focused_window` in the defaults so an agent can learn the real ids. An independent review then tightened six things: release on every child end rather than only the CLI, exact workspace equality instead of the ancestor rule, a fail-closed wrapper around the whole hook (a PreToolUse hook that exits non-zero is non-blocking, so an unhandled exception would have meant "allowed"), the same workspace rule inside the hook's pending-handle hint, full unwind of a failed open, and this disclosure note. **All of it is proved against fakes.** What only a live session can show is whether Claude Code visibly re-reads a tool list on `notifications/tools/list_changed`, whether a second `computer-use-linux` child brings a portal session up cleanly in a process that already had one, and whether the real core revokes on the stop path.

**Unverified:**

- **HiDPI.** All three displays on the calibration host are scale 1, so a capture of a scaled display was never seen. The metadata rule does not depend on a display scale, but it has not met one.
- **Cross-session portal prompting.** "Allow and remember" silenced the dialog within one session; across sessions is untested, as is whether a portal RemoteDesktop session survives many one-shot MCP calls without re-prompting.
- **`get_app_state`'s result shape** was never read on this host, and it can be asked upstream for an inline screenshot — a key the bridge does not classify, so it refuses.
- **Whether `COMPUTER_USE_LINUX_SCREENSHOT_BACKEND=portal` takes effect.** The token appears in the binary beside `auto` and `kwin`; the pin was not proved.
- **The input backend is attested, not pinned.** The earlier design scanned results for `ydotool`/`uinput` as a fall-through signal, which on this host would have latched every real session shut at startup (`doctor` lists `ydotool` as *available*, and the primary pointer path is itself a uinput absolute pointer). Replaced by attestation: `doctor` must list `abs_pointer` under `capabilities.input` or the session latches `BACKEND_UNATTESTED` before it opens, and every action result must report `ok: true` with the `uinput absolute pointer` message or that step refuses and latches. The marker is the server's own claim about itself; no upstream switch excludes a backend, so containment stays the argument gate's job. `drag` and `scroll` are held to the same rule but only `click`'s echo has been read from the real server.

## See also

- [`agent-context/zz-research/2026-09-12-computer-use-linux-mcp-design.md`](../../agent-context/zz-research/2026-09-12-computer-use-linux-mcp-design.md) — the design, its host survey, the eight human-frozen decisions, and decisions 9–10 (backend attestation, bridge-authored `initialize.instructions`) added after §5a calibration, and decision 13 (session lifecycle) after first field use.
- [`agent-context/zz-research/2026-09-12-desktop-computer-use-without-vendor-apps.md`](../../agent-context/zz-research/2026-09-12-desktop-computer-use-without-vendor-apps.md) — the ranked survey of runtimes this pathway was chosen from.
- [Persistent browser bridge](./browser-automation-pilot.md) — the sibling client of the same permission core.
- [Portable agent permissions](./portable-agent-permissions.md) — the model-worker kind, and why it grants no desktop scope.
