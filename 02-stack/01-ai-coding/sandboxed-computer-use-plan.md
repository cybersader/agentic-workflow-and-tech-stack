---
title: Sandboxed computer use — plan and trial
description: Plan for giving agents their own GUI desktop in a local container/VM so the human keeps using the machine — no window focusing on the human's screen — with the model path kept inside Claude Code and CLIProxyAPI, a proxy image-passthrough test for GPT workers, safety defaults, and pass/fail trial gates.
stratum: 2
status: research
tags:
  - stack
  - ai-coding
  - computer-use
  - mcp
  - sandboxing
  - cliproxyapi
  - security
date: 2026-09-30
branches: [agentic]
---

**Goal:** an agent can operate GUI apps while the human keeps full use of their own screen, keyboard and pointer. The agent never has to focus windows on the human's desktop.

**Approach:** give the agent **its own desktop inside a sandbox** — a container or VM. It clicks and focuses freely there, and nothing reaches the human's session. The existing governed [[desktop-computer-use-pilot]] stays the path for the rare task that needs the *real* desktop.

> [!note] Trial ran 2026-09-30 — the core path works on both lanes
> Rootless Podman runs a cua desktop. A five-tool, model-free MCP adapter drives it from headless Claude Code. Both a Claude lane and a GPT-6.1 Sol lane read a random on-screen code and typed a correct answer, so **screenshots do survive CLIProxyAPI's translation to GPT**. See [Trial results](#trial-results). The viewer clipboard is now durably off (a small derived image). On 2026-10-01 an optional derived image added a real accessibility tree and a one-command lifecycle tool (`cu-sandbox`) wrapped the whole setup; see [Accessibility fix](#accessibility-fix) and [Sandbox CLI](#sandbox-cli). The remaining blocker for routine use is the missing guest-session permission kind; a design is drafted in [Guest-session permission kind](./guest-session-permission-kind.md) (not yet implemented). Promote to `active` once that is closed and a real task succeeds. The ranking and gotchas come from the 2026-09-30 source research ([crumb](../../agent-context/zz-research/2026-09-30-computer-use-sandboxing.md)).

## Why a sandbox, not "no-focus" on the real desktop

On KDE Plasma Wayland, input goes only to the surface holding seat focus. That is by design, and it applies to libei/EIS, the RemoteDesktop portal, KWin scripting and XTEST alike. Only two focus-free paths exist on the real desktop:

- **AT-SPI accessibility actions:** press, toggle, set value. They work on GTK4, Qt5/6 and Firefox; Electron needs `--force-renderer-accessibility`. Typing text often still needs focus.
- **Browser pages via CDP:** already covered by [[browser-automation-pilot]].

Anything else on the real desktop needs focus. A sandbox makes the question irrelevant.

## Architecture

```
model (Claude, or GPT via CLIProxyAPI)
   ⇅  tool definitions out; clicks in; screenshots/a11y text back
Claude Code (host)                 ← the only agent loop
   ⇅  MCP (stdio)
permission proxy (desktop-bridge pattern, re-pointed at the guest)
   ⇅
in-guest computer server (cua computer-server / computer-use-linux)
   ⇅
guest desktop (container or KVM VM)   ← agent focuses windows here
```

**Invariants:**

1. **Claude Code is the only agent loop.** Expose only low-level tools: screenshot, click, type, key, accessibility tree. Never enable a sandbox product's built-in agent (for example cua's `ComputerAgent` / task-runner tools). Those call model providers directly with their own API keys, which bypasses CLIProxyAPI, the meters and `agent-guard`.
2. **All model traffic goes through the launcher's normal route.** Whichever lane launched Claude Code determines the meter: the Anthropic 5h pool, or the weekly Codex pool via CLIProxyAPI.
3. **Starting a session is human-approved.** This mirrors the `desktop_session` grant; the agent prepares a request and the human approves it. The 2026-10-02 draft proposes a separate `guest_session` kind rather than widening `desktop_session`; see [Guest-session permission kind](./guest-session-permission-kind.md).

## Candidate stacks (ranked)

