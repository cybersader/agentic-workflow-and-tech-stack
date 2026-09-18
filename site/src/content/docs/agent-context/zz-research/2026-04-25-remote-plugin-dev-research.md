---
title: Remote Obsidian plugin testing — research log
description: Three-agent fan-out covering Obsidian plugin distribution + reload mechanisms, cross-device Obsidian access patterns, and GitHub → tailnet private static-site deploy patterns. Output of a deeper research pass on the prior `research/projects/remote-plugin-dev-testing/` doc that was research-shallow. Findings drive a tier-2 generic pattern, a tier-3 specific instance, and a separate tailnet-deploy design doc.
stratum: 5
status: research
priority: medium
date: 2026-04-25
tags:
  - obsidian
  - plugin-development
  - cross-device
  - tailscale
  - homelab
  - research
  - findings
---

## Why this exists

The prior research artifact at [`research/projects/remote-plugin-dev-testing/README.md`](/agentic-workflow-and-tech-stack/research/projects/remote-plugin-dev-testing/README/) shipped without a research-army pass — it was written from general knowledge of BRAT + Local REST API + Syncthing. The output doc landed but the lineage that would let a reader *evaluate* the depth didn't exist. This log fixes that gap.

Three parallel Explore agents covered, in order:

- **Bundle A** — Obsidian plugin distribution mechanisms beyond BRAT, plus reload mechanisms beyond `pjeby/hot-reload`. Confirms or sharpens the prior recommendation.
- **Bundle B** — Cross-device Obsidian setups in the wider ecosystem. Where does the Kasm-VNC + BRAT approach actually fit?
- **Bundle C** — GitHub → tailnet-hosted private static-site deploy patterns. Closes the gap the user flagged: *"I like tailnet — i just don't know how we automate that from github."*

## TL;DR

- **BRAT is genuinely the right primary mechanism.** Industry baseline for distributing community plugins from GitHub to a remote Obsidian; covers ~80% of dev-test workflows; supports pre-release / beta channels via `-beta.X` versioning.
- **`pjeby/hot-reload` is the right reload helper.** ~750 ms reload from a single file touch. Has known limits around plugins that hold OS-native handles (worker threads, file watchers) — those need full-app reload as a fallback.
- **The tier-2 pattern should NOT be Obsidian-specific** — it's a "desktop-app-streamed-to-browser + GitHub-driven plugin updates" shape that generalizes. Obsidian is one exemplar; VS Code Server, JupyterLab, etc. fit the same mold.
- **For solo homelab on TrueNAS Scale, cron-pull beats every alternative deploy mechanism.** Self-hosted GitHub Actions runners add resource contention and token-rotation friction; webhook-driven tunnels are either public (Tailscale Funnel) or expensive (ngrok-private); n8n only makes sense if n8n is already running. Systemd timer with `git pull && build && rsync` to a Caddy app's web root is the simplest, most resilient path.
- **Tailscale ACME (`tailscale cert`) integrates cleanly with Caddy** for HTTPS on a `<host>.<tailnet>.ts.net` URL. Not strictly required (tailnet transport is already encrypted) but matches browser expectations.

---

## Bundle A — Plugin distribution + reload mechanisms

### Distribution mechanisms ranked

