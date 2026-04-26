---
created: 2025-01-15
updated: 2025-01-15
tags:
  - architecture
  - personal
  - mcp
  - reference
---

# Personal AI Architecture

## The Big Picture

```mermaid
graph TB
    subgraph "YOU"
        U1[Desktop<br/>Windows/WSL2]
        U2[Phone<br/>Termux SSH]
        U3[Laptop<br/>On the go]
    end

    subgraph "AI Clients"
        C1[Claude Code]
        C2[Gemini CLI]
        C3[Codex CLI]
        C4[Cursor/Cline]
    end

    subgraph "Knowledge Layer"
        K1[Obsidian Vaults<br/>Local + Synced]
        K2[Project Repos<br/>Git]
    end

    subgraph "Home Lab"
        G[MCP Gateway<br/>MCPJungle]
        M1[MCP: Home Assistant]
        M2[MCP: Obsidian]
        M3[MCP: Custom APIs]
        O[Ollama<br/>Local Models]
    end

    subgraph "Cloud"
        API1[Anthropic API]
        API2[OpenAI API]
        API3[Google API]
    end

    U1 --> C1
    U1 --> C2
    U1 --> C4
    U2 -->|SSH + tmux| C1
    U3 --> C1

    C1 --> K1
    C1 --> K2
    C1 --> G
    C1 --> API1

    C2 --> API3
    C4 --> API1
    C4 --> API2

    G --> M1
    G --> M2
    G --> M3

    C1 -.->|optional| O
```

---

## Where Things Live

### Decision: Knowledge Base Location

```
┌─────────────────────────────────────────────────────────────────┐
│  OPTION A: Local Desktop + Duplicati Backup (RECOMMENDED)       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  C:\Users\You\Documents\                                         │
│  ├── Obsidian Vaults/                                           │
│  │   ├── personal-vault/                                        │
│  │   ├── work-vault/                                            │
│  │   └── mcp-kb/          ← This project                        │
│  └── Projects/                                                   │
│      └── repos/                                                  │
│                                                                  │
│  Backup: Duplicati → NAS or cloud                               │
│                                                                  │
│  ✅ Fast local access                                            │
│  ✅ Claude Code works natively                                   │
│  ✅ No path translation issues                                   │
│  ✅ Obsidian works directly                                      │
│  ⚠️  Need backup discipline                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OPTION B: SMB Share (PROBLEMATIC)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  \\NAS\documents\vaults\                                        │
│                                                                  │
│  ❌ Path issues with Claude Code / MCP tools                    │
│  ❌ Network latency on file operations                          │
│  ❌ Obsidian can be slow                                        │
│  ✅ Centralized, always backed up                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OPTION C: Git Repo (FOR CODE, NOT NOTES)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Good for: This MCP project, code, configs                      │
│  Bad for: Daily notes, media-heavy vaults                       │
│                                                                  │
│  ✅ Version control                                              │
│  ✅ Sync across machines                                         │
│  ⚠️  Friction for quick notes                                    │
│  ❌ Binary files (images) bloat repo                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OPTION D: Obsidian Sync / Syncthing                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Good for: Multi-device access to same vault                    │
│                                                                  │
│  ✅ Seamless sync                                                │
│  ✅ Works with mobile                                            │
│  ⚠️  Obsidian Sync = paid                                        │
│  ⚠️  Syncthing = self-managed                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Recommendation:** Local desktop + Duplicati backup for primary work. Git for code/config projects. Obsidian Sync or Syncthing for vaults you need on mobile.

---

## Component Breakdown

### AI Clients

```mermaid
graph LR
    subgraph "Primary"
        CC[Claude Code<br/>Terminal-based<br/>MCP support]
    end

    subgraph "Alternatives"
        GC[Gemini CLI<br/>Google models]
        CX[Codex CLI<br/>OpenAI models]
        CR[Cursor<br/>IDE with AI]
        CL[Cline<br/>VS Code extension]
    end

    subgraph "Capabilities"
        MCP[MCP Tools]
        FS[File System]
        TERM[Terminal]
    end

    CC --> MCP
    CC --> FS
    CC --> TERM

    CR --> FS
    CL --> FS
    CL --> MCP
