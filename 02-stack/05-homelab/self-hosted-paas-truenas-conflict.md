---
title: Why PaaS tools (Dokploy, Coolify) don't work directly on TrueNAS SCALE
description: The fundamental conflict — self-hosted PaaS tools want to own the whole server's Docker daemon, and so does TrueNAS SCALE. Two systems fighting over one Docker = breakage. The answer is a VM on TrueNAS. Background explainer (bare metal vs VM vs container vs NAS appliance) plus the receipts.
stratum: 2
status: stable
date: 2026-03-31
tags:
  - homelab
  - truenas
  - dokploy
  - coolify
  - paas
  - docker
  - vm
---



## The Short Version

Self-hosted PaaS tools (Dokploy, Coolify, CapRover) are designed to own the entire server. TrueNAS SCALE also wants to own the entire server. Running both on the same machine creates a fundamental conflict: two systems fighting over the same Docker daemon.

The solution: run the PaaS in a **VM** on TrueNAS, not directly on TrueNAS.

## Background: What These Things Are (And Why It Matters)

If you're not deeply familiar with servers, containers, and hosting — this section is for you. These concepts seem interchangeable but have critical differences that determine whether tools like Dokploy will work.

### Bare Metal
A physical computer running an OS directly. You plug it in, install Linux, and you control everything — Docker, networking, ports, firewall. Nothing sits between you and the hardware.

A PaaS tool installed here works perfectly because **you are the only thing managing Docker**.

### VPS (Virtual Private Server)
A virtual machine hosted by a cloud provider (Hetzner, DigitalOcean, Oracle, AWS, etc.). You rent it by the month. From the OS's perspective, a VPS looks and acts identical to bare metal — you get root access, you install whatever you want, you manage Docker yourself.

**This is where PaaS tools like Dokploy and Coolify are designed to run.** When their docs say "run on a VPS," they mean: "we expect to be the only thing managing Docker on this machine." They assume a clean Linux install where they can set up Docker, Swarm, Traefik, and networking without anything else interfering.

