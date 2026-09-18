---
title: Desktop computer use without the Codex or Claude desktop apps
description: Survey of self-hosted GUI-level computer-use runtimes for a KDE Plasma 6 / Wayland host with CLIProxyAPI as the model gateway; ranked pathways and unverified claims.
stratum: 5
status: research
date: 2026-09-12
tags:
  - research
  - computer-use
  - wayland
  - cliproxyapi
  - mcp
---

## Question

A GUI-level computer-use agent (screenshot → reason → click/type on arbitrary desktop apps) on a native Fedora / KDE Plasma 6 / **Wayland** host, orchestrated from Claude Code, with models reached through CLIProxyAPI (`127.0.0.1:8317`) rather than the Codex or Claude desktop apps. Browser-origin automation is already covered by `02-stack/01-ai-coding/browser-automation-pilot.md`; this is the desktop gap.

## Two filters that decide everything

1. **Wayland input injection.** `xdotool`/`pyautogui` are X11-only. On KDE the working paths are `xdg-desktop-portal` RemoteDesktop (libei), `ydotool` (uinput), `wtype`, or KWin D-Bus scripting; screenshots via Spectacle or the portal ScreenCast API.
2. **Base-URL flexibility.** The runtime must accept an arbitrary OpenAI- or Anthropic-compatible endpoint so the existing proxy lanes carry the model.

## Survey (2026-09-12, Sonnet research worker; primary sources)

| Candidate | Backend flexibility | Wayland/KDE | Isolation | Verdict |
|---|---|---|---|---|
| Anthropic `computer_toolset_20260801` (client-side toolset over `/v1/messages`) | plain tool JSON; should pass through the proxy's Anthropic-format route — **unverified** | none (you supply the OS side) | n/a | substrate for a hand-rolled loop |
| `anthropic-quickstarts/computer-use-demo` | README lists only vendor keys; `ANTHROPIC_BASE_URL` **unverified** | controls its own X11 container, not the host | full (Docker + VNC) | sandbox to experiment in, not host control |
| Hermes Agent (Nous) + `cua-driver` | explicitly any OpenAI-compatible endpoint | **broken on KDE**: published `cua-driver` ships with `portal-libei` gated off (trycua/cua#1982) — cursor moves, input never dispatches | live desktop | wait for the upstream fix or self-build the driver |
| Cua / trycua | "bring your own model" | same driver, same gap; Lume VMs are macOS-only | none on Linux | same blocker as Hermes |
| Agent S3 (simular-ai) | `--model_url`, Anthropic/OpenAI/vLLM documented | `pyautogui` → X11 only; XWayland fallback per app | none (runs as the user) | most flexible off-the-shelf agent, but you own the X11 workaround |
| UI-TARS-desktop (ByteDance) | tied to UI-TARS/Seed-VL weights | no official Linux support (issue #9 open for years) | none | drop |
| OpenAdapt | n/a — pivoted to record-and-replay compiled workflows | AT-SPI capture | verification-gated replay | different product; drop for live use |
| Open Interpreter | upstream pivoted to a coding agent; computer-use survives only in forks | — | — | drop |
| `agent-sh/computer-use-linux` (Rust MCP server + CLI) | any MCP host, so Claude Code on an existing lane | KDE is in the support matrix with a trail of KDE-specific fixes, but upstream's stated validation is Ubuntu/GNOME Wayland (correction 2026-09-12, see design doc); fallback chain AT-SPI → KWin D-Bus → portal → `ydotool`; no restricted mode/allowlist built in | live desktop | **best ready-made fit**, restrictions must be built outside it |
| `wayland-computer-use` (wh0ami3, PyPI) | no bundled model; `WCU_AIMER` hook for any vision call | tested end-to-end on **KDE Plasma 6 Wayland** (portal RemoteDesktop + ScreenCast + Spectacle + KWin scripting) | live desktop | best-fit primitive, worst maturity (v0.1.0, 2026-08-12, one maintainer) |

## Ranked pathways

1. **Claude Code + `computer-use-linux` as an MCP server.** No custom loop: the session on an existing lane calls screenshot/click/type tools; the model stays behind the proxy. Governance mirrors the browser bridge (exact-scope request, human-approved, owned cleanup). Risks: modest-activity project; untested here.
2. **`wayland-computer-use` as the KDE primitive, wrapped in a thin MCP server or loop.** Matches this host's stack exactly; you would be its second real user.
3. **Hermes Agent / cua-driver once trycua/cua#1982 lands** (or a self-built driver with `portal-libei` enabled). Ideal model story, not actionable on KDE today.

Agent S3 is the fallback if XWayland-per-app is acceptable.

## Unverified

- CLIProxyAPI passthrough of the Anthropic computer-use toolset `tool_use`/`tool_result` shape end-to-end.
- `computer-use-demo` honoring `ANTHROPIC_BASE_URL`.
- Real-world reliability of `computer-use-linux`'s KDE fallback chain (read, not run).
- Agent S3's handling of Anthropic-shaped tool responses from the proxy.

## Next step (needs explicit go-ahead; nothing installed yet)

A read-only design pass for pathway 1: what `computer-use-linux` needs on the host (`ydotool` uinput group, portal backend), how it would be scoped like `browser-bridge-request`, and a smoke test that proves tool passthrough before trusting it. Prior art in-repo: none beyond the browser pilot and `portable-agent-permissions.md`.
