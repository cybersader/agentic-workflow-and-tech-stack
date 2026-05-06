---
title: Remote Obsidian plugin development via tailnet
description: Iterate on Obsidian plugin code from any tailnet-connected device and test in a real Obsidian instance running on a NAS or home-server, without giving the deploy host privileged access to your dev machine. Push mechanism survey (BRAT primary, Local REST API secondary), reload strategies, failure modes, and composition with the rest of this stack's cross-device patterns.
stratum: 2
status: stable
sidebar:
  order: 2
tags:
  - stack
  - obsidian
  - plugin-development
  - cross-device
  - tailscale
  - homelab
date: 2026-04-25
branches: [agentic]
---

## The pattern

A common homelab shape: **the desktop Obsidian app runs in a container on a NAS** (or other always-on host), reachable from any tailnet-connected device through a VNC stream rendered in a browser. Plugin development on a separate dev machine produces build artifacts that need to land at `<vault>/.obsidian/plugins/<plugin-id>/` on that NAS so the streamed Obsidian can load them.

The goal: **iterate on plugin code from any tailnet device, test in a real Obsidian instance, without granting the dev tooling deeper-than-app-level access to the NAS host.**

```
┌─────────────────────────────────────────────────────────────────┐
│  THE ITERATION LOOP                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Edit plugin source     (any tailnet device)                │
│  2. Build (npm run build)  (locally or remote-via-SSH)         │
│  3. Push artifacts         ← this doc's main concern           │
│  4. Reload in Obsidian     (cmd+P → reload, or hot-reload)     │
│  5. Test via VNC stream    (browser → host on tailnet)         │
│  6. GOTO 1                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The friction this pattern targets is **step 3 (push artifacts)**. Editing happens via [cross-device SSH](./../patterns/cross-device-ssh.md). Building is whatever `npm run build` does locally. Reload + VNC are Obsidian's own surfaces. The hard part is getting build outputs into the vault without standing up a privileged push channel.

## Constraints

This pattern targets a specific shape:

- **The deploy host is sensitive infrastructure.** A NAS, a home server, or anything else where granting dev-tool root SSH would have unbounded blast radius. The pattern assumes you don't want to give that level of access — which means the push channel must use less-privileged surfaces (Obsidian community plugins, HTTP APIs, public-git remotes, app-catalog file-sync apps).
- **Tailnet-only access is sufficient.** The deploy host is reachable inside a Tailscale mesh; nothing public-facing.
- **Generic across plugins.** Should work for any plugin with a standard `npm run build` step and the conventional `manifest.json + main.js + styles.css` output shape.

If those constraints don't match your setup (e.g., you run Obsidian locally on the same dev machine, or you're fine giving root SSH to the deploy host), simpler patterns apply — `rsync` to a local path, etc.

## Push mechanism — ranked

### Primary: BRAT (Beta Reviewer's Auto-update Tool)

[`TfTHacker/obsidian42-brat`](https://github.com/TfTHacker/obsidian42-brat) — a community plugin that pulls plugin builds from a configured GitHub repo into the local Obsidian's `.obsidian/plugins/<id>/`. Designed exactly for the "test a plugin before it's published to the official directory" use case.

**Setup (one-time per plugin):**

1. In the streamed Obsidian (via the host's VNC URL): install BRAT from Community Plugins.
2. BRAT settings → "Add beta plugin" → paste the GitHub repo URL of the plugin under development.
3. BRAT pulls the latest tagged release — fetching `manifest.json`, `main.js`, optional `styles.css`. Plugin appears under Community Plugins; enable it.

**Iteration (per-edit):**

1. Edit plugin source.
2. `npm run build` produces `main.js` (and `styles.css`).
3. `git tag vX.Y.Z && git push --tags` (or use a release-on-push GitHub Action — recommended; see "Failure modes" below for why).
4. In streamed Obsidian: command palette → `BRAT: Check for updates to all beta plugins`.
5. Reload the plugin (see Reload strategies below).

**Properties:**
- Zero deploy-host-level access needed; only GitHub access from the plugin author's side and Obsidian access on the host.
- Works for public *and* private GitHub repos (private requires a fine-grained PAT in BRAT settings).
- Supports pre-release / beta channels via `-beta.X` suffix versioning ([upstream docs](https://docs.obsidian.md/Plugins/Releasing/Beta-testing+plugins)).
- One-time setup per plugin; subsequent iterations are click-once-in-Obsidian.
- Latency: GitHub Actions build + release ≈ 60–180 sec; manual `git push --tags` skips the Action; BRAT update is ~5 sec.

**Limits:**
- **Pull-based, not push-based.** No "I committed, now go update" trigger. Either click manually each iteration or set BRAT's auto-check interval (default 4 hours, configurable).
- **Plugin must produce a release with build artifacts attached.** The canonical pattern is a release-on-push GitHub Action that bundles `manifest.json + main.js + styles.css` as one release asset.
- **No file-level granularity** — BRAT updates the whole plugin folder per release.
- **Per-vault**, not per-host. Pushing to N vaults takes N adds + N update clicks.

### Secondary: Obsidian Local REST API plugin

[`coddingtonbear/obsidian-local-rest-api`](https://github.com/coddingtonbear/obsidian-local-rest-api) — exposes vault file ops over HTTPS. With a reverse proxy in front, the API can be reached at the host's tailnet URL.

**Setup (one-time):**

1. In the streamed Obsidian: install Local REST API plugin.
2. Plugin settings → enable HTTPS endpoint (default port 27124), generate API key, copy.
3. Update the host's reverse proxy (whatever's fronting the Obsidian VNC stream — typically nginx, openresty, or Caddy) to proxy a path (e.g., `/api/vault/`) to `localhost:27124`. *This is the one piece of host config that requires shell access — but it's a one-time edit, not ongoing.*

**Iteration:**

```bash
# After npm run build, push the artifacts:
curl -k -X PUT 'https://<host>.<tailnet>.ts.net/api/vault/.obsidian/plugins/<id>/main.js' \
  -H 'Authorization: Bearer <api-key>' \
  -H 'Content-Type: application/octet-stream' \
  --data-binary '@dist/main.js'

