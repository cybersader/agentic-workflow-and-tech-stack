---
title: Image-Paste Pipeline (Zipline + ShareX + sharex-clip2path)
description: One-click screenshot → URL for pasting into terminal-based AI tools. Self-hosted, Tailscale-gated.
stratum: 2
status: research
tags:
  - stack
  - pattern
  - zipline
  - sharex
  - image-paste
date: 2026-04-17
branches: [agentic]
---

## The problem

Terminal-based AI coding CLIs (Claude Code, Gemini CLI, Codex) can reference images by URL but **cannot accept pasted image data** from the OS clipboard. This is a real friction: when explaining a UI bug or sharing a diagram, you screenshot → save → upload → paste URL → finally tell the AI. Five steps for what should be one.

The pattern: hotkey a screenshot → auto-upload to a personal image host → URL copies to clipboard → paste into terminal. Five steps become one hotkey + one paste.

## The components

```
ShareX (Windows)              sharex-clip2path            Zipline (self-hosted)
  │                             (my tool)                   │
  │ PrintScreen hotkey          │                           │ Tailscale-gated
  │───────────────────────────→ │ Configures ShareX         │ img.<your-local-domain>/u/ABCD.png
  │                             │ to upload to Zipline      │
  │ Captures screenshot         │                           │
  │                             │ Copies final URL          │
  │ ShareX uploads to Zipline ──┼──────────────────────────→│
  │                             │                           │
  │                             │ URL now on clipboard      │
  │                             │                           │
  │     Ctrl+V in terminal      │                           │
  │     → paste URL             │                           │
  │                             │                           │
  │                             │                           │
  └── Claude Code reads the URL → fetches image ────────────┘
```

## My components (concrete picks)

### Zipline (self-hosted image host)

- **What it is:** [zipline.diced.sh](https://zipline.diced.sh/) — a self-hosted file/image uploader with short URLs, API, auth. Think "private imgur with a real API."
- **Where it runs:** Docker container on my home server.
- **Access:** Tailscale-gated. The URL `img.<your-local-domain>/u/ABCD.png` only resolves on my tailnet. No public exposure.
- **Install:** [Zipline setup guide](https://zipline.diced.sh/docs/get-started/docker).

### ShareX (Windows)

- **What it is:** open-source Windows screenshot + upload tool. Highly configurable: hotkeys, upload destinations, post-actions.
- **Why it:** mature, works with custom uploaders, has every knob you'd want. Free.
- **Alternative for Mac/Linux:** [Flameshot](https://flameshot.org/) + custom upload script (similar but more DIY).

### sharex-clip2path (my tool)

- **Repo:** [github.com/cybersader/sharex-clip2path](https://github.com/cybersader/sharex-clip2path)
- **What it is:** a small utility I built to load hotkeys into ShareX that implement the full "screenshot → upload → URL on clipboard" flow with my preferred conventions.
- **Why built:** ShareX's out-of-box hotkey config is verbose. clip2path packages the workflow into one configurable block.

## Setup walkthrough

### 1. Stand up Zipline

```bash
# On the home server (Docker)
docker run -d \
  --name zipline \
  -p 3000:3000 \
  -v /path/to/uploads:/zipline/uploads \
  -e CORE_SECRET=<random-secret> \
  ghcr.io/diced/zipline:trunk
```

Set a reverse proxy (Nginx, Caddy) if you want a pretty hostname. Tailscale handles the auth layer — the reverse proxy just provides hostname + HTTPS termination inside the tailnet.

### 2. Configure Tailscale-only access

In Tailscale ACLs (or the host's firewall), restrict Zipline's port to the tailnet. No `0.0.0.0` binding. If you're running behind a reverse proxy, bind the proxy to the tailnet interface only.

### 3. Install ShareX on Windows

Download from [getsharex.com](https://getsharex.com/). Default install fine.

### 4. Install sharex-clip2path

Follow [the README](https://github.com/cybersader/sharex-clip2path). It configures ShareX's upload destination to point at your Zipline instance, sets hotkeys, and wires the clipboard handoff.

### 5. Test

- Press the screenshot hotkey
- ShareX captures + uploads to Zipline (via tailnet)
- URL lands on clipboard
- Paste into a terminal running Claude Code: `Look at this bug: https://img.<your-local-domain>/u/ABCD.png`
- Claude fetches the image and responds

## Mac/Linux equivalent

Not as polished. What works:

- **Flameshot** + custom script that calls Zipline's upload API and puts URL on clipboard.
- **imgcat** + a rehost step.

I use Windows for most of my agentic dev (via WSL), so ShareX is the primary path.

## Android equivalent

**Termux** has `termux-clipboard-set` and can upload via `curl` to the Zipline API. Combined with Android's sharing menu → send to Termux script, you can approximate the same flow.

## Security notes

:::caution
**Never expose Zipline directly to the public internet.** The default setup ships an admin UI and an upload API that are not safe to publish raw. Keep it behind Tailscale (or another identity layer) — bind the listener to the tailnet interface, not `0.0.0.0`. If you want public read-only image URLs, terminate at a CDN or proxy that strips the admin paths; don't punch a hole straight to Zipline.
:::

- **Tailscale ACLs** — restrict the image host to devices/users that actually need it.
- **Upload retention** — set max age on Zipline or you'll accumulate old screenshots forever.

## Integration with the rest of the stack

- [06 · Dev Infra](../06-dev-infra/) — Zipline is part of dev infra.
- [03 · Cross-Device](../03-cross-device/) — Tailscale is what gates Zipline access.
- [01 · AI Coding CLIs](../01-ai-coding/) — the consumers of the resulting URLs.

## Deep dives

- [Zipline docs](https://zipline.diced.sh/docs)
- [ShareX custom uploader docs](https://getsharex.com/docs/custom-uploader)
- [sharex-clip2path README](https://github.com/cybersader/sharex-clip2path)
