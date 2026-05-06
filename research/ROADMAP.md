# MCP Workflow & Tech Stack - Research Roadmap

## Project Goals

1. **Personal Stack** - Convenient, simple, secure, powerful MCP workflow for home lab
2. **Enterprise Stack** - Role-based identity governance, audit, compliance for work

---

## Phase 1: Personal Workflow Foundation

### 1.1 Core Infrastructure (In Progress)
- [x] Tailscale mesh networking
- [x] WSL2 + SSH setup
- [ ] tmux workflow documentation
- [ ] Claude Code session management
- [ ] BashRC / SSH config patterns

### 1.2 MCP Gateway for Home Lab
- [x] Gateway options research (MCPJungle, MCP Gateway Registry)
- [ ] Deploy MCPJungle on TrueNAS
- [ ] Register Home Assistant MCP
- [ ] Single endpoint for Claude

### 1.3 Config Management
- [x] Git workflow design (Gitea + HA Git Pull)
- [ ] Deploy Gitea on TrueNAS
- [ ] Set up Git Pull add-on on HA
- [ ] Test review-before-deploy workflow

### 1.4 RAG/Memory (Optional Phase)
- [x] GraphRAG architecture (Neo4j + Qdrant)
- [ ] Deploy Neo4j + Qdrant containers
- [ ] Connect via MCP server
- [ ] Curation strategy ("Librarian" pattern)

---

## Phase 2: Tooling & Clients

### 2.1 Claude Code Mastery
- [x] Session management basics
- [x] Subagents and skills mental model (`docs/tools/agent-workflow-guide.md`)
- [x] Context funneling problem solved (retrieval patterns, not content)
- [ ] Custom slash commands (implementation)
- [ ] MCP server configuration (practical setup)

### 2.2 Obsidian Integration
- [x] MCP setup guide
- [ ] Large content file workflows
- [ ] Knowledge graph integration

### 2.3 Mobile Access
- [x] Termux + SSH + tmux pattern
- [x] Android MCP client landscape
- [ ] Side button → desktop agent (future)

### 2.4 LLM Observability
- [x] Langfuse/LangSmith overview
- [ ] Decide on tool for personal use
- [ ] Set up logging for Ollama (if using)

---

## Phase 3: Enterprise Mental Models

### 3.1 Identity & Access (CRITICAL)
**Key Resource:** Jake Williams (WWHF 2025, IANS Research)
**Docs:** `docs/architecture/10-identity-governance-patterns.md`

- [x] OAuth problem for agents ("Confused Deputy")
- [x] Service Principals vs User tokens
- [x] On-Behalf-Of (OBO) flow
- [x] Purpose-bound tokens (ticket_id, justification)
- [x] Entra ID / Managed Identity patterns
- [x] RBAC schema for MCP tools
- [x] Identity pattern decision tree

### 3.2 MCP Gateway as Policy Enforcement Point
**Docs:** `docs/architecture/10-identity-governance-patterns.md`, `docs/architecture/09-enterprise-reference-architecture.md`

- [x] Tool-level RBAC
- [x] OPA / Cedar policy engines
- [x] Token exchange at gateway
- [x] Gateway enforcement architecture diagram
- [ ] Audit logging requirements (in progress)

### 3.3 Enterprise Architecture Stacks
**Docs:** `docs/architecture/09-enterprise-reference-architecture.md`

- [x] 5 stack patterns documented (A-E)
- [x] Decision matrix for stack selection
- [x] Microsoft-native vs OSS/hybrid tradeoffs
- [x] Technology alternatives matrix by layer

### 3.4 Observability & Compliance
**Docs:** `docs/architecture/11-observability-architecture.md`

- [x] OpenTelemetry for agent tracing
- [x] LangSmith for visibility (Jake Williams recommended)
- [x] SIEM integration (Sentinel)
- [x] Full trace correlation (LLM → MCP → Backend)
- [x] Dashboard designs (executive, security, operations)
- [x] Detection rules and alerting strategy

---

## Phase 4: Security & Testing

**Docs:** `docs/security/ai-security-testing.md`

### 4.1 AI Pen Testing (Jason Haddix)
- [x] 7-stage LLM assessment methodology
- [x] Prompt injection taxonomy (intents, techniques, evasions)
- [x] Parsel Tongue tool exploration
- [x] First Try Fallacy implications
- [x] Evasion techniques deep dive (encoding, Unicode, BYOC)

### 4.2 Prompt Firewalls & Guardrails
- [x] LlamaGuard setup
- [x] Azure Prompt Shield integration
- [x] Rebuff (ProtectAI)
- [x] When/where to deploy (decision matrix)
- [x] Guardrail options comparison

### 4.3 Risk Assessment
- [x] Impact-based (not likelihood-based) approach
- [x] Common findings checklist
- [x] Testing personas approach (Jake Williams)
- [x] Pre/post deployment testing checklists

