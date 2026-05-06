# MCP Workflow & Tech Stack - Knowledge Base Index

## Overview

This knowledge base covers MCP (Model Context Protocol) workflows for both **personal/home lab** and **enterprise** deployments. It includes architecture patterns, security guidance, and tooling documentation derived from original research and WWHF 2025 conference insights.

---

## ⭐ Start Here: Foundations

**[FOUNDATIONS.md](FOUNDATIONS.md)** — The principles that don't change:
> "The hierarchy is the access primitive. The graph is a navigation aid within granted scope."

- Why hierarchies work for access control
- The four-mechanism access model (path, tag, graph, explicit grants)
- What never changes vs what's implementation detail
- See also: [Access Model Deep Dive](architecture/14-access-model-implementation.md)

**[AGENTS.md](../AGENTS.md)** — Portable agent definitions (works with any AI tool):
- Available specialist agents for delegation
- Invocation patterns that work across tools
- When to offload vs do directly

---

## Quick Navigation

### For Personal/Home Lab Users
Start here: ⭐ [Personal Architecture Visual Guide](architecture/12-personal-architecture.md)
- ⭐ [Pragmatic Workflow Guide](personal-workflow/pragmatic-workflow-guide.md) — **How to use the stack today**
- [Agent Workflow Mental Model](tools/agent-workflow-guide.md) — How skills, subagents, MCP fit together
- [Context Management](tools/context-management.md) — Working within LLM limits
- [WSL2 + Tailscale + SSH + tmux Guide](personal-workflow/wsl2-tailscale-ssh-tmux.md)
- [Claude Code Sessions](tools/claude-code-sessions.md)
- [Obsidian MCP Setup](tools/obsidian-mcp-setup.md)
- [Android MCP Clients](tools/android-mcp-clients.md)
- [Recommended Stack (Home Lab)](architecture/04-recommended-stack.md)

### For Enterprise Architects
Start here: ⭐ [Enterprise Architecture Visual Guide](architecture/13-enterprise-architecture.md)
- [Identity Governance Patterns](architecture/10-identity-governance-patterns.md)
- [Observability Architecture](architecture/11-observability-architecture.md)
- [AI Security Testing](security/ai-security-testing.md)
- [WWHF 2025 Insights](research/wwhf-2025-insights.md)

---

## Architecture Documents

| Doc | Description |
|-----|-------------|
| [00 - Problem Statement](architecture/00-problem-statement.md) | Why we need MCP governance |
| [01 - Simple Stack](architecture/01-simple-stack.md) | Initial options explored |
| [02 - Secure Workflows](architecture/02-secure-workflows.md) | Git vs Samba analysis |
| [03 - Git Workflow Setup](architecture/03-git-workflow-setup.md) | Implementation guide |
| [04 - Recommended Stack](architecture/04-recommended-stack.md) | Final personal architecture |
| [05 - n8n and Gateway Roles](architecture/05-n8n-and-gateway-roles.md) | Workflow orchestration |
| [06 - n8n Concrete Uses](architecture/06-n8n-concrete-uses.md) | Practical n8n examples |
| [07 - Enterprise MCP Stacks](architecture/07-enterprise-mcp-stacks.md) | Enterprise patterns |
| [08 - Personal vs Enterprise](architecture/08-personal-vs-enterprise-stacks.md) | Stack comparison |
| [09 - Enterprise Reference](architecture/09-enterprise-reference-architecture.md) | **Core enterprise doc with diagrams** |
| [10 - Identity Governance](architecture/10-identity-governance-patterns.md) | **RBAC, OAuth, Service Principals** |
| [11 - Observability](architecture/11-observability-architecture.md) | **Tracing, logging, SIEM** |
| [12 - Personal Architecture](architecture/12-personal-architecture.md) | ⭐ **Visual guide - personal stack** |
| [13 - Enterprise Architecture](architecture/13-enterprise-architecture.md) | ⭐ **Visual guide - enterprise stack** |
| [14 - Access Model Implementation](architecture/14-access-model-implementation.md) | **WHERE each access mechanism lives** |

