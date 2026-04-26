---
title: Tailnet browser access — serve files/content temporarily across devices
description: Pattern for giving browser-based read access to local files or a running service over your tailnet, without opening ports to the public internet. Tailscale Serve + miniserve (or similar) solves "I need to browse these files from my phone" in seconds.
stratum: 2
tier_of_abstraction: 2
status: stable
sidebar:
  order: 4
tags:
  - stack
  - pattern
  - cross-device
  - tailscale
  - miniserve
  - file-sharing
date: 2026-04-18
branches: [agentic]
---

## The problem

I'm on my phone / laptop / a different device on the tailnet. The files or rendered output I need to look at live on my desktop. Options I want to avoid:

- **SCP/SFTP back and forth** — too slow, wrong mental model for "browse and click around"
- **Cloud-drive sync** — overkill for a one-off peek; may leak content off-device
- **Opening a port to the public internet** — creates attack surface for what's meant to be temporary
- **rdesktop / VNC / Screen Share** — full-screen remoting is heavier than needed; fixed resolution
- **Drag-and-drop via messaging app** — doesn't preserve directory structure; manual

## The solution

Stack two tools, both identity-gated by the tailnet:

1. **A local HTTP server** that exposes a directory or rendered site on `localhost:PORT` — anything simple that speaks HTTP
2. **`tailscale serve`** to make `localhost:PORT` reachable at a stable tailnet URL, over Tailscale's identity-verified transport

The content is readable from any device on my tailnet. Nobody else can reach it. It's **identity-gated at the network layer** by Tailscale — no auth config needed.

## Picks

### Server layer: [miniserve](https://github.com/svenstaro/miniserve)

Rust single binary. One command produces a browsable HTML listing of a directory with optional search, QR code, tarball downloads, and upload support. Nothing to configure; nothing to clean up.

```bash
# Install
cargo install miniserve
# or on Debian/Ubuntu
sudo apt install miniserve  # check version; cargo gets newer

# Serve current directory on localhost:8080
miniserve .

# Serve a specific directory with a prettier title + QR code
miniserve --title "My dir" --qrcode /path/to/dir

# Read-only listing, no upload, on a chosen port
miniserve --port 9001 --random-route /path/to/dir
```

Why miniserve vs alternatives:

| Alternative | Why miniserve wins |
|---|---|
| `python -m http.server` | Works but plain. Miniserve has search, QR, tarballs, styled HTML |
| `npx http-server` | Needs node + npm network call. Miniserve is static binary |
| `caddy file-server` | Caddy is heavier (meant for production HTTPS); miniserve for ad-hoc |
| `darkhttpd` | Similar in philosophy but fewer features; miniserve's QR + search are nice for mobile |

For serving **built site output** (not file listings), any static server works — `bun run preview`, `python -m http.server`, or miniserve's `--index` flag if you want fancy listing layered on a built index.html.

### Network / identity layer: `tailscale serve`

`tailscale serve` exposes a local port as a URL on your tailnet's MagicDNS (`<machine>.<tailnet>.ts.net`) with automatic HTTPS certificates provisioned by Tailscale. Only devices on your tailnet can reach it. No NAT traversal, no port forwarding, no dynamic DNS.

```bash
# Expose localhost:8080 at https://<this-machine>.<tailnet>.ts.net
tailscale serve --https=443 --bg http://localhost:8080

# Shorter alternative: reverse proxy with path prefix
tailscale serve --set-path=/files http://localhost:8080

# List active serve configs
tailscale serve status

# Tear down
tailscale serve reset
```

HTTPS certs are automatic (via Let's Encrypt, scoped to your tailnet).

### Alternative: `tailscale funnel` (public exposure — usually NOT what you want)

:::caution
`tailscale funnel` extends `serve` to the **public internet** with the same URL shape. The flag is a single keystroke away from `serve` and the output looks identical, so it's easy to publish a directory you meant to keep private. For this pattern, prefer `serve`. Reach for `funnel` only when you explicitly need a public URL, and double-check with `tailscale funnel status` after running it.
:::

## Worked recipe: "let me browse these files from my phone"

On the desktop:

```bash
# 1. Start miniserve in the directory of interest
miniserve --title "Project files" --qrcode /path/to/project-dir &

# 2. Expose it across the tailnet
tailscale serve --bg --https=443 http://localhost:8080
```

Output prints a URL like `https://desktop-xyz.your-tailnet.ts.net/`. Open it on your phone's browser — browse, download, search. When done:

```bash
tailscale serve reset
kill %1   # kill the miniserve background job
```

## Worked recipe: "preview my built site on my phone before I push"

```bash
# 1. Build the site
cd site && bun run build

# 2. Serve the static output
miniserve --index index.html ./dist

# 3. Expose across the tailnet
tailscale serve --bg --https=443 http://localhost:8080
```

Open on phone → verify responsive breakpoints, check reading flow, test links without a deploy round-trip.

## Worked recipe: "browse my Obsidian vault's rendered output from anywhere on the tailnet"

Chain with `obsidian-cli` or a static-export tool (Obsidian's export plugins, quartz, etc.):

```bash
# Static-export the vault to /tmp/vault-html (using your preferred tool)
# Then serve:
miniserve --title "Vault preview" /tmp/vault-html
tailscale serve --bg --https=443 http://localhost:8080
```

## Security model

| Layer | Protects against |
|---|---|
| Tailscale identity | Only devices you've explicitly added to your tailnet can reach the URL |
| Tailscale ACLs (optional) | Further restrict which tailnet members can access — e.g. "only my own devices, not my team's" |
| HTTPS by default | No on-path eavesdropping within the tailnet |
| Temporary exposure | `tailscale serve reset` takes everything down — no lingering access |
| Firewall unchanged | No public ports opened; attack surface is unchanged |

**What this does NOT protect:**

- Anything readable by miniserve is readable by ALL tailnet members (unless ACLs restrict). If you have shared tailnet members, scope accordingly.
- `miniserve` has no built-in auth — rely on the tailnet for that
- Directory traversal is blocked by miniserve; custom apps behind `tailscale serve` inherit their own security posture

## When to use this pattern

- Reviewing content across devices you own
- Quick "can you look at this?" with tailnet-shared collaborators (if applicable)
- Previewing built-but-not-deployed artifacts
- Browsing logs / reports on a remote dev machine
- Sanity-checking file structures without dragging through SSH

## When NOT to use this pattern

- **Persistent / production serving** → use a real reverse proxy (Caddy, nginx) with proper cert management
- **Public access needed** → use `tailscale funnel`, Cloudflare Tunnels, or traditional hosting
- **Mutable / write access needed from multiple users** → miniserve upload is basic; reach for Syncthing, Seafile, or Nextcloud
- **Sensitive auth required** → add an auth layer in front (Authelia, oauth2-proxy) — miniserve has basic HTTP-auth but it's not strong

## Related

- [Cross-device SSH pattern](./cross-device-ssh/) — the terminal-level version of "access my desktop from elsewhere"
- [Terminal emulator stack research](#private-reference) — why cross-device access is a first-class concern in agentic workflows
- [My tool picks](#private-reference) — where Tailscale sits in the stack
- [Known issues](#private-reference) — running log of cross-device quirks worth knowing about
