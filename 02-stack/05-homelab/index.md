---
title: 05 · Home Lab (general patterns)
description: General homelab patterns — self-hosted services, Tailscale-gated. Specific IPs, endpoints, and configs live in tier 3 (my work).
stratum: 2
status: research
sidebar:
  order: 1
tags:
  - stack
  - homelab
  - self-hosted
  - tailscale
date: 2026-04-17
branches: [agentic]
---

## The pattern (stratum 2)

A home lab is a small collection of self-hosted services you depend on. For this stack's purposes, the key pattern is:

1. **Services live on one or two machines** (NAS + maybe a small server)
2. **Access is Tailscale-gated** — no public ports, no public DNS, no reverse proxy facing the internet
3. **Services are containerized** (Docker / Podman) for reproducibility
4. **Configs are version-controlled** where possible

This layer is generic. The **specific services I run, IPs, and endpoints** are stratum 5 and live in [`03-work/homelab/`](#private-reference) — not here.

## What tends to run

Typical homelab services relevant to an agentic workflow:

| Category | Examples |
|---|---|
| **File server / NAS** | TrueNAS, Unraid, Synology |
| **Image / file host** | [Zipline](https://zipline.diced.sh/), Immich (photos), Nextcloud |
| **Container orchestration** | Docker Compose, Portainer, k3s |
| **Monitoring** | Grafana, Prometheus, Uptime Kuma |
| **Password / secret management** | Vaultwarden (Bitwarden server), Hashicorp Vault |
| **MCP servers** | Running local / enterprise MCP servers behind Tailscale |
| **Home automation** | Home Assistant |
| **Backup** | Duplicati, restic, Borg |
| **Git** | Gitea, Forgejo (if you want self-hosted Git alongside GitHub) |

## The access pattern

```
    Internet ╳
             ╲  (no public ports to lab services)
              ╲
               ╲
   Tailscale ─── Device identity authenticates
   tailnet            │
                      ├──→ NAS (TrueNAS)
                      │       ├── Zipline
                      │       ├── Immich
                      │       ├── Nextcloud
                      │       └── other containers
                      │
                      ├──→ Home Assistant
                      │
                      └──→ MCP servers
```

Key rule: **no service exposes a public port unless there's a specific reason** (e.g., webhook receivers from an external SaaS). Any such exception has its own mitigation (auth, rate limit, WAF).

## Why Tailscale-first for homelab

Alternatives considered:

| Alternative | Why not default |
|---|---|
| Public exposure + Nginx + Let's Encrypt + user/pass | Biggest attack surface; brute-force targeting constant; cert automation adds config burden |
| Cloudflare Tunnel | Shifts exposure to Cloudflare; still internet-reachable; requires trust in Cloudflare + their account binding |
| VPN (raw WireGuard) | Tailscale is WireGuard + the management layer (key rotation, peer discovery, DNS). Less to manage. |
| Port-forward + no auth | 💀 |

## Backup philosophy

Rule of thumb: **3-2-1** — 3 copies, 2 different media, 1 offsite.

- Original data: NAS
- Local backup: another disk on NAS (ZFS snapshot, different disk/pool)
- Offsite: encrypted backup to cloud (B2, S3, or similar) via restic/Borg/Duplicati

For truly irreplaceable content (family photos, Obsidian vault), this is non-negotiable.

:::caution[ZFS snapshots are not a backup]
A ZFS snapshot on the same pool protects against accidental deletion and ransomware on the live dataset, **not** against drive failure, controller failure, lightning, theft, or fire. If the NAS dies, the snapshot dies with it. The "2 different media + 1 offsite" half of 3-2-1 is the part that survives a disaster — don't skip it because snapshots feel like backups.
:::

## Identity layer (if it matters)

For a personal lab: Tailscale's OAuth identity is enough.

For a team/household lab: consider self-hosting an identity provider:

- **Authelia** — lightweight, SQLite-backed
- **Keycloak** — fuller SSO, heavier

Either pairs well with forward-auth reverse proxies (Nginx Proxy Manager, Traefik) for service-level RBAC.

For my specific setup (individual, occasional family access), Tailscale identity + service-level auth where it matters is sufficient. See [Velociportal](https://github.com/cybersader/velociportal) (my project) for an identity-aware service dashboard pattern.

## Container patterns

- **`docker-compose.yml` per service** — one Compose file per service, in a versioned directory
- **Named volumes, not bind mounts** for production data (unless a bind mount is necessary)
- **Labels for Traefik/Nginx if using** — declare routing in the Compose file
- **Automated updates via Watchtower or manual** — I lean manual for production services, auto for sandboxes

## Monitoring baseline

Minimum:

- **Uptime Kuma** — service status page; tells you what's down
- **Grafana + Prometheus** — metrics if services expose them

Optional but useful:

- **Loki** — log aggregation
- **Alertmanager** — actually page me when things fail

## What lives at tier 3 (my specific instance)

The following are **user-specific** and belong in [`03-work/homelab/`](#private-reference), not here:

- NAS model, disk layout
- Specific services running
- IPs, hostnames, MagicDNS names
- Tailscale network ACLs
- Home Assistant entities + automations
- MCP server specifics + credentials
- Backup targets + schedules
- Monitoring dashboards

This separation keeps the stack pattern shareable while my specific infrastructure stays private.

## Integration with the rest of the stack

| Used by | For |
|---|---|
| [03 · Cross-Device](../03-cross-device/) | Tailscale is the network fabric |
| [04 · Knowledge Mgmt](../04-knowledge-mgmt/) | Obsidian vault backup / sync |
| [06 · Dev Infra](../06-dev-infra/) | Zipline, Everything reference, custom dev services |

## Deep dives

- [Self-hosted deployment platforms](../../knowledge-base/03-reference/self-hosted-deployment-platforms.md) (when this migrates into the tier)
- [`03-work/homelab/`](#private-reference) — my specific infrastructure (mostly private content)
- [Velociportal](https://github.com/cybersader/velociportal) — identity-aware service dashboard (my project)