---

## Research Documents

| Doc | Description |
|-----|-------------|
| [WWHF 2025 Insights](research/wwhf-2025-insights.md) | **Jake Williams, Jason Haddix** |
| [MCP Gateway Options](research/mcp-gateway-options.md) | Gateway comparison |
| [MCP Gateway Comparison](research/mcp-gateway-comparison.md) | Feature matrix |
| [MCP Gateway Terminology](research/mcp-gateway-terminology.md) | Definitions |
| [Docker MCP Gateway Review](research/docker-mcp-gateway-review.md) | Why Docker MCP didn't work |
| [n8n Claude Code SSH](research/n8n-claude-code-ssh-approach.md) | Integration approach |
| [RAG Graph Architecture](research/rag-graph-architecture.md) | GraphRAG patterns |
| [LLM Observability Logging](research/llm-observability-logging.md) | Langfuse, LangSmith |
| [DMAF Concepts Reference](research/dmaf-concepts-reference.md) | Philosophical grounding (form/matter, ontology/epistemology) |
| [Problem Types Framework](research/problem-types-framework.md) | Deterministic vs semantic problems |

---

## Security Documents

| Doc | Description |
|-----|-------------|
| [Threat Model](security/threat-model.md) | Security decisions |
| [AI Security Testing](security/ai-security-testing.md) | **Pen testing methodology** |

---

## Tool Guides

| Doc | Description |
|-----|-------------|
| [Agent Workflow Guide](tools/agent-workflow-guide.md) | ⭐ **Mental model for skills, subagents, MCP** |
| [Context Management](tools/context-management.md) | ⭐ **Working within LLM limits** |
| [Claude Code Sessions](tools/claude-code-sessions.md) | Session management, history |
| [Obsidian MCP Setup](tools/obsidian-mcp-setup.md) | Vault integration |
| [Android MCP Clients](tools/android-mcp-clients.md) | Mobile access options |

---

## Learnings

Agent-discovered insights from research and conversations:

| Doc | Description |
|-----|-------------|
| [OpenCode Permissions System](learnings/2025-01-01-opencode-permissions-system.md) | ⭐ **Granular bash allowlisting, per-project config, session approval** |
| [Anthropic API Image Limits](learnings/2025-01-01-anthropic-api-image-limits.md) | 5MB limit, OpenCode fix pending |
| [Inter-Agent Messaging](learnings/2025-12-31-inter-agent-messaging.md) | ⭐ **Filesystem-based message passing for agent coordination (SEACOW-aligned)** |
| [Tool Ecosystem Comparison](learnings/2025-12-23-tool-ecosystem-comparison.md) | ⭐ **Claude Code vs OpenCode vs Gemini vs Codex vs Cline** |
| [Delegation Patterns](learnings/2025-12-23-delegation-patterns.md) | ⭐ **YAML frontmatter, proactive invocation, what actually works** |
| [Anthropic Skills Paradigm](learnings/2025-12-20-anthropic-skills-paradigm.md) | ⭐ **Official Anthropic perspective: "Don't Build Agents, Build Skills Instead"** |
| [RPI Context Engineering](learnings/2025-12-20-rpi-context-engineering.md) | ⭐ **Sub-agents for context compression, "dumb zone" concept** |
| [Hierarchy + Graph Access Model](learnings/2025-12-17-hierarchy-graph-access-model.md) | Access primitives insight |
| [Planning-with-Files v2.0.0 Update](learnings/2026-01-27-planning-with-files-v2-update.md) | **2-Action Rule, 3-Strike Protocol, session recovery, Manus Context Engineering** |
| [Stale Sessions-Index Detection and Recovery](learnings/2026-04-23-stale-sessions-index-detection-and-recovery.md) | The append-log + summary-index drift pattern (Claude Code instance) |

---

## Open Challenges