| Mechanism | Shape | Setup cost | Iteration cost | Where it shines |
|---|---|---|---|---|
| **BRAT** ([TfTHacker/obsidian42-brat](https://github.com/TfTHacker/obsidian42-brat)) | Pull from GitHub releases | ~5 min | 1 click + `touch .hot-reload` | Industry baseline; supports beta channels via `-beta.X` versioning |
| **Local REST API** ([coddingtonbear/obsidian-local-rest-api](https://github.com/coddingtonbear/obsidian-local-rest-api)) | Push HTTP to vault | ~15 min (proxy edit needed) | 2 `curl` calls per file | Sub-60-sec iteration; atomic per-file pushes; no GitHub round-trip |
| **Obsidian Git** ([Vinzent03/obsidian-git](https://github.com/Vinzent03/obsidian-git)) | Pull from git clone inside vault | ~10 min | 3 steps (commit, push, in-Obsidian pull) | Multi-vault sync; works offline-first |
| **Custom Plugin Manager** (community alternative directories) | UI-driven plugin toggle | ~2 min | Manual UI | When team curates a private registry |
| **Syncthing** (NAS app catalog) | Bidirectional file sync | ~20 min | Automatic on file save | Multi-device parity; no GitHub roundtrip |

**What BRAT doesn't handle well:**
- **Multi-vault scenarios** — BRAT is per-vault; pushing to N vaults takes N adds + N update clicks.
- **Race conditions during update** — pull-and-reload isn't atomic; mitigation is the canonical release-on-push GitHub Action that bundles `manifest.json + main.js + styles.css` as one release asset.
- **Sub-second iteration** — GitHub Actions adds 1–3 min per cycle; Local REST API eliminates this by pushing directly.

### Reload mechanisms ranked

| Mechanism | Cost | Coverage | Notes |
|---|---|---|---|
| **`pjeby/hot-reload`** | 1 file touch (`<vault>/.hot-reload`) | Most plugins | ~750ms reload; scriptable via Local REST API |
| **`Benature/obsidian-plugin-reloader`** | 1 command-palette click | All plugins | Manual; no watch; faster UI than Settings toggle |
| **Manual disable+enable** | 2 Settings clicks | All plugins | Slowest; loses unsaved editor state |
| **Full-app reload** (`app:reload` command) | 1 command-palette click | Edge case: worker threads, embedded runtimes, OS-native handles | Resets all plugin state; necessary for plugins Obsidian's plugin lifecycle can't unload cleanly |

**Edge case worth documenting in any tier-2 pattern:** the Obsidian plugin sandbox does not support the `Worker` API. CPU-intensive plugin code runs 5–10× slower than equivalent worker-threaded code (per the [forum discussion](https://forum.obsidian.md/t/how-to-speed-up-cpu-intensive-tasks-in-an-obsidian-plugin-workers-not-supported/103392)). Plugins that try to spawn workers via shims often need full-app reload to unload cleanly.

### Citations (Bundle A)

- [TfTHacker/obsidian42-brat](https://github.com/TfTHacker/obsidian42-brat)
- [coddingtonbear/obsidian-local-rest-api](https://github.com/coddingtonbear/obsidian-local-rest-api)
- [pjeby/hot-reload](https://github.com/pjeby/hot-reload)
- [Benature/obsidian-plugin-reloader](https://github.com/Benature/obsidian-plugin-reloader)
- [Obsidian official: beta-testing plugins](https://docs.obsidian.md/Plugins/Releasing/Beta-testing+plugins)
- [Forum: BRAT functional update with version picker (2025)](https://forum.obsidian.md/t/functional-update-to-brat-version-picker-github-pre-releases-and-frozen-version-updates/98951)
- [Obsidian Hub: plugin testing for developers](https://publish.obsidian.md/hub/04+-+Guides,+Workflows,+&+Courses/Community+Talks/Plugin+Testing+for+Developers)

---

## Bundle B — Cross-device Obsidian access landscape

### Comparison matrix

| Tool / approach | Plugin support | Cross-device access | Latency | Maintenance cost | Notes |
|---|---|---|---|---|---|
| **Obsidian Sync** (official) | Plugin configs only, NOT plugin code | Desktop + iOS + Android | Low | $4–8/mo per user | 1 vault (Standard) / 10 vaults (Plus) |
| **obsidian-livesync** ([vrtmrz/obsidian-livesync](https://github.com/vrtmrz/obsidian-livesync), CouchDB) | Full sync including plugins via "Customisation Sync (Beta)" | Desktop + iOS + Android via CouchDB | Low | Self-hosted (free Docker + CouchDB) | Most flexible; peer-to-peer (WebRTC) optional |
| **Mobile-native Obsidian (iOS/Android)** | Most community plugins unavailable on Android; limited on iOS | Native apps | Very low | Free | Mobile plugin testing is structurally limited |
| **OpenClast** ([cybersader/openclast](https://github.com/cybersader/openclast)) | Full plugin support via Obsidian desktop | Browser via Kasm VNC + Yjs CRDT | Medium (~100–200ms) | Self-hosted (Kasm or Guacamole) | Enterprise-focused; folder-level RBAC; future state for cybersader's setup |
| **linuxserver/obsidian** (noVNC) | Full plugin support | Browser (noVNC ports 3000–3001) | Medium (~150–300ms) | Self-hosted container | Standard NAS deployment; lightweight; HTTPS recommended |
| **BRAT** (per the prior bundle) | Beta plugin distribution from GitHub | Desktop only (depends on host Obsidian) | N/A (local) | Free; GitHub rate limit at 60 req/hr | Developer-focused; bridges GitHub → local Obsidian |

### Implications for the tier-2 pattern

The recommendation that emerged: **frame the tier-2 pattern as VNC-streamed desktop app + GitHub-driven update, with Obsidian as the exemplar**, not as Obsidian-specifically. Same shape works for VS Code Server, JupyterLab, RStudio, anything else streamed to browser.

The BRAT-based path fills a specific gap: **rapid plugin iteration on a remote Obsidian without local installation**. Other gaps (mobile testing, real-time collaboration, full multi-device note sync) are filled by other tools (Obsidian Sync, obsidian-livesync, OpenClast). The tier-2 doc should acknowledge those gaps and explicitly state where the BRAT-based pattern is the right fit.

### Citations (Bundle B)

- [vrtmrz/obsidian-livesync](https://github.com/vrtmrz/obsidian-livesync)
- [Obsidian docs: mobile development](https://docs.obsidian.md/Plugins/Getting+started/Mobile+development)
- [Mobile-compatible plugins (Obsidian Hub)](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.01+Plugins+by+Category/Mobile-compatible+plugins)
- [linuxserver/obsidian docs](https://docs.linuxserver.io/images/docker-obsidian/)
- [Kasm vs Guacamole comparison (Cendio)](https://www.cendio.com/blog/kasm-vnc-alternatives/)

---

## Bundle C — GitHub → tailnet private static-site deploy

### Mechanism comparison

| Mechanism | Model | Setup effort | Ongoing cost | Failure recovery | Notes |
|---|---|---|---|---|---|
| **Cron pull** (`git pull && build && rsync`) | Pull (polling) | Low (1–2 hrs) | Near-zero (systemd timer) | Re-run script | Polling latency 5–60 min; no token-management overhead |
| **GitHub Actions self-hosted runner** | Push (event-driven) | Medium (3–4 hrs) | CPU + uptime | Runner re-registration; token rotation | Immediate deploys; token security is critical |
| **n8n webhook + git pull** | Event-driven | Medium (2–3 hrs) | n8n runtime overhead | Webhook replay; n8n restart | Worth it only if n8n is already running for other workflows |
| **smee.io + listener** | Push (tunneled) | Medium (2–3 hrs) | smee.io free tier | Tunnel restart; potential event loss | Public tunnel; needs auth in front |
| **ngrok-private** | Push (tunneled, private) | Medium (2–3 hrs) | ~$40/mo | Tunnel reconnect | Vendor lock-in; high cost for homelab |
| **Tailscale Funnel + webhook** | Push (public-tunneled) | Low | Near-zero | Listener downtime | **Rejected** for tier-3 — Funnel makes the URL public, defeating the privacy goal |

### Recommended path — cron pull on TrueNAS Scale

For a solo homelab user on TrueNAS Scale + Tailscale + private GitHub repo:

1. **Fine-grained GitHub PAT** scoped to `<repo>:Contents=read`. Stored in `.env` (gitignored) or TrueNAS secrets.
2. **Shell script** at `/scripts/deploy-site.sh` doing `git pull && npm run build && rsync -av dist/ /mnt/<pool>/site-www/`.
3. **Systemd timer** every 30 min (cadence configurable). Logs to journal.
4. **TrueNAS Caddy app** serving `/mnt/<pool>/site-www`, auto-HTTPS via `tailscale cert`.
5. **Manual test** — run script, verify auth + build + rsync + Caddy serve over `https://<host>.<tailnet>.ts.net`.

**Upsides:** No runner resource contention. No token-expiry surprises. Cron failure = re-run once. Resilient to TrueNAS reboots (timer auto-starts on boot).

**Downsides:** ~30 min latency between push and live. Not suitable for sub-5-min turnaround.

### Tailscale ACME composition

`tailscale cert` vends Let's Encrypt certs for `<host>.<tailnet>.ts.net`. Caddy integrates automatically:

```caddy
<nas-host>.<your-tailnet>.ts.net {
  tls /etc/caddy/certs/<...>.crt /etc/caddy/certs/<...>.key
  file_server { root /var/www/site }
}
```

Auto-renews if certs near expiry. **Not strictly needed** for tailnet-only sites (transport is already encrypted) but matches browser HTTPS expectations.

### Composition with existing scaffold patterns

- [`02-stack/patterns/cross-device-ssh.md`](/agentic-workflow-and-tech-stack/stack/patterns/cross-device-ssh/) — orthogonal. SSH lets you reach the NAS to run things; the deploy script is *what* runs there.
- [`02-stack/patterns/tailnet-browser-access.md`](/agentic-workflow-and-tech-stack/stack/patterns/tailnet-browser-access/) — partial overlap; layers cleanly. That pattern covers ad-hoc serving (`tailscale serve` + miniserve) for temp previews; this deploy is the *persistent* version (Caddy on a fixed `<host>.<tailnet>.ts.net`). Reference both.

### Failure modes + rebuild cost

| Failure | Recovery | Notes |
|---|---|---|
| Git PAT expires | ~5 min (rotate token, re-run) | Fine-grained PATs are cheap to rotate |
| Build fails | 5–30 min (fix code in repo, push, wait next cycle) | Logs in journal; offline fix |
| Network blip | Auto (next cron cycle succeeds) | Resilient by design |
| TrueNAS reboot | Auto (systemd timer restarts) | No manual intervention |
| Caddy crash | Manual restart | TrueNAS app logs |

### Citations (Bundle C)

- [GitHub fine-grained PATs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Tailscale certificate docs](https://tailscale.com/kb/1153/enabling-https)
- [TrueNAS app catalog](https://www.truenas.com/docs/scale/scaletutorials/apps/)
- [Caddy reverse-proxy + auto-HTTPS](https://caddyserver.com/docs/caddyfile/directives/tls)
- [systemd timer units](https://www.freedesktop.org/software/systemd/man/systemd.timer.html)

---

## Falsifiable hypotheses

The agents didn't produce empirical numbers for these — open for verification:

1. **GitHub Actions release-on-push end-to-end latency.** Hypothesis: 60–180 sec from `git push --tags` to BRAT-pulled-to-vault. Test: instrument the GitHub Action with timestamps, measure across 5 plugin releases.
2. **Local REST API push throughput.** Hypothesis: ~5–10 file pushes per second over tailnet to NAS-hosted Obsidian. Test: script a 100-file batch, measure wall-clock.
3. **Cron-pull cadence sweet spot.** Hypothesis: 30 min is the right default for solo homelab; 5 min is unnecessary; 60+ min becomes annoying. Test: run with each cadence for a day, log "I wished it had pulled by now" friction events.
4. **Tailscale ACME cert renewal failure mode.** Hypothesis: when `tailscale cert` fails to renew, Caddy's on-demand TLS recovers automatically. Test: deliberately expire a cert, observe recovery.

## Graduation map

This research feeds three downstream artifacts. Findings split as follows:

### Tier-2 doc — `02-stack/04-knowledge-mgmt/obsidian-plugin-dev-remote.md`

- The generic iteration loop (no PII, no specific URLs)
- BRAT primary / Local REST API secondary mechanism survey, with the gap-analysis from Bundle A
- Reload-strategy ranking from Bundle A
- Cross-device Obsidian context from Bundle B (acknowledge the broader landscape; explicit "this pattern fills X gap")
- Composition with `cross-device-ssh`, `tailnet-browser-access`, `image-paste-pipeline`
- Frame as VNC-streamed-desktop-app pattern with Obsidian as exemplar (per Bundle B's recommendation)

### Tier-3 doc — `03-work/homelab/obsidian-home-remote-plugin-iteration.md`

- Cybersader's specific obsidian.home setup (openresty front, HTTP 400 quirk)
- TrueNAS Scale linuxserver/obsidian app config + vault paths
- Active plugin set across `4 VAULTS/plugin_development/`
- Deploy-script template with actual paths/URLs
- 7-step verification checklist tied to actual setup

### Tier-3 doc — `03-work/homelab/tier3-private-deploy.md`

- The cron-pull recommendation from Bundle C with the 5-step sketch
- Tailscale ACME + Caddy composition
- Failure modes table
- Composition with `tailnet-browser-access` pattern (temp preview vs. persistent deploy)
- 5-step setup checklist

## Cross-references

- Prior research artifact: [`research/projects/remote-plugin-dev-testing/README.md`](/agentic-workflow-and-tech-stack/research/projects/remote-plugin-dev-testing/README/) — the research-shallow ancestor; will get a "graduated as" trailer pointing at this log + the tier-2/tier-3 outputs.
- Today's worklog: [`zz-log/2026-04-25.md`](/agentic-workflow-and-tech-stack/agent-context/zz-log/2026-04-25/) — Session 5 documents this research and the resulting split.
- Memory: `feedback_no_deep_infra_access_for_ai.md` (user-level memory) — the constraint that shaped the deploy-mechanism rejection set (no infra-root SSH, no SMB exposure).
- Sibling research: [`2026-04-25-parallel-agent-coordination-findings.md`](/agentic-workflow-and-tech-stack/agent-context/zz-research/2026-04-25-parallel-agent-coordination-findings/) — the structural template this log mirrors (3 bundles → synthesis → graduation map).
