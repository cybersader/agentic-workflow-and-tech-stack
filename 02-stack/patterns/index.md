---
title: Stack patterns
description: Stack-tier patterns — opinionated structural patterns tied to my tech stack (WSL + Claude Code + Obsidian + Tailscale).
stratum: 2
status: planning
sidebar:
  order: 0
tags:
  - stack
  - patterns
  - index
date: 2026-04-18
branches: [agentic]
---

[Stratum-2/3 patterns](../../principles/07-five-strata/#stratum-2) with stack-specific content. More opinionated than [kernel patterns](../../patterns/) — they assume my stack.

## Available patterns

| Pattern | Purpose |
|---|---|
| [Cross-device SSH](./cross-device-ssh/) | Reach my desktop from any device on the tailnet; reattach long-running sessions |
| [Tailnet browser access](./tailnet-browser-access/) | Temporarily expose files or a local service across the tailnet via `tailscale serve` + `miniserve` — no public ports, browser-ready from any device |
| [Image paste pipeline](./image-paste-pipeline/) | ShareX → Zipline → tailnet — clipboard to shareable URL in <1s |
| [Claude Code session recovery](./claude-code-session-recovery/) | Decision tree across `claude -r <uuid>` / `pconv rebuild-index` / `pconv doctor --dump-stale` when `/resume` shows wrong sessions |
| [Dokploy on TrueNAS via VM](./dokploy-on-truenas-via-vm/) | Run a self-hosted PaaS on a NAS appliance without fighting it — Debian VM + Tailscale handoff + Dokploy install in ~30 min |
| [Tailscale HTTPS three levels](./tailscale-https-three-levels/) | Decision framework for tailnet HTTPS — HTTP-over-tunnel vs `tailscale serve` vs `tailscale cert` + Traefik + systemd timer. Knowing where to stop saves an afternoon |
| [GitHub Actions → tailnet-only PaaS autodeploy](./github-actions-tailnet-paas-autodeploy/) | `git push` → autodeploy when your PaaS (Dokploy / Coolify / etc.) is on Tailscale only. Ephemeral CI runner joins tailnet via OAuth + tag-ACL → curls deploy webhook. Two-layer auth; ~10 min admin per repo |
| [TrueNAS stuck ZFS dataset](./truenas-stuck-zfs-dataset/) | Diagnostic ladder for "EBUSY — dataset is busy" when nothing visible holds the dataset, plus the rename-then-destroy escape hatch |
| [Debian VM tailnet bootstrap](./debian-vm-tailnet-bootstrap/) | Every-screen netinst recipe + the two installer footguns nobody warns you about (sudo, curl) + VNC-once → SSH-via-tailnet handoff |
| [Tailscale file-share four flavors](./tailscale-file-share-four-flavors/) | Decision framework for "send a file over the network." Taildrop / SMB-over-tailnet / `tailscale serve` / `tailscale funnel`, picked by recipient capability. Plus the realistic "use a USB drive or Drive link" answer for the non-technical case |
| [WSL/Docker VHDX bloat — reclaim and prevent](./wsl-vhdx-bloat-reclaim/) | VHDX grows on write, never shrinks on delete — in-guest cleanup → fstrim → sparse VHDX/compaction, the double-docker-daemon gotcha, and the cargo-target-on-/mnt/c tax. Field receipts: ~50 GB reclaimed |

## Candidates not yet written

- Parallel agents + git worktrees
- Obsidian sync over Tailscale
- Clone-tab-at-remote-cwd (OSC 7 pipeline across SSH+Zellij)

See also: [kernel patterns](../../patterns/) for universal structural patterns.
