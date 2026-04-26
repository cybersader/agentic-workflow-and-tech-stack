---
title: 06 · Dev Infra
description: Docker, Git, Zipline (image host), Everything.exe (file search) — the connective tissue of the dev environment.
stratum: 2
status: research
sidebar:
  order: 1
tags:
  - stack
  - dev-infra
  - docker
  - git
  - zipline
  - everything
date: 2026-04-17
branches: [agentic]
---

## The pattern (stratum 2)

Beyond the AI CLI and terminal mux, there's a handful of infrastructure tools that make daily development work without friction. They're not the primary tools; they're the **connective tissue**. Pick once, configure once, mostly forget they exist until they matter.

## My picks

### Docker (or Podman)

- **What for:** running services locally without polluting the host (databases for dev, test services, sometimes build environments)
- **Pick:** Docker Desktop on Windows/Mac; Docker Engine on Linux servers; Podman if you specifically want rootless / daemonless
- **WSL note:** Docker Desktop's WSL2 integration works well; running the daemon natively in WSL is also fine
- **Install:** Platform-specific from [docker.com](https://www.docker.com/)

### Git

- **Global config I set:**
  - `user.name` and `user.email` per GitHub
  - `init.defaultBranch = main`
  - `pull.rebase = false` (I prefer merge commits to see context)
  - `core.autocrlf = input` on Windows (avoid CRLF drift)
- **Aliases I keep:** `git st`, `git lg` (pretty log), `git wt` (worktree shortcut)
- **Git worktrees** for parallel AI work — see [`../patterns/parallel-agents-worktrees.md`](../patterns/parallel-agents-worktrees.md)

### Zipline (self-hosted image host)

- **What for:** the [image-paste pipeline](../patterns/image-paste-pipeline.md) depends on this
- **Where it runs:** in my homelab (see [`05-homelab/`](../05-homelab/) for the pattern)
- **Access:** Tailscale-gated only
- **Install:** [Zipline docker instructions](https://zipline.diced.sh/docs/get-started/docker)

### Everything.exe (Windows file search)

- **What for:** full-filesystem search on Windows — instant, by filename or regex. Dramatically faster than `find` on `/mnt/c/` from WSL.
- **How I use from WSL:** call `es.exe` (the CLI) via the Windows path:
  ```bash
  "/mnt/c/Users/<name>/AppData/Local/Everything/es.exe" "pattern"
  ```
- **Why:** `find` on `/mnt/c/` is 10–100× slower than Everything. For PC-wide filename search, Everything is unbeatable.
- **Install:** [voidtools.com](https://www.voidtools.com/)

### Additional utility tools

| Tool | Purpose | Notes |
|---|---|---|
| **ripgrep (`rg`)** | Full-text search | Default for code search; much faster than `grep -r` |
| **fd** | File finding | `find` replacement with sane defaults |
| **jq** | JSON processing | Parsing API responses, config manipulation |
| **bat** | `cat` with syntax highlighting | Pleasant reading |
| **fzf** | Fuzzy finder | Pipe-compatible; composes with other tools |
| **delta** | Better `git diff` | Side-by-side, syntax-highlighted diffs |

Install via whatever your platform uses (`cargo`, `apt`, `brew`, `winget`). These are stratum 4 (deterministic, drop-in) — install scripts can include them unconditionally.

## Shell / terminal ancillaries

- **Starship prompt** (optional) — fast, Git-aware prompt
- **direnv** — per-project env vars automatically loaded when entering directory
- **dotenv-safe patterns** — for local development only; production uses real secret stores

## What I don't use (and why)

| Tool | Why not |
|---|---|
| **NerdFonts as required** | I use them when they're already there but don't make my tools depend on them — portability across machines where I can't install fonts |
| **Oh-my-zsh / Oh-my-bash** | Heavy framework layers. I'd rather hand-pick bashrc snippets. |
| **`fish` shell** | Great shell, but my scripts assume bash-compatible syntax across all my devices. Switching would mean rewriting all helper scripts. |
| **Zsh** | Fine; I've just settled on bash for consistency across WSL + Termux + servers. |

## Integration with the rest of the stack

| Serves | With |
|---|---|
| [01 · AI Coding CLIs](../01-ai-coding/) | Git for version control, Docker for local services |
| [04 · Knowledge Mgmt](../04-knowledge-mgmt/) | Everything for fast file search beyond Obsidian |
| [Image-paste pipeline](../patterns/image-paste-pipeline.md) | Zipline as the upload target |

## Deep dives

- [`../patterns/parallel-agents-worktrees.md`](../patterns/parallel-agents-worktrees.md) — Git worktrees for parallel AI work
- [`../patterns/image-paste-pipeline.md`](../patterns/image-paste-pipeline.md) — Zipline + ShareX flow
- [`../../knowledge-base/03-reference/`](../../knowledge-base/) — self-hosted deployment platforms (when that migrates into this tier)
