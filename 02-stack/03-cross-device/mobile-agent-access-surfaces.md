---
title: Mobile agent access surfaces
description: Decision guide for controlling local coding-agent sessions from a phone through terminal clients, Mosh, Claude Remote Control, T3 Code, remote desktop, or read-only tailnet browser surfaces.
stratum: 2
status: research
sidebar:
  order: 2
tags:
  - stack
  - cross-device
  - mobile
  - tailscale
  - ssh
  - mosh
  - claude-code
  - t3-code
  - termux
date: 2026-08-24
branches: [agentic]
---

A phone can be a terminal, a chat-native controller, a remote display, or a read-only
browser. Those are different products with different trust boundaries. Choosing one tool
before naming the interaction problem leads to false comparisons—for example, Mosh can
improve roaming but cannot turn terminal scrollback into message cards with copy buttons.

## Invariants for this stack

1. Project files, Git, local instructions, Portagenty manifests, and durable knowledge stay
   authoritative; a frontend is a control surface, not a second project database.
2. Execution should remain on the workstation unless cloud execution is chosen explicitly.
3. Tailscale is the default private-network perimeter. No public listener, tunnel, relay,
   or account-mediated control plane is enabled implicitly.
4. Portagenty and Zellij remain useful when the selected surface is terminal-shaped. A
   chat-native control plane may manage provider sessions directly instead of pretending to
   be a terminal.
5. Battery, clipboard behavior, Android background survival, and large-output readability
   require device testing; architecture alone cannot prove them.

## The option matrix

| Surface | Interaction model | Execution boundary | Remote path / trust boundary | Clipboard and long output | Material tradeoff | Current posture |
|---|---|---|---|---|---|---|
| **Termux + SSH + Zellij** | Full terminal/Linux userspace | Workstation after SSH; Android also runs a local userspace | Tailscale + SSH | Zellij emits OSC 52; Termux accepts clipboard writes but its OSC payload is size-limited and terminal selection remains awkward | Flexible and local-first, but observed battery and touch-selection friction | Current baseline and repair shell |
| **ConnectBot + SSH + Zellij** | Dedicated Android SSH terminal | Workstation | Tailscale + SSH; credentials remain device-local by default | ConnectBot 1.10.x supports OSC 52, so Zellij scroll-mode copy can reach Android without touch-selecting the viewport | No integrated Mosh; still a terminal rather than a chat UI | Lowest-risk terminal-client trial |
| **Termux + Mosh + Zellij** | Full terminal with roaming transport | Workstation | SSH bootstrap, then encrypted UDP over the tailnet | Zellij must retain server-side scrollback because Mosh synchronizes visible terminal state, not complete history | Keeps Termux's UI/battery characteristics and adds server/UDP policy | Transport experiment only if roaming is the problem |
| **Termius Starter + Mosh + Zellij** | Polished proprietary mobile terminal | Workstation | SSH bootstrap + Mosh UDP; optional Termius account/vault features add another trust surface | Recent Android releases advertise OSC 52; exact payload and Zellij behavior need device verification | Mosh is advertised in the free tier; proprietary client and optional cloud vault | Secondary terminal/Mosh trial |
| **Claude Code Remote Control** | Official chat-native browser/mobile client | Claude Code process, tools, MCP servers, and filesystem stay on the workstation | Outbound TLS through Anthropic infrastructure; synchronized activity is account-mediated | Structured conversation UI avoids terminal scrollback and touch selection | Transcript/control synchronization crosses the Anthropic boundary; not tailnet-only | Strong official UX candidate; off until explicitly approved |
| **T3 Code over Tailscale** | Open-source web/desktop/mobile control plane for multiple agent CLIs | T3 server owns provider processes, terminals, Git, and filesystem operations on the workstation | Authenticated WebSocket to a local T3 server; official pairing supports Tailnet IPs or opt-in Tailscale Serve HTTPS | Chat-native threads, diffs, terminals, and review surfaces address the interface problem directly | Adds a persistent local server, pairing/session credentials, Node runtime, update lifecycle, and optional hosted-web/T3 Connect surfaces | Legitimate first-class candidate; evaluate before installation |
| **Tailnet-constrained remote desktop** | Full graphical workstation UI | Workstation | Tailscale plus separately verified remote-desktop transport | Native GUI selection, copy controls, diffs, and tabs | Heavier pixels-on-the-wire interaction; relay/listener behavior needs verification | Graphical fallback, not yet adopted |
| **Tailnet browser access** | Read-only files, reports, previews, artifacts | Workstation serves selected content | `tailscale serve` + a scoped local HTTP server | Excellent reading and browser copy; no agent control | Deliberately not interactive control | Best for finished evidence and long reports |

