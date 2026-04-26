---
title: Remote Obsidian plugin testing via Tailscale + NAS-hosted Obsidian
description: Original investigation that produced the tier-2 generic pattern (under 02-stack/04-knowledge-mgmt/) and the tier-3 cybersader-specific instance + deploy doc (under 03-work/homelab/). Kept here as the durable lineage; the practical artifacts are the graduated docs.
stratum: 2
status: stable
date: 2026-04-25
tags:
  - obsidian
  - plugin-development
  - cross-device
  - tailscale
  - homelab
  - research
  - project
branches: [agentic]
---

> **Graduated (2026-04-25).** This investigation produced three downstream artifacts. Reach for those for current usage:
>
> - **Tier-2 generic pattern:** [`02-stack/04-knowledge-mgmt/obsidian-plugin-dev-remote.md`](../../../02-stack/04-knowledge-mgmt/obsidian-plugin-dev-remote.md) — portable how-to with mechanism survey, decision rationale, failure-mode catalog. Ships to the agentic public mirror.
> - **Tier-3 specific instance** (private): [`03-work/homelab/obsidian-home-remote-plugin-iteration.md`](#private-reference) — cybersader's actual obsidian.home + TrueNAS Scale setup, deploy script template, 7-step verification checklist.
> - **Tier-3 deploy design** (private): [`03-work/homelab/tier3-private-deploy.md`](#private-reference) — design for hosting tier-3 markdown content from GitHub to a tailnet-only Caddy site on TrueNAS Scale.
>
> The deeper research log that closed the depth gap on this doc: [`agent-context/zz-research/2026-04-25-remote-plugin-dev-research.md`](../../../agent-context/zz-research/2026-04-25-remote-plugin-dev-research.md). It captures the three-agent research-army synthesis (plugin distribution + reload mechanisms; cross-device Obsidian access landscape; GitHub → tailnet deploy patterns) that drove the graduation.
>
> This doc stays as durable investigation lineage. Don't edit content below; instead update the graduated docs.

## Goal

Iterate on Obsidian plugin code from any tailnet-connected device — phone in a coffee shop, laptop on the couch, work machine — and test the result inside a real Obsidian instance running on the home NAS, without granting AI tooling deeper-than-app-level access to the NAS host.

```
┌─────────────────────────────────────────────────────────────────┐
│  THE ITERATION LOOP                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Edit plugin source     (any tailnet device + dev box)      │
│  2. Build (npm run build)  (or remote build via SSH-to-dev)    │
│  3. Push artifacts         ← this doc's main concern           │
│  4. Reload in Obsidian     (cmd+P → reload, or hot-reload)     │
│  5. Test via VNC stream    (browser → obsidian.home)           │
│  6. GOTO 1                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The friction this design targets: **step 3 (push artifacts)**. The other steps already work — editing happens via the cross-device-ssh pattern, building is whatever `npm run build` does locally, reload + VNC are Obsidian's own surfaces.

## Constraints

Hard constraints set by the user, applied throughout:

- **No root SSH on the NAS.** Workflow must use programmatic surfaces a regular user can configure (Obsidian plugins, HTTP APIs, public-git remotes, file-sync apps from the NAS app catalog) — not host-level access.
- **No SMB exposure as the primary push channel.** Heavy, infra-level, and re-introduces a "core surface" the user wants to avoid.
- **Tailnet-only access.** All network surfaces (`obsidian.home`, the NAS itself) are inside the Tailscale mesh; nothing public-facing.
- **Generic across plugins.** The 5 active plugins with proper `package.json` build systems (and the rest of the ~15 in development) all need to work with the same workflow — no per-plugin glue.

## Setup snapshot (current state)

| Surface | What it is | Access |
|---|---|---|
| `obsidian.home` (HTTP/HTTPS) | Browser-Obsidian via VNC streaming, fronted by openresty on the NAS | Tailnet only; user logs in via browser |
| `truenas-scale` (host) | TrueNAS Scale running the Obsidian community app | Tailnet only; **deliberately not used** in this design |
| Vault directory | Bind-mounted from a NAS dataset into the Obsidian app's `/config/vaults/` | Reachable only from inside the app or via a NAS-app-catalog file-sync service |
| `<vault>/.obsidian/plugins/<id>/` | Where Obsidian loads plugins from | The push target |

Future state — when the user's [OpenClast](https://github.com/cybersader/openclast) project lands at `obsidian.home`, the surface becomes richer (per-user mount orchestrator, Yjs CRDT sync, MinIO attachments). The patterns below remain valid — they layer on top of OpenClast cleanly.

## Push mechanism — ranked

### Primary: BRAT (Beta Reviewer's Auto-update Tool)

[`TfTHacker/obsidian42-brat`](https://github.com/TfTHacker/obsidian42-brat) — a community plugin that pulls Obsidian plugin builds from a configured GitHub repo into the local Obsidian's `.obsidian/plugins/<id>/`. Designed exactly for the "test a plugin before it's published to the official Community Plugins directory" use case.

**Setup (one-time per plugin):**

1. In the NAS Obsidian (via VNC stream): install BRAT from Community Plugins.
2. BRAT settings → "Add beta plugin" → paste the GitHub repo URL of the plugin (e.g., `cybersader/crosswalker-obsidian-plugin`).
3. BRAT pulls the latest tagged release — fetching `manifest.json`, `main.js`, optional `styles.css`. Plugin appears under Community Plugins; user enables it.

**Iteration (per-edit):**

1. Edit plugin source (anywhere — locally on dev machine or remote-via-SSH-to-dev-machine via the cross-device-ssh pattern).
2. `npm run build` produces `main.js` (and `styles.css` if applicable).
3. `git tag vX.Y.Z && git push --tags` (or use a release-on-push GitHub Action — recommended; one already exists in `crosswalker-obsidian-plugin`).
4. In NAS Obsidian: command palette → `BRAT: Check for updates to all beta plugins` → BRAT pulls the new release.
5. Reload the plugin (see Reload strategies below).

**Properties:**
- Zero NAS-level access needed; only GitHub access.
- Works for public *and* private repos (private requires a GitHub Personal Access Token in BRAT settings).
- One-time setup per plugin; subsequent iterations are click-once-in-Obsidian.
- Latency: GitHub Actions build + release ≈ 1–3 min; manual `git push --tags` skips that. BRAT update is ~5 sec.

**Limits:**
- Update is pull-based, not push-based — there's no "I committed, now go update" trigger. Either click manually each iteration or set BRAT's auto-check interval (default: every 4 hours, configurable).
- Plugin must produce a release with the build artifacts attached (or commit the build outputs to a specific branch). The release-on-push GitHub Action that crosswalker uses is the canonical pattern.
- No file-level granularity — BRAT updates the whole plugin folder per release.

### Secondary: Obsidian Local REST API plugin

[`coddingtonbear/obsidian-local-rest-api`](https://github.com/coddingtonbear/obsidian-local-rest-api) — a community plugin that exposes an HTTP+HTTPS API for vault file ops on the local machine running Obsidian. With openresty's existing reverse proxy in front, the API can be reached at `obsidian.home/<api-prefix>/`.

**Setup (one-time):**

1. In NAS Obsidian: install Local REST API plugin.
2. Plugin settings → enable HTTPS endpoint (default :27124), generate API key, copy.
3. Update openresty config on the NAS to proxy a path (e.g., `/api/vault/`) to `localhost:27124`. *This is the one piece of infra config that requires NAS host access — but it's a one-time openresty edit, not ongoing root SSH.*

**Iteration:**

```bash
# After npm run build, push the artifacts:
curl -k -X PUT 'https://obsidian.home/api/vault/.obsidian/plugins/<id>/main.js' \
  -H 'Authorization: Bearer <api-key>' \
  -H 'Content-Type: application/octet-stream' \
  --data-binary '@dist/main.js'

curl -k -X PUT 'https://obsidian.home/api/vault/.obsidian/plugins/<id>/manifest.json' \
  -H 'Authorization: Bearer <api-key>' \
  -H 'Content-Type: application/json' \
  --data-binary '@dist/manifest.json'
```

Then trigger plugin reload via the same API (the plugin exposes `/commands/<command-id>` for executing arbitrary command-palette actions; pair with `obsidian-hot-reload` to make this seamless).

**Properties:**
- More flexible than BRAT — any vault file (not just plugins), any path, atomic per-file.
- Lower latency than BRAT (no GitHub round-trip). Two `curl` calls per iteration.
- Composes naturally into a `npm run deploy` script in the plugin's `package.json` — one command from anywhere.

**Limits:**
- One-time openresty edit needed to expose the API path through the existing front. Self-documenting via the openresty config diff; not a recurring access need.
- API-key management — user holds the key; care needed not to commit it. Standard `.env`-pattern.
- HTTPS cert at `obsidian.home` is self-signed by default → `curl -k`. Resolvable by configuring the NAS to trust a Let's Encrypt cert via Tailscale ACME, but out of scope here.

### Tertiary: Syncthing (NAS app catalog)

Syncthing peer-to-peer file sync, installable as a TrueNAS Scale community app. Each side runs a Syncthing instance; folders pair up by ID. Push = save the file on the dev machine.

**Properties:**
- No SSH, no API key, no GitHub round-trip.
- Bidirectional by default — the dev machine and NAS see each other's edits. Useful if the user wants to edit *content* in the NAS Obsidian and have it land on the dev machine. Less useful for plugin-specifically (plugin builds are unidirectional dev → NAS).
- Minimal latency on a tailnet — sub-second for small files.

**Limits:**
- Heavyweight setup vs. BRAT (Syncthing daemon on both ends, folder-pairing dance, ID approvals).
- Less hermetic than BRAT — easy to accidentally sync the whole `node_modules/` if the folder selection is wrong.
- Bidirectional sync is footgun-shaped for plugin dev (a corrupted plugin reload on the NAS could write garbage back to the dev machine if the source folder is the sync target).

### Rejected: SSH / SMB

Both explicitly out of scope per user preference (no host-level NAS access). Documenting only so future-readers don't propose them.

## Reload strategies

Obsidian does **not** auto-reload plugin code on disk change. After pushing new build artifacts, the plugin must be reloaded:

| Strategy | Mechanism | Cost |
|---|---|---|
| `pjeby/hot-reload` plugin | Watches `<vault>/.hot-reload` file; touches that file → all enabled plugins reload | One-time install + a single `touch .hot-reload` after each push |
| Manual disable + enable | Settings → Community Plugins → toggle the plugin off and back on | Two clicks per iteration; works if hot-reload isn't installed |
| Reload Obsidian (cmd+P → "Reload app without saving") | Whole-app reload | Heaviest; loses unsaved state in other notes |

For BRAT-based workflows, BRAT already triggers reload on update. For Local REST API, a `touch .hot-reload` via the same API after pushing the build artifacts gives an end-to-end automated cycle.

## VNC stream UX over tailnet

The Obsidian web surface streams the desktop app via VNC. From inside the tailnet:

- **Laptop / dev machine on tailnet:** ~50–100ms latency, fully usable for any plugin behavior including UI-heavy ones.
- **Phone (browser-based VNC):** ~150–300ms over LTE, ~80–150ms over Wi-Fi-tailnet. Functional for triggering plugin commands, reading plugin output, command palette ops. Suboptimal for: plugins with rapid scrolling, drag-and-drop, fine-grained mouse work.
- **Long sessions:** Kasm-style streams can hibernate after inactivity → reconnect cost ~5–10 sec.

The narrow-pane Ink rendering bug documented in `agent-context/zz-research/2026-04-23-claude-code-ink-narrow-pane-bug.md` does NOT apply here — that's specific to Claude Code's TUI, not Obsidian's GUI under VNC.

## Composition with existing scaffold patterns

| Pattern | How it composes |
|---|---|
| [Cross-device SSH](../../../02-stack/patterns/cross-device-ssh.md) | Source-edit happens on the dev machine, accessed via SSH from any device. Pairs with this doc — SSH is for *editing*, this doc is for *deploying*. |
| [Tailnet browser access](../../../02-stack/patterns/tailnet-browser-access.md) | The mechanism `obsidian.home` already uses to expose the Obsidian VNC stream. This doc is a specialization of that pattern for plugin testing. |
| [Image-paste pipeline](../../../02-stack/patterns/image-paste-pipeline.md) | Same NAS, similar tailnet-only philosophy. Independent — but if a plugin under test uses images, the pipeline already lands them in a Zipline-shaped URL the plugin can dereference. |

## Failure modes + mitigations

| Failure | Trigger | Mitigation |
|---|---|---|
| Plugin reload doesn't pick up new code | Obsidian caches require explicit reload | Install hot-reload plugin OR script the disable-enable via Local REST API |
| BRAT update silently no-ops | Release artifacts missing from the GitHub release (often after a manually-tagged release without artifacts attached) | Use the canonical release-on-push GitHub Action that bundles `main.js + manifest.json + styles.css` as release assets |
| Local REST API curl call returns 401 | API key wrong or HTTPS cert issue | Verify key in plugin settings; use `-k` if cert is self-signed |
| Pushed plugin breaks Obsidian app | Plugin throws on load | Disable-enable via Settings UI; if Obsidian is fully wedged, restart the container at the TrueNAS app surface (no host SSH needed) |
| GitHub Action release-on-push doesn't fire | Tag pattern mismatch, missing workflow trigger | Verify `.github/workflows/release.yml` matches the tag pattern (typically `v*`) |
| VNC stream too laggy from a phone | Bandwidth / latency on cellular | Drop quality in Kasm settings; for read-only verification, the docs-site rendered at the same NAS may be enough without going into the live Obsidian |
| openresty 400 on programmatic API calls | Strict Host / SNI matching | Send Host header `Host: obsidian.home` explicitly; for HTTPS use `--resolve obsidian.home:443:<tailscale-ip>` if name resolution differs |

## Verification checklist (user-runnable)

The user runs these from their dev machine. Each step is independently observable; failure at any step locates the gap.

1. **NAS browser-Obsidian still works.** Open `obsidian.home` in a browser on a tailnet device. Confirm Obsidian renders, the demo vault is loaded, the user is signed in. ⏱ ~30 sec.
2. **BRAT plugin install.** In NAS Obsidian: Community Plugins → search BRAT → install + enable. ⏱ ~1 min.
3. **BRAT-add a plugin.** Add `cybersader/crosswalker-obsidian-plugin` (or another active plugin) as a beta plugin. Verify the plugin folder appears at `<vault>/.obsidian/plugins/<id>/` and it loads under Community Plugins. ⏱ ~2 min.
4. **Hot-reload plugin install.** Install `pjeby/hot-reload`. Touch `<vault>/.hot-reload` (via Local REST API in step 6, or via the file explorer plugin in Obsidian for now). Verify the plugin reload fires on touch. ⏱ ~3 min.
5. **Make a trivial change to the plugin source.** Edit a console.log message, `npm run build`, push tag. Trigger BRAT update in NAS Obsidian. Verify the new console.log shows up in dev tools (cmd+shift+I in the streamed Obsidian). ⏱ ~5 min the first time.
6. **(optional) Local REST API.** Install the plugin in NAS Obsidian. Generate API key. Test a `curl -k -X GET 'https://obsidian.home:27124/'` from the dev machine — confirm reachability. If openresty isn't proxying yet, document the openresty edit needed (stop here; the openresty edit is a separate one-time task). ⏱ ~10 min if openresty is already routing; ~30 min including the one-time route addition.
7. **End-to-end iteration loop time.** Pick one of the active plugins. Make one substantive change, build, push, BRAT-update, reload, observe. Time the loop. Goal: under 90 sec from `git push` to "I see the change in the streamed Obsidian." If longer, the GitHub Action build is the likely bottleneck — consider local-build + Local REST API path instead.

After running, append findings to `findings/verified-iteration-loop.md` (file ready to be created in this folder); the design above gets revised based on what actually shipped.

## Open questions / future

- **Could a small purpose-built endpoint replace BRAT + Local REST API?** A tiny FastAPI / Express service running as a NAS app, accepting `POST /plugins/<id>` with a tarball, would unify the two flows. Worth designing only if BRAT + Local REST API turn out insufficient in practice.
- **What happens at OpenClast migration?** OpenClast's mount orchestrator gives per-user vault assembly — the user's "agentic-workflow scaffold preview" vault could be a separate mount alongside the plugin-test vault. Each iteration target would have its own surface. Out of scope for this doc; revisit when OpenClast goes live.
- **Could plugin tests run automatically against the NAS Obsidian?** Beyond manual VNC observation — Playwright-driven tests inside the Kasm browser, or a headless mode for plugin assertions. Worth investigating if the plugin set grows or if regressions become a recurring problem.
- **Image-paste compatibility.** When a plugin under test produces images that the user wants to capture into the agentic-workflow scaffold's research notes, does the existing image-paste pipeline (Zipline + ShareX) layer cleanly? Untested.

## Cross-references

- **Existing patterns this composes with:** [cross-device SSH](../../../02-stack/patterns/cross-device-ssh.md), [tailnet browser access](../../../02-stack/patterns/tailnet-browser-access.md), [image-paste pipeline](../../../02-stack/patterns/image-paste-pipeline.md).
- **OpenClast (future home):** [github.com/cybersader/openclast](https://github.com/cybersader/openclast) — the user's own browser-Obsidian-with-CRDT-sync project; this doc's workflow layers on top of it cleanly when it lands.
- **Obsidian plugin ecosystem references:** [BRAT](https://github.com/TfTHacker/obsidian42-brat), [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api), [hot-reload](https://github.com/pjeby/hot-reload).
- **Active plugin projects (across `4 VAULTS/plugin_development/`):** crosswalker-obsidian-plugin (richest dev loop, GitHub Actions release-on-push wired), obsidian-daily-notes-ng, obsidian-criticmarkup, obsidian-linkify-dfd, obsidian-folder-tag-sync (paths recently moved — see [stale-sessions-index recovery](../../../agent-context/zz-research/2026-04-23-stale-sessions-index-bug.md) for adjacent context).