| Rank | Stack | Isolation | Why | Main risk |
|---|---|---|---|---|
| 1 | **trycua/cua** — `cua-ubuntu` container, or its QEMU/KVM VM image | Container, or full VM | Packaged guest, in-guest server, official MCP server; browser viewer | Docs assume Docker (Podman untested); MCP documented for Claude Desktop, not Claude Code; resource use unpublished |
| 2 | **libvirt/KVM VM + community MCP** (mcp-libvirt-vm-use, boxes-mcp) | Full VM | Strongest isolation on existing KVM | Build the guest yourself; small maintainer base; pixels only, no accessibility tree |
| 3 | **Webtop/Kasm container + computer-use-linux in the guest** | Container | Reuses the tool already in use | Two projects to integrate |

Ruled out:

- **e2b desktop:** no supported local self-host.
- **agent-workspace-linux:** a hidden display on the host kernel, so no isolation.
- **Anthropic computer-use-demo:** a standalone app, not an MCP tool.
- **Firecracker:** no display device.
- **Claude Code native computer use and Claude in Chrome:** they drive only the real local display or profile.
- **cua Lume:** Apple Silicon only.

## Safety defaults

The first four follow Anthropic's computer-use guidance.

1. **Dedicated, minimal-privilege guest.** Reset it from a snapshot or recreate it per task. Avoid a privileged container unless it runs the VM variant, and document why.
2. **No secrets in the guest.** No host credentials, SSH keys, tokens, browser profiles or logged-in accounts.
3. **Egress allowlist.** No open internet by default; allow only the domains the task needs.
4. **Human confirmation** for consequential actions: submitting, purchasing, sending, deleting.
5. **One project folder, read-only** (virtiofs/9p, or a bind mount with `:ro`). Anything writable goes through an explicit export directory.
6. **No host↔guest clipboard sharing.** On-screen and clipboard text is untrusted input and a prompt-injection vector.
7. **Accessibility tree first, screenshots on demand.** This is cheaper and more reliable. Screenshots are large, so each one is a real cost on the lane's meter.

## CLIProxyAPI considerations

- **Tool execution is local.** The proxy only carries model traffic, so the architecture is lane-independent.
- **Image passthrough works for GPT-6.1 Sol** (verified 2026-09-30, trial step 6). Screenshots return as image content inside MCP tool results, and CLIProxyAPI's Anthropic→OpenAI translation preserves them. Sol read a random six-letter code that was visible only on screen. GPT-6 Luna is untested.
- **Meter awareness.** GUI sessions are screenshot-heavy. Keep them on a single top-level session, not a fan-out; pick the lane deliberately and disclose which pool it spends.

## Trial plan

Scope:

- One local container.
- A throwaway guest with no logins.
- No changes to the host desktop.
- No changes to `profiles/desktop-bridge`, which is owned by the desktop pilot.
- No billable inference beyond the few test turns named below.

| # | Step | Pass gate |
|---|---|---|
| 1 | Pull and run `cua-ubuntu` under rootless Podman. If that fails, record why and try Docker. | Guest desktop visible in a browser viewer; the host screen is unaffected |
| 2 | Measure idle RAM, CPU, image size and cold-start time. | Numbers recorded |
| 3 | Apply the safety defaults: no network except an allowlist, a read-only project mount, no clipboard, a snapshot/recreate path. | Each default demonstrated, e.g. a blocked domain fails and writing to the mount fails |
| 4 | Register the cua MCP server in Claude Code (project scope) with **only low-level tools** exposed; confirm no model API key is configured for it. | `/mcp` lists the server; no agent/task tool is reachable |
| 5 | **Claude-lane task:** open an app in the guest, click a named button, type into a field, then take a screenshot and read back the result. | Task succeeds; the human keeps working on the host throughout |
| 6 | **Sol-lane task** (same script, GPT-6.1 Sol via CLIProxyAPI): the image-passthrough test. | Pass: the model describes screenshot contents correctly. Fail: record the proxy behaviour (dropped, placeholder, or error) |
| 7 | **Accessibility-only variant** on the failing lane, if step 6 fails. | Task succeeds from accessibility text alone, or is recorded as not viable |
| 8 | Reset the guest and confirm nothing persists. | Clean state |
| 9 | Write up evidence; decide the permission-kind design (reuse `desktop_session` or a new guest kind). | Doc promoted to `research`, with a decision logged |