curl -k -X PUT 'https://<host>.<tailnet>.ts.net/api/vault/.obsidian/plugins/<id>/manifest.json' \
  -H 'Authorization: Bearer <api-key>' \
  -H 'Content-Type: application/json' \
  --data-binary '@dist/manifest.json'
```

Then trigger plugin reload via the same API (the plugin exposes `/commands/<command-id>` for executing arbitrary command-palette actions — pair with `obsidian-hot-reload` to make this seamless).

**Properties:**
- More flexible than BRAT — any vault file (not just plugins), any path, atomic per-file.
- Lower latency than BRAT (no GitHub round-trip). Two `curl` calls per iteration.
- Composes naturally into a `npm run deploy` script in the plugin's `package.json` — one command from anywhere.

**Limits:**
- One-time reverse-proxy edit needed to expose the API path. Self-documenting via the proxy config diff; not a recurring access need.
- API-key management — author holds the key; care needed not to commit it. Standard `.env`-pattern.
- HTTPS cert may be self-signed by default → `curl -k`. Resolved by Tailscale ACME via `tailscale cert` if you want a real chain.

### Tertiary: Obsidian Git plugin

[`Vinzent03/obsidian-git`](https://github.com/Vinzent03/obsidian-git) — pulls a git repo cloned inside `<vault>/.obsidian/plugins/<id>/`.

**Properties:**
- Works for multi-vault sync (each vault has its own clone).
- Offline-first.

**Limits:**
- Mobile reliability is poor (Obsidian Git on mobile has known issues).
- Bidirectional sync is footgun-shaped.
- Requires the plugin to have prebuilt artifacts on a specific branch.

### Tertiary: Syncthing (NAS app catalog)

Syncthing peer-to-peer file sync, installable as a NAS-app-catalog item. Each side runs a Syncthing instance; folders pair up by ID.

**Properties:**
- No SSH, no API key, no GitHub round-trip.
- Bidirectional, automatic, sub-second on a tailnet.

**Limits:**
- Heavyweight setup vs. BRAT.
- Bidirectional sync is footgun-shaped for plugin dev (a corrupted plugin reload could write garbage back to dev).

### Rejected: SSH/rsync, SMB

Both require host-level access. Out of scope for the constraint set.

## Reload strategies

Obsidian does not auto-reload plugin code on disk change. After pushing new artifacts, the plugin must be reloaded:

| Strategy | Mechanism | Cost |
|---|---|---|
| **`pjeby/hot-reload`** plugin | Watches `<vault>/.hot-reload`; touching that file → enabled plugins reload (~750ms) | One-time install + a single `touch .hot-reload` after each push |
| **`Benature/obsidian-plugin-reloader`** plugin | Command-palette one-click reload | One-time install; manual click per iteration |
| Manual disable + enable | Settings → Community Plugins toggle | Two clicks per iteration; works without any plugin help |
| Full-app reload (`app:reload`) | Whole-app reload via command palette | Heaviest; loses unsaved state |

For BRAT-based workflows, BRAT triggers reload on update. For Local REST API, a `touch .hot-reload` via the same API after pushing artifacts gives an end-to-end automated cycle.

**Edge case worth knowing:** the Obsidian plugin sandbox does not support the `Worker` API. Plugins that spawn workers (or shim them) often can't unload cleanly via plugin-level reload — these need full-app reload. Per the [Obsidian forum discussion](https://forum.obsidian.md/t/how-to-speed-up-cpu-intensive-tasks-in-an-obsidian-plugin-workers-not-supported/103392), CPU-intensive plugin code runs 5–10× slower than equivalent worker-threaded code; many plugins try to work around this with shims that don't reload cleanly.

## Where this pattern fits in the broader landscape

This isn't the only way to do cross-device Obsidian. The shape it specifically targets:

- **Plugin development iteration**, not note content sync.
- **Browser-streamed Obsidian on a homelab host**, not Obsidian Sync, not obsidian-livesync, not mobile.
- **Tailnet-only access**, not public-internet exposure.

For other shapes:

| Need | Reach for |
|---|---|
| Multi-device note sync (no plugin dev) | [Obsidian Sync](https://obsidian.md/sync) (official) or [`vrtmrz/obsidian-livesync`](https://github.com/vrtmrz/obsidian-livesync) (community CouchDB) |
| Mobile plugin testing | Not really possible — Android has no community-plugin support; iOS partial. Use a desktop fallback |
| Real-time multi-user collab | obsidian-livesync (peer-to-peer WebRTC) or [OpenClast](https://github.com/cybersader/openclast) (server-mediated CRDT) |
| Public docs site from the same vault | Obsidian Publish, or render the vault via Astro/Starlight at build time |

The VNC-streamed-desktop + GitHub-driven-update shape generalizes beyond Obsidian — same pattern works for VS Code Server, JupyterLab, RStudio, anything else streamed to browser.

## Failure modes and mitigations

| Failure | Trigger | Mitigation |
|---|---|---|
| Plugin reload doesn't pick up new code | Obsidian plugin caches require explicit reload | Install `hot-reload` OR script disable-enable via Local REST API |
| BRAT update silently no-ops | Release artifacts missing from the GitHub release (often after a manually-tagged release without artifacts attached) | Use the canonical release-on-push GitHub Action that bundles `manifest.json + main.js + styles.css` |
| Local REST API call returns 401 | API key wrong or HTTPS cert issue | Verify key in plugin settings; use `-k` if cert is self-signed |
| Pushed plugin breaks Obsidian app | Plugin throws on load | Disable-enable via Settings UI; if Obsidian fully wedges, restart the container at the host's app surface |
| GitHub Action release-on-push doesn't fire | Tag pattern mismatch, missing workflow trigger | Verify `.github/workflows/release.yml` matches the tag pattern (typically `v*`) |
| Race condition during BRAT update | Pull-and-reload not atomic; partial files possible | Mitigated by atomic GitHub Action releases that bundle all artifacts in one release asset |
| VNC stream too laggy from a phone | Bandwidth / latency on cellular | Drop VNC quality settings; for read-only verification, the streamed Obsidian's render output is enough without going into the live app |
| Worker-using plugin doesn't reload cleanly | Obsidian plugin sandbox doesn't support `Worker` API | Use full-app reload as the fallback for that class of plugin |

## Composition with existing scaffold patterns

| Pattern | How it composes |
|---|---|
| [Cross-device SSH](../patterns/cross-device-ssh.md) | Source-edit happens on the dev machine, accessed via SSH from any device. Pairs with this pattern — SSH is for *editing*, this pattern is for *deploying*. |
| [Tailnet browser access](../patterns/tailnet-browser-access.md) | The mechanism the streamed Obsidian uses to expose its VNC URL on the tailnet. This pattern is a specialization of that for plugin testing. |
| [Image-paste pipeline](../patterns/image-paste-pipeline.md) | Same tailnet philosophy. Independent — but if a plugin under test produces images, the pipeline lands them at a Zipline-shaped URL the plugin can reference. |

## When the rest of the iteration loop falls to pieces

If you're spending more time on push/reload friction than on the actual plugin code, three escalations:

1. **Switch from BRAT to Local REST API.** Eliminates the GitHub round-trip, drops latency from minutes to seconds.
2. **Add `obsidian-hot-reload` if not already in.** Eliminates the manual reload click.
3. **Script the deploy.** Add a `npm run deploy` to `package.json` that does build + Local REST API push + hot-reload trigger, all in one command. Single command from any tailnet device.

If you're still bottlenecked, the bottleneck is probably the VNC stream UX (latency, screen real estate). Consider whether the iteration step that's slow is something you can do on the dev machine instead and only use the remote Obsidian for final verification.
