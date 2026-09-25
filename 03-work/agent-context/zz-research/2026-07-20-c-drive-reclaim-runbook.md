---
title: C-drive reclaim + WSL stability runbook
description: One-time Windows-side runbook to fix the recurring WSL hard-kills — C-drive triage to SMB shares, VHDX sparse/compact, Docker Desktop and Podman cleanup, and the corrected .wslconfig. Companion to the 2026-07-20 crash forensics.
stratum: 5
status: active
date: 2026-07-20
tags:
  - runbook
  - wsl
  - disk
  - homelab
---

## Why this exists

Three-agent forensics (2026-07-20, receipts in `zz-log/2026-07-20.md`) established:

- **Crashes** = host-side VM kills: `.wslconfig` gave WSL 24 GB of a 32 GB host; under agent load Vmmem balloons and Windows kills the VM before Linux's OOM-killer runs (hence zero Linux-side evidence — the mem-watchdog now leaves receipts).
- **Disk** = mostly NOT WSL: C: 909 GiB used; all VHDXs + pagefile + hiberfil ≈ 183 GiB. ~726 GiB is Windows-side content (user-confirmed: captures/videos, Fortnite ~150 GB, provisioning images, installer archive, Downloads, retake-studio logs, AppData bloat).
- `sparseVhd=true` never applied to existing VHDXs — all are non-sparse, so in-WSL deletions never shrank C:. This is why cleanups "never stuck."
- In-WSL reclaim already executed: ext4 86 → 51 GiB (Docker images/build-cache + browser/pip caches).

Order matters: **move the big content first** (fast GB), **then** sparse/compact VHDXs (so the freed ext4 space actually returns to C:), **then** apply the new `.wslconfig` (needs `wsl --shutdown` anyway — batch the restarts).

## Phase 1 — content triage to SMB (biggest win, no risk to WSL)

Placeholder `\\nas\archive` = your SMB share root; adjust per share layout.

| Content | Action | Est. |
|---|---|---|
| Game captures (Fortnite/Smite/other videos) | Move → `\\nas\archive\captures\` | large (user est.) |
| Windows provisioning stuff (Documents) | Move → `\\nas\archive\provisioning\` — good excuse to give it its own organized tree | large |
| Applications installer archive | Move → `\\nas\archive\installers\` — it's a rebuild asset, belongs on the NAS anyway | med |
| Downloads folder | **Verify-then-delete**: likely partially mirrored on the NAS already. `robocopy "%USERPROFILE%\Downloads" \\nas\archive\downloads /E /XC /XN /XO /L` first (`/L` = list-only dry run: shows what would copy = what's NOT on the share yet). Copy the gaps, spot-check, then delete locally. No blind moves. | med |
| retake-studio logs | Wipe (user-confirmed disposable) | small |
| Old Smite `CookedPCConsole` game folder | Delete the game folder only — keep any settings/profile dirs. If unsure it's fully dead, archive to NAS first, delete after a week. | ~10–30 GB |
| Fortnite | **Keep** (actively played). Don't touch. | — |
| AppData bloat | Run WizTree (admin) on C: after the moves — triage the remainder by actual size, don't guess. | ? |

`robocopy /MOV` does copy-then-delete per file (safer than cut/paste for big trees):

```bat
robocopy "C:\path\to\captures" "\\nas\archive\captures" /E /MOV /R:1 /W:1 /LOG:%TEMP%\mig-captures.log
```

## Phase 2 — WSL-adjacent VHDX cleanup (PowerShell, admin)

```powershell
# 1. Stop everything
wsl --shutdown

# 2. Make the Ubuntu VHDX sparse so ext4 frees flow back to NTFS
#    (existing VHDXs were created non-sparse; the .wslconfig flag only affects NEW ones)
wsl --manage Ubuntu --set-sparse true

# 3. Docker Desktop data VHDX (29 GB): rootless Docker runs INSIDE the distro,
#    so Docker Desktop is redundant unless used deliberately from Windows.
#    Either uninstall Docker Desktop, or in its Settings → purge data / compact.
#    Verify first: docker context ls inside WSL shows 'rootless *' as active.

# 4. Podman machine VHDX (8.9 GB) — remove if podman is unused:
podman machine rm  # or delete C:\Users\<you>\.local\share\containers\podman\...

# 5. Stale temp swap VHDX (2.1 GB) — after shutdown, delete:
#    C:\Users\<you>\AppData\Local\Temp\53DD5F02-*\swap.vhdx

# 6. Optional (12.7 GB, only if you never hibernate):
powercfg /h off
```

Expected return to C: from this phase alone: **~40 GiB** (35 freed in ext4 once sparse + Podman + temp swap), plus up to 29 GiB more if Docker Desktop goes.

## Phase 3 — the corrected `.wslconfig` (stops the crashes)

Replace `C:\Users\<you>\.wslconfig`:

```ini
[wsl2]
memory=18GB              # was 24GB on a 32GB host — leaves Windows ~14GB instead of ~8GB
swap=4GB                 # was 2GB — absorbs spikes without enabling hours of thrash
swapFile=D:\\wsl-swap.vhdx   # D: has 221GB free; keep swap off the squeezed C:
processors=16            # of 24 — keep the host responsive under load
guiApplications=false    # omit this line if WSLg/Linux GUI apps are needed
nestedVirtualization=false

[experimental]
autoMemoryReclaim=disabled   # was dropcache (the repeated drop_caches churn in journals);
                             # hard 18GB cap is the real protection. Known bad interactions
                             # of reclaim modes with systemd + native Docker.
sparseVhd=false              # documented corruption reports; we sparse the existing VHD
                             # once, manually, in Phase 2 instead
```

Then `wsl --shutdown` once more and relaunch. Sources: MS wsl-config + disk-space docs, WSL#10675 (gradual-reclaim hangs), WSL#13075 (sparse corruption). Full citations in zz-log 2026-07-20.

## Phase 4 — verify

1. Inside WSL: `free -h` should show ~18 GB total; `swapon --show` → 4 GB on the D: file.
2. `memwatch-last` after a heavy agent day — the watchdog log should show `avail` never collapsing below ~2 GB without a `!!` alert naming the culprit.
3. Windows: C: free should jump by Phase 1+2 totals; `fsutil sparse queryflag` on the Ubuntu VHDX confirms sparse.
4. If a crash still occurs: `memwatch-last 100` immediately after reboot — the final fsynced samples name the top-RSS processes. That's the receipt loop that was missing.

## Still parked / follow-ups

- 13 GiB `~/work/kwir/daemon/target` — delete on demand (full cargo rebuild cost).
- 56 rootless Docker volumes (1.46 GB) — review names, prune the anonymous ones.
- 7 GiB legacy Claude-projects duplicate pairs on C: (`C--*` vs `-mnt-c-*` under `%USERPROFILE%\.claude\projects`) — dedupe once the old project-sync tool is confirmed retired.
- WizTree pass on the remaining AppData/ProgramData bulk.
- If OpenClast sync is ever revived: redesign away from `WATCH_POLLING=true` over DrvFS first.
