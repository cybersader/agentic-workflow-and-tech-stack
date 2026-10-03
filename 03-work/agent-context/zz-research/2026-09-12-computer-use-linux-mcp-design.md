---
title: Governed desktop bridge — computer-use-linux as an MCP tool
description: Read-only design for running agent-sh/computer-use-linux as a permission-bound MCP server on a KDE Plasma 6 Wayland host, governed like the browser bridge — exact-scope request, human-only approval, per-call grant check, owned cleanup.
stratum: 5
status: research
date: 2026-09-12
tags:
  - research
  - computer-use
  - mcp
  - wayland
  - permissions
  - security
---

Design only. Nothing here was installed, registered, started, or approved. Follow-on from
[the survey](./2026-09-12-desktop-computer-use-without-vendor-apps.md) pathway 1; governance mirrors
[`browser-automation-pilot.md`](../../../02-stack/01-ai-coding/browser-automation-pilot.md) and
[`portable-agent-permissions.md`](../../../02-stack/01-ai-coding/portable-agent-permissions.md).

## Host facts (verified read-only, 2026-09-12)

| Fact | Observed |
|---|---|
| Session | `XDG_SESSION_TYPE=wayland`, `XDG_CURRENT_DESKTOP=KDE`, `KDE_SESSION_VERSION=6` |
| Compositor | `plasmashell 6.7.4`, `kwin 6.7.4` (Fedora 44) |
| KWin D-Bus scripting | **reachable** — `org.kde.KWin /Scripting` exposes `loadScript`, `loadDeclarativeScript`, `start`, `unloadScript`; `org.kde.KWin.ScreenShot2` also on the bus |
| Portal | `xdg-desktop-portal 1.22.1`, `xdg-desktop-portal-kde 6.7.4`; `org.freedesktop.portal.Desktop` exposes `RemoteDesktop`, `ScreenCast`, `Screenshot` |
| AT-SPI | **already live** — `at-spi-bus-launcher` + `at-spi2-registryd` running, `org.a11y.Bus` claimed, `org.freedesktop.a11y.Manager` served by `kwin_wayland`; `at-spi2-core 2.60.6` |
| ydotool | `ydotool 1.0.4-8.fc44` present; **`ydotoold.service` is a *user* unit, `enabled` and `active (running)` for 2 weeks**; socket `/run/user/$UID/.ydotool_socket` mode `0600` |
| uinput | `/dev/uinput` `crw-rw----+ root:input`; current user's groups include **`input`** |
| Absent | `wtype`, `grim`, `slurp`, `xdotool`, `qdbus`/`qdbus6` (only `qdbus-qt6`) |
| Present | `spectacle`, `wl-clipboard 2.2.1`, `libei 1.5.0`, `dbus-send`, `busctl`, `node v22.23.1`, `cargo`/`rustc 1.97.1` |
| MCP registry | `claude mcp list` → only three remote claude.ai connectors (Drive, Gmail, Calendar). No local stdio servers. `~/.claude/disabled-mcp/` holds one quarantined entry (`ck-search`) |

**The decisive fact:** system-wide input injection capability is *already installed and running* on this
host. The `input` group membership and the live `ydotoold` daemon were paid for before this design. So the
question is not "should we grant desktop input" — it is "what is allowed to drive an injection channel that
already exists, under what recorded approval."

## 1. Tool surface

Upstream v0.5.0 (MIT, rmcp `2024-11-05` over stdio, `computer-use-linux mcp`) exposes:

| Tool | Class | Disposition |
|---|---|---|
| `doctor`, `list_apps`, `list_windows`, `focused_window` | read-only metadata | **allow** ungated (no pixels, no input); still counted |
| `screenshot`, `get_app_state` | observation (pixels + a11y tree) | **wrap** — charge an observation, enforce window allowlist, crop |
| `click`, `drag`, `scroll` | pointer | **wrap** — charge an action, require `pointer` in scope |
| `press_key`, `type_text` | keyboard | **wrap** — require `keyboard` in scope; keychord allowlist |
| `perform_action`, `set_value` | semantic a11y write | **wrap**, default off — `set_value` writes arbitrary text into arbitrary widgets |
| `activate_window`, `move_window`, `resize_window` | window management | **wrap** — allowlist-bound; `activate_window` is how focus moves onto a non-approved window |
| `setup_accessibility`, `setup_window_targeting` | host mutation | **deny** — GNOME-only anyway, and installation is not a tool call |
| `run_shell` | `/bin/sh -c` | **hard deny** — never set `COMPUTER_USE_LINUX_ENABLE_SHELL`; the wrapper refuses the tool name even if the env leaks |

