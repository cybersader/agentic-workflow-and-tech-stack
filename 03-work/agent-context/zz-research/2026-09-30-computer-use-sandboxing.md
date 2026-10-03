---
title: Computer-use sandboxing — letting an agent drive a GUI while the human keeps working
description: Research crumb on running agent computer-use in a local VM/container sandbox on a Linux KDE Wayland host so the human keeps their own screen, plus why focus-free control of the real Wayland desktop is only partially possible (AT-SPI actions, browser via CDP).
stratum: 5
status: research
date: 2026-09-30
tags:
  - research
  - computer-use
  - sandboxing
  - desktop-automation
---

## Question

Can an agent use a GUI while the human keeps using the machine — without the agent having to focus windows on the human's desktop?

## Answer

Yes, when the agent gets **its own display inside a sandbox**. Focus and pointer movement then happen on the sandbox's screen, not the human's, so "focus the right window" stops being the human's problem. Controlling the **real** Wayland desktop without focus is only partly possible (see below).

## Viable local sandboxes (Linux/KVM host, 2026-09)

| Rank | Stack | Isolation | Agent interface | MCP | Watch live | Main gotcha |
|---|---|---|---|---|---|---|
| 1 | **trycua/cua** — `cua-ubuntu` container, or QEMU-in-container VM | Container, or full KVM VM | In-guest `computer-server` (HTTP/WS); newer Cua Driver reads the accessibility tree first | Official `cua-mcp-server` | Browser (KasmVNC) | Docs assume Docker, Podman untested; RAM/boot figures unpublished; documented for Claude Desktop/Cursor, not Claude Code |
| 2 | **libvirt/KVM VM + community MCP** (mcp-libvirt-vm-use, boxes-mcp) | Full VM | SPICE screenshots + input | Community stdio servers | virt-viewer / Boxes | You build the guest; small maintainer base |
| 3 | **LinuxServer Webtop/Kasm + agent-sh/computer-use-linux in the guest** | Container | AT-SPI + portal input inside the guest | Yes, once installed in the guest | Browser (KasmVNC) | Two projects to wire together; the guest compositor choice matters |

Ruled out:

- **e2b desktop:** cloud-first; no supported bare-Linux self-host path.
- **agent-workspace-linux:** a hidden Xvfb display on the host kernel, not a sandbox.
- **Anthropic computer-use-demo:** a standalone app, not an MCP tool.
- **Firecracker:** no display device.
- **Claude Code native computer use and Claude in Chrome:** they drive only the local real display or profile.
- **cua Lume:** Apple Silicon only.

## Safety defaults

The first four are Anthropic's computer-use guidance: a dedicated minimal-privilege VM or container, no sensitive data or logins, a domain allowlist for egress, and human confirmation for consequential actions.

1. Ephemeral or snapshot-reset guest per task.
2. No host credentials, SSH keys or browser profiles in the guest. Share one project folder, read-only (virtiofs/9p).
3. Egress allowlist; no open internet by default.
4. No host↔guest clipboard sharing. On-screen text is untrusted input (prompt injection).
5. Session start stays behind a human-approved grant, re-pointed from the real desktop to the guest.

## Focus-free control of the real KDE Wayland desktop (fallback)

- **AT-SPI2 actions** (do_action, Value, EditableText) are the only mechanism that works without focus.
  - Works: GTK4, Qt5/6, and Firefox. GTK3 needs at-spi2-atk.
  - Electron/Chromium need `--force-renderer-accessibility`.
  - Buttons, toggles and value-sets are reliable. Typing text may still need perceived focus.
  - `do_action` can hang on modal dialogs.
- **Every Wayland input path is seat-focus-bound by design:** libei/EIS, the RemoteDesktop portal, and KWin scripting. The kwin-mcp project hit this wall.
- **XWayland `XSendEvent` is dead:** GTK and Qt reject synthetic events.
- **The cua Driver's background delivery** is X11/XWayland only and untested on KDE.
- **The browser is the clean exception:** CDP/Playwright acts on the renderer without OS window focus. It needs focus emulation, and wheel events are flaky. Route this through the governed browser bridge.

## CLIProxyAPI fit

- **MCP tools run locally in Claude Code,** so the approach is lane-independent. The proxy only carries model traffic.
- **Never enable a sandbox product's built-in agent loop.** It would call providers directly and bypass the proxy, the meters and the guard.
- **Screenshots return as tool-result images.** Whether the proxy's Anthropic→OpenAI translation preserves them for Sol and Luna is unverified, so it is a trial gate.
- **Screenshots are token-heavy.** Prefer the accessibility tree.

Promoted into a plan: [[sandboxed-computer-use-plan]].

## Open questions (resolve with a trial)

- cua under rootless Podman with `/dev/kvm`.
- cua container RAM and cold-start time.
- `cua-mcp-server` registered in Claude Code (stdio).
- Whether computer-use-linux can target a guest display from the host, or must run inside the guest.

## Sources

- [trycua/cua](https://github.com/trycua/cua)
- [cua QEMU container](https://cua.ai/docs/cua/reference/desktop-sandbox/qemu-container)
- [cua MCP server](https://cua.ai/docs/cua/reference/mcp-server/installation)
- [Inside Linux computer-use](https://cua.ai/blog/inside-linux-computer-use)
- [agent-sh/computer-use-linux](https://github.com/agent-sh/computer-use-linux)
- [agent-sh/agent-workspace-linux](https://github.com/agent-sh/agent-workspace-linux)
- [mcp-libvirt-vm-use](https://github.com/xddxdd/mcp-libvirt-vm-use)
- [LinuxServer Kasm](https://docs.linuxserver.io/images/docker-kasm/)
- [Anthropic computer-use tool docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)
- [isac322/kwin-mcp #33](https://github.com/isac322/kwin-mcp/issues/33)
- [libei](https://libinput.pages.freedesktop.org/libei/)
- [e2b-dev/desktop](https://github.com/e2b-dev/desktop)

Related: [[desktop-computer-use-pilot]], [[browser-automation-pilot]].