```

| Client | MCP Support | Best For |
|--------|-------------|----------|
| **Claude Code** | ✅ Native | Terminal work, automation, MCP integration |
| **Cline** | ✅ Via config | VS Code users, visual diff |
| **Cursor** | ❌ | IDE-centric coding |
| **Gemini CLI** | ⚠️ Limited | Google ecosystem |
| **Codex CLI** | ⚠️ Limited | OpenAI ecosystem |

### MCP Gateway (MCPJungle)

```mermaid
graph LR
    subgraph "Client"
        CC[Claude Code]
    end

    subgraph "Gateway"
        GW[MCPJungle<br/>:9090]
    end

    subgraph "MCP Servers"
        HA[Home Assistant<br/>:8123]
        OB[Obsidian<br/>:27124]
        SQL[SQLite/Postgres]
        API[Custom APIs]
    end

    CC -->|single endpoint| GW
    GW --> HA
    GW --> OB
    GW --> SQL
    GW --> API
```

**Why a gateway?**
- Single endpoint for Claude Code config
- Visibility into all tool calls
- Add/remove MCP servers without reconfiguring client
- Future: auth, rate limiting

### Knowledge Storage

```mermaid
graph TB
    subgraph "Obsidian Vaults"
        V1[Personal Vault<br/>Daily notes, journal]
        V2[Work Vault<br/>Projects, meetings]
        V3[MCP KB<br/>This project]
    end

    subgraph "Structure"
        FM[YAML Frontmatter<br/>dates, tags]
        FOL[Folders<br/>by topic]
        LNK[Wiki Links<br/>connections]
    end

    subgraph "Retrieval"
        SEARCH[Obsidian Search]
        MCP_OB[MCP: Obsidian]
        RAG[Future: GraphRAG]
    end

    V1 --> FM
    V2 --> FM
    V3 --> FM

    FM --> SEARCH
    FM --> MCP_OB
    MCP_OB --> RAG
```

---

## RAG / Retrieval Strategy

### Current: MCP-Based Retrieval

```mermaid
sequenceDiagram
    participant You
    participant Claude
    participant MCP_Obsidian
    participant Vault

    You->>Claude: "What did I decide about gateways?"
    Claude->>MCP_Obsidian: obsidian_simple_search("gateway")
    MCP_Obsidian->>Vault: Search files
    Vault->>MCP_Obsidian: Matching content
    MCP_Obsidian->>Claude: Results
    Claude->>You: "Based on your notes..."
```

**Pros:** Simple, works now, no extra infra
**Cons:** Keyword-based, no semantic understanding

### Future: GraphRAG

```mermaid
graph TB
    subgraph "Ingestion"
        OB[Obsidian Vault]
        PARSE[Parse + Chunk]
        EMBED[Embed Chunks]
        EXTRACT[Extract Entities]
    end

    subgraph "Storage"
        VEC[Qdrant<br/>Vector DB]
        GRAPH[Neo4j<br/>Knowledge Graph]
    end

    subgraph "Retrieval"
        QUERY[User Query]
        SEM[Semantic Search]
        TRAVERSE[Graph Traversal]
        COMBINE[Combine Results]
    end

    OB --> PARSE
    PARSE --> EMBED --> VEC
    PARSE --> EXTRACT --> GRAPH

    QUERY --> SEM --> VEC
    QUERY --> TRAVERSE --> GRAPH
    VEC --> COMBINE
    GRAPH --> COMBINE