## What each layer actually solves

### Transport: SSH versus Mosh

SSH is already private and stable over Tailscale. Zellij preserves the remote process when
SSH disconnects. Mosh earns its additional server and UDP surface only when Wi-Fi/cellular
roaming, latency, or packet loss is the remaining pain.

Mosh authenticates through SSH, starts `mosh-server`, closes SSH, and continues over an
encrypted UDP port—normally selected from the 60000–61000 range, although a fixed port can
be chosen. It synchronizes visible terminal state rather than replaying every historical
update, so Zellij/tmux/screen or command-specific pagers must own durable scrollback.

**Decision:** do not use Mosh as a clipboard or interface fix. Evaluate it after the client
surface is chosen and only if transport behavior still hurts.

### Terminal clipboard: OSC 52

Zellij uses OSC 52 by default. Over SSH, OSC 52 is its supported bridge from remote
selection to the local terminal clipboard. This can remove Android drag-selection from the
copy path:

```text
Zellij scroll mode → Copy → OSC 52 → Android terminal → Android clipboard
```

This is still terminal-shaped. It does not create per-response copy buttons, collapsible
tool calls, rendered diffs, or message cards. Very long content should leave the terminal
as a file, report, artifact, or chat-native thread.

Keep clipboard reads disabled. Zellij deliberately returns empty data to pane programs that
request clipboard contents unless a dangerous opt-in is enabled; remote software should be
able to write a deliberate selection without silently reading unrelated clipboard secrets.

### Chat-native control: official versus local web control plane

Remote Control and T3 Code both solve the presentation problem rather than trying to make
terminal selection pleasant, but their control planes differ:

- **Remote Control:** Claude Code remains local and opens no inbound port; control and
  synchronized session activity traverse Anthropic infrastructure and account auth.
- **T3 Code:** a local T3 server is the execution boundary. Web, desktop, and mobile clients
  connect over one authenticated WebSocket. It launches installed provider CLIs—including
  Claude Code—rather than bundling their credentials or replacing them.

T3 Code's official remote guide supports one-time pairing tokens, session revocation, direct
Tailnet IP/MagicDNS endpoints, and opt-in Tailscale Serve HTTPS. The hosted
`app.t3.codes` client connects directly to the configured backend; it does not proxy the
agent session, but browser HTTPS rules require an HTTPS/WSS backend. Pairing URLs remain
credentials and can leak through screenshots, history, logs, or copy/paste.

The official native T3 mobile app exists in the repository but is currently documented as
in development and not generally distributed. The practical near-term phone route is the
web client paired to a tailnet-reachable backend, not an assumed production mobile app.

## Battery hypotheses to test, not declare

- A permanent `termux-wake-lock` prevents CPU sleep and explicitly increases standby use;
  an outbound SSH client normally should not need a permanent wake lock.
- Tailscale identifies routing all phone traffic through an exit node as a common mobile
  battery-drain source.
- Streamed terminal output still costs client-side rendering, scrollback buffering, VPN
  transport, radio activity, screen time, and software-keyboard work even when inference
  and tools run remotely.
