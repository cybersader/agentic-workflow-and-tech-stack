---
title: GitHub Actions → tailnet-only PaaS autodeploy via Tailscale-OAuth runner
description: Pattern for autodeploying from a public GitHub repo to a self-hosted PaaS (Dokploy / Coolify / CapRover / etc.) that lives on a Tailscale-only network. The naive PaaS-GitHub-App webhook flow fails — GitHub fires from public IPs and can't reach a tailnet-only host. The workaround joins an ephemeral GitHub Actions runner to the tailnet via Tailscale OAuth + tag-ACL, then has the runner curl the PaaS's deploy webhook. Two-layer auth (network + app); ~10 min of admin clicks per repo; ~25-line workflow file. Sanctioned by Tailscale — they ship `tailscale/github-action` for exactly this case.
stratum: 2
status: stable
sidebar:
  order: 7
tags:
  - stack
  - pattern
  - dokploy
  - coolify
  - caprover
  - tailscale
  - github-actions
  - homelab
  - paas
  - deploy-pattern
  - private-repo
date: 2026-05-10
branches: [agentic]
---

## The promise

You have a self-hosted PaaS — Dokploy, Coolify, CapRover, or similar — running behind Tailscale (no public ingress). You have a private GitHub repo. You want `git push main` to autodeploy.

The PaaS's GitHub-App + autodeploy toggle **does not work** in this topology. GitHub fires webhooks from public IPs; your PaaS host is `<host>.<tailnet>.ts.net` only; webhooks time out silently and you don't notice until the deploy doesn't happen.

This pattern is the workaround that does work, end to end. It's `tailscale/github-action` doing the load-bearing work — joining the ephemeral GitHub Actions runner to your tailnet under a tag with a tightly scoped ACL — followed by a single `curl` to the PaaS's existing deploy-token webhook.

The pattern is generic. Dokploy v0.29.x is the source-case from a homelab tailnet deploy; the same shape works for any PaaS that exposes a token-protected deploy webhook reachable on the tailnet.

## The shape

```
git push main (public)
    ↓ webhook → public GitHub Actions runner
    ↓ tailscale/github-action@v3 (OAuth → ephemeral auth-key, runner joins as tag:ci)
    ↓ curl POST → http://<paas-host>.<tailnet>.ts.net/api/deploy/<app-token>
    ↓ PaaS validates branch + watch-paths
    ↓ build + deploy
```

## Why two-layer auth matters

This is the load-bearing security argument:

- **Network layer** (Tailscale OAuth + tag ACLs): the runner is ephemeral but joins as `tag:ci`. The ACL grants `tag:ci → tag:paas:<ports>` and nothing else. If the runner is compromised, blast radius is limited to whatever the ACL exposes.
- **App layer** (PaaS deploy-token in URL): the per-app webhook URL has a long random token in the path. Stolen token alone gets nothing — the attacker still needs tailnet access.

Both layers must pass. Neither alone is sufficient. This is the same model GitHub uses for self-hosted runners (network ACL + auth token); the PaaS just doesn't surface the network half by default.

## Concrete recipe

Three sides need touching: tailnet admin (one-time per tailnet), PaaS app (per app), GitHub repo (per repo).

### Tailnet admin (one-time, ~5 min)

1. **Create a Tailscale OAuth client.**
   - `https://login.tailscale.com/admin/settings/oauth` → Generate OAuth client.
   - Scope: `auth_keys` write.
   - Tags: `tag:ci`.
   - Copy the Client ID and Secret. **The Secret is shown once.**

2. **Update tailnet ACL** to allow `tag:ci → tag:paas` on the ports your PaaS deploy webhook listens on (commonly 80, 443, 3000, or whatever your PaaS uses internally).

   Tailscale's newer **grants** format (replaces the older `acls` block — both work but grants is the documented current-generation syntax):

   ```jsonc
   "tagOwners": {
     "tag:ci":   ["autogroup:admin"],
     "tag:paas": ["autogroup:admin"]
   },
   "grants": [
     {
       "src": ["tag:ci"],
       "dst": ["tag:paas"],
       "ip":  ["tcp:80", "tcp:443", "tcp:3000"]
     }
   ]
   ```

   **Gotcha — split ports per array entry.** In the grants format, each `ip` entry holds **one** port or range. `"tcp:80,443,3000"` is rejected with `only one port range allowed`. Split into separate strings as shown above.

3. **Apply the tag** to your PaaS host: Machines tab → `<paas-host>` → Edit ACL tags → add `tag:paas`.

You now have an ACL where ephemeral CI runners (with `tag:ci`) can reach your PaaS (with `tag:paas`) on the deploy ports. Anything else stays unreachable.

### PaaS (per app)