If cua fails at step 1 or 4, repeat steps 3–8 with the rank-3 stack (Webtop + computer-use-linux in the guest) before trying the rank-2 VM.

## Trial results

Run 2026-09-30 on the Fedora KDE Wayland host. Artifacts live in a scratch directory outside the repo (`~/cu-sandbox-trial/`). The human kept using the host desktop throughout; nothing opened on it.

| # | Result | Evidence |
|---|---|---|
| 1 | **Pass** | `trycua/cua-ubuntu` under **rootless Podman**, `Privileged=false`. Viewer and API bound to `127.0.0.1` only; viewer HTTP 200. Docker not needed. |
| 2 | **Pass** | Image **12.2 GB**. Idle RAM **~0.9 GB**, idle CPU **~1% of one core**, viewer ready **~1.2–1.4 s** from a fresh container (image already pulled). |
| 3 | **Pass** (after fix) | Egress blocked (`curl https://example.com` → exit 6); the read-only share rejects writes; recreating the container leaves no guest state. The KasmVNC viewer clipboard was on by default and the first runtime flags did not disable it; the fix below closes that gap. |
| 4 | **Pass** | Legacy `cua-mcp-server` is **unsuitable**: its task-runner tools (`run_cua_task`, …) always register and call `ComputerAgent`. The image's `computer_server` MCP, narrowed with FastMCP `remove_tool` to an **exact allowlist** (screenshot, click, type, press_key, accessibility_tree) and launched via `podman exec -i`, needs **no model key**. It was loaded per-run with `--mcp-config … --strict-mcp-config`, not registered in any project. |
| 5 | **Pass** | Headless `claude -p`, **Sonnet 5.5** through CLIProxyAPI: read the code, clicked, typed, and pressed Enter; the in-guest answer file matched. 6 turns, ~18 s. |
| 6 | **Pass** | Same script on **GPT-6.1 Sol** through CLIProxyAPI: same result. 6 turns, ~48 s. |
| 7 | Skipped | Only needed if step 6 failed. Note: the guest's accessibility tree comes back as an empty `"Linux Window"` placeholder, so an accessibility-only fallback was **not viable in the base image**. The optional accessibility image added on 2026-10-01 fixes this; see [Accessibility fix](#accessibility-fix). |
| 8 | **Pass** | Recreate-and-verify: `RESET_NO_GUEST_STATE`, egress still blocked, share still read-only. Container left stopped. |

**Verification design:** each run showed a fresh random six-letter code in a guest terminal. The model had to report it and then type the *reversed* code into a file that was checked inside the guest. Reading the code requires seeing the screenshot, because the accessibility tree is empty. Typing the reversed code proves click, type and key delivery.

**Cost signal:** each run was 6 turns. Claude-side usage was ~200k input tokens, mostly cached (Claude Code system prompt plus screenshots), and each screenshot is a JPEG image block. Keep GUI sessions to a single top-level session, per the meter guidance above.

**Step 9 decision (proposed):** guest sessions get their **own permission kind** rather than reusing `desktop_session`. The risk profile differs: a guest has no host input, no host capture and no secrets. The grant should name the container and the allowed tool set, and approval stays with the human via the same controller. The design and implementation belong to the permission-core owner.

### Clipboard fix

**Root cause:** `vncserver` tracks command-line options by their literal spaced form, so `-SendCutText=0` is not seen as an explicit setting. It then appends YAML-derived arguments, and the shipped defaults (`/usr/share/kasmvnc/kasmvnc_defaults.yaml`) enable clipboard in both directions. The result was `SendCutText 1` / `AcceptCutText 1` after the intended `0`. The image's startup script also appends `KASM_SVC_SEND_CUT_TEXT` / `KASM_SVC_ACCEPT_CUT_TEXT` after `VNCOPTIONS`. These variables are unset by default, but they are a second override point.

**Fix:** a small local derived image, built offline (`--pull=never --network=none`) from the pinned base image ID. Its two layers of protection are:

- **The system YAML** (`/etc/kasmvnc/kasmvnc.yaml`): both clipboard directions are disabled, server-to-client primary selection is disabled, and the runtime-override allowlist is reduced to `pointer.enabled`.
- **The environment:** `-SendCutText 0 -AcceptCutText 0 -SendPrimary 0 -SetPrimary 0` in spaced form, both in `VNCOPTIONS` and in the two `KASM_SVC_*` variables. `SetPrimary` has no YAML mapping, so only the flag covers it.

**Verification (all passed):**

1. Every occurrence of the four flags in the final Xvnc arguments is `0`.
2. The effective YAML shows both directions disabled.
3. In-guest `vncconfig` attempts to set each flag to `1` are refused, and readbacks stay `0`. Note that the setter still exits `0`.
4. A headless authenticated RFB/websocket probe confirms clipboard and primary export are denied and Kasm binary paste is rejected. Its positive control is that the same probe *did* transfer text against the unhardened image.
5. Reset, egress and read-only checks still pass.
6. The five-tool MCP smoke still passes.

**Residual limits:**

- This was a protocol-level test, not a real browser against the host clipboard.
- Only `text/plain` was exercised.
- It is viewer-channel policy, not DLP against guest code starting another server.
- Reverify after any base-image or KasmVNC upgrade.

### Display geometry fix (2026-10-03)

**Root cause:** the same YAML-precedence defect as the clipboard override left the real guest screen at 1024×768 even though `VNC_RESOLUTION` requested 1280×720 and the mediator accepted x 0–1279 / y 0–719. KasmVNC defaults pin `desktop.resolution` to 1024×768 and enable `desktop.allow_resize`; a viewer could therefore change the screen during a session.

**Fix:** the derived image now pins 1280×720 with `allow_resize: false`. Both the image and CLI force spaced `-AcceptSetDesktopSize 0` and remove `desktop` from `AllowOverride`, retaining only `AcceptPointerEvents` and all existing clipboard-denial flags. `display_geometry_matches_bounds` compares the real X screen with dimensions derived from `TOOL_SCHEMAS`, checks the effective three-layer YAML and runtime allowlist, and proves resize readbacks remain `0` after an enable attempt. Missing values or drift fail `up`, `reset`, `verify` and `mcp-launch`. The mediator also parses each screenshot PNG/JPEG header with the host standard library and withholds mismatched or unavailable image dimensions as drift.

**Evidence:** both images rebuilt offline and passed live verification (23/23 baseline, 24/24 accessibility). `xdpyinfo` and mediated JPEG screenshots agreed on 1280×720. Clicks at (1279,719) and (0,0) succeeded; (1280,0) and (0,720) were rejected by the mediator. Trap-guarded, timeout-bounded probes stopped both scratch containers; their final state was `exited`. No human-desktop or host-clipboard access was used. The deterministic suite passed 116 tests, including geometry failure/unavailable cases and screenshot drift rejection.

### Accessibility fix

**Root cause:** the empty tree is not an AT-SPI failure. The in-image `computer_server` Linux handler is a stub: `get_accessibility_tree` hard-codes `"Linux Window"` with no children and never queries accessibility. Installing packages or setting variables alone cannot change that.

**Fix (optional image, `localhost/cu-sandbox:a11y`):** built offline from the clipboard-off image, with no new packages.

- A bounded, read-only AT-SPI reader runs under the image's Python 3.10 using the already-installed `python3-dbus`. The image's default `python3` is 3.12, and the D-Bus/GI bindings are built for 3.10. The reader resolves `org.a11y.Bus.GetAddress` on the existing desktop session bus and walks the registry root via `Accessible.GetChildren`, `Name`, `GetRole` and `GetState`.
- Only the stub handler is swapped before the MCP server is created. The exact five tool names and the allowlist stay unchanged.
- It reuses the desktop's own session bus (published guest-only at startup) rather than starting a second bus, and it fails closed if the bus is absent. `QT_LINUX_ACCESSIBILITY_ALWAYS_ON=1` covers Qt apps.
- It enforces limits on nodes (2000), depth (32), time (8 s) and output (128 KiB). Password fields are redacted. A real empty tree is distinguished from a backend failure; it never returns a fake success.

