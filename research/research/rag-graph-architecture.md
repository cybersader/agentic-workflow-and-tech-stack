# RAG GRAPH Architecture for Claude Code

## The Core Insight (from WWHF 2025)

> "RAG is a funneling information into a context window problem. Knowledge graphs are the best way to do RAG."

## Why GraphRAG > Vector-Only RAG

| Approach | Strength | Weakness |
|----------|----------|----------|
| **Vector RAG** | Semantic similarity | Loses relationships |
| **Graph RAG** | Preserves relationships | More complex setup |
| **Hybrid** | Best of both | Requires two DBs |

## Practical Stack for Home Lab

### Components

```
┌─────────────────────────────────────────┐
│           Claude Code (Client)           │
└────────────────┬────────────────────────┘
                 │ MCP
                 v
┌─────────────────────────────────────────┐
│         MCP Server (Bridge)              │
│   Translates queries → Cypher + Vector   │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        v                 v
┌──────────────┐   ┌──────────────┐
│    Neo4j     │   │    Qdrant    │
│   (Graph)    │   │   (Vector)   │
└──────────────┘   └──────────────┘
```

### Docker Compose

```yaml
services:
  # Graph Database
  neo4j:
    image: neo4j:5.26.0
    container_name: rag_graph_neo4j
    restart: unless-stopped
    ports:
      - "7474:7474"  # HTTP Browser
      - "7687:7687"  # Bolt connection
    environment:
      - NEO4J_AUTH=neo4j/your_secure_password
      - NEO4J_PLUGINS=["apoc", "graph-data-science"]
    volumes:
      - ./neo4j/data:/data
      - ./neo4j/logs:/logs

  # Vector Database
  qdrant:
    image: qdrant/qdrant:latest
    container_name: rag_vector_qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
    volumes:
      - ./qdrant/storage:/qdrant/storage

  # Optional: Zep for automatic memory/chat curation
  zep:
    image: zepai/zep:latest
    container_name: rag_memory_zep
    ports:
      - "8000:8000"
    environment:
      - ZEP_OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./zep/data:/app/data
```

### MCP Server Options

1. **Riley Lemm's GraphRAG MCP** - Hybrid search (Qdrant + Neo4j)
   - [github.com/rileylemm/graphrag_mcp](https://github.com/rileylemm/graphrag_mcp)

2. **Official Neo4j MCP** - Claude writes Cypher queries directly
   - `npm install -g @neo4j-contrib/mcp-neo4j`

3. **Zep MCP** - Automatic memory extraction from conversations

### Connecting via Tailscale

**Option A: SSH Tunnel (Most Secure)**
```bash
claude mcp add graph-rag -- \
  ssh user@<TRUENAS_TAILSCALE_IP> \
  "docker run -i --rm \
  -e NEO4J_URI=bolt://neo4j:7687 \
  -e NEO4J_PASSWORD=pass \
  mcp-server-image"
```

**Option B: HTTP/SSE (Remote MCP)**
```json
{
  "mcpServers": {
    "graph-rag": {
      "type": "http",
      "url": "http://<TAILSCALE_IP>:3000/sse"
    }
  }
}
```

---

## Curation Strategy

### The Problem
Simply dumping files into a vector DB isn't enough. You need structured curation.

### Solution: "Librarian" Agent Pattern

1. **Create dedicated curation session**
   - Prompt: "Analyze this conversation. Extract key entities (functions, APIs, architectural decisions) and insert into the Graph Database."

2. **Entity Types to Extract**
   - Concepts / Decisions
   - Files / Functions
   - Relationships (imports, depends on, relates to)
   - Questions / Answers pairs

3. **Automated with Zep**
   - Zep automatically extracts "facts" from conversations
   - Builds knowledge graph from chat history
   - Good for input/output curation

### Graph Schema Example

```cypher
// Entities
(:Concept {name, description, source})
(:File {path, language, purpose})
(:Decision {title, rationale, date})
(:Question {text, context})
(:Answer {text, confidence})

// Relationships
(:File)-[:IMPORTS]->(:File)
(:Decision)-[:RELATES_TO]->(:Concept)
(:Answer)-[:ANSWERS]->(:Question)
(:Concept)-[:MENTIONED_IN]->(:File)
```

---

## Integration with Your Stack

| Component | Tool | Location |
|-----------|------|----------|
| Graph DB | Neo4j | TrueNAS Docker |
| Vector DB | Qdrant | TrueNAS Docker |
| Memory | Zep (optional) | TrueNAS Docker |
| Network | Tailscale | Mesh |
| Client | Claude Code | Desktop |
| MCP Bridge | graphrag_mcp or neo4j-mcp | TrueNAS or local |

---

## Best Practices (from WWHF)

1. **Chunking for large docs** - Use doc subagents
2. **Concise prompts** - System and user prompts should be minimal
3. **Structured output** - Enforce JSON/schema for graph insertions
4. **Human value** - Knowing what to distill and how
5. **Context windows** - Keep low, use new chats frequently
