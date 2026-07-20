---
title: Local-search tooling — ck vs alternatives (deferred eval)
description: Followup research note opened after a 13 GiB OOM during ck semantic indexing of a binary-heavy archive tree. The OOM was patched with `.ckignore` + `ulimit -v` rails, but the underlying question — "is ck the right primary?" — stays open. Catalogues candidate alternatives (codebase-memory-mcp, qmd, Meilisearch, simonw/llm + sqlite-vss) with axes for comparison, so the next pass starts with a structured framework instead of a re-scope.
stratum: 2
status: research
sidebar:
  order: 8
tags:
  - stack
  - ai-coding
  - claude-code
  - search
  - ck
  - codebase-memory-mcp
  - qmd
  - meilisearch
  - eval
  - deferred
date: 2026-05-12
branches: [agentic]
---

## Why this note exists

The local-search system (ck + Obsidian CLI + bash registry, shipped 2026-05-10 in commits `1ff3b9a`–`d82865e`) blew up to 13 GiB of RAM during a fan-out query 2026-05-12. Root cause was binary-heavy trees without `.gitignore` — ck was attempting to embed audio/PDF/image files as text. The immediate fix (`.ckignore` template + `ulimit -v` rails + `cks-doctor`/`cks-cleanup` diagnostics, commit `<this commit>`) closes the OOM path, but a deeper question remains:

**Should ck remain the primary tool, given that out-of-the-box it has no default-exclude list and no concurrent-instance management?** The patches make it safe; they don't make it the *best fit*.

This note opens the alternative-research thread without committing to a switch. The investment is small (read each candidate's README + recent issues + memory-profile docs); the upside is a possibly better primary that handles binary-heavy multi-tree corpora natively.

## Candidate axes

When comparing, score each tool on:

1. **Default exclude behavior.** Does it ship with a sensible binary-file blocklist out of the box? Does it require user-supplied `.<tool>ignore`?
2. **Memory profile during indexing.** Does it stream chunks to disk as it goes, or buffer entire files? How does RSS scale with corpus size?
3. **Multi-root federation.** Native registry of multiple search roots, or per-tree CLI invocations (the position ck is in)?
4. **Concurrent-instance behavior.** Does the server process handle multiple client connections, or does each MCP client spawn its own server (the ck problem)?
5. **Embedding model size + offline operation.** Does it bundle embeddings or download them? Can it run without an internet connection?
6. **Speed of first-query (cold-index) vs subsequent (warm).**
7. **Output format flexibility.** JSON / JSONL / grep-style / scored / with-context options?
8. **MCP server availability.** Does it ship its own MCP server, or do we have to wrap it?
9. **License + maintenance status.** Active? Permissive license? Single maintainer or org-backed?
10. **OOM-safe defaults.** Does it have its own RAM-cap behavior, or does it expect the caller to provide one?

## Candidates

### ck (current primary, BeaconBay/ck)

- **Default excludes:** none beyond `.gitignore`. Requires user `.ckignore` for binary blocklist.
- **Memory profile:** can balloon on first-index of trees with large binaries (the OOM we just hit).
- **Multi-root:** no native registry; per-tree `.ck/`. We built a bash registry on top.
- **Concurrent instance:** one `ck --serve` per MCP client. Stale instances accumulate.
- **Model:** bge-small (default), bundled embedding via FastEmbed/ONNX. Offline after first download.
- **Speed:** "~1M LOC under 2 min" per docs for index. Sub-500ms warm queries.
- **Output:** grep-style + `--json`/`--jsonl`.
- **MCP:** native `ck --serve`.
- **License/status:** Apache 2.0 / MIT dual. Active (v0.7.4 as of 2026-05).
- **OOM-safe:** no built-in cap; we're providing one via `ulimit`.

### codebase-memory-mcp (DeusData)

- **Pitch:** "high-performance code intelligence MCP server. Single static binary, zero dependencies. Average repo in milliseconds. 155 languages, sub-ms queries, 99% fewer tokens."
- **Default excludes:** unknown — needs README read.
- **Memory profile:** unknown.
- **Multi-root:** unknown.
- **Concurrent instance:** unknown.
- **Model:** bundled Nomic embeddings (no API key, no Ollama, no Docker).
- **MCP:** native.
- **License/status:** unknown.

### qmd (tobi/qmd)

- **Pitch:** mini CLI search for docs/knowledge bases. Three-stage: BM25 + vector + LLM rerank, all local via `node-llama-cpp` + GGUF models.
- **Concurrent instance:** unknown.
- **Model:** local GGUF.
- **MCP:** unknown — there's a separate Obsidian plugin port (`achekulaev/obsidian-qmd`) but not sure about MCP.
- **Notable:** designed for "personal knowledge base" use case directly.

### Meilisearch

- **Pitch:** lightning-fast search engine API. Single binary daemon. Hybrid full-text + semantic via vector store.
- **Concurrent instance:** daemon-style, multi-client.
- **Multi-root:** indices are first-class; multiple indices in one daemon.
- **Model:** pluggable (OpenAI, Ollama, local, etc.).
- **MCP:** no native MCP server; would need to wrap.
- **Notable:** much more mature than ck/qmd/codebase-memory. Production search engine.

### simonw/llm + sqlite-vss (composition)

- **Pitch:** `llm` CLI + `llm-embed` plugin + `sqlite-vss` for vector storage. Index markdown recursively, query semantically.
- **Multi-root:** anything you point it at; SQLite per-index.
- **Model:** any LLM/embedding model accessible via `llm`.
- **MCP:** no — pure CLI composition.
- **Notable:** maximum flexibility, most moving parts. Simon's tools are very well-maintained.

## Decision-prompts (open)

- Does `codebase-memory-mcp` actually have sensible defaults that would have prevented the OOM, or does it have the same gap?
- Is `qmd`'s 3-stage retrieval (BM25 + vector + LLM rerank) worth the model-loading overhead for our typical query shape (short conceptual queries against medium corpora)?
- Is Meilisearch's stability worth giving up native MCP integration? (We'd have to wrap.)
- What's the actual RSS profile of `codebase-memory-mcp`'s Nomic-embedded single-binary model vs ck's bge-small + ONNX?
- Is there *any* primary that handles binary-detection natively without `.ckignore`-style configuration? (If not, the `.ckignore` pattern transfers regardless of tool.)

## Method for the next pass

1. Read each candidate's README, recent issues, and memory-profile docs (~20 min per tool).
2. For top 1–2 candidates, install side-by-side with ck on a controlled test tree (one of our existing registered trees, ideally one that triggered the OOM).
3. Compare on the axes above with an `eval-results.md` per-tool.
4. Decide: stay on ck (the patches are sufficient), or switch primary.

## Status

Open. No work has happened beyond yesterday's discovery and today's OOM-mitigation pass. Pick this up when ck either bites again or when a clear better-fit tool ships an update worth attention.

## Related

- `02-stack/01-ai-coding/local-search-ck-and-obsidian-cli.md` — current tier-2 pattern doc (post-OOM-mitigation).
- `profiles/bashrc-snippets/local-search-helpers.sh` — current helper implementation.
- Worklog `2026-05-12.md` — the OOM diagnosis and mitigation that prompted this note.