Active unresolved problems worth multiple sessions of thinking. Messier than open questions — these are "I don't even know how to frame this yet" territory.

| # | Title | Status |
|---|-------|--------|
| 01 | [Interactive Agent Testing with Live Feedback](zz-challenges/01-interactive-agent-testing.md) | Active |

See [zz-challenges/index.md](zz-challenges/index.md) for the lifecycle and format.

---

## Testing

| Doc | Description |
|-----|-------------|
| [Test Workspace](../test-workspace/TESTING.md) | ⭐ **Multi-tool agent testing guide** |
| [Test Results](../test-workspace/RESULTS.md) | Track test results across tools |

---

## Practical Guides

### Problem-Solving Approaches

| Doc | Description |
|-----|-------------|
| [Solving Deterministic Problems](guides/solving-deterministic-problems.md) | **Code, logic, structural problems** |
| [Solving Semantic Problems](guides/solving-semantic-problems.md) | **Knowledge, research, synthesis** |

### Access Control Implementation

| Doc | Description |
|-----|-------------|
| [Implementing All Access Mechanisms](guides/access/implementing-all-access-mechanisms.md) | ⭐ **Gateway + OPA policies for all 4 mechanisms** |
| [Path-Based Access](guides/access/path-based-access.md) | Primary access mechanism (works today) |
| [Tag-Based Access](guides/access/tag-based-access.md) | Cross-cutting access (via gateway) |
| [Graph-Based Access](guides/access/graph-based-access.md) | Navigation + edge-based policies |
| [Explicit Grants](guides/access/explicit-grants.md) | Purpose-bound tokens |

### Tool Ecosystem

| Doc | Description |
|-----|-------------|
| [MCP Client Ecosystem](guides/mcp-client-ecosystem.md) | Claude Code vs Cline vs others |

---

## Personal Workflow

| Doc | Description |
|-----|-------------|
| [Pragmatic Workflow Guide](personal-workflow/pragmatic-workflow-guide.md) | ⭐ **How to use the stack today** |
| [WSL2 + Tailscale + SSH + tmux](personal-workflow/wsl2-tailscale-ssh-tmux.md) | Phone-to-desktop access |

---

## Key Concepts

### Enterprise AI Identity (Jake Williams)

**The Problem:** Standard OAuth 2.0 doesn't work for agents.
- Agents inherit user permissions = "Confused Deputy" problem
- Prompt injection = full user access

**Solutions:**
- Service Principals (agents with own identity)
- On-Behalf-Of flow (reduced scope)
- Purpose-bound tokens (ticket_id, justification)
- MCP Gateway as Policy Enforcement Point

**See:** [Identity Governance Patterns](architecture/10-identity-governance-patterns.md)

### AI Security Testing (Jason Haddix)

**Key Insight:** LLMs are non-deterministic. Same attack may need 10-15 attempts.

**7-Stage Assessment:**
1. Identify inputs
2. Attack ecosystem
3. Attack model (prompt injection)
4. Attack prompt engineering
5. Attack databases (RAG)
6. Attack web apps
7. Pivot

**See:** [AI Security Testing](security/ai-security-testing.md)

### Observability (Jake Williams)

**Requirement:** "Log LLM inputs AND outputs... Correlate: LLM request → MCP call → backend action"

