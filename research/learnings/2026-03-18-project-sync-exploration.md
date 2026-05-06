---
date: 2026-03-18
type: insight
tags:
  - claude-code
  - sync
  - tailscale
  - infrastructure
source: conversation about multi-device project sync
---

# Multi-Device Claude Code Project Sync

:::caution[Premise partially superseded — read alongside challenge 02]
The single-machine WSL ↔ Windows half of this exploration was **superseded 2026-04-21** when the content-layer poisoning was characterized: file-sync between `C--` and `-mnt-c-` buckets cannot fix paths baked into the JSONL content itself. The fix is paste-first extraction via [portaconv](https://github.com/cybersader/portaconv) — see [02 · Claude Code Conversation Fragmentation](../zz-challenges/02-claude-code-conversation-fragmentation.md) for the full evidence.

The **multi-machine** half (Tailscale + Syncthing across desktop/laptop/server) is still an open design question — file-sync remains the right primitive there, since each machine has its own consistent path encoding. Use that part of this doc; ignore the single-machine `claudecode-project-sync` framing.
:::

## Current State

`claudecode-project-sync` tool handles WSL ↔ Windows path conversion on a single machine. It works by copying project folders between `C--` and `-mnt-c-` format in `~/.claude/projects/`.

**Still valid:** The core `C--` ↔ `-mnt-c-` path encoding hasn't changed.

**New since tool was written (2026):**
- `sessions-index.json` — Session metadata index (summaries, message counts, dates)
- `memory/` directory — Auto-memory files per project (MEMORY.md + topic files)
- The tool copies whole folders so these are included, but untested

## The Bigger Idea

Self-hosted sync service that keeps `~/.claude/projects/` in sync across multiple machines over Tailscale. Use cases:
- Desktop (WSL) ↔ Laptop
- Desktop ↔ Remote server
- Any machine on the Tailnet

## Approaches to Explore

### 1. Syncthing (simplest, most trusted)
- Self-hosted, P2P file sync
- Already widely used, very mature
- Just point it at `~/.claude/projects/` on each machine
- Handles conflict resolution
- Runs as a service, web UI for config
- **Concern:** Session .jsonl files could conflict if editing on two machines simultaneously

### 2. Git-based sync
- Push `~/.claude/projects/` to a private repo
- Cron job or hook to auto-commit/push
- **Concern:** .jsonl files are large, binary-ish — bad fit for git

### 3. rsync over Tailscale SSH
- Simple cron: `rsync -avz ~/.claude/projects/ desktop:~/.claude/projects/`
- One-directional or bidirectional with unison
- **Concern:** No conflict resolution with basic rsync

### 4. Custom daemon (overkill?)
- Watch `~/.claude/projects/` for changes
- Sync via Tailscale to other machines
- Handle path conversion (WSL ↔ Mac ↔ Linux)
- **Concern:** Reinventing Syncthing

## Recommendation

**Syncthing is the right answer here.** It's:
- Self-hosted (runs on TrueNAS, any Docker host)
- Encrypted in transit
- Works over Tailscale
- Mature conflict resolution
- Zero maintenance once configured

The only question is whether Claude Code handles concurrent access to the same project folder gracefully (probably not — but you'd rarely edit on two machines simultaneously).

## Path Conversion Across Platforms

| Machine | Claude projects path | Format |
|---------|---------------------|--------|
| WSL | `~/.claude/projects/-mnt-c-Users-X-project` | WSL |
| Mac | `~/.claude/projects/-Users-X-project` | macOS |
| Linux | `~/.claude/projects/-home-X-project` | Linux native |
| PowerShell | `~/.claude/projects/C--Users-X-project` | Windows |

A sync tool would need to handle these different encodings. Syncthing alone won't convert paths — you'd still need the project-sync tool for that.

## Next Steps (when ready)

1. Test Syncthing syncing `~/.claude/projects/` between two machines
2. Verify session files aren't corrupted by sync
3. Test if auto-memory persists correctly across machines
4. If path conversion needed: update claudecode-project-sync for multi-platform
