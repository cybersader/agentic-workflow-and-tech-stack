---
title: Isolated-display lane for governed computer use
description: Why masking windows on the shared seat cannot work, and the design for a second desktop-bridge lane that gives the agent its own private X display — a bridge-owned xdotool/import child instead of the portal+uinput vendor binary, display-scoped terms, per-mode attestation, and a local viewer.
stratum: 5
status: research
date: 2026-09-14
tags:
  - research
  - computer-use
  - mcp
  - x11
  - permissions
  - security
---

Design note. The Xvfb isolation spike below was actually run and torn down; the lane itself is not built.
Follow-on from [the bridge design](./2026-09-12-computer-use-linux-mcp-design.md) and the operating guide
[`desktop-computer-use-pilot.md`](../../../02-stack/01-ai-coding/desktop-computer-use-pilot.md).

## Context

Lane 1 — the shipped pilot — is a **shared seat**: the agent and the human use the same display, the same
pointer, and the same keyboard focus. A field run on 2026-09-14 in an Electron-app project exposed both
kinds of problem that lane 1 has: sharp edges in the bridge itself (recorded in
[today's worklog](../zz-log/2026-09-14.md)) and one that is not a bug at all — the human cannot use their
own computer while the agent works, and the agent cannot see anything except the window that happens to
hold focus.

The obvious wish — "let the agent see and drive only the allowlisted window, and mask everything else" —
turns out not to be achievable on the shared seat. That is what pushed lane 2.

## Findings

### Verified this session

- **A private Xvfb display gives real capture isolation.** Started as this user on a high display number, a
  capture of that display showed only what was launched on it — nothing from the real desktop leaked in.
  The display was killed afterwards and verified gone.
- **The vendor binary does not follow `DISPLAY` onto the private display.** `computer-use-linux` v0.5.0
  pointed at the private display still captured the real desktop through the desktop portal and still
  injected input to the real seat through `uinput`. It does not fail; it silently operates on the wrong
  display. **Consequence: the vendor binary cannot be the child for lane 2.**
- **Forced-X11 re-test refines that, and does not reverse it** (read-only; `doctor` only — no screenshot or
  input tool was ever called). Under
  `env -i PATH HOME USER LANG DISPLAY=:97 XDG_SESSION_TYPE=x11 XDG_RUNTIME_DIR=<scratch>`, with no
  `WAYLAND_DISPLAY` and no `DBUS_SESSION_BUS_ADDRESS`, `doctor` reported input
  `["abs_pointer","xdotool"]`, screenshot `["portal"]`, window_control `["kwin"]`, isolation `["shared"]`;
  preferred `abs_pointer` / `portal` / `kwin`. So the binary honours `DISPLAY` for exactly one path — the
  **xdotool keyboard** backend — and for nothing else:
  - **No xdotool/XTEST pointer force exists.** The complete set of force knobs is
    `FORCE_XDOTOOL_KEYBOARD`, `FORCE_YDOTOOL_KEYBOARD`, `FORCE_YDOTOOL_POINTER`, `FORCE_PORTAL_POINTER`,
    `FORCE_PORTAL_KEYBOARD`, `SCREENSHOT_BACKEND`. Pointer has no X11 option at all.
  - **No X11 screenshot backend is in the binary.** No `import`, `scrot`, `xwd`, or `maim` strings — only
    the portal and `gnome-screenshot`. `SCREENSHOT_BACKEND` was tried with `x11`, `import`, `xdotool`,
    `auto`, `portal`, and an invalid token: always `["portal"]`, and the invalid token was not rejected.
  - **The X11 window backend loses to KWin** whenever the session bus is reachable, and it needs `wmctrl`,
    which is not installed here.
  That is two of three needs missing as **upstream features, not configuration** — capture and pointer
  cannot be pointed at a private display by any amount of environment work.
- **Environment scrubbing is not a boundary.** With `WAYLAND_DISPLAY` and `DBUS_SESSION_BUS_ADDRESS`
  absent, `doctor` still found `unix:path=/run/user/<uid>/bus`, the real `XAUTHORITY`, and
  `xdg_current_desktop: KDE`; every real portal answered ok (`desktop_portal`, `remote_desktop`,
  `screencast`, `screenshot`, `input_capture`), and `/dev/uinput` probed read/write. Inference: sd-bus
  derives the bus path from the uid, so only a uid, namespace, or socket-level boundary would sever it.
- **Allowlist matching is `app_id`-only, exact, case-sensitive** (`profiles/desktop-bridge/lib/scope.mjs:100`).
  `wm_class` is extracted by `lib/window-facts.mjs` and then never consulted.

### Reasoned, not measured

- **Masking cannot be enforced.** A capture proxy that blacked out non-allowlisted windows would still leave
  *input* on the shared seat: focus stealing, and keystrokes landing in whatever the human is typing into.
  And nothing in the mask is enforceable against a vendor binary that reaches the portal directly.
- **The realistic industry model is a separate display, not a VM.** Vendor computer-use demos, hosted
  sandbox runners, browser-driving agents, and CI GUI harnesses all give the agent its own X server and
  leave the human's seat alone. Lane 2 copies that, not a hypervisor.

### Prior art already inside this environment

Two of the user's own Obsidian-plugin projects already do this: one gates releases on WebDriver tests run
against a private Xvfb (a `linux-x64-xvfb` attestation string, an environment allowlist, and a
display-failure regex), and another runs ad-hoc private-Xvfb test sessions. Lane 2 is the same pattern with
a permission card in front of it — consistent with existing practice rather than a new mechanism.

## Design

### Shape: a second, bridge-owned child

Lane 2 keeps the whole governed skeleton — request, human approval, grant, per-call counters, owned
cleanup — and swaps the child:

| | Lane 1 (shared seat) | Lane 2 (isolated display) |
|---|---|---|
| Child | vendor `computer-use-linux` | bridge-owned `x11-child` |
| Capture | desktop portal (real seat) | `import` / `xwd` on `:N` |
| Input | `uinput` absolute pointer (real seat) | `xdotool` (XTEST) on `:N` |
| Window facts | vendor `focused_window` | `xprop` / `xdotool` on `:N` |
| Human impact | human must stop using the machine | none; human keeps the real seat |

`x11-child` is a small MCP server the bridge owns and launches, bound to the private display. Writing it
ourselves is what makes `DISPLAY` load-bearing: every backend it uses is display-scoped by construction.

### Terms

Two new fields on the approval card:

- `terms.display` — the private display the grant is bound to.
- `terms.launch` — the argv the bridge launches *inside* that display, **printed verbatim on the card**.
  The human approves the exact command line, not a description of it.

### Launcher environment

The bridge sets, for the launched app:

```text
DISPLAY=:N
QT_QPA_PLATFORM=xcb
GDK_BACKEND=x11
ELECTRON_OZONE_PLATFORM_HINT=x11
WAYLAND_DISPLAY   (unset)
```

Unsetting `WAYLAND_DISPLAY` is not cosmetic — a toolkit that finds it will go to the real compositor and
the isolation is gone. These are assertions, not hints: the launcher should refuse if they do not hold.

### Display allocation

`O_EXCL` lock files per display number, allocating at `:90` and above. Numbers below that are left alone,
and `:99` specifically is already owned by another project's test harness.

### Attestation is per-mode, and inverted

Lane 1 requires an attestation that the pointer went through the `uinput` absolute-pointer backend. In
lane 2 that exact marker becomes a **failure** marker: seeing it proves the wrong backend ran and the call
escaped onto the real seat. The same string means "healthy" in one lane and "abort" in the other, so the
check has to be selected by lane, never shared.

### Viewer

Xephyr preferred — it is a local X client with no listening socket, so watching the agent costs no network
surface. `x11vnc` only if the human wants remote viewing, and then bound to `127.0.0.1`.

> [!danger] `DISPLAY` is not a boundary for portal or uinput tools
> Any tool that captures through `xdg-desktop-portal` or injects through `uinput`/`ydotool` acts on the
> **real seat regardless of `DISPLAY`**. A test that only asserts `DISPLAY` was set to the private display
> proves nothing at all — the vendor binary passes that test while capturing the human's screen.
>
> The only acceptable attestation is a **capture of the private display that shows a sentinel window
> launched there, and does not show a sentinel placed on the real desktop.** Both halves are required: the
> positive proves the display works, the negative proves nothing leaked.
>
> **And unsetting `WAYLAND_DISPLAY` / `DBUS_SESSION_BUS_ADDRESS` is not containment either.** With both
> absent, the vendor binary still found the session bus at `unix:path=/run/user/<uid>/bus`, the real
> `XAUTHORITY`, and every live portal — sd-bus derives the bus path from the uid. A scrubbed environment
> only hides the variables; it severs nothing. Real containment would have to be a uid, namespace, or
> socket-level boundary, which lane 2 explicitly does not attempt.

## Decisions taken by the human

- **Write `x11-child`** (Node, zero dependencies, `xdotool` / `import` / `xprop`). The search for a
  maintained X11-native computer-use MCP server to vendor-pin instead came up empty; the only runner-up,
  `tak-uukti/linux-computer-use` (Python + AT-SPI, `xdotool`/`scrot`, no shell tool, ~3 stars), would drag
  in a Python dependency chain for a server we would still have to review line by line. Keep it named as
  the fallback if `x11-child` stalls.
- Install `xdotool`, `xorg-x11-server-Xephyr`, and `openbox`; the human runs the package manager. Current
  state: `xdotool`, Xephyr, `import`, and `xprop` are **already installed**; only `openbox` may be missing.
  `wmctrl` and `scrot` are not installed, and nothing in this design needs them.
- **Residual risk accepted:** the private display runs as the same user on the same filesystem, so an app
  launched there can read the user's files. The boundary this lane buys is *display and input isolation*,
  not a sandbox. Stated plainly on the card and in the docs.
- "Invisible or visible are both fine" — headless is acceptable, but a viewer is wanted.

## Open items

- Whether the lane-2 policy reuses lane 1's counters or gets its own ceilings (a private display has a
  different blast radius, so the pilot's 15 min / 20 actions is probably too tight).
- How `stop-desktop-bridge` tears down the display (the lock file, the X server, the viewer) as one owned
  group.

## Effort

Seven bounded chunks, ~1,900 lines, roughly 60–65% reuse of the existing bridge:

1. Display manager + `O_EXCL` allocation
2. `x11-child` MCP server (`xdotool` / `import` / `xprop`)
3. Terms, policy, and schema for `display` + `launch`
4. Approval card with verbatim argv
5. Launcher environment assertions
6. Stop path + guard learning about a second lane
7. Isolation test suite (sentinel-on-private / sentinel-on-real, both halves)