**Verification (all passed):** a real tree came back through the unchanged MCP: 117 nodes, no skipped errors, no truncation. It contains the terminal window with its visible text and the GTK label, button and entry. Text typed through the MCP appears in the tree, and the results hold after restarting the apps and after recreating the container. The image passes all 23 `verify` checks, including the real accessibility backend, and 12 reader and session unit tests.

**Limits:**

- The tree covers the whole desktop, not just the active window.
- Coverage depends on the app. Canvas and other inaccessible apps still need screenshots.
- The clipboard-off image stays the default. Selecting the accessibility image requires a reset.

**Alternatives assessed, not built:**

- `pyatspi` or GI `Atspi`: needs staged packages.
- Cua Driver in the guest: a native AT-SPI client, but it exposes a wider tool surface and needs a filtering adapter.
- computer-use-linux in the guest: viable to test, but don't run its broad install script.

### Sandbox CLI

`cu-sandbox` is a single-file Python tool (stdlib only on the host) that replaces the trial's ad-hoc scripts:

The reusable tool, both derived-image sources, and offline tests now live at [`profiles/cu-sandbox/`](../../profiles/cu-sandbox/). See its README for portable paths, pinned-base provisioning, and per-run MCP configuration; it remains trial-grade until the guest-session permission kind is implemented.

| Command | Does |
|---|---|
| `build` | Offline build (`--pull=never --network=none`) of the derived image |
| `up` / `down` / `reset` | Start with the safety flags, wait for readiness, verify; stop; recreate from the image |
| `verify [--json]` | 23 containment checks (24 with the accessibility image): rootless, internal network, DNS and direct-IP egress blocked, loopback-only listeners, read-only share, guest UID 1000, no-new-privileges, resource limits, no model keys, all four clipboard/primary flags pinned to `0`, fixed 1280×720 X dimensions with resizing disabled, and the exact five-tool allowlist. A stopped container returns `ok=false` with exit 1. |
| `mcp-config` | Prints a per-run MCP config for `claude --mcp-config … --strict-mcp-config`; registers nothing |
| `status` | Container state and listeners |

**Review fixes:** a fresh-context adversarial review of the Sol-built tool found two medium issues, both fixed and rechecked.

- **The generated MCP launch now gates on containment.** It runs a host-side `mcp-launch` step that re-verifies the running container. It then binds both the guest checks and the adapter `exec` to the container's immutable ID, not its reusable name. A saved config now refuses a same-name container that was recreated with a different image.
- **Interrupted startup now cleans up.** Ctrl-C, `SystemExit` or SIGTERM during `up`/`reset` stops the container without masking the original error.

There are 29 unit tests. The check runs at adapter startup and is not continuous; configs saved before the fix must be regenerated.

## Open questions

- ~~Rootless Podman?~~ Yes for the container. The KVM VM variant is still untested.
- ~~Low-level-only MCP?~~ Yes, via the narrowed `computer_server` adapter; not via legacy `cua-mcp-server`.
- ~~Image passthrough to GPT?~~ Yes for Sol; Luna is untested.
- ~~Clipboard?~~ Off in both directions via a derived image; see [Clipboard fix](#clipboard-fix).
- ~~Accessibility?~~ Real tree via a direct AT-SPI reader in an optional image; see [Accessibility fix](#accessibility-fix). Whether to scope it to the active window is still open.
- **Cua Driver** (`cua-driver mcp`) is model-free and does native AT-SPI, but exposes a broader surface. It is the next candidate if the reader's coverage falls short.
- Can computer-use-linux target a guest display from the host, or must it run inside the guest?
- Guest permissions: extend `desktop_session` with a target (host desktop vs. named guest), or add a separate kind? The current consumer of the desktop bridge prefers a separate kind. Its natural binding is the immutable container ID that `mcp-launch` already verifies.
- ~~Should `cu-sandbox` move from the trial directory into this repo as a profile?~~ Resolved: promoted to [`profiles/cu-sandbox/`](../../profiles/cu-sandbox/) with portable paths and offline tests; trial evidence stays outside the repo.

## See also

- [[desktop-computer-use-pilot]] — governed real-desktop computer use (the fallback)
- [[browser-automation-pilot]] — focus-free browser automation via CDP
- [[claudex-codex-models-via-cliproxyapi]] — lanes, meters and routing
- [[portable-agent-permissions]] — the human-approved permission core