**Three Pillars:**
- Traces (what happened)
- Metrics (how it's performing)
- Logs (why it happened)

**See:** [Observability Architecture](architecture/11-observability-architecture.md)

---

## Enterprise Stack Patterns

| Pattern | Best For | Key Components |
|---------|----------|----------------|
| **A: Microsoft-Native** | Regulated industries | Entra ID, Azure AI Foundry, Sentinel |
| **B: Developer Productivity** | Engineering teams | VS Code + Cline, governed endpoints |
| **C: Workflow-First** | Business process automation | Power Automate + bounded agents |
| **D: OSS/Hybrid** | Flexibility with MS identity | n8n, LangGraph, Keycloak |
| **E: High-Security** | Financial, healthcare, gov | Private Link, no public egress |

**See:** [Enterprise Reference Architecture](architecture/09-enterprise-reference-architecture.md)

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for:
- Progress tracking
- Research questions to answer
- Next actions

---

## Key Resources

### People
- **Jake Williams** - IANS Research, AI identity governance
- **Jason Haddix** - Arcanum, AI pen testing methodology
- **Dex Horthy** - HumanLayer, RPI/context engineering
- **Barry Zhang, Mahesh Murag** - Anthropic, Agent Skills
- **Dan McInerney, Marcello Salvati** - Agent architecture patterns

### Links
- [Arcanum AI Security Resources](https://arcanum-sec.github.io/ai-sec-resources/)
- [Prompt Injection Taxonomy](https://github.com/Arcanum-Sec/arc_pi_taxonomy)
- [Parsel Tongue Tool](https://arcanum-sec.github.io/P4RS3LT0NGV3/)
- [Jake Williams WWHF Talk](https://www.youtube.com/watch?v=hT1dNsoK3YA)

---

## Document Hierarchy

```
cybersader-agentic-setup/              # (rename pending)
├── CLAUDE.md                         # ⭐ Project context (always read)
├── AGENTS.md                         # ⭐ Portable agent definitions
├── README.md                         # Quick start guide
│
├── knowledge-base/                   # Temperature gradient (5 zones)
│   ├── 00-inbox/                     # Hot: raw captures, unprocessed
│   ├── 01-working/                   # Warm: active synthesis, drafts
│   ├── 02-learnings/                 # Cool: distilled insights (permanent)
│   ├── 03-reference/                 # Cold: actively used stable docs
│   └── 04-archive/                   # Frozen: filed knowledge (Johnny Decimal)
│
├── .claude/                          # Agent infrastructure
│   ├── ARCHITECTURE.md               # Composability rules
│   ├── agents/                       # Subagents (fresh context)
│   ├── skills/                       # Skills (same context)
│   └── commands/                     # Slash commands
│
├── docs/                             # User journey docs
│   ├── 01-initial-setup.md
│   ├── 02-project-init.md
│   └── 03-ongoing-usage.md
│
└── research/                         # ⭐ Research documentation (you are here)
    ├── INDEX.md                      # This file
    ├── ROADMAP.md                    # Progress tracking
    ├── FOUNDATIONS.md                # ⭐ Principles that don't change
    ├── architecture/
    │   ├── 00-11*.md                 # Architecture patterns
    │   ├── 12-personal-architecture.md   # ⭐ Personal stack visual
    │   ├── 13-enterprise-architecture.md # ⭐ Enterprise stack visual
    │   └── 14-access-model-implementation.md
    ├── research/
    │   ├── wwhf-2025-insights.md     # ⭐ WWHF 2025 source material
    │   └── *.md                      # Research notes
    ├── security/
    │   ├── threat-model.md           # Personal stack security
    │   └── ai-security-testing.md    # Pen testing guide
    ├── tools/
    │   ├── agent-workflow-guide.md   # ⭐ Skills, subagents mental model
    │   ├── context-management.md     # ⭐ Working within LLM limits
    │   └── *.md                      # Other tool guides
    ├── guides/
    │   ├── solving-deterministic-problems.md
    │   ├── solving-semantic-problems.md
    │   ├── mcp-client-ecosystem.md
    │   └── access/                   # Access mechanism implementations
    ├── personal-workflow/
    │   ├── pragmatic-workflow-guide.md   # ⭐ How to use today
    │   └── wsl2-tailscale-ssh-tmux.md
    ├── learnings/
    │   └── YYYY-MM-DD-topic.md       # Agent-discovered insights
    └── _archive/                     # Archived content (searchable, not active)
        ├── conversations/            # Exported conversation transcripts
        ├── logs/                     # Old session notes
        └── superseded/               # Replaced docs (kept for reference)
```

⭐ = Core documents to read first