4. **Get the app's deploy webhook URL** from the PaaS UI. The PaaS will typically show it as `http://<internal-service-name>:<port>/api/deploy/<token>` — using its internal Docker service hostname. **Hand-edit the hostname** when you store it as a GitHub secret, replacing the internal hostname with the tailnet hostname:

   ```
   http://dokploy:3000/api/deploy/<token>          ← what the PaaS UI shows
   http://<paas-host>.<tailnet>.ts.net/api/deploy/<token>   ← what you store
   ```

5. **Don't expect the PaaS UI to template this for you.** In Dokploy v0.29.x, setting `Settings → Web Server → Server Domain` to your tailnet hostname does NOT update the templated webhook URL — it stays as the internal hostname. Hand-edit is the only path. Other PaaS tools may behave similarly. (Setting the Server Domain to the tailnet hostname is harmless — it adds a Traefik route on port 80 for the admin UI but doesn't affect the webhook output. **HTTPS toggle should stay OFF** — Let's Encrypt can't reach a tailnet-only host, so any HTTPS attempt will fail.)

### GitHub repo (per repo)

6. **Three repository secrets.** Names matter (the workflow file references them by name). Store as **Secrets**, not Variables — the GitHub UI has both tabs and they're not interchangeable:

   ```
   TS_OAUTH_CLIENT_ID    ← Tailscale OAuth Client ID from step 1
   TS_OAUTH_SECRET       ← Tailscale OAuth Secret from step 1 (only visible once)
   PAAS_DEPLOY_URL       ← the hand-edited URL from step 4
   ```

7. **Workflow file** at `.github/workflows/deploy.yml` (~25 lines):

   ```yaml
   name: Deploy
   on:
     push:
       branches: [main]
       paths: ['<deploy-path>/**', '.github/workflows/deploy.yml']
     workflow_dispatch:
   jobs:
     deploy:
       runs-on: ubuntu-latest
       timeout-minutes: 5
       steps:
         - uses: tailscale/github-action@v3
           with:
             oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
             oauth-secret:    ${{ secrets.TS_OAUTH_SECRET }}
             tags:            tag:ci
         - env:
             SHA: ${{ github.sha }}
           run: |
             curl -fsSL --max-time 30 -X POST \
               -H 'Content-Type: application/json' \
               -H 'X-GitHub-Event: push' \
               -d "{
                 \"ref\": \"refs/heads/main\",
                 \"head_commit\": {\"id\": \"${SHA}\", \"message\": \"CI deploy\"},
                 \"commits\": [{\"id\": \"${SHA}\", \"modified\": [\"<deploy-path>/.deploy-trigger\"]}]
               }" \
               "${{ secrets.PAAS_DEPLOY_URL }}"
   ```

   Replace `<deploy-path>` with the directory that, when changed, should trigger a deploy (e.g. `app/`, `docs-site/`, or `.` for the whole repo). The same path goes in `paths:` (so the workflow runs only when relevant files change) AND in the curl payload's `commits[0].modified` (so the PaaS's `watchPaths` filter sees a matching change). See the **Webhook payload quirks** section below for why the latter matters.

## Webhook payload quirks (the non-obvious part)

The PaaS deploy webhook is **not** a generic "trigger build" endpoint. It expects to look like a real provider webhook event (GitHub / Gitea / GitLab / Bitbucket). Reverse-engineering the right payload is the part that takes the longest first time.

The patterns vary slightly per PaaS, but the load-bearing requirements (sourced from Dokploy v0.29.x — others are similar) are:

- **A provider-event header is required.** Dokploy's `extractBranchName(headers, body)` returns null unless one of `x-github-event`, `x-gitea-event`, `x-gitlab-event`, `x-event-key` (Bitbucket), or `x-softserve-event` is present. Without one, the branch check fails with `Branch Not Match` even when the body is a perfect provider-shaped JSON. **Add `-H 'X-GitHub-Event: push'` to the curl.**
- **The branch must match exactly.** For provider-linked apps (`sourceType: "github"`), branch is extracted as `body.ref.replace("refs/heads/", "")` and compared against the configured branch. For generic-Git apps (`sourceType: "git"`), it's compared against the app's `customGitBranch` field. Either way, the value in `ref` must match.
- **`watchPaths` filtering happens upstream of branch matching for some sourceTypes.** If the app has `watchPaths` configured, the PaaS computes `normalizedCommits = body.commits.flatMap(c => c.modified)` and skips deploy if no modified file matches any watch path. Workaround: include a sentinel path under the watched directory in `commits[0].modified` (the workflow above does this with `.deploy-trigger`).

If you're integrating with a different PaaS, **read its deploy-webhook handler source** before guessing the payload shape — the docs typically don't enumerate every required field. For Dokploy: `apps/dokploy/pages/api/deploy/[refreshToken].ts`.

