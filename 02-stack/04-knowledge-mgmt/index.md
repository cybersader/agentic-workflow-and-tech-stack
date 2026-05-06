---
title: 04 · Knowledge Management
description: Obsidian + Obsidian CLI + curated plugins — the local-first markdown knowledge system that this scaffold both supports and depends on.
stratum: 2
status: research
sidebar:
  order: 1
tags:
  - stack
  - obsidian
  - knowledge-management
date: 2026-04-17
branches: [agentic]
---

## The pattern (stratum 2)

A knowledge-work environment needs a **knowledge system** — a place where thinking accumulates, gets refined, and becomes accessible later. The pattern has specific requirements for AI agent integration:

1. **Plain-text markdown files** on the local filesystem (not a proprietary database)
2. **Stable paths + human-readable names** so agents can navigate via glob/grep/read
3. **Optional graph overlay** for human navigation; not required for agents
4. **A CLI or programmatic interface** so automation can add/query without a GUI

This combination rules out most "second brain" apps that lock content into closed formats (Roam, Notion-as-KB, Evernote). What's left is mostly Obsidian, Logseq, and plain-text-with-a-tool-chain.

## Sub-pages

- [Remote plugin development via tailnet](./obsidian-plugin-dev-remote.md) — iteration loop for Obsidian plugin testing against a NAS-hosted browser-streamed Obsidian, without granting deploy-host root access.

## My current pick: Obsidian

### Why Obsidian

- **Files on your filesystem** — `.md` in folders. No server, no account required, no lock-in.
- **Stable feature set** — the core is simple (folders + files + links + tags). Plugins add what's needed.
- **Strong community** — deep plugin ecosystem, many well-maintained ones.
- **Obsidian CLI** — now available (v1.12.4+), making scripting straightforward.
- **Works with this scaffold's Obsidian-Flavored-Markdown** — wikilinks, callouts, properties all render both in Obsidian and on the Starlight site.

### My vault pattern

Vault lives outside this repo (knowledge work is separate from the tier-3 work content — see [the three-tier structure](../../kernel/)). Typical layout mirrors the temperature gradient from [principle 02](../../principles/02-temperature-gradient.md):

```
~/Obsidian/main-vault/
├── 00-inbox/
├── 01-working/
├── 02-learnings/
├── 03-reference/
├── 04-archive/
├── System/               # templates, plugin data
├── .obsidian/            # vault config (portable if you keep it in git)
└── _attachments/         # images, PDFs
```

### Obsidian CLI (newer)

As of v1.12.4 Obsidian ships with a CLI:

```bash
obsidian search "query"             # search the current vault from terminal
obsidian open "Note Name"           # open a note
obsidian get "Note Name"            # stream note content to stdout
```

Enable: Obsidian Settings → General → CLI → Register.

See [`../../docs/knowledge-base-guide.md`](../../docs/knowledge-base-guide.md) (temporary location, will migrate into this layer) for the full CLI walkthrough.

### Plugins I use (and some I've authored)

| Plugin | Purpose | Author |
|---|---|---|
| Dataview | Query notes like a database | community |
| Templater | Scripted templates | community |
| [obsidian-daily-notes-ng](https://github.com/cybersader/obsidian-daily-notes-ng) | Next-gen daily notes with NLP dates | me |
| [obsidian-folder-tag-sync](https://github.com/cybersader/obsidian-folder-tag-sync) | Bidirectional folder↔tag sync | me |
| [obsidian-immich-picker](https://github.com/cybersader/obsidian-immich-picker) | Insert images from Immich | me |
| [crosswalker](https://github.com/cybersader/crosswalker) | GRC compliance crosswalking | me |
| [obsidian-criticmarkup](https://github.com/cybersader/obsidian-criticmarkup) | Suggest edits / annotations | me |
| [tasknotes](https://github.com/cybersader/tasknotes) | Task + time tracking | me |

See [my Obsidian-related repos on GitHub](https://github.com/cybersader?tab=repositories&q=obsidian) for the full list.

### Obsidian-Flavored Markdown compatibility

This scaffold deliberately preserves Obsidian syntax so the same files work both in-vault (for direct editing) and on this site:

- `[[wikilinks]]` resolve via `remark-wiki-link`
- `> [!note]` callouts render via `remark-obsidian-callout`
- YAML frontmatter is native to both
- Images work via relative paths

The `obsidian-markdown`, `obsidian-bases`, and `json-canvas` skills in [`../../skills/`](../../skills/) keep AI agents fluent in the Obsidian dialects when authoring or editing vault content.

## Alternatives considered

| Alternative | Why not (for me) |
|---|---|
| Logseq | Outliner-first UX; I prefer document-first. Great for people with the opposite preference. |
| Notion | Not plain text. Locks content to their servers. Poor fit for agent integration. |
| Roam Research | Similar concerns to Notion + expensive. |
| TiddlyWiki | Single HTML file model; hard to integrate with file-tree tooling. |
| Zettlr / Joplin | Reasonable alternatives; smaller plugin ecosystems. |
| Plain markdown + VS Code | Works if you don't need graph navigation. Drops when vault gets big. |

## What I'm watching

- **Neo4j + Ollama + [MegaMem](https://github.com/nullchimp/megamem-plugin)** — Obsidian-to-Neo4j bridge for semantic search. Pre-beta; watching.
- **[Openclast](https://github.com/cybersader/openclast)** (my project) — browser-based Obsidian with CRDT sync. When this matures, it becomes an alternative for multi-device vault editing.

## Install pointers

| Tool | Where |
|---|---|
| Obsidian | [obsidian.md/download](https://obsidian.md/download) |
| Obsidian CLI | Built-in since v1.12.4 (enable in Settings) |
| Plugins | Community Plugins browser inside Obsidian |

## Integration with the rest of the stack

| Connects to | How |
|---|---|
| [01 · AI Coding CLIs](../01-ai-coding/) | Agents navigate the vault via filesystem + Obsidian CLI |
| [05 · Home Lab](../05-homelab/) | Vault sync via Syncthing or Obsidian Sync |
| This scaffold | Principles pages use Obsidian callouts + wikilinks; render identically on the site |

> [!note]
> Obsidian callouts (`> [!note]`, `> [!warning]`) render natively in Obsidian but degrade to plain blockquotes in the Starlight site mirror. For docs that get site-mirrored (`01-kernel/`, `02-stack/`, `03-work/`), prefer Starlight syntax (`:::note` … `:::`). Obsidian syntax is appropriate for `knowledge-base/` content (Obsidian-native demo) only.

## Deep dives

- [`../../01-kernel/principles/02-temperature-gradient.md`](../../01-kernel/principles/02-temperature-gradient.md) — the thermal zones used in Obsidian vaults
- [`../patterns/obsidian-workflow.md`](../patterns/obsidian-workflow.md) — stack-specific workflow patterns (coming)
