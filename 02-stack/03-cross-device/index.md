---
title: 03 · Cross-Device Access
description: Tailscale + SSH alias + Termux — work from any device without managing SSH keys or exposing ports to the internet.
stratum: 2
status: research
sidebar:
  order: 1
tags:
  - stack
  - tailscale
  - ssh
  - termux
  - cross-device
date: 2026-04-17
branches: [agentic]
---

## The pattern (stratum 2)

A knowledge worker with an agentic workflow needs to reach their development environment from **more than one device**. At minimum: the primary PC, and a phone (for quick checks and bug reports while away from the desk). The substrate that makes this possible without compromising security has three elements:

1. **Device-identity network** — a mesh where devices authenticate each other, not the internet
2. **Consistent addressing** — one name that resolves to the same machine from any device
3. **Mobile client** — something Android/iOS can run that speaks SSH or similar

Do this right and you can SSH from your phone to your WSL environment without exposing a single port to the public internet, without managing SSH keys across devices, and without memorizing IP addresses.

## My current picks

### Primary: Tailscale

- **Why primary:** WireGuard-based mesh VPN; device identity via OAuth (Google, GitHub, etc.); auto-configuring; clients for everything. I don't manage SSH keys across devices because Tailscale SSH handles authentication via the Tailscale identity. Zero public ports.
- **Install:** [tailscale.com/download](https://tailscale.com/download) per platform.
- **Free tier:** 3 users / 100 devices — enough for a personal setup.
- **Alternative considered:** Headscale (self-hosted Tailscale control plane). I chose managed Tailscale to avoid running the control plane myself. Revisit if the free tier no longer fits.

### SSH alias (the convenience layer)

- **Why:** Tailscale gives me a stable IP per device (like `100.x.y.z` or the MagicDNS name). Typing it every time is friction. An SSH config alias collapses it to `ssh pc`.
- **Config:** `~/.ssh/config` (or Termux's equivalent on Android) with entries like:

  ```
  Host pc
      HostName pc-name-or-tailscale-ip
      User cybersader
      ForwardAgent yes
  ```

- This config travels via the [rebuild flow](#private-reference) — same file copied to every device that needs to connect.

### Android mobile client: Termux

- **Why Termux:** real Linux userspace on Android. Runs `ssh`, `git`, `vim`, `tmux`, `zellij`. Not a shell emulator — an actual Debian-ish environment.
- **Install:** [F-Droid Termux](https://f-droid.org/en/packages/com.termux/) (the Play Store version is unmaintained — do not use it).
- **First-run:** `pkg install openssh`, then copy my SSH config, test `ssh pc`.

### iOS alternative: Termix or Codespaces

- **iOS limitations:** no direct Termux equivalent because of Apple's sandboxing. Options:
  - **Termix** — community iOS SSH client with a terminal. Works; less powerful than Termux.
  - **GitHub Codespaces** — access dev environments from the phone via a browser. Different model (dev container vs my-machine).
- Status: I haven't committed to an iOS workflow yet. Termix is the lowest-effort path when I need one.

## Why not alternatives

### Port-forward SSH over the public internet

- Viable technically, bad for security hygiene. Every exposed port is an attack surface; SSH brute-force is constant. Tailscale eliminates the exposure entirely.

### WireGuard (raw)

- Tailscale **is** WireGuard — with the hard parts (key rotation, peer discovery, DNS) solved. Using raw WireGuard means rebuilding that layer yourself.

### Cloudflare Tunnel / ngrok / similar

- These expose a specific service over a public URL. Fine for sharing a dev server with a teammate. Wrong model for "reach my entire machine from anywhere."

### VS Code Remote-SSH over public internet

- Same security concern as raw SSH. Use it *through* Tailscale (`ssh pc` lands on the tailnet first), not instead of Tailscale.

## Workflow (daily path)

```
Phone (Termux)                 PC (WSL2)
       │                              │
       │─── ssh pc (over Tailscale) ──→ │
       │                              │
       │   [Zellij session attaches or resumes]
       │                              │
       │   [Portagenty workspace pick]
       │                              │
       │   [Claude Code / Gemini CLI / Codex]
       │                              │
       │   Working …                  │
       │                              │
       │   Detach (Ctrl+O D in Zellij)
       │                              │
       │   [PC session persists]      │
       │                              │
       └── (later, from laptop) ── ssh pc ──→ same session resumes
```

A session started on the PC is reachable from the phone later. A session started from the phone persists when I close Termux and reattach from the laptop.

## Install pointers

| Tool | Where |
|---|---|
| Tailscale (desktop/server) | [tailscale.com/download](https://tailscale.com/download) |
| Tailscale (Android) | Play Store |
| Termux (Android) | [F-Droid](https://f-droid.org/en/packages/com.termux/) |
| SSH config | `~/.ssh/config` (see [../profiles/](../profiles/) for example) |

## Integration with the rest of the stack

| Connects to | How |
|---|---|
| [02 · Terminal](../02-terminal/) | The SSH session attaches to a Zellij/tmux session |
| [05 · Home Lab](../05-homelab/) | Homelab services are Tailscale-gated — no public exposure |
| [06 · Dev Infra](../06-dev-infra/) | Zipline (image host) is reachable only over Tailscale |

## Deep dives

- [Cross-device SSH pattern](../patterns/cross-device-ssh.md) — full walkthrough
- [Tailnet browser access](../patterns/tailnet-browser-access.md) — temporary browser-based read-access to files or a local service across the tailnet via `tailscale serve` + `miniserve`
- [`../../01-kernel/principles/06-single-canonical-addressability.md`](../../01-kernel/principles/06-single-canonical-addressability.md) — why one stable name beats memorizing IPs
