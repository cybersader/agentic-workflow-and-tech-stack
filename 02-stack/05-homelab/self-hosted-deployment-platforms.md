---
title: Self-hosted deployment platforms — the landscape
description: Reference survey for deploying static sites and web apps on self-hosted infrastructure — Dokploy (recommended, in a VM), Coolify, CapRover, Dokku, plain Docker Compose + reverse proxy, and when each fits. Pairs with the TrueNAS-conflict explainer for the "why a VM" question.
stratum: 2
status: stable
date: 2026-03-31
tags:
  - homelab
  - deployment
  - paas
  - dokploy
  - coolify
  - self-hosted
---


Reference for deploying static sites and web apps on self-hosted infrastructure.

## Recommendation: Dokploy in a VM

[Dokploy](https://dokploy.com/) is a self-hosted deployment platform. GitHub integration, auto-deploy on push, web UI.

**Important:** Dokploy requires Docker Swarm and full control over Docker. It cannot run directly on TrueNAS SCALE (or any NAS appliance) because the NAS manages Docker itself. Run Dokploy inside a **VM** on TrueNAS instead. See [why PaaS tools don't work on TrueNAS](./self-hosted-paas-truenas-conflict.md) for the full explanation.

### Why Dokploy

- GitHub webhook integration — push-to-deploy
- Web UI for managing multiple projects
- Supports static sites and dynamic apps
- Open source

### Why Not Others

| Platform | Issue |
|----------|-------|
| **Coolify** | Similar to Dokploy but heavier. TrueNAS catalog warns "remote servers only" |
| **Dokku** | Not Docker-native, requires Debian host, CLI-only |
| **CapRover** | Also requires Docker Swarm |
| **Portainer** | Manages containers but doesn't build from source |
| **GitHub Pages** | Public internet only |

### Network Security Note

If your router (pfSense/OPNsense) runs Tailscale with `--advertise-routes` for your LAN subnet, all LAN services are accessible via Tailscale. The VM gets its own LAN IP — accessible locally and via Tailscale with no extra config.

---

## Setup: Dokploy VM on TrueNAS SCALE

### Overview

```
TrueNAS SCALE (host) — manages storage, runs NAS apps
  └── Debian VM (guest) — runs Dokploy with its own Docker + Swarm
        ├── Dokploy dashboard (:3000)
        ├── Traefik reverse proxy (:80, :443)
        ├── Postgres + Redis (internal)
        └── Your deployed apps (routed by Traefik)
```

The VM gets its own IP on your network (e.g., `192.168.1.X`). No port conflicts with TrueNAS at `192.168.1.Y`. Completely isolated Docker instances.

### Step 1: Download Debian ISO

Download [Debian 12 "bookworm" netinst ISO](https://www.debian.org/distrib/netinst) (small, ~600 MB).

Save it to a TrueNAS dataset, e.g., `/mnt/<your-pool>/isos/debian-12-amd64-netinst.iso`.

Or download directly from TrueNAS shell:
```bash
mkdir -p /mnt/<your-pool>/isos
cd /mnt/<your-pool>/isos
wget https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.10.0-amd64-netinst.iso
```

### Step 2: Create the VM in TrueNAS

In TrueNAS UI: **Virtualization > Add VM** (or **Virtual Machines > Add** on older versions)

| Setting | Value |
|---------|-------|
| Name | `dokploy` |
| Guest OS | Linux |
| CPUs | 2 |
| Memory | 2048 MB (2 GB minimum for Dokploy) |
| Disk | 30 GB (zvol, on your pool) |
| Boot | UEFI |

**Network:** Add a NIC with:
- **Attach NIC** → your physical interface (e.g., `enp0s25` or whatever your LAN NIC is)
- **Type:** virtio
- **Mode:** Bridge — this gives the VM its own IP on your LAN via DHCP

**CD-ROM:** Add a CD-ROM device pointing to the Debian ISO you downloaded.

Reference: [TrueNAS VM Documentation](https://www.truenas.com/docs/scale/scaletutorials/virtualization/)

### Step 3: Install Debian

1. Start the VM, open the **Display** (VNC console in TrueNAS UI)
2. Install Debian with defaults:
   - Language, keyboard, timezone
   - **Hostname:** `dokploy`
   - **Root password:** pick one (or use sudo-only)
   - **User:** create a user account
   - **Partitioning:** use entire disk, all in one partition
   - **Software:** select only **SSH server** and **standard system utilities** (no desktop)
3. Finish install, reboot, remove CD-ROM from VM settings

### Step 4: Find the VM's IP

After the VM boots, find its IP. From TrueNAS shell:
```bash
# If you set hostname to 'dokploy':
ping dokploy.local

# Or check your router's DHCP leases
# Or from the VM console:
ip addr show
```

The VM should have an IP like `192.168.1.X` (varies by your DHCP server).

**Optional but recommended:** Assign a static IP in your router's DHCP settings so it doesn't change.

### Step 5: SSH In and Install Dokploy

```bash
ssh user@192.168.1.X    # or whatever IP the VM got

# Switch to root
sudo -i

# Install Dokploy (their official one-liner)
curl -sSL https://dokploy.com/install.sh | sh
```

This installs Docker, initializes Swarm, sets up Traefik, Postgres, Redis, and the Dokploy app. Takes 2-3 minutes.

Reference: [Dokploy Installation Docs](https://docs.dokploy.com/docs/core/installation)

### Step 6: Access Dokploy

From any device on your network:
- **Dashboard:** `http://192.168.1.X:3000`
- **Deployed apps:** `http://192.168.1.X` (port 80, routed by Traefik)

Also accessible via Tailscale if your router advertises your LAN subnet.

### Step 7: Deploy Your First App

1. Create admin account at the dashboard URL
2. **Settings > Git Providers > Add GitHub** (OAuth or PAT)
3. **Projects > Create Project** (e.g., "RetakeForge Docs")
4. **Add Service > Application** → select GitHub repo, branch, build path
5. Set **Build Type** to **Dockerfile** (if your project has one)
6. Click **Deploy**

For the RetakeForge docs site:

| Setting | Value |
|---------|-------|
| Repository | `cybersader/retakeforge` |
| Branch | `main` |
| Build Path | `/docs-site` |
| Build Type | Dockerfile |

### Step 8: Make the VM Start on Boot

In TrueNAS UI: **Virtualization** → select the `dokploy` VM → **Edit** → check **Start on Boot**.

This ensures Dokploy comes back after TrueNAS reboots.

---

## TrueNAS Storage for the VM (Optional)

If you want Dokploy's deployed apps to store data on TrueNAS ZFS (rather than the VM's local zvol):

1. Create an NFS share on TrueNAS for the VM
2. Mount it inside the VM: add to `/etc/fstab`:
   ```
   192.168.1.Y:/mnt/<your-pool>/dokploy-vm-data  /mnt/truenas  nfs  defaults  0  0
   ```
3. Use `/mnt/truenas/` as volume paths in Dokploy app configs

This gives you ZFS snapshots, compression, and redundancy for your deployed app data while keeping Docker management cleanly inside the VM.

---

## Alternative: No PaaS (GitHub Actions + Watchtower)

If you don't want to run a VM or a PaaS at all, this pattern works directly on TrueNAS's managed Docker — no Swarm, no conflict:

```
Push to GitHub → GitHub Actions builds Docker image → Pushes to GHCR
                                                           ↓
TrueNAS: Watchtower (container) polls GHCR → Pulls new image → Restarts app
```

Everything on TrueNAS is a plain compose file. Watchtower is a single container that watches for image updates. No Swarm, no PaaS, no VM. See the [Watchtower docs](https://containrrr.dev/watchtower/) for setup.

---

## Cleanup: Remove Dokploy from TrueNAS Host

If you previously deployed Dokploy directly on TrueNAS (before switching to VM), clean up:

```bash
# Stop and remove the TrueNAS Custom App in the UI first, then:
sudo docker swarm leave --force 2>/dev/null
sudo docker network rm dokploy-network 2>/dev/null

# Remove the init script from TrueNAS:
# System > Advanced > Init/Shutdown Scripts → delete the init-swarm entry
```

The datasets (`<pool>/dokploy/data`, `pgdb`, `redis`) can be deleted via TrueNAS UI → Datasets.

---

## References

### Dokploy
- [Installation requirements](https://docs.dokploy.com/docs/core/installation)
- [Manual installation — "not a container"](https://docs.dokploy.com/docs/core/manual-installation)
- [GitHub — Dokploy/dokploy](https://github.com/Dokploy/dokploy)

### TrueNAS
- [VM Documentation](https://www.truenas.com/docs/scale/scaletutorials/virtualization/)
- [Docker Swarm — officially rejected](https://forums.truenas.com/t/not-accepted-implementing-functionality-for-docker-swarm/34838)
- [Why PaaS tools don't work on TrueNAS](./self-hosted-paas-truenas-conflict.md)

### Debian
- [Debian 12 download](https://www.debian.org/distrib/netinst)
- [Debian installation guide](https://www.debian.org/releases/stable/amd64/)

### Watchtower (alternative)
- [Watchtower docs](https://containrrr.dev/watchtower/)
- [GitHub — containrrr/watchtower](https://github.com/containrrr/watchtower)