```

**GraphRAG adds:**
- Entity relationships (people, projects, decisions)
- Multi-hop reasoning ("What did Jake Williams say about identity that relates to our MCP setup?")
- Better context selection

**Components needed:**
- Qdrant (vector store) - runs on TrueNAS
- Neo4j (graph DB) - runs on TrueNAS
- Embedding model - Ollama or API
- MCP server for RAG queries

---

## Context Window Constraints

### The Problem

```
┌─────────────────────────────────────────────────────────────────┐
│  CONTEXT WINDOW REALITY                                          │
│                                                                  │
│  Claude: ~200K tokens                                            │
│  Gemini: ~1M tokens (but quality degrades)                       │
│  GPT-4: ~128K tokens                                             │
│                                                                  │
│  Your Obsidian vault: 50MB+ of text = millions of tokens        │
│                                                                  │
│  You can't just "load everything"                                │
└─────────────────────────────────────────────────────────────────┘
```

### Solutions

```mermaid
graph TB
    subgraph "Strategies"
        S1[Selective Retrieval<br/>Only fetch relevant docs]
        S2[Summarization<br/>Compress before loading]
        S3[Chunking<br/>Work on sections]
        S4[Subagents<br/>Delegate subtasks]
    end

    subgraph "Tools"
        T1[MCP Obsidian<br/>Search + fetch]
        T2[Claude Skills<br/>Focused helpers]
        T3[CLAUDE.md<br/>Always-loaded context]
    end

    S1 --> T1
    S2 --> T2
    S3 --> T1
    S4 --> T2
```

**See:** [Context Management Guide](../tools/context-management.md)

---

## File System Layout

### Recommended Structure

```
C:\Users\You\Documents\
├── Obsidian Vaults/
│   ├── personal/                    # Daily notes, journal
│   ├── work/                        # Work projects
│   └── mcp-workflow/                # This KB (or in Projects)
│
├── Projects/
│   ├── mcp-workflow-and-tech-stack/ # This repo (Git)
│   ├── home-assistant-projects/     # HA configs
│   └── other-repos/
│
└── .claude/                         # Claude Code config
    └── mcp_servers.json             # MCP server definitions
```

### WSL2 Consideration

```
Windows path: C:\Users\You\Documents\Projects\
WSL2 path:    /mnt/c/Users/You/Documents/Projects/

⚠️ Claude Code in WSL2 sees /mnt/c/ paths
⚠️ SSH keys must be in WSL2 home (~/.ssh), not /mnt/c/
```

---

## Phone Access

```mermaid
graph LR
    subgraph "Phone"
        TERM[Termux]
        SSH[SSH Client]
    end

    subgraph "Desktop"
        TS[Tailscale<br/>in WSL2]
        TMUX[tmux session]
        CC[Claude Code]
    end

    TERM --> SSH
    SSH -->|Tailscale network| TS
    TS --> TMUX
    TMUX --> CC
```

**Setup:** [WSL2 + Tailscale + SSH + tmux Guide](../personal-workflow/wsl2-tailscale-ssh-tmux.md)

---

## Optional Components

| Component | Purpose | When to Add |
|-----------|---------|-------------|
| **MCPJungle** | Gateway for multiple MCP servers | When you have 3+ MCP servers |
| **Ollama** | Local models | Privacy, offline work, cost savings |
| **Neo4j + Qdrant** | GraphRAG | When simple search isn't enough |
| **Gitea** | Self-hosted Git | For HA config review workflow |
| **n8n** | Workflow automation | Complex multi-step automations |

---

## Quick Start Checklist

### Minimal Setup
- [ ] Claude Code installed
- [ ] Obsidian vault in local Documents
- [ ] CLAUDE.md in project root
- [ ] Tailscale on desktop + phone (for remote access)

### Enhanced Setup
- [ ] MCP Obsidian server configured
- [ ] MCPJungle gateway on TrueNAS
- [ ] Home Assistant MCP registered
- [ ] Duplicati backup configured

### Advanced Setup
- [ ] GraphRAG (Neo4j + Qdrant) deployed
- [ ] Ollama for local inference
- [ ] Custom MCP servers for your APIs

---

## See Also

- [Enterprise Architecture](13-enterprise-architecture.md) - How this differs at work
- [Context Management Guide](../tools/context-management.md) - Working within LLM limits
- [MCP Gateway Options](../research/mcp-gateway-options.md) - Gateway comparison
- [RAG Graph Architecture](../research/rag-graph-architecture.md) - GraphRAG details
