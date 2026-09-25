---
title: Vault knowledge engine — semantic/graph index + agent surface over Obsidian
description: Landscape resweep (2026-07-18) for the "Obsidian as my Work IQ" thread — a layered architecture where markdown files are the sole source of truth and every index (lexical, semantic, structural graph, temporal KG) is a disposable derived artifact exposed to agent harnesses via MCP. Evaluates MegaMem/Graphiti current state, the vault-KG/AI-memory field, and driving Claude Code-grade agents from inside Obsidian. Successor context to the 2026-05-12 local-search-alternatives note; absorbs the MegaMem memory crumb.
stratum: 2
status: research
date: 2026-07-18
tags:
  - research
  - search
  - knowledge-graph
  - obsidian
  - mcp
  - graphiti
  - megamem
  - ai-memory
  - agentic
---

## The goal (vision statement)

Microsoft has Work IQ — an intelligence layer over your work content. The house version: **Obsidian is the Work IQ knowledge space.** The vault is the substrate; what's missing is (a) a robust, scalable, future-facing index/retrieval layer over it, and (b) a way to drive Claude Code / Codex / `x`-grade agent work *through* Obsidian itself, not just beside it.

Wanted properties: starts small, expands without rework; resilient (survives tool death); sovereign (self-hosted, offline-capable); not bleeding-edge-fragile.

## The design principle (hard filter)

**Markdown files are the only source of truth. Every index — lexical, semantic, graph — is a disposable derived artifact, fully rebuildable from the files.**

The moment an index holds knowledge that isn't in a note, sovereignty and rebuildability are lost. This is the disqualifying test for every candidate below. It is the same doctrine as filesystem-first / rebuildable-from-files in the kernel, applied to retrieval.

## The layer stack

1. **Substrate** — the vault. Wikilinks + frontmatter are already a graph; a graph *database* is only needed to query it at scale.
2. **Index layers** (each independently replaceable):
   - 2a *Lexical* (grep/BM25) — HAVE: ck, `cks` registry.
   - 2b *Semantic* (embeddings) — HAVE: ck semantic + OOM rails.
   - 2c *Structural graph* (links/tags/frontmatter relations) — derivable with zero new infra; Dataview/Bases is a weak form.
   - 2d *Temporal/entity KG* (Graphiti-class: entities, relations, validity intervals) — the expansion tier.
3. **Access layer** — MCP, one protocol for every index; every harness consumes identically. This is what keeps the stack tool-agnostic.
4. **Agent harness** — Claude Code / `x` / OpenCode pointed at the vault, MCP servers attached.
5. **Surface** — terminal today; Obsidian-embedded tomorrow. The OpenClast browser-native orchestrator gateway (Challenge 39/43 work) is the house-built candidate for this tier.

Adopt/replace one tier at a time; no tier may become load-bearing state.

## Resweep findings (2026-07-18)

> Three bounded research agents (Sol lane): (1) MegaMem + Graphiti current state, (2) vault-KG/AI-memory field survey, (3) Obsidian-as-agent-surface. Findings below; prior state was the 2026-04 MegaMem crumb + 2026-05-12 ck-alternatives note.

### MegaMem / Graphiti current state