- A dedicated SSH client may use less power than a full Termux userspace, but only an A/B
  test on the actual phone can establish that.
- A chat-native browser surface may reduce terminal redraw and selection friction, but the
  browser, WebSocket, and screen can still dominate active use.

## Evaluation order

### 1. No-server-change terminal trial

Compare current Termux SSH against ConnectBot SSH using the same Tailscale path, Zellij
workspace, brightness, idle interval, and streamed-output interval. Verify OSC 52 through
Zellij and record Android's per-app attribution for the terminal client and Tailscale.

### 2. Chat-native proof of fit

Evaluate the two credible control-plane routes separately:

- **Remote Control:** accept or reject Anthropic-mediated synchronization explicitly.
- **T3 Code:** inspect and approve the local server, binding address, pairing/session model,
  provider process behavior, Tailscale Serve mapping, resource containment, and update
  lifecycle before installation.

Do not treat starting a T3 server or enabling Remote Control as a cosmetic UI toggle. Both
change the access architecture, in different directions.

### 3. Transport trial only if needed

If the selected client still loses usability during roaming, compare Mosh using a fixed UDP
port inside the tailnet. Keep Zellij as the durable session/scrollback owner. Installation,
host firewall changes, and tailnet policy changes require a separate approval checkpoint.

### 4. Long-output escape hatch

Regardless of control surface, hand long reports to the phone as browser-readable content:
private artifacts, rendered docs, or a narrowly scoped tailnet-served report. Copying a
multi-page answer out of terminal history should be an exception, not the normal workflow.

## Decision record

No replacement is selected yet. The standing conclusions are narrower:

1. **T3 Code is a real option**, not a hypothetical PWA wrapper. Its official architecture
   is explicitly server + web/desktop/mobile clients + installed provider CLIs.
2. **Remote Control is the lowest-setup official chat-native route**, with an
   Anthropic-mediated trust boundary.
3. **ConnectBot is the lowest-risk terminal-client experiment** for OSC 52 and potential
   battery improvement.
4. **Mosh is a transport option, not the answer to copy/paste.**
5. **Termux remains valuable as a repair shell** even if it stops being the primary mobile
   Claude interface.

## Primary sources

- [T3 Code](https://t3.codes/) and [official repository](https://github.com/pingdotgg/t3code)
- [T3 Code installation](https://github.com/pingdotgg/t3code/blob/main/docs/user/install.md)
- [T3 Code remote access](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md)
- [T3 Code architecture](https://github.com/pingdotgg/t3code/blob/main/docs/internals/overview.md)
- [T3 Code mobile status](https://github.com/pingdotgg/t3code/blob/main/apps/mobile/README.md)
- [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control)
- [Mosh official documentation](https://mosh.org/)
- [Zellij clipboard FAQ](https://zellij.dev/documentation/faq.html)
- [ConnectBot changelog](https://github.com/connectbot/connectbot/blob/main/CHANGELOG.md) and [privacy model](https://connectbot.org/privacy/)
- [Termius Android client](https://www.termius.com/free-ssh-client-for-android), [pricing](https://termius.com/pricing), and [security overview](https://support.termius.com/hc/en-us/articles/4402480134169-Termius-Security-Overview)
- [Termux Mosh package](https://github.com/termux/termux-packages/blob/master/packages/mosh/build.sh), [terminal emulator OSC implementation](https://github.com/termux/termux-app/blob/master/terminal-emulator/src/main/java/com/termux/terminal/TerminalEmulator.java), and [wake-lock documentation](https://github.com/termux/termux-tools/blob/master/doc/termux.1.md.in)
- [Tailscale mobile battery troubleshooting](https://tailscale.com/docs/reference/troubleshooting/mobile/battery-drains)
- [Tailnet browser access](../patterns/tailnet-browser-access.md)
- [Claude Code UI trust boundaries](../01-ai-coding/claude-code-ui-trust-boundaries.md)
