---
title: WSL/Docker VHDX bloat — reclaim and prevent
description: Why a WSL2 machine slowly eats the C drive — VHDX virtual disks grow on write but never shrink on delete, so the ext4.vhdx can hold tens of GB more than the distro actually uses; Docker Desktop and podman machines add their own. Field-tested reclaim recipe (in-guest cleanup → fstrim → sparse VHDX / compaction → per-engine prune), the double-docker-daemon gotcha, the cargo-target-on-/mnt/c tax, and the honest "would Linux be better" verdict.
stratum: 2
status: stable
sidebar:
  order: 8
tags:
  - stack
  - pattern
  - wsl
  - vhdx
  - docker
  - disk-space
  - windows
  - homelab
date: 2026-07-11
branches: [agentic]
---

## The symptom

C: drive slowly fills to critical (a treemap shows giant `ext4.vhdx` / `docker_data.vhdx` blocks under `AppData\Local\wsl\` and `AppData\Local\Docker\`), while *inside* WSL `df` reports far less usage than the VHDX file's size. In the incident that produced this doc: **ext4.vhdx = 71 GB on disk, actual usage inside the distro = 53 GB** (and after cleanup, 37 GB — with the VHDX still 71 GB until compacted).

## Why it happens (the one-way ratchet)

A WSL2 distro's filesystem lives in a dynamically-expanding VHDX. Writes grow it; **deletes never shrink it** — freed ext4 blocks stay allocated in the host file. Every download-then-delete, build-then-clean, index-then-drop cycle ratchets the VHDX up. Docker Desktop (its own `docker_data.vhdx`) and podman machines ratchet independently. This is the genuinely WSL-specific tax: on native Linux, freed space is simply free.

Two co-conspirators that are **not** WSL-specific (they'd bloat a Linux box identically):

- **Rust `target/` dirs** — multi-GB per project (this incident: 22 GB + 9.5 GB across two projects), fully regenerable with one build.
- **Engine/image/model caches** — Docker images, Ollama models, playwright browsers, npm/bun caches.

### Gotcha: the double docker daemon

A machine can have **two independent Docker data roots**: Docker Desktop's `docker_data.vhdx` (Windows side) *and* a docker-ce/rootless daemon inside the distro (`~/.local/share/docker`). `docker system df` only reports whichever daemon the CLI context points at. Check both before concluding you're clean.

## Reclaim recipe (order matters)

### 1. In-guest cleanup first (shrinks what compaction must copy)

```bash
# Build artifacts (regenerable) — biggest wins are often on /mnt/c, which
# frees C: space IMMEDIATELY (no VHDX involved):
rm -rf <project>/target                    # Rust; cargo rebuilds on demand

# Engine + tool caches inside the distro:
docker system prune -af --volumes          # check BOTH daemons (see gotcha)
npm cache clean --force
bun pm cache rm
rm -rf ~/.cache/ms-playwright              # re-downloads on next E2E run
sudo apt-get clean

# Runaway logs — check ~/.claude/debug (this incident: 3.4 GB of debug txt):
find ~/.claude/debug -type f -mtime +7 -delete
```

### 2. TRIM inside the guest

```bash
sudo fstrim -v /
```

Marks freed ext4 blocks as unused so the host can actually release them.

### 3. Host side — sparse VHDX (the durable fix) or one-shot compaction

> ⚠️ Both require `wsl --shutdown` — this kills every WSL session (including a running Claude Code). Run from PowerShell **after** wrapping up in-guest work.

```powershell
wsl --shutdown

# Sparse (DISABLED upstream for corruption risk — refuses without --allow-unsafe;
# recommended: skip this and rely on compaction below):
# wsl --manage <DistroName> --set-sparse true --allow-unsafe

# One-shot compaction (either instead of, or in addition to, sparse):
Optimize-VHD -Path "$env:LOCALAPPDATA\wsl\{GUID}\ext4.vhdx" -Mode Full   # needs Hyper-V module / admin
# no Hyper-V module? diskpart route:
#   diskpart
#   select vdisk file="C:\Users\<you>\AppData\Local\wsl\{GUID}\ext4.vhdx"
#   compact vdisk
```

Find the VHDX path per distro: the treemap shows it, or `wsl -l -v` + `Get-ChildItem $env:LOCALAPPDATA\wsl -Recurse -Filter ext4.vhdx`.

### 4. Docker Desktop's own VHDX

Start Docker Desktop → `docker system prune -af --volumes` against *its* engine → quit Desktop → compact `docker_data.vhdx` the same way (or Settings → Troubleshoot → Purge data for the nuclear option). An unused podman machine (`podman-machine-default`) has its own disk too — `podman machine rm` if it's dead weight.

### 5. Windows-side honorable mentions (not VHDX, same treemap)

NVIDIA `DXCache` (shader cache — safe to delete, rebuilds), `Downloads/`, model stores (Ollama), and `C:\Users\<you>\.claude\projects` (Windows-side Claude Code session JSONLs — archive with pconv before trimming).

## Prevention

- **Compaction cadence over sparse** — sparse VHD is disabled upstream for corruption risk (`--allow-unsafe` required to force). The highest-leverage *safe* change is automating the compaction loop: SessionStart low-disk warning → `disk-slim` → `compact-wsl.bat` (backup-first, double-clickable).
- **Keep heavy build trees OUT of `/mnt/c`** — cargo/node builds on the 9P mount are slow *and* their artifacts land on C: directly. Either build inside the distro filesystem, or schedule `target/` cleanup.
- **Periodic ritual** (quarterly or when the treemap yellows): in-guest cleanup → fstrim → check both docker daemons → compact if not sparse.
- **Log rotation for anything that writes per-session logs** (`~/.claude/debug` grows unbounded).

## When it keeps coming back (it will)

This is a **treadmill, not an incident** — normal agentic-dev churn (cargo builds, docker experiments, semantic-index builds, per-session logs) re-inflates everything. A documented ritual is the least reliable prevention layer (it lives in human memory). The durable answer is layered automation:

1. **Sparse VHDX — DON'T (as of WSL 2.7.x).** Field-verified conclusion: `wsl --manage <distro> --set-sparse true` **refuses** with *"Sparse VHD support is currently disabled due to potential data corruption"* and requires an `--allow-unsafe` flag to force. This retroactively explains every "I enabled sparse and it came back" experience — the enable attempts were silently failing (a `.bat` step swallowed the refusal). Microsoft disabled it for corruption reasons; a flag literally named `--allow-unsafe` on your primary dev distro is the wrong trade. **The safe durable posture is a compaction cadence** (next item), with `fsutil sparse queryflag` / `disk-doctor` reporting the flag state honestly (OFF = expected, not an alarm). If you accept the risk anyway, force it only after a full `wsl --export` backup.
2. **`disk-slim`** (bashrc helper) — the whole in-guest sweep as one command: debug-log trim, conservative docker prune, npm/bun/playwright/apt caches, fstrim. `disk-doctor` is its read-only sibling (both docker daemons, VHDX-vs-guest gap, cargo `target/` hunt).
3. **SessionStart hook** (`check-disk.sh`) — deterministic early warning: every new agent session checks free space and flags below 60 GB on the host / 70% in the guest, pointing at disk-doctor. Catches the plague at 15% free instead of 2.7% — per the firing-reliability doctrine, the *trigger* is a hook, the *content* is the helper + this doc.

What automation deliberately does NOT do: delete cargo `target/` dirs (disk-doctor lists them; deleting is a deliberate act since the next build repays the cost) and full `docker system prune -af --volumes` (disk-slim's default prune keeps tagged images).

## Would this happen on native Linux?

Honest split verdict: the **VHDX double-bookkeeping and the compaction ritual would not exist** — freed space is instantly free, and there's one filesystem to reason about. But roughly **half of this incident's bloat (build artifacts, image/model/browser caches, unbounded logs) is platform-independent dev hygiene** and would accumulate identically on Linux. WSL's real sin is hiding the waste in an opaque file that needs a shutdown ritual to deflate — it converts "disk usage" from a glanceable fact into a forensic exercise.

## Incident receipts (2026-07-11)

| Action | Reclaimed |
|---|---|
| Two Rust `target/` dirs on /mnt/c | ~31.5 GB (C:, immediate) |
| In-distro docker daemon prune (20 inactive images) | ~9.6 GB (in-guest) |
| `~/.claude/debug` trim (3.4 GB → 76 KB) | ~3.4 GB (in-guest) |
| npm/bun/playwright/apt caches | ~6 GB (in-guest) |
| In-guest total: 53 GB → 37 GB; VHDX compaction potential | ~34 GB more (host, after sparse/compact) |