**MegaMem** — v1.7.5 (2026-07-16), active but small (59 stars; public repo is an automated release-mirror of a private repo, so contributor surface is opaque). Five releases since the 2026-04 crumb: `databases[]` credential model, cross-vault copy/move, `obsidian://` URIs, content-hash sync status, native template engine. No vault-data-loss reports found — failures are incomplete ingestion, missing provenance write-back, false sync state, daemon resets, and a nasty local-Ollama footgun (no bounded `num_ctx` → 2.5 GB model reserving ~22 GB RAM; open issue #20, no maintainer response yet). Requires Obsidian 1.12.4+, desktop only, Linux "less tested."

**The rebuild question — answered, negative.** The graph DB is *not* purely derived state:
1. `add_memory`/`add_conversation_memory` write graph-only episodes with no corresponding markdown file — deleted DB ⇒ those memories are gone.
2. Re-extraction is LLM-driven and non-deterministic; a rebuild yields a *different* graph (entities, dedup decisions, communities).
3. Notes without a reference date get ingestion-time timestamps — rebuild later ⇒ different temporal graph.
4. `sync.db` (episode UUIDs, saga chains, analytics) is non-vault state; no documented disaster-recovery/rebuild procedure exists.

Mitigation if ever adopted: **never use the graph-only memory tools; treat the graph as lossy cache; keep reference dates in frontmatter.** That makes the loss tolerable but the guarantee is behavioral, not architectural.

**Graphiti** — core v0.29.2 (2026-06-08), MCP server v1.0.2; very healthy (28.9k stars, 44 contributors, active mid-July PRs) but 443 open issues/PRs. Zep formally consolidated its OSS effort on Graphiti (Community Edition discontinued); company active, hiring. 2026 changes that matter here:
- **FalkorDB Lite (v0.29.2)** — embedded, zero-server, local-file graph backend (Python 3.12+, needs `redis<8`). Kills the "must run Neo4j" objection for single-user. Kuzu deprecated; Neo4j remains the "production" label; FalkorDB is the MCP default.
- **Ingest still costs LLM calls per episode** — extraction, dedup, invalidation, embeddings; bulk mode reduces but doesn't eliminate. `add_fact_triple` bypasses extraction yet still does LLM dedup + embeddings. No supported LLM-free ingest (open issue #1299). GLiNER2 localizes only NER. Local models via OpenAI-compatible endpoints work but structured-output reliability is the limiting factor; Sentence-Transformers embedding support is advertised but not present in the current factory code (issue #1260).
- Known FalkorDB correctness issues open: concurrent multi-group writes can race to the wrong graph (#1331), single-group queries hitting `default_db` (#1325).

### Field survey — vault-KG / AI-memory systems

Verdicts against the rebuildable-from-markdown filter (agent 2, 2026-07-18; full sources in its report — key URLs inline):

**PASS (markdown stays sole truth, index disposable):**

- **QMD** (tobi/qmd) — v2.5.3 (2026-05-29), MIT, ~28k stars. The standout since the May note: one SQLite DB (FTS5 + sqlite-vec), local GGUF models (~2 GB) via node-llama-cpp for embed + rerank + query expansion, `qmd update` / `qmd embed -f` fully rebuilds. **Now has first-class MCP: stdio AND stateless Streamable HTTP `/mcp`, daemon mode.** Single Node 22+/Bun process. Directly answers the 2026-05-12 note's open question about qmd's MCP story.
- **Basic Memory** (basicmachines-co) — v0.22.1 (2026-06), AGPL, ~3.5k stars. Cleanest strict pass: entities/relations encoded IN the markdown (wikilinks + observations), SQLite is a disposable projection with explicit full-reindex. Local FastEmbed. stdio MCP.
- **markdown-vault-mcp** (pvliesdonk) — v3.1.0 (2026-07-08), MIT, very active but tiny adoption. SQLite FTS5 + NumPy vectors, frontmatter-aware chunking, hash-incremental, auto cold-rebuild on config change, stdio/SSE/Streamable HTTP with optional OAuth. FastEmbed bge-small or Ollama nomic-embed.
- **OKB / obsidian-kb-plugin** (dgalichet) — v0.4.1 (2026-07-08), MIT/Apache. Obsidian plugin + sidecar binary; lexical + semantic + **link-graph** retrieval in one `.obsidian-kb` index, local HTTP `/mcp` for Claude Code/Codex/OpenCode. Exactly the tier-2a+2b+2c shape — but near-zero adoption, early.
- **Microsoft GraphRAG** — v3.1.1 (2026-07-18), MIT. Passes the filter (Parquet/LanceDB artifacts fully re-derivable) but still batch-CLI research tooling, no first-party MCP, deletion semantics unverified. Wrong operational fit for a live vault.
- **txtai** — v9.11.0 (2026-07-01), Apache. Passes if index-only; first-party Streamable HTTP `/mcp`. Library-shaped (you write the ingest).
- **Thin Obsidian MCP bridges** (all pass trivially — no index of their own): cyanheads/obsidian-mcp-server v3.2.9 (stdio+HTTP, wraps Local REST API), aaronsb/obsidian-mcp-plugin v0.11.42 (runs INSIDE Obsidian, HTTP MCP, graph traversal + Dataview/Bases ops), ZethicTech/obsidian-mcp v1.1.7 (wraps official Obsidian 1.12+ CLI), MarkusPfundstein/mcp-obsidian (~4k stars), bitbonsai/mcpvault (no Obsidian needed, BM25 on demand).
- **Smart Connections** v4.5.3 — passes (`.smart-env/` rebuildable); community stdio bridge (msdanyg/smart-connections-mcp v2.0.0) reads its vectors without re-embedding. Custom non-OSI license.

**FAIL (DB/service becomes load-bearing state):**

- **mem0** (60k+ stars), **Zep hosted** (Community Edition discontinued 2025; official MCP is read-only against their cloud), **Hindsight** (vectorize-io, ~18k stars — memory banks + "mental models" are DB-resident truth), **Cognee** (fails *by default* — its MCP `remember`/`forget` writes permanent graph memory; a one-way re-ingest deployment could pass but nothing enforces the boundary).
- **LightRAG** v1.5.4 — CONDITIONAL: passes as a one-way derived index, but no first-party MCP and community wrappers expose entity-mutation tools that break reproducibility.
- **Khoj** 2.0.0-beta — CONDITIONAL: doc index is derived, but the product persists conversations/agents/automations as state; current MCP server status unverified.
- **Graphiti** — fails *by default* as normally used: `add_episode` writes ground-truth events into the graph DB. Passes only under a strict one-way vault→graph re-ingest discipline (which is what MegaMem attempts — see above).
- **MegaMem** v1.7.5 (2026-07-16) — **UNPROVEN → FAIL under the hard filter**: sync is vault→graph with content hashes, but its MCP surface also exposes graph-memory writes, no documented deterministic full-rebuild guarantee, and no documented fully-local embedding path (current docs emphasize API-key/OpenRouter). Actively maintained (released two days ago), MIT, but the filter question is exactly its weak point.

### Driving agents from inside Obsidian

Agent 3's headline (2026-07-18): **coding-agent-grade work inside Obsidian is now an established plugin category**, not a rabbit hole. Three architectures dominate: Agent SDK embedded in Electron, local CLI/app-server subprocess, and **ACP (Agent Client Protocol) adapters** — agents treated like language servers, the emerging provider-neutral boundary.

**The leaders (community store, real adoption):**

- **Claudian** (YishenTu/claudian) — v2.0.39 (released *today*), **~1.4M downloads, 14.2k stars**. The full agent loop inside Obsidian: vault read/write, Bash, word-level-diff inline edits, Plan Mode, skills/slash commands, MCP (stdio/SSE/HTTP), subagents, sessions with resume/fork/compact. Claude Code primary; Codex/OpenCode/Pi adapters live but less-tested. Desktop only.
- **Agent Client** (RAIT-09) — v0.11.0, 2.3k stars. ACP-based: runs Claude Code, Codex, Gemini CLI, custom ACP agents via adapter binaries. Permission-control claims not fully documented.
- **Codex Panel** — v5.1.0 (also today), fast-moving; drives local `codex app-server` threads with approvals/diffs. Rides Codex's *experimental* app-server API.
- **Copilot for Obsidian v4 preview** ("summer 2026") — pivoting from proprietary agent to a host that wraps **OpenCode, Claude Code, and Codex** with staged review of writes. Prerelease marketing claims, unverified.
- **YOLO** (Lapis0x0, Smart Composer fork) — v1.6.0.3, added a real agent runtime (Bash, MCP, skills, subagents, background agents). Safety policy under-documented.

**Official Obsidian trajectory — the biggest single fact:**

- **Obsidian 1.12 (2026-02-27) shipped an official CLI** explicitly aimed at "agentic coding tools": note CRUD, search with context, backlinks/properties/tasks, Bases query+create, command palette, workspaces, plugin management — plus dev commands (DOM inspection, console, screenshots, CDP, `eval`). Talks to the live app; near-full application authority, no separate agent auth/sandbox layer. (We already wrap this: `obs-*` helpers. ZethicTech/obsidian-mcp wraps it as 34 typed MCP tools.)
- No first-party AI assistant or MCP server; official posture = powerful local primitives (CLI, SecretStorage/Keychain 1.11.4, Settings API + ConfirmationModal 1.13) + heavier automated plugin review. Their May 2026 blog notes coding agents flooding the plugin review queue.
- **Security reality check:** Obsidian plugins are NOT sandboxed — official docs say plugins inherit full app access (files, network, program install). Every "approval dialog" in these plugins is plugin-level courtesy, not an enforced boundary. Restricted Mode or independent audit is the only real control.

**Vault-as-MCP surface (inverse direction):** Local REST API plugin now has *built-in* Streamable HTTP MCP (v4.1.7, 591k downloads); MCP Connector (51 tools, allowlisted command exec, audit log); Semantic Notes Vault MCP; the archived MCP Tools (87k installs) points users elsewhere. Also notable: **claude-obsidian** (AgriciDaniel, 9.6k stars) — a Claude Code-side plugin/vault-template with 15 skills that runs the vault as a self-organizing wiki over CLI/MCP transports — conceptually adjacent to this scaffold's own approach.

## Evaluation axes (carried from 2026-05-12 note, extended)

The ck-alternatives axes (default excludes, memory profile, multi-root, concurrency, offline embeddings, cold/warm speed, output formats, MCP, license/maintenance, OOM-safety) still apply to tier-2a/2b candidates. For tier-2d (KG) candidates add:

11. **Rebuildable-from-markdown** — delete the DB; can the graph be fully regenerated from the vault? (Disqualifying if no.)
12. **Ingest cost** — LLM calls per note-change? Local-LLM option? What meter does it feed?
13. **Temporal model** — supersede-don't-duplicate support (validity intervals vs overwrite).
14. **Infra weight** — zero-infra / single binary / DB server / cloud.

## Decision state (post-resweep, 2026-07-18)

**1. The temporal-KG tier (2d) is demoted from "next evaluation" to "watch."** The resweep answered the disqualifying question directly: MegaMem's graph is *not* rebuildable-from-vault (graph-only memories, non-deterministic re-extraction, undocumented recovery), and Graphiti ingest still bills LLM calls per note-change with local-model reliability caveats. Neither is dead — Graphiti is thriving and FalkorDB Lite removes the DB-server objection — but adopting now means accepting behavioral (not architectural) safety, a per-edit LLM meter, and a single-maintainer mirror-repo plugin. The structural graph we need short-term is derivable without any of that.

**2. Tier 2c (structural graph) has cheap paths that didn't exist in May.** OKB bundles lexical+semantic+link-graph behind one local `/mcp` (early, tiny adoption); aaronsb/obsidian-mcp-plugin exposes graph traversal + Dataview/Bases over MCP from inside Obsidian; the official CLI exposes backlinks/properties. A derived links+frontmatter index stays the zero-risk DIY option.

**3. QMD is the candidate to evaluate against ck** — resolves the 2026-05-12 note's open questions: first-class MCP (stdio + Streamable HTTP daemon), fully local GGUF stack, single rebuildable SQLite index, huge adoption. The eval frame from that note applies as-is; add the ~2 GB model footprint and Node 22/Bun dependency as axes.

**4. The Obsidian-surface question flipped from "build it?" to "adopt, then integrate."** Claudian (~1.4M downloads) already runs the full Claude Code loop inside Obsidian, with ACP as the emerging neutral protocol and Copilot v4 heading the same direction. The house differentiator is NOT another agent panel — it's what OpenClast is already building: sovereign remote/browser access with an orchestrator gateway, which none of the plugin-in-Electron players address. Try Claudian for local desktop use; keep OpenClast Challenge 39/43 aimed at the remote/multi-device gap.

**5. Security caveat that rides every option:** Obsidian plugins are unsandboxed by design (official docs); every approval dialog in agent plugins is courtesy UI. For agent-drives-vault work, the trust boundary must live outside Obsidian (the harness's own permission layer, or OpenClast's gateway) — aligns with [[feedback_no_deep_infra_access_for_ai]].

**Concrete next actions (in order, all cheap):**
1. Trial Claudian on a non-critical vault (community store, desktop).
2. Side-by-side QMD vs ck eval per the 2026-05-12 axes on one registered tree.
3. Prototype tier-2c: derived link/frontmatter graph (script → SQLite/JSON) exposed via existing MCP plumbing.
4. Re-check MegaMem/Graphiti in ~a quarter — triggers: documented full-rebuild procedure, LLM-free ingest (#1299), or local-embedding fix (#1260).

## Related

- `zz-research/2026-05-12-local-search-tooling-alternatives.md` — tier-2a/2b candidate framework (still open).
- Memory crumb `reference_megamem.md` (2026-04-29 state) — absorbed here.
- OpenClast Challenge 43 (agent-access ecosystem survey) + Challenge 39 (browser-native gateway) — the tier-5 surface from the other end.
- `02-stack/01-ai-coding/local-search-ck-and-obsidian-cli.md` — current shipped search layer.
