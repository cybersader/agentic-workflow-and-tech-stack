---
title: Obsidian → knowledge-graph → MCP pipeline (early setup notes)
description: Early working notes (2025-02) for an Obsidian → Graphiti → Neo4j → MCP knowledge-graph pipeline. Parked — this thread continued into the MegaMem evaluation (temporal KG plugin); kept as the origin record of the AI-memory thread.
stratum: 2
status: parked
date: 2025-02-01
tags:
  - obsidian
  - knowledge-graph
  - mcp
  - graphiti
  - neo4j
  - ai-memory
---

# Obsidian Knowledge Graph Setup

Active setup for Obsidian → Knowledge Graph → MCP pipeline.

## Key Decisions

1. **Forked MegaMem** — Original creator has blockchain/Web3 background, so forked and stripped branding
2. **Ollama for embeddings** — Local/private, no data leaves network
3. **Local testing first** — Docker Neo4j in WSL before TrueNAS deployment

## Components

| Component | Status |
|-----------|--------|
| Neo4j (Docker) | Running |
| Plugin (forked) | Installed |
| MCP Config | Created |
| Ollama model | Needs `nomic-embed-text` pulled |

## Full Setup Notes

See: `obsidian-knowledge-graph/docs/setup-notes.md`

## Status

**2026-02-02**: Initial setup complete. Plugin loads, Ollama embeddings configured. Ready for first sync test.

## Related

- [[2025-01-28-claude-code-keybindings-ssh-zellij]] — Keybindings discovered during this session

## Learnings Captured

Key learnings:
- `graphiti_bridge/` must be in installed plugin folder (not just source)
- MCP config goes in `.mcp.json` at project root
- Ollama supports both embeddings AND LLM (full privacy possible)
