---
title: obsidian-headless ≠ headless Obsidian for plugin E2E
description: Name-collision gotcha — the "Obsidian Headless" project is a sync client, NOT a headless-GUI mode of the Obsidian app; it cannot run plugin E2E tests. WebdriverIO (wdio-obsidian-service) remains the real plugin-E2E path. Quick capture to avoid re-researching.
stratum: 2
status: research
date: 2026-04-24
tags:
  - obsidian
  - testing
  - plugin-dev
  - e2e
  - gotcha
---

# obsidian-headless ≠ headless Obsidian for plugin E2E

Quick capture so I don't re-research this next time.

## The confusion

The name "Obsidian Headless" sounds like it should be a headless-GUI mode of the Obsidian app suitable for plugin E2E testing. **It isn't.**

## What `obsidian-headless` actually is

- Repo: `obsidianmd/obsidian-headless`
- Description from the repo: *"Headless client for Obsidian Sync and Obsidian Publish. Sync and publish your vaults from the command line without the desktop app."*
- Installed as: `npm install -g obsidian-headless`
- Commands: `ob login`, `ob sync`, `ob sync-list-remote`, `ob sync-setup`, `ob publish …`
- Requires Node 22+

**It is a CLI client for the Sync/Publish services.** It does not load plugins, does not run the app, does not render the UI. It's for servers/CI that need to keep a vault synced via Obsidian Sync without the full desktop app running.

## What you actually want for plugin E2E

For automated testing that drives the Obsidian UI:

- **`wdio-obsidian-service`** (`jesse-r-s-hines/wdio-obsidian-service`) — purpose-built. Downloads Obsidian binaries, launches the real app with a sandbox vault, drives it via WebDriver. On Linux CI it uses `xvfb` under the hood so you get "headless GUI" without caring about the display server. Sample plugin at `jesse-r-s-hines/wdio-obsidian-service-sample-plugin`.
- **Playwright + CDP** — launch Obsidian with `--remote-debugging-port`, connect Playwright. More manual, no vault-management helpers, but works. (TaskNotes historically used this.)

Both of those are GUI-based E2E. The "headless" word is doing different work in each context:
- `obsidian-headless`: no GUI at all, only talks to the Sync API
- wdio / Playwright: real GUI launched against a virtual display (xvfb) when there's no physical one

## When could `obsidian-headless` plausibly help in a plugin dev setup?

Narrow case: if a project's test vault is on Obsidian Sync and you want CI to pull the latest vault state before running tests, `ob sync` could do that as a pre-step. Not relevant if the test vault is just a local sandbox (which is the common case).

## Takeaway

- For plugin E2E: use `wdio-obsidian-service`. The xvfb it runs under is the "headless" you want.
- For sync-specific automation: `obsidian-headless` is the right tool, but it's a narrow niche.
- Never conflate the two again. The name collision is genuinely misleading.
