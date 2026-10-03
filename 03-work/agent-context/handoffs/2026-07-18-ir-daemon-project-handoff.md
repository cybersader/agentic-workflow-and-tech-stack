# HANDOFF: kwir (knowledge-work IR daemon) — new standalone project scaffold + build

**From:** workflow-stack session, 2026-07-18 (Gates 0–1 complete)
**To:** a fresh session in the new project workspace
**Contract:** `zz-research/2026-07-18-ir-daemon-contract-draft.md` in the workflow-stack repo — **copy it into the new repo as `CONTRACT.md` first thing.** It is Gate-1 approved; treat it as frozen (amend only with owner sign-off).

## What this project is

**kwir** ("knowledge-work IR", pronounced "quire"): a standalone, self-contained search daemon for knowledge workspaces — any registered tree of markdown/text (Obsidian vaults, project repos, docs trees); Obsidian is one client, not the definition. It is: embedded Rust binary (Tantivy lexical + vector index + local ONNX embeddings, hybrid via RRF), exposing a frozen HTTP + MCP contract, with a dumb Obsidian plugin client. Files are the sole source of truth; the index is always rebuildable from nothing (CI-enforced). It escapes Omnisearch's in-editor ceiling while keeping an explicitly-scoped in-plugin "lite" tier for locked-down environments.

**This is its own product/repo** — NOT part of the agentic-workflow scaffold and NOT part of OpenClast. Both reference it:
- workflow-stack: pattern doc + shell helpers will point here (owner brings the project back into that ecosystem when ready).
- OpenClast (`obsidian-in-the-browser` repo): Challenge 45 capability A — the same binary later runs as a container sidecar behind its orchestrator gateway, room-scoped via the contract's filter-pinned tokens. A reply-handoff to OpenClast with the frozen contract is a queued step (see below).

## Decisions already made (do not relitigate)

| Decision | Choice | Why |
|---|---|---|
| Core shape | Embedded libraries in ONE binary — no external engine server | Desktop ergonomics (single artifact, Win+Linux) + identical deploy in OpenClast container |
| Language | Rust | Tantivy native; clean cross-compile; lean sidecar RAM; WASM path for lite tier |
| v1 surfaces | Linux daemon + CLI + MCP server + dumb Obsidian plugin | Gate 0 selection |
| Algorithms | Imported only (Tantivy, vector crate, fastembed-class ONNX). RRF fusion is the one permitted formula | Owner's hard rule: no reinventing IR |
| Index | Disposable, rebuild-from-nothing as a CI contract (fixture vault + determinism test) | The house filter |
| Windows | Native binary is a v1.x goal (not blocking v1); WSL2 covers interim | Owner's cross-OS requirement |
| Naming | **kwir** (working name, owner-picked 2026-07-18). Confirm once before creating the GitHub repo | Settled |

## Scaffold instructions

1. **Location:** owner suggested under `Documents/1 Projects` (Windows side). **Flag before scaffolding:** measured on this machine, `/mnt/c` is ~327× slower than ext4 for small-file metadata, and Rust `target/` churn is the worst case. Recommend: code at `~/work/kwir` (WSL-native, reachable via `\\wsl$`), optional pointer in `1 Projects`. Present both, let the owner pick, proceed.
2. **Repo skeleton** (per CONTRACT §9): `CONTRACT.md`, `daemon/` (Rust workspace: core lib + bin), `clients/obsidian/` (TS plugin), `fixtures/vault/` (CI fixture), `docs/`. CLI = daemon subcommands (contract §10 lean), one binary.
3. Git init on `main`; **no AI attribution in any commit, ever** (owner hard rule, enforced by hooks in their other repos — carry the norm here).
4. Owner uses Portagenty for workspace setup — if invoked there, respect whatever it scaffolds and fill in the rest.

## Build order (small verticals, owner checkpoint between each)

1. **Vertical 1 — index + query core:** registered-vault config → walk/chunk (heading-split per CONTRACT §3, `chunking_version: 1`) → Tantivy index → `daemon search "q"` lexical CLI against a real tree. Checkpoint: owner runs real searches.
2. **Vertical 2 — daemon + watcher:** HTTP `/v0/` per CONTRACT §4 (search/status/health first), debounced watcher, hash-incremental updates, rename/delete correctness, boot reconciliation. Checkpoint: edit-a-note → search reflects it.
3. **Vertical 3 — semantic + hybrid:** embed via fastembed-rs (micro-benchmark vs ort/candle FIRST on real vault content — open question from Gate 0), vector index, RRF hybrid, `mode` param. Checkpoint: owner A/B's hybrid vs lexical on their own vocabulary-mismatch queries.
4. **Vertical 4 — MCP (3 tools per §6) + rebuild endpoint + the CI determinism test.**
5. **Vertical 5 — Obsidian plugin:** query box + results + status light, hitting localhost. NOTHING else in it. Checkpoint: owner daily-drives alongside Omnisearch.
6. Then: Windows-native build; lite-tier WASM spike (kill criterion in CONTRACT §2 applies); OpenClast reply-handoff.

## Working agreement (owner-set, binding)

- Sol 5.6 workflows for build waves are fine, BUT: **frequent check-ins — discuss, get green lights at every vertical boundary; never run far ahead.**
- **Respect the agent-guard caps** (global hook, 15/prompt): keep waves at 3–5 agents, disclose count/model/cost if any wave would exceed 15 (none should). On 429/cooldown: stop, report, wait.
- Delegated agents must not sub-delegate — every agent/workflow prompt carries an explicit "do NOT spawn sub-agents."
- Owner may redirect at any checkpoint; the contract is the only fixed thing.

## Queued follow-ups (do not do these first)

- Reply-handoff to OpenClast: frozen CONTRACT.md + "what does the gateway need from this contract?" → fold answer back as contract amendment (owner shuttles the handoff).
- workflow-stack back-reference: pattern doc + `cks`-family helper pointing at the daemon (owner brings this home when the project is real).
- markdown-vault-mcp (pvliesdonk) is the behavioral blueprint for ingestion correctness — read its docs when building Vertical 2; copy behavior, not code (it's MIT, but we're Rust anyway).
- QMD (tobi/qmd) is the architecture-proof reference for the embedded shape generally.
