# Tailscale Preview — How to Review the Site

The repo is **private** during PII audit. The site must not go public yet. But the user needs to review content on the phone / other devices.

Solution: **serve the site over the tailnet** so it's reachable only from the user's Tailscale-authenticated devices.

## Local dev (PC only)

```bash
cd site
bun install   # first time
bun run dev
```

Visit `http://localhost:4321/agentic-workflow-and-tech-stack/` in a browser on the same PC.

## Tailscale-accessible dev server

### Option A: Bind to all interfaces + Tailscale sharing

The `dev:host` script binds Astro's dev server to `0.0.0.0`:

```bash
cd site
bun run dev:host
```

Server is now reachable at:

```
http://<pc-tailnet-hostname>.ts.net:4321/agentic-workflow-and-tech-stack/
```

From any Tailscale-authenticated device (laptop, phone via Termux browser, tablet), open that URL.

**Security note:** binding to `0.0.0.0` means the server is reachable on all network interfaces, not just the tailnet. If the PC is on a public WiFi, or has other hostile networks, this is a concern. For a home network + tailnet, it's fine; the Astro dev server has no sensitive state.

### Option B: Tailscale Serve (recommended for phone review)

Tailscale Serve gives the dev server a clean HTTPS URL scoped to the tailnet, no `:port` required:

```bash
# On the PC, while the dev server is running locally
tailscale serve https / http://localhost:4321
```

Then open on any tailnet device:

```
https://<pc-tailnet-hostname>.ts.net/agentic-workflow-and-tech-stack/
```

(No port in the URL. Tailscale terminates HTTPS.)

To stop the Tailscale Serve tunnel:

```bash
tailscale serve reset
```

### Option C: Tailscale Funnel (public — DON'T DO THIS)

Tailscale Funnel makes the URL internet-public. **Do not use this for preview** until the PII audit clears. Tailscale Serve (internal to tailnet) is the right choice for private review.

## Preview checklist for review

On the phone browser:

- [ ] Homepage renders (hero, tier cards, vision block)
- [ ] Principles section works — all 10 pages open
- [ ] Stratum badges visible at the top of each page (S1 purple, S2 blue, etc.)
- [ ] Stack pages load (01-ai-coding through 07-editor-ext)
- [ ] Work pages load (memory, rebuild, homelab, project-types)
- [ ] Site search works (Pagefind)
- [ ] Site graph renders (from starlight-site-graph)
- [ ] Mobile layout — sidebar collapse, readable body text
- [ ] Internal links resolve (no 404s)
- [ ] Image zoom works on any images

## Building a production preview (static files)

For a stable preview without the dev server:

```bash
cd site
bun run build
# then serve dist/ statically via any HTTP server:
python3 -m http.server --directory dist 4321
# or
bunx serve dist -l 4321
```

Then use Tailscale Serve against that:

```bash
tailscale serve https / http://localhost:4321
```

Static serving is more representative of the final deploy (no HMR, real navigation).

## Before going public

1. Run the PII scan:
   ```bash
   cd ..
   bun 00-meta/stratum-audit/pii-scan.mjs
   ```
2. Resolve all **critical** findings (zero expected)
3. Review **high** + **medium** findings — fix or add to `PLACEHOLDER_MATCHES` tolerance list
4. Confirm [`03-work/homelab/`](#private-reference) does NOT contain actual IPs, hostnames, credentials
5. Confirm root `CLAUDE.md` and `AGENTS.md` don't expose anything personal
6. Switch GitHub repo visibility to public
7. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
8. The existing `.github/workflows/deploy-site.yml` will fire on next push to `main`

## Stopping

- `Ctrl+C` in the `bun run dev:host` terminal
- `tailscale serve reset` to remove the tailnet route
- `bun run build` once more if you want the static output stable