## Failure modes (in the order they typically appear)

| Symptom | Cause | Fix |
|---|---|---|
| `Error: OAuth identity empty` | Repo secret name typo, OR saved as Variable instead of Secret | Names must be exact: `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`. GitHub UI has separate Variables/Secrets tabs — must be Secrets |
| `{"message":"Branch Not Match"}` with empty POST | No body | Add `-d '{"ref":"refs/heads/main"}'` |
| `{"message":"Branch Not Match"}` with body | Missing provider header — webhook handler returns null branch | Add `-H 'X-GitHub-Event: push'` |
| `curl: (28) Operation timed out` at TCP layer | ACL not granting `tag:ci` → `tag:paas` | Verify PaaS host has the right tag applied (Machines tab); verify the grants block exists in tailnet ACL |
| `{"message":"Watch Paths Not Match"}` | App has `watchPaths` configured but payload's `modified[]` is empty | Add a sentinel path under the watched dir to `commits[0].modified` |
| Tailnet ACL editor: `only one port range allowed` | Multiple ports comma-joined in one `ip` string | Split into separate array entries: `["tcp:80", "tcp:443", "tcp:3000"]` |
| Deploy starts but never completes | Build itself failing inside the PaaS | Different problem (PaaS-side); check PaaS logs. The webhook side is healthy if you got past `Branch Not Match` and `Watch Paths Not Match`. |

## Why this is the right shape

The instinct when the official `PaaS GitHub App` doesn't work is to put the PaaS on a public IP with HTTPS — the same shape every cloud-hosted PaaS uses. That works but defeats the point of having the PaaS on Tailscale (private-by-default; no public attack surface; no Let's Encrypt rate-limit games; no DNS / DDoS / bot scanning).

The pattern in this doc keeps the PaaS tailnet-only AND gets autodeploy. The single piece of public-internet code that runs is the GitHub Actions workflow itself (which GitHub already secures), and the only thing it has access to inside your tailnet is the explicit `tag:ci → tag:paas` grant. Compare to:

- **PaaS public + Cloudflare Tunnel + GitHub App**: works, but adds Cloudflare as a trust dependency and a third party between GitHub and your PaaS.
- **PaaS public + manual webhook button**: works for one app, doesn't scale; every push needs human action.
- **Self-hosted GitHub Runner inside the tailnet**: works, but adds a permanent always-on runner you have to maintain. The pattern in this doc uses ephemeral cloud runners (no maintenance) and only joins the tailnet for the duration of the deploy.

The pattern is sanctioned by Tailscale — they ship `tailscale/github-action` specifically for this case, and "deploy to private infra from public CI" is the canonical example in their docs. It feels like duct-tape because the PaaS doesn't surface it as a first-class flow in its UI; once wired up, it's solid and repeatable.

## When NOT to use this pattern

- **Your PaaS is already on a public IP.** Use the PaaS's native GitHub App if it has one — fewer moving parts. The pattern in this doc is specifically for tailnet-only PaaS.
- **You only have one repo.** ~10 min of admin clicks beats setting up the OAuth + ACL infrastructure. Reach for this pattern when you have a second app coming.
- **Your CI provider isn't GitHub Actions.** GitLab CI, CircleCI, etc. need their own equivalent of `tailscale/github-action`. The pattern transfers (ephemeral runner joins tailnet via OAuth + tag-scoped ACL) but the recipe steps differ. Tailscale's docs cover the GitLab equivalent.

## Reusing across repos

Once the tailnet admin (steps 1–3) is done, every subsequent repo only needs:

- The 3 GitHub secrets (steps 6–7) — the workflow file copies cleanly between repos with the deploy-path variable being the only edit.
- A new app provisioned in the PaaS UI with a deploy webhook (the PaaS gives you the new token; you hand-edit the hostname).

Roughly **5 minutes per new repo** once the tailnet is set up.

## Related

- [Dokploy on TrueNAS Scale via a Debian VM](./dokploy-on-truenas-via-vm.md) — the homelab-side prerequisite for "you already have a tailnet-only PaaS"
- [Tailscale HTTPS — three levels of effort](./tailscale-https-three-levels.md) — orthogonal: this pattern works fine over HTTP-over-WireGuard (the Tailscale tunnel itself is encrypted), so HTTPS to the PaaS isn't load-bearing for this flow
- [Tailnet browser access](./tailnet-browser-access.md) — for end-user access to the deployed app; this pattern handles the deploy step, not the browse step
- [`tailscale/github-action`](https://github.com/tailscale/github-action) — the action being used; v3 at time of writing
- Tailscale docs: ["Use Tailscale with GitHub Actions"](https://tailscale.com/kb/1276/tailscale-github-action) — the upstream pattern this doc instantiates