Anthropic's `computer_toolset` vocabulary does not help here: these are named MCP tools with their own
JSON schemas, and the model never sees a `computer_20260801` block. Do not map them.

Upstream ships **no restricted mode, no dry-run, and no allowlist** — only advisory
`readOnlyHint`/`destructiveHint` annotations, which are model-facing hints, not enforcement. Every
restriction in this design has to be built outside the upstream binary.

## 2. Prerequisites and blast radius

Minimal backend order for KDE Plasma 6 Wayland, best first:

1. **AT-SPI** — discovery and semantic action. Already running, no new capability, no new consent, and
   it targets an element rather than a coordinate: the only backend that fails *safely*.
2. **KWin D-Bus** — window targeting. Upstream ranks it 4th behind three GNOME/COSMIC paths that don't
   exist here, so on this host it is effectively first. Blast radius: `/Scripting.loadScript` loads
   arbitrary QML/JS into the compositor — full window control *and* code execution inside KWin.
3. **Portal RemoteDesktop (libei)** — input. Per-session consent dialog, revocable, compositor-scoped,
   and the only backend that leaves a visible trace. Prefer it.
4. **ydotool** — input, fallback only. Kernel `uinput` injection, confined by nothing: not a compositor,
   a window, a seat, or a nested session. It lands wherever focus is, including a lock screen or a
   `sudo` prompt.
5. `wtype` — absent; only helps Unicode literal text on wlroots. Do not install it for KDE.

Screenshots are the weak spot. Upstream's chain is GNOME Shell D-Bus → `org.freedesktop.portal.Screenshot`
→ `gnome-screenshot`; there is no KDE-native path, so every capture here goes through the portal, meaning
a Spectacle-mediated permission flow and a full-screen (not per-window) grab.
`COMPUTER_USE_LINUX_SCREENSHOT_BACKEND` can pin it. Consequence: **a desktop screenshot cannot be masked
the way the browser bridge masks a DOM** — there is no node to mark sensitive in a pixel buffer.

**Would not enable by default:** `run_shell`; `COMPUTER_USE_LINUX_FORCE_YDOTOOL_*` (forces the
unconfinable backend); the `setup_*` tools; and — had this host not already paid for it — `input`-group
membership, which gives *every* process running as that user permanent system-wide keystroke injection
and input-device read access, with no per-use consent and no audit trail. That it is already enabled
here is a finding to record, not a licence.

## 3. Governance design

A new permission kind `desktop_session` in the existing harness-neutral core, alongside
`model_allowance` and `browser_session`. This is a core change (`schemas/`, `core.py`, `renderers.py`,
`policy-v1.json`), not an adapter-only one — budget for it.

### Terms v1 (proposed)

```json
{"termsVersion": 1,
 "operations": ["screenshot", "get_app_state", "list_windows", "click", "type_text"],
 "inputClasses": ["screenshot", "pointer", "keyboard"],
 "windowAllowlist": [{"appId": "org.kde.kate", "titleContains": "scratch.txt"}],
 "anyWindow": false,
 "captureScope": "allowlisted-window-only",
 "maxActions": 20, "maxObservations": 30, "minutes": 15}
```

- `operations` — exact upstream MCP tool names; same "the label says the verb exists, the list says where
  it may point" split the browser bridge uses for `formSelectors`.
- `inputClasses` — `screenshot` / `pointer` / `keyboard` / `clipboard`, independently grantable.
  Screenshot-only is the common case and the default the agent proposes first.
- `windowAllowlist` — exact app IDs / window classes, no wildcards. `anyWindow: true` is a separate
  boolean so the renderer can shout about it; an empty list never implies it.
- `captureScope` — `allowlisted-window-only` crops the portal's full-screen grab to the geometry KWin
  reports, and **refuses the capture** if the focused window is off-allowlist or geometry is
  unavailable. `full-screen` exists as a separate, loudly rendered choice. No pixel-level password
  masking exists; the card must say so.
- Counters reuse `actions` / `observations`, independent of the browser and model ledgers. Ceilings to
  propose: 60 minutes, 40 actions, 60 observations, 16 allowlist entries — matching the browser bridge.

### Flow

1. `desktop-bridge-request` — agent-run, reads one strict JSON object (`purpose`, `terms`) on stdin, no
   argv, derives a fresh `ctx-desktop-task-<hex>` context from canonical cwd + UID, applies a
   source-owned policy with its own digest, calls core `prepare` only. Returns `pending`. Grants nothing.
2. Human runs `agent-permissions-controller` and decides. The agent never starts it, never answers it,
   never reads anything as approval.
3. Agent calls core `status` with the exact returned binding; only an `activeGrant` yields `grantId` +
   `grantFingerprint`.