Good explainers:
- [What is a VPS? — Hetzner](https://www.hetzner.com/what-is-a-vps/) — clear, no-nonsense explanation
- [Bare Metal vs VPS vs Shared Hosting — DigitalOcean](https://www.digitalocean.com/community/tutorials/a-general-introduction-to-cloud-computing) — broader context

### VM (Virtual Machine)
A virtual computer running inside another computer. Your TrueNAS box (the "host") runs a hypervisor that creates VMs (the "guests"). Each VM gets its own OS, its own Docker, its own IP address, its own ports. The VM is isolated from the host — what happens inside the VM doesn't affect TrueNAS's Docker.

**A VM on TrueNAS looks like a VPS to any software running inside it.** This is why the VM approach works for PaaS tools — Dokploy running inside a Debian VM doesn't know or care that it's on TrueNAS hardware.

### NAS Appliance OS (TrueNAS, Synology, Unraid)
These are **specialized operating systems** that manage storage first and run apps second. They have their own container management systems that control Docker (or Podman, etc.) behind the scenes. The key constraint that trips people up:

**The NAS OS manages Docker for you.** You don't get to configure Docker directly — the NAS middleware generates Docker's config files, manages networking, and controls the container lifecycle. This is by design: the NAS wants to ensure stability and prevent users from breaking their storage system.

When you try to install a PaaS tool that ALSO wants to manage Docker, you get two systems fighting over the same control interface. Neither knows about the other.

### Docker Socket
Think of Docker as a service running in the background on your machine. The "Docker socket" (`/var/run/docker.sock`) is the doorway to talk to that service. Any program that can access this file can create, destroy, or modify containers.

When TrueNAS's app system says "start container X," it talks through the Docker socket. When Dokploy says "deploy service Y as a Swarm service," it also talks through the same Docker socket. They're both giving orders to the same Docker daemon, and Docker has no concept of "this order came from TrueNAS" vs "this order came from Dokploy."

Good explainers:
- [Docker overview — Docker Docs](https://docs.docker.com/get-started/docker-overview/) — the official "what is Docker" guide
- [What is a Docker Socket? — Medium / Ivan Velichko](https://iximiuz.com/en/posts/container-networking-is-simple/) — deep but accessible

### Docker Swarm
Docker's built-in orchestration mode. Think of it as "Docker with management features" — it adds the ability to run services across multiple machines, do zero-downtime updates, automatically restart crashed containers, and create virtual networks between services.

You activate it with one command: `docker swarm init`. After that, Docker expects to manage containers as "services" instead of just "containers." Dokploy requires Swarm mode for all deployments — it's how Dokploy deploys your apps.

**TrueNAS explicitly does not support Docker Swarm.** A feature request was [officially rejected](https://forums.truenas.com/t/not-accepted-implementing-functionality-for-docker-swarm/34838) by iXsystems. The TrueNAS middleware generates Docker config with settings (`iptables: false`, `bridge: none`) that are incompatible with Swarm's networking requirements.

Good explainers:
- [Docker Swarm overview — Docker Docs](https://docs.docker.com/engine/swarm/) — official guide
- [Swarm mode key concepts — Docker Docs](https://docs.docker.com/engine/swarm/key-concepts/) — what managers, workers, and services mean

### PaaS (Platform as a Service)
A tool that lets you deploy apps without managing the underlying infrastructure. Vercel, Netlify, and Heroku are cloud PaaS. Dokploy, Coolify, and CapRover are self-hosted PaaS — same concept, but you run the platform on your own server.

The key assumption of self-hosted PaaS: **the server is mine to control.** They install Docker (if not present), set up networking, configure reverse proxies, manage SSL certificates, and create/destroy containers. They don't expect another system to be doing the same things on the same machine.

Good explainers:
- [PaaS explained — Red Hat](https://www.redhat.com/en/topics/cloud-computing/what-is-paas) — clear business explanation
- [Self-Hosting Guide — noted.lol](https://noted.lol/what-is-self-hosting/) — approachable intro to self-hosting

## Why It Doesn't Work: The Technical Conflict

### 1. TrueNAS Rewrites Docker Config on Every Boot

TrueNAS's middleware generates `/etc/docker/daemon.json` on every boot with these settings:
- `iptables: false` — Docker won't manage firewall rules
- `bridge: none` — Docker won't create a default bridge network

Docker Swarm **requires** both of these features. Without iptables, Swarm's overlay networking doesn't work. Without bridge networking, containers can't communicate across services.

Reference: [TrueNAS daemon.json middleware](https://gist.github.com/mixa3607/0297ae24c32588e12333fc1983bd6d91), [TrueNAS forum discussion](https://forums.truenas.com/t/how-to-edit-the-etc-docker-daemon-json/45180)

### 2. Dokploy Force-Initializes Docker Swarm

From [Dokploy's manual installation docs](https://docs.dokploy.com/docs/core/manual-installation):
> "Make sure you run this as root on a Linux environment that is **not a container**, and ensure ports 80, 443, and 3000 are free."

The install script unconditionally runs:
```bash
docker swarm leave --force 2>/dev/null
docker swarm init --advertise-addr $advertise_addr
```

It also creates an overlay network and deploys all services (postgres, redis, app, traefik) as Docker Swarm services. See [Dokploy cluster docs](https://docs.dokploy.com/docs/core/cluster).

### 3. Port Collisions

PaaS tools expect to own ports 80, 443, and 3000. On TrueNAS, these are often already used by:
- Port 80/443: TrueNAS web UI or Nginx Proxy Manager
- Port 3000: Other apps (n8n, Grafana, Gitea, etc.)

From [Dokploy installation docs](https://docs.dokploy.com/docs/core/installation):
> "The installation will fail if any of these ports are already in use."

### 4. Coolify Has the Same Problem

Coolify is [available as a TrueNAS app](https://apps.truenas.com/catalog/coolify/), but a TrueNAS contributor explicitly warned in [GitHub issue #3313](https://github.com/truenas/apps/issues/3313):
> "It should only be used as a 'control panel' for **REMOTE** servers. ie NOT the TrueNAS itself."

## What We Tried (and What Broke)

1. **Deployed Dokploy via Docker Compose on TrueNAS** — the 3 core services (app + postgres + redis) started, but Docker Swarm wasn't initialized → deploy failed
2. **Ran `docker swarm init`** — worked temporarily, but TrueNAS may overwrite daemon.json on reboot, breaking Swarm
3. **Created `dokploy-network` overlay** — fixed the network-not-found error, but no Traefik meant deployed apps were unreachable
4. **Added Traefik to compose** — would fix routing, but the entire setup is fragile: any TrueNAS update could reset Docker config and break everything

## The Right Approaches

### Option 1: VM on TrueNAS (Recommended for Dokploy)

Run a lightweight Debian VM on TrueNAS:
- 2 GB RAM, 30 GB disk (Dokploy's minimum requirements)
- Full Docker control inside the VM
- Dokploy's install script works perfectly
- TrueNAS provides ZFS storage via NFS mount
- VM gets its own IP on the network — no port conflicts with TrueNAS
- Access via LAN IP or Tailscale

### Option 2: GitHub Actions → GHCR → Watchtower (No PaaS Needed)

Skip the PaaS entirely:
- GitHub Actions builds Docker images on push
- Pushes to GitHub Container Registry (GHCR)
- Watchtower on TrueNAS polls GHCR and auto-pulls new images
- Everything on TrueNAS is plain Docker Compose — no Swarm, no PaaS
- Works natively with TrueNAS's Docker management

### Option 3: Cheap VPS ($5/mo)

Oracle Cloud free tier, Hetzner CAX11, or DigitalOcean $5 droplet:
- Dokploy install script works first try
- Access via Tailscale for private networking
- No conflict with any home infrastructure

## VM Networking Note

A VM on TrueNAS gets its own network interface. Two options:
- **Bridged networking** — VM gets its own IP on your LAN (e.g., `192.168.1.X`), just like another device. No port conflicts with TrueNAS at `192.168.1.Y`.
- **NAT networking** — VM shares TrueNAS's IP with port forwarding. This CAN cause port conflicts.

**Use bridged networking** for Dokploy VMs to avoid any port overlap.

## References

### TrueNAS
- [Docker Swarm feature request — rejected](https://forums.truenas.com/t/not-accepted-implementing-functionality-for-docker-swarm/34838)
- [Docker settings reset by TrueNAS update](https://forums.truenas.com/t/docker-settings-reset-to-defaults-by-24-10-1-update/27935)
- [How to edit daemon.json (middleware overwrites it)](https://forums.truenas.com/t/how-to-edit-the-etc-docker-daemon-json/45180)
- [Docker Swarm on TrueNAS — unanswered](https://forums.truenas.com/t/docker-swarm-manager-on-truenas-scale/28752)
- [Using vanilla Docker on TrueNAS SCALE](https://gist.github.com/Jip-Hop/af3b7a770dd483b07ac093c3b205323f)
- [Patching daemon.json generator](https://gist.github.com/mixa3607/0297ae24c32588e12333fc1983bd6d91)

### Dokploy
- [Installation requirements](https://docs.dokploy.com/docs/core/installation)
- [Manual installation — "not a container"](https://docs.dokploy.com/docs/core/manual-installation)
- [Is Swarm mandatory? — GitHub Discussion #682](https://github.com/Dokploy/dokploy/discussions/682)
- [Cluster / Swarm docs](https://docs.dokploy.com/docs/core/cluster)
- [Proxmox LXC issues — GitHub #65](https://github.com/Dokploy/dokploy/issues/65)

### Coolify
- [TrueNAS app catalog listing](https://apps.truenas.com/catalog/coolify/)
- [TrueNAS app request — "remote servers only"](https://github.com/truenas/apps/issues/3313)
- [Coolify installation docs](https://coolify.io/docs/get-started/installation)
- [Coolify on Synology — doesn't work](https://github.com/coollabsio/coolify/discussions/3166)