---

## Phase 5: Foundational Research

### 5.1 Problem Types Framework (NEW)
**Doc:** `docs/research/problem-types-framework.md`

Two fundamentally different types of problems require different agent approaches:

- [ ] **Deterministic/Structural** — Code, logic, stacked abstractions
  - Hierarchical decomposition
  - Depth-first traversal (follow logic chains)
  - Verification by proof/trace
  - Need: AST parsers, call graphs, LSP integration

- [ ] **Semantic/Linguistic** — Knowledge, meaning, context
  - Associative search + synthesis
  - Breadth-first traversal (gather related concepts)
  - Verification by coherence
  - Need: RAG, graph traversal, semantic search

- [ ] **Hybrid patterns** — Most real problems are both
  - Code comprehension + design intent
  - Research combining documents and implementations

### 5.2 Hierarchical Agent Architecture for Code
- [ ] Design: Root agent → layer agents → module agents
- [ ] Tool needs: MCP servers for AST, call graphs, type info
- [ ] Test: Large codebase comprehension task

**See:** DMAF Philosophical Foundations (B&G vault) for form/matter grounding

---

## Research Questions to Answer

### Personal Stack
1. How do I maintain Claude Code context across phone/desktop?
2. What's the minimal secure setup for home MCP?
3. How do I curate knowledge into a graph effectively?
4. **Where does the knowledge base physically live?**
   - Desktop + Duplicati backup?
   - SMB share (has path/access issues with tools)?
   - Git repo (version control but friction)?
   - Synced Obsidian vault?
5. **What's the RAG/retrieval approach?**
   - GraphRAG vs vector-only?
   - Neo4j + Qdrant setup?
   - How does it integrate with MCP?

### Enterprise Stack
1. How do agents get scoped permissions without user masquerading?
2. What's the logging architecture for full trace correlation?
3. How do I enforce "no tool call without business context"?
4. Where does the MCP gateway sit in relation to model gateway?

### Architecture Fundamentals
1. Where does AI state actually live? (context, history, tools)
2. What are the entry points to an AI system?
3. How do personal and enterprise patterns translate?
4. ~~**How do Claude skills/subagents help with context constraints?**~~ → **ANSWERED** in `docs/tools/agent-workflow-guide.md` - Skills contain retrieval patterns, not domain knowledge. Subagents are context loaders. The vault is the memory.

---

## Raw Files Status

**All raw files processed and deleted.** Content preserved with user perspective in:
- `docs/personal-workflow/wsl2-tailscale-ssh-tmux.md`
- `docs/tools/claude-code-sessions.md`
- `docs/tools/obsidian-mcp-setup.md`
- `docs/tools/android-mcp-clients.md`
- `docs/research/llm-observability-logging.md`

---

## Key Resources

### People
- **Jake Williams** - IANS Research, AI identity governance
- **Jason Haddix** - Arcanum, AI pen testing methodology
- **Dan McInerney, Marcello Salvati** - Agent architecture patterns

### Links
- [Arcanum AI Security Resources](https://arcanum-sec.github.io/ai-sec-resources/)
- [Prompt Injection Taxonomy](https://github.com/Arcanum-Sec/arc_pi_taxonomy)
- [Parsel Tongue Tool](https://arcanum-sec.github.io/P4RS3LT0NGV3/)
- [Jake Williams WWHF Talk](https://www.youtube.com/watch?v=hT1dNsoK3YA)
- [Simon Willison - Claude Tags](https://simonwillison.net/tags/claude/) - Claude/LLM tooling insights

---

## Next Actions

1. ~~**Done:** Finish personal workflow docs (WSL2/Tailscale/SSH/tmux)~~
2. ~~**Done:** Verify raw file processing, delete processed files~~
3. ~~**Done:** Deep dive on enterprise identity (Jake Williams content)~~
4. ~~**Done:** Observability architecture doc (trace correlation, logging patterns)~~
5. ~~**Done:** Security testing patterns (prompt firewalls, guardrails)~~
6. ~~**Done:** Visual architecture docs (`12-personal-architecture.md`, `13-enterprise-architecture.md`)~~
7. ~~**Done:** Claude Code mental model (`agent-workflow-guide.md` - skills, subagents, context funneling)~~
8. ~~**Done:** Foundations doc (`FOUNDATIONS.md` - hierarchy/graph access model)~~
9. ~~**Done:** Global meta-agents (skill-builder, agent-builder at `~/.claude/agents/`)~~
10. **Now:** Create first practical skills (vault conventions, research workflow) based on mental model
11. **Future:** Deploy home lab components (Gitea, MCPJungle)
12. **Future:** Set up GraphRAG (Neo4j + Qdrant) when keyword search isn't enough
13. **Future:** MCP servers for AST/code analysis (deterministic problem traversal)