4. `desktop-bridge` mints a host identity, `claim_host`s, revalidates the **complete** grant terms
   against its own source-owned policy, then spawns `computer-use-linux mcp` as a child in its own
   process group. The child owns the portal handles (RemoteDesktop / ScreenCast sessions); the bridge
   owns the child. Killing the validated group closes those handles. (Corrected 2026-09-13 to match the
   implementation: the bridge never opens a portal session itself.)

### Where the grant check lives — recommendation: **both, with the proxy as the authority**

- **MCP-side wrapper (authority).** `desktop-bridge` is a thin stdio MCP proxy: Claude Code talks to the
  wrapper, the wrapper talks to the real server. Only the proxy can (a) reserve an action/observation
  atomically *before* the side effect, (b) rewrite the advertised tool list to exactly the granted
  operations so denied tools are never offered, (c) crop screenshots and drop `run_shell`, (d) own the
  child process group (and through it the child's portal handles) for cleanup. A hook cannot do any of those — it returns
  allow/deny and has no transaction with the permission core's counters.
- **PreToolUse hook `mcp__computer-use-linux__.*` (backstop).** Add to `~/.claude/settings.json`
  alongside the existing `Agent|Workflow` and `Bash` matchers — the hook layer is already the
  deterministic tier in this scaffold, and `bash-guard.py` covers Bash only, so MCP is currently
  ungoverned. Its job is to fail closed if the raw binary is ever registered directly (bypassing the
  proxy) and to give the human a legible denial in the transcript. It is Claude-Code-specific and is
  not sufficient alone: another MCP client, or a shell call to the CLI subcommands, never reaches it.

Registering the proxy under the server name `computer-use-linux` keeps the hook matcher correct while
the real binary stays unregistered.

### Cleanup

`stop-desktop-bridge --session <id>` mirrors `stop-browser-bridge`: validate run ID, PID, PGID, process
start time, worker path, and real UID via `/proc` **before signalling**; SIGTERM the owned process group,
bounded grace, SIGKILL that same validated group; never `pkill`, never name matching. The child held
the portal RemoteDesktop session, so its death drops the D-Bus session and revokes the libei fd — there
is no separate handle for the bridge to close. Then remove the owned socket and artifact directory,
and remove only the matching active record. `ydotoold` is a pre-existing
host service — **do not stop it**; it was not ours to start.

### What a model allowance does not grant

An approved `model_allowance` — portable or one-use — authorizes *worker admission*, nothing else. It
does not grant a desktop session, a window, a keystroke, a screenshot, an origin, credentials, or the
shell. The three kinds have separate counters, separate scope, and separate human decisions; a live
desktop grant equally cannot admit an Astra or Fable worker. This is the existing rule extended to a
third kind, not a new exception.

## 4. Isolation options, ranked

1. **Live session (no isolation).** Gains: the only option that does the thing you want — drive real
   apps, with AT-SPI, KWin, and the portal all verified working here today. Loses: everything. The agent
   shares a screen with password managers, mail, and signed-in browsers; `screenshot` at
   `full-screen` is a desktop exfiltration primitive; and prompt injection from any on-screen text is
   now an input to a process that can type.
2. **Nested `kwin_wayland --xwayland` in a window.** Visual containment only, and a trap: the nested
   compositor cannot claim `org.kde.KWin` on the same session bus (so KWin targeting still hits the
   *outer* compositor), and **uinput injection is a kernel device that a nested compositor does not
   confine at all.** Worth something only with the backend pinned portal-only — and that portal is still
   the outer session's.
3. **Separate user account, own Plasma session on another VT.** Real containment: distinct UID, D-Bus,
   a11y bus, home. Costs: that user needs its own `input` membership or portal grant (blast radius
   moves, it does not vanish), it cannot drive your apps, and VT switching is clumsy.
4. **VM.** Best containment, zero host desktop control. The right place to first run an unfamiliar binary
   that types on keyboards; useless as the product.

**Recommended for the pilot:** prove the binary in #3 or #4 first — no governance work, no risk, and it
settles whether upstream's KDE path works at all. Then run the governed pilot on #1 with
`inputClasses: ["screenshot","pointer"]`, `captureScope: allowlisted-window-only`, and one scratch app
on the allowlist. Do not go straight to #1.

## 5. Smoke test plan (for later, with separate authorization — not now)

**(a) Does the binary work on this host?** In the isolated session of §4:
`computer-use-linux doctor | jq .readiness`; then `computer-use-linux windows` and `screenshot`; then a
click on a scratch window (a fresh Kate document, nothing else open). Watch specifically for: whether
the portal Screenshot path prompts per call under `xdg-desktop-portal-kde`; whether window targeting
falls through the three GNOME/COSMIC backends to KWin cleanly; whether `type_text` reaches the window
(upstream #103 was ASCII-only on Wayland, fixed by adding `wtype`, which is **absent here** — so
non-ASCII typing likely degrades to ydotool and drops characters).

**(b) Does the gate hold?** Register the proxy, confirm the tools appear in `claude mcp list` and in
session. Then, in order: call a wrapped tool with **no** grant → must be denied by both the proxy and
the hook, with no portal session opened and no counter moved; prepare a request, approve it in the
controller, call the same tool → must succeed and decrement exactly one counter; call a tool *outside*
`operations` under the same live grant → denied; call an allowed tool against a window outside
`windowAllowlist` → denied; let the grant expire → denied. Finally `stop-desktop-bridge` and confirm the
child process group is gone, the portal session is closed, and `ydotoold` is still running.

**(c) CLIProxyAPI passthrough is not needed for this pathway.** The model only ever sees ordinary MCP
tool definitions and `tool_result` JSON, which every lane already carries — there is no
`computer_20260801` / `computer_toolset` block in the request at all. The survey's open question about
proxy passthrough of the Anthropic computer-use toolset applies **only** to a hand-rolled
`computer_toolset` loop (survey pathway "substrate"), and stays open there.

## 6. Install plan (for approval, not execution)

- **Artifact:** `computer-use-linux-x86_64-unknown-linux-gnu` from release **v0.5.0** (2026-08-31) with
  its published `.sha256`. No GPG signatures or build attestations exist on the release — the checksum
  proves the download matches what that publisher uploaded, **not** that the publisher is trustworthy.
  An unaudited MIT Rust binary from a modest-activity project.
- **Alternative:** `cargo install computer-use-linux` — crates.io source, auditable in principle, but
  pulls a large unaudited dependency tree (`atspi`, `zbus`, `rmcp`, `cosmic-protocols`). No real trust
  gain without reading it.
- **Do not run upstream `./install.sh`.** It installs system packages and Rust and configures
  `ydotoold` — each either needing root or already satisfied here, and it would take ownership of a
  host service this design must not touch.
- **Location:** `~/.local/bin/computer-use-linux` (the binary, never registered as an MCP server) plus
  `desktop-bridge`, `desktop-bridge-request`, `stop-desktop-bridge` from a
  `profiles/desktop-bridge/install-desktop-bridge.sh` with the browser bridge's
  `--check-source` / `--dry-run` / `--check` discipline.
- **Registration:** ~~`claude mcp add --scope project computer-use-linux -- ~/.local/bin/desktop-bridge mcp`
  — project scope, pointing at the wrapper. Never `--scope user`, never the raw binary.~~
  **Superseded 2026-09-13: registered at user scope; see decision 11.** (The wrapper-not-the-binary half stands.)
- **Root required:** none, on this host — `input` group, `/dev/uinput`, and `ydotoold` are all already in
  place. On a fresh host all three need root and would be the main thing to argue about.

## 7. Risks and rejected alternatives

- **Screenshots cannot be masked.** The browser bridge's strongest privacy control does not port.
  Cropping to an approved window is the substitute, and it fails open when geometry lookup fails — hence
  "refuse the capture" rather than "fall back to full screen".
- **Prompt injection with a keyboard attached.** On-screen text is untrusted data with a far worse blast
  radius than a browser page; `get_app_state` returns a11y trees an attacker-influenced app controls.
- **Same-user boundary, as always.** Accident prevention only. A hostile same-UID process already has
  `input`, `/dev/uinput`, the live `ydotoold` socket, and `org.kde.KWin /Scripting`.
- **Upstream fit is thinner than the survey implied.** Upstream states validation on *Ubuntu 25.10 /
  GNOME Shell 50.1 Wayland*. KDE is in the support matrix with a trail of KDE-specific fixes (scroll
  polarity #56/#57, KWin callback hardening #96, Plasma terminal paste #113). Read that as "KDE works
  after several rounds of it not working", not "validated on KDE".
- **Why not `wayland-computer-use` first:** better KDE fit on paper, but v0.1.0, one maintainer, and no
  MCP surface — we would write the server *and* be its second user. Revisit if test (a) fails.
- **Why not Hermes now:** trycua/cua#1982 still gates `portal-libei` off in the published driver, so
  input never dispatches on KDE. Nothing to govern until that lands or we self-build.

## 8. Open decisions

1. Accept a third core permission kind (`desktop_session`) — with the schema, renderer, and controller
   work that implies — or shoehorn desktop scope into `browser_session`? (Recommend: new kind. Reusing
   `browser_session` would put desktop actions on the browser's counters and the browser's card.)
2. Is `captureScope: full-screen` allowed to exist at all, or is the pilot crop-or-refuse only?
3. Which scratch app is the allowlist target for the pilot, and does the pilot grant `keyboard` at all
   or start pointer-only?
4. Pilot isolation: VM or second-user Plasma session for test (a)? (Recommend: second user — it exercises
   the real KWin/portal/AT-SPI stack that a VM would only approximate.)
5. Prebuilt binary + checksum, or `cargo install` from source?
6. Does the pre-existing `input`-group + running `ydotoold` state stay as-is, or does this work become
   the occasion to remove it and go portal-only?

## Frozen decisions (2026-09-12, human-approved)

1. **New core kind `desktop_session`** alongside `model_allowance` and `browser_session`; own counters, own card, own policy digest. Not shoehorned into `browser_session`.
2. **`captureScope` is `allowlisted-window-only` only.** `full-screen` is not a schema value in v1; a request carrying it is rejected at prepare. Capture refuses (never falls back) when the focused window is off-allowlist or geometry is unavailable.
3. **Host input posture untouched.** `input` group, `/dev/uinput`, and the running user `ydotoold.service` are pre-existing and out of scope; nothing stops, removes, or reconfigures them. The bridge pins portal RemoteDesktop for input, never sets any `COMPUTER_USE_LINUX_FORCE_YDOTOOL_*`, never sets `COMPUTER_USE_LINUX_ENABLE_SHELL`, and refuses `run_shell` / `setup_*` by name regardless of env. ~~If upstream offers no env pin that excludes the ydotool fallback, the proxy must detect and report backend fall-through rather than silently accept it.~~ **Superseded 2026-09-13 by decision 9 below — the fall-through half of this decision was written against a wrong model of the host; the rest stands.** Separate low-priority item: establish what enabled `ydotoold` on 2026-08-28.
4. Pilot scope: `inputClasses: ["screenshot","pointer"]`, `windowAllowlist: [{"appId":"org.kde.kate","titleContains":"scratch.txt"}]`, `anyWindow: false`, `maxActions: 20`, `maxObservations: 30`, `minutes: 15`. No `keyboard` in the pilot.
5. Ceilings: 60 minutes, 40 actions, 60 observations, 16 allowlist entries. `anyWindow: true` is allowed by schema but rendered loudly and excluded from the pilot policy.
6. First smoke test (§5a) runs in a **second user's Plasma session**, not the live desktop; only after it passes does the governed live-session pilot (§5b) run.
7. Artifact: **prebuilt v0.5.0 x86_64 + its published sha256, pinned in the installer**; no upstream `install.sh`; binary at `~/.local/bin/computer-use-linux`, never registered directly; ~~proxy registered project-scope as `computer-use-linux`~~ **superseded 2026-09-13 by decision 11 — the proxy is registered at user scope; "never the raw binary" stands.**
8. Enforcement: proxy is the authority; `PreToolUse` hook on `mcp__computer-use-linux__.*` is the fail-closed backstop.
9. **Input-backend attestation replaces fall-through detection** (2026-09-13, after §5a ran the real binary). Decision 3 assumed pointer input goes through the portal and that a `ydotool`/`uinput` mention in a payload would be the server admitting an ungoverned fall-through. Both halves are false on this host. The real `doctor` answers `capabilities.input: ["abs_pointer", "ydotool", "portal"]` with `capabilities.preferred.input: "abs_pointer"`, and every successful click answers `"message": "Action sent through the uinput absolute pointer."` — the server's *primary* pointer path **is** its own uinput absolute pointer. The implemented whole-document scan for `ydotool|uinput` therefore latched every real session shut at startup (a calibration test pinned exactly that). Containment does not come from the input backend at all; it comes from the argument gate, which requires every coordinate to land inside the window the gate verified for itself and every selector to name that window.

   What replaces it: `lib/desktop-policy.mjs` declares `EXPECTED_INPUT_BACKEND = { capability: 'abs_pointer', actionMarker: 'uinput absolute pointer' }`, both strings copied from the observed payloads. The startup `doctor` probe requires `capabilities.input` — that one key path — to contain `capability`; absent, unreadable, or a failed probe latches the session under `BACKEND_UNATTESTED` (renamed from `BACKEND_FALLTHROUGH`), keeping the probe's uncharged, never-returned property. Every operation the pilot counts as an **action** must come back with `ok: true` and `actionMarker` inside its own `message`, or that step is refused (charged, cached like other post-lookup refusals, because it may still have moved the desktop) **and** the session latches — a step that went through an unknown path is the same session-ending event the old latch modelled. Observations are never asked for the marker. `FALLTHROUGH_PATTERN` and all string scanning are deleted: no window title, message, or `doctor` detail can latch a session by its content. This is still attestation, not prevention — no upstream env pin excluding a backend was found — but it is a claim about the path a step actually took rather than a hunt for a word.

10. **The proxy authors `initialize.instructions`; the child's are never passed through** (2026-09-13). The real server sends its own instructions ("Begin every turn that uses Computer Use by calling `get_app_state` …"), which describe the ungated binary — every tool, no window allowlist, no budget, no human — and are app-controlled text that would enter a model's context as guidance. The proxy replaces the string unconditionally with its own (`lib/instructions.mjs`, so tests can assert on it), covering what the grant is, the focused-window check and its generic refusal, the one-observation cost of a post-check refusal, the granted operations **rendered from the live grant**, the coordinate and `relative: true` rules, window-targeted-only capture, the argument keys and tools that always refuse, and that the human alone starts, approves and stops the session. The refusing case says why and points at `desktop-bridge-request` and the controller rather than advertising nothing.

11. **The proxy is registered at user scope; project scope and the committed `.mcp.json` are retired** (2026-09-13, superseding the §6 registration line and decision 7's scope clause). "Never `--scope user`" was written on the assumption that registering the server is itself a capability. It is not. Probed from an unrelated working directory (`~`), a grantless `desktop-bridge mcp` is **refusal-only**: it spawns no `computer-use-linux` child, opens no portal session, answers `initialize` with `serverInfo.version` `desktop-bridge/0.1.0` and its own instructions ("The desktop bridge is refusing this session: no approved desktop_session grant is active …"), returns `tools: []`, and leaves no raw-binary process behind. A grant is further bound to the workspace its request was prepared from — `desktop-bridge-request` derives `ctx-desktop-task-<hex>` from the canonical working directory, and `resolveSingleGrant` in `lib/session.mjs` skips a `CONTEXT_MISMATCH` rather than resolving it — so a session in another project cannot reach an approval made here. The `PreToolUse` backstop is installed globally in `~/.claude/settings.json` and is unaffected by scope.

    The human-approved `desktop_session` card is therefore the control, and registration is plumbing. Cost of user scope: one idle Node process per session and a refusal-only tool group in every session's tool list. Benefit: every current and future workspace can prepare a request with no per-project `.mcp.json` edit and no per-project MCP-approval prompt — the same model as premium-agent approval, globally available and individually granted. Project scope still works and buys nothing but an extra prompt; the raw binary is registered at no scope anywhere. The repo's committed `.mcp.json` (added in `2b0a7bd`) is removed as redundant. Operational consequence: the proxy resolves its grant once at startup, so after the human approves a card the session must reconnect the server (`/mcp` → reconnect) or start fresh.

12. **The workspace binding is enforced by the proxy, not by the core** (2026-09-13, correcting the clause decision 11 leaned on). Audit finding: `desktop-bridge-request` records `{workingDirectory: realpath(cwd), uid}` with each pending request, but every handle lands in one per-user `runtime/bindings` directory and `resolveSingleGrant` replays each handle's *stored* context to the core verbatim. The core therefore compares that value against itself, so `CONTEXT_MISMATCH` can never fire on it, and a grant approved in workspace A resolved for a proxy started in workspace B under the same UID. Decision 11's "cannot reach an approval made here" was true of the intent and false of the code.

    The rule now: before the core is asked anything, a handle is eligible only if its recorded `uid` equals this process's UID **and** the proxy's own `realpath(cwd)` — which is the project directory Claude Code starts a stdio MCP server in — is the recorded working directory or a path-segment ancestor of it (`stored === root || stored.startsWith(root + sep)`, so `/tmp/proj` is not an ancestor of `/tmp/project2`). Ancestor rather than equality because one project root legitimately contains the subdirectory a request was filed from. An ineligible handle is skipped exactly as a core-refused one is: never claimed, not counted toward the exactly-one-live-grant rule, and refused under the existing `NO_ACTIVE_GRANT` text with no new code and no other workspace's path in the message. Malformed or missing fingerprints, and a cwd this process cannot resolve, fail closed.

    What it does not do: this is still **per-UID**. A cwd is a path fact, not an identity — anything running as this user can `cd` into the workspace, and the binding is a blast-radius limit on an approval the human already made, not an authentication boundary. It adds no core round-trip (the fingerprint is read from the handle) and changes no charging, refusal, or containment semantics.

13. **A refusing proxy keeps looking; a stopped session releases its grant; a window matches on either identity it reports** (2026-09-14, after the first attempt to actually use this outside the calibration workspace). The failure was lifecycle, not scope, and it was unrecoverable in-session.

    *What happened.* The human approved a `desktop_session` while the proxy was already running in the refusal-only state decision 11 relies on. `openSession` resolved the grant **once, at process start**, so the approval was never seen. `/mcp` reconnect does not respawn a stdio server, so the reconnect the README prescribed could not work. The `PreToolUse` backstop then denied every call with "no `desktop_session` grant was approved. Prepare a request with `desktop-bridge-request`…", which was false — an approved handle existed — and which sent the human to file a second request. Recovery was a fresh `claude` process. Earlier in the same session `stop-desktop-bridge` had killed the child and left the **proxy alive and the grant active**, so a session that had been stopped was still holding an approval. Separately, the agent had guessed `appId` for an Electron app whose real `app_id` was `com.vendor.app`; matching was exact and case-sensitive on `app_id` only (`lib/scope.mjs`), `wm_class` was extracted and never consulted, and the refusal correctly named no window — so nothing in the transcript said which of the two facts had been wrong.

    *The rule now.* (a) **Lazy pickup.** A waiting proxy re-runs the entire opening sequence — handle scan, workspace binding, claim, terms revalidation, `doctor` attestation — on a 2.5 s timer, on every `tools/list`, and on every `tools/call`, throttled to one full attempt every 2 s. The timer reads the mode-0600 handles in `runtime/bindings/` and stops there; the core is asked only when that scan finds a handle this workspace filed that has not already failed. Success switches to live, rewrites the tool list, and sends `notifications/tools/list_changed` (so `initialize` now advertises `listChanged: true`). A handle that resolves to a grant the proxy cannot claim, spawn for, or attest is **marked failed and skipped until it changes** — write-once records mean that is "until a new request is filed" — and the refusal keeps saying why rather than decaying to "no grant is active" on the next tick. The exactly-one-live-grant rule, the `BINDINGS_FLOODED` refusal and the workspace binding are unchanged; pickup re-runs that sequence, it does not shorten it.

    (b) **Child exit returns the proxy to waiting.** Any exit — `stop-desktop-bridge`, a crash, a ceiling — finalises the run as before, empties the tool list, emits another `list_changed`, and goes back to waiting, so the next approval opens a new session in the same process. Nothing crosses the boundary: the replay cache, the unattested-backend latch and the closed-lookup flag belong to the session that earned them. The alternatives were a dead session refusing `SERVER_EXITED` forever, or exiting and taking the client's MCP connection with it.

    (c) **`stop-desktop-bridge` releases the grant**, using the core's existing `revoke` (API-CONTRACT §3.4, `narrow` omitted) with the exact `ContextBinding` the request was filed under — now recorded beside the grant id in the session's own mode-0600 active record. No new core verb, and still no verb anywhere in this package that approves, renews, widens or creates. Best-effort: the child is already dead when it runs, so an unreachable core is reported in the command's JSON rather than turned into a failed stop. **Only the CLI releases** — a client disconnect or a crashed child does not, because that is not the human saying the session is over and lazy pickup means the next proxy takes the grant up. *(The browser bridge has the same gap and was left alone: `profiles/browser-bridge/lib/stop-session.mjs` never calls `revoke` either.)*

    (d) **The hook denies in two sentences.** When no session is live but a fresh, owned binding handle exists in this runtime, the denial says an approval may be waiting to be picked up and to retry in a few seconds (reconnect only if that persists), instead of the blunt "no grant was approved". It is still a denial — a handle is a lookup key, not a grant, and the hook never allows on the strength of one — the bindings directory is located the way `lib/session.mjs` locates it, the scan is bounded at 64 handles, and the core is never consulted.

    (e) **`windowAllowlist[].appId` matches `app_id` OR `wm_class`**, case-folded and trimmed, and **exact** otherwise: no substring, no prefix, no wildcard. `titleContains` is unchanged. A list-valued `wm_class` (X11's `(instance, class)` pair) normalises to its first entry, and a client's own `wm_class` selector is compared against that same value. This is the **one** place the bridge's gate is deliberately wider than the core's pure `check_desktop_scope`, which compares `appId` alone; `test/scope-parity.test.mjs` still pins the shared table probe-for-probe and carries the divergence as an enumerated list with its own negatives, so it cannot grow without a test being edited.

    (f) **Defaults: 30 minutes / 30 actions / 45 observations, and `focused_window` is granted by default.** Core ceilings (60/40/60) are unchanged and each default is strictly under them. The old 15/20/30 envelope was what ended sessions — twenty actions is about ten deliberate clicks once refused neighbours are paid for — and nothing about what a step may *touch* moved. `focused_window` is a metadata tool with no allowlist question, and it is the bootstrap for (e): file the request by `titleContains`, then call it once to learn the exact ids. The bridge's `initialize.instructions` now also state that the `purpose` sentence is **descriptive context for the human, not an enforced restriction** — the enforced scope is the operations, the window allowlist and the ceilings — because an agent treating it as a fence refuses work the human just approved and asks for a grant it already holds.

    *What is proved, and what is not.* All of the above is exercised against the fake core and the fake desktop server (bridge suite 179 → 206, plus a new Python suite for the hook). Only a live session can show whether Claude Code visibly re-reads a tool list on `notifications/tools/list_changed`, whether a second `computer-use-linux` child brings a portal session up cleanly in a process that already had one, and whether the real core revokes on the stop path.

14. **Review corrections to decision 13** (2026-09-14, independent review, ship-with-fixes). Five of the six change behaviour; none redesigns anything decision 13 froze.

    (a) **Any end of the child ends the grant** — superseding 13(c)'s "only the CLI releases". That clause rested on "the next proxy takes the grant up", which the core does not permit: a host claim is immutable (API-CONTRACT §3.6) and `claimAndSpawn` mints a fresh host identity per attempt, so a second identity claiming an already-claimed grant is `host_claim_conflict`. A grant whose session ended is therefore not handed on, it is **stranded** — clock running, counters unspent, card still saying the session is on, and nothing able to use it. So the child exiting, the proxy shutting down, and an open that fails after the claim all call `revoke` as the CLI does. Revoke failure (already expired, already revoked, core unreachable) is logged and non-fatal. The documented semantics, in the README and here: *any end of the child ends the grant; a new approval is needed; the proxy returns to waiting and picks the next approval up without a reconnect.*

    (b) **The workspace match is exact, everywhere** — superseding decision 12's ancestor rule at startup and on pickup alike. A handle is eligible only when its recorded `workingDirectory` equals this proxy's own resolved cwd, same uid. The ancestor rule's justification (a project root legitimately contains the subdirectory a request was filed from) widens the wrong way: the deeper the session's root, the more requests it collects, and "approved for the project I am in" is not the statement the card makes — the card names one directory. A request must now be filed from the session's own working directory; a subdirectory refuses, and so does a parent.

    (c) **The hook fails closed on its own failure.** A PreToolUse hook that exits non-zero is **non-blocking**, so an unhandled exception in the guard would have turned "the guard broke" into "the guard allowed it". `guarded_main` converts every `BaseException` — `SystemExit` included, because `argparse` raises it for a bad command line — into a deny decision with exit 0, naming only the exception's type.

    (d) **The hook's pending-handle hint applies the same exact workspace rule.** Otherwise a request filed in one project would tell a session in a sibling project to wait for an approval it can never claim, which is the original misleading sentence wearing different words. A foreign or wrong-uid handle falls through to the existing "no grant was approved" text, naming no other workspace.

    (e) **A failed open leaves nothing behind.** The claim happens first, so every failure after it owns a run directory and possibly a child and an active record. All of it is now unwound in one catch — stop the run, release the grant — before the error is re-raised and the handle is marked failed. Previously a failed handshake left a `dsk-*` directory, a live child, and a grant nothing could claim.

    (f) **`focused_window` in the defaults is disclosed plainly** (the decision itself stands). Because it asks no allowlist question, a granted `focused_window` returns the `app_id`, `wm_class`, **title**, `pid` and bounds of whatever window has focus, **including one not on the allowlist** — and a title is often the most identifying thing on a screen. What bounds it is the observation budget the human set. It returns no pixels and widens nothing a step may touch, and it can be left out of `operations` for a session where that disclosure is not acceptable.

Implementation order: (1) core kind + schema + renderer + policy + tests → (2) `profiles/desktop-bridge/` request/proxy/stop + installer + hook + tests against a fake MCP server → (3) independent review → (4) human commit, then download + §5a with separate explicit authorization.

## Unverified

- Whether upstream's portal Screenshot path prompts per capture under `xdg-desktop-portal-kde`, or
  stores a session permission.
- Whether KWin D-Bus window targeting actually returns usable geometry on Plasma 6.7.4 (the code path
  exists and the bus interface is present; it was read, not run).
- Whether `type_text` handles non-ASCII on this host with `wtype` absent.
- Whether the portal RemoteDesktop session can be held across many one-shot MCP calls without
  re-prompting.
- Everything in §1's disposition column — no tool was ever invoked.
- Upstream tool list, env vars, install methods, and backend order come from the README as fetched
  2026-09-12; the binary was not downloaded and `--help` was not run.
