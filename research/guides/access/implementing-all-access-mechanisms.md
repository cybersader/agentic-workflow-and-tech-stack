---
created: 2025-12-18
updated: 2025-12-18
tags:
  - guides
  - access-control
  - practical
  - mcp
  - gateway
  - implementation
---

# Implementing All Access Mechanisms via Gateway

We already have the solutions documented in our enterprise architecture. The key insight:

**The MCP Gateway + Policy Engine is where ALL access mechanisms get enforced.**

This guide shows how to implement path, tag, graph, and explicit grant access using the gateway patterns from our existing docs.

---

## The Architecture (From Our Docs)

From [Enterprise Reference Architecture](../../architecture/09-enterprise-reference-architecture.md):

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ACCESS ENFORCEMENT                            │
│                                                                      │
│  Client (Claude Code / Cline)                                        │
│         │                                                            │
│         ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  MCP GATEWAY                                                 │    │
│  │  ┌─────────────────────────────────────────────────────────┐│    │
│  │  │  POLICY ENGINE (OPA / Cedar)                            ││    │
│  │  │                                                          ││    │
│  │  │  • Path-based rules                                     ││    │
│  │  │  • Tag-based filtering (via metadata query)             ││    │
│  │  │  • Graph edge policies                                   ││    │
│  │  │  • Explicit conditional grants                          ││    │
│  │  └─────────────────────────────────────────────────────────┘│    │
│  └──────────────────────────┬──────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  MCP SERVERS (obsidian-mcp, filesystem-mcp, etc.)           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Key insight:** The gateway intercepts ALL requests. Policy engine can enforce ANY logic.

---

## Gateway Options (From Our Research)

From [MCP Gateway Comparison](../../research/mcp-gateway-comparison.md):

| Gateway | Complexity | Policy Engine | Best For |
|---------|------------|---------------|----------|
| **MCPJungle** | Low | Tool groups, Bearer tokens | Personal, quick start |
| **MCP Gateway Registry** | High | OPA + Keycloak | Enterprise, full RBAC |
| **microsoft/mcp-gateway** | High | OPA/Cedar + Entra | Microsoft shops |

**For implementing all four access mechanisms, you need policy engine support.**

Recommendation: **MCP Gateway Registry** or **microsoft/mcp-gateway** for full flexibility.

---

## Mechanism 1: Path-Based Access

**Already works.** But gateway makes it configurable.

### Without Gateway (Current)

Each MCP server has its own path config:
```json
{
  "mcpServers": {
    "obsidian": {
      "env": { "VAULT_PATH": "/vault/projects" }
    }
  }
}
```

### With Gateway (Better)

Gateway policy controls which paths each agent can access:

```rego
# OPA policy: path-based access
package mcp.access

default allow = false

# Agent can access paths matching its role
allow {
    input.agent == "project-assistant"
    glob.match("/vault/projects/**", [], input.resource.path)
}

allow {
    input.agent == "personal-assistant"
    glob.match("/vault/personal/**", [], input.resource.path)
}
```

**Benefit:** Centralized path control. Change policy, not MCP server configs.

---

## Mechanism 2: Tag-Based Access

**The "gap" is solved by: Gateway + Metadata Service**

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  TAG-BASED ACCESS VIA GATEWAY                                        │
│                                                                      │
│  1. Request comes in: "Read file X"                                 │
│  2. Gateway queries Metadata Service: "What tags does X have?"      │
│  3. Policy engine checks: "Does agent have access to those tags?"   │
│  4. If yes → forward to MCP server                                  │
│  5. If no → deny                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Metadata Service Options

| Option | Description | Complexity |
|--------|-------------|------------|
| **SQLite/Postgres** | Index tags → paths at ingest time | Medium |
| **RAG Vector DB** | Query by metadata filter | Medium |
| **Obsidian API** | Query tags via obsidian-mcp first | Low |
| **File parsing** | Gateway parses frontmatter on each request | High (slow) |

### Implementation: Obsidian Tags via Gateway

```rego
# OPA policy: tag-based access via Obsidian API
package mcp.access

default allow = false

# Query Obsidian for file tags
file_tags := tags {
    response := http.send({
        "method": "GET",
        "url": concat("", ["http://obsidian-mcp:8080/file/", input.resource.path, "/tags"])
    })
    tags := response.body.tags
}

# Check if agent's allowed tags intersect with file tags
allow {
    input.tool == "obsidian_read"
    agent_tags := data.agents[input.agent].allowed_tags
    count({t | t := file_tags[_]; t == agent_tags[_]}) > 0
}
```

### Implementation: Pre-Indexed Tags (Better Performance)

Build a tag index at ingest time:

```python
# Index builder (run periodically or on file change)
def build_tag_index(vault_path):
    index = {}
    for file in glob.glob(f"{vault_path}/**/*.md", recursive=True):
        frontmatter = parse_frontmatter(file)
        if frontmatter and 'tags' in frontmatter:
            for tag in frontmatter['tags']:
                if tag not in index:
                    index[tag] = []
                index[tag].append(file)
    return index
```

Then OPA queries the index:

```rego
# OPA policy: tag-based access via index
package mcp.access

# Get file's tags from index
file_tags := data.tag_index.files[input.resource.path].tags

# Allow if agent has permission for any of the file's tags
allow {
    input.tool == "file_read"
    some tag in file_tags
    tag in data.agents[input.agent].allowed_tags
}
```

### Policy Data Structure

```yaml
# policy-data.yaml - loaded into OPA
agents:
  work-assistant:
    allowed_tags: ["work", "project-x", "mcp-workflow"]
    denied_tags: ["personal", "finances"]

  personal-assistant:
    allowed_tags: ["personal", "health", "journal"]
    denied_tags: ["work", "client-data"]

tag_index:
  files:
    "/vault/projects/mcp.md":
      tags: ["work", "mcp-workflow"]
    "/vault/personal/journal.md":
      tags: ["personal", "journal"]
```

---

## Mechanism 3: Graph-Based Access Control

**Turn navigation into access control via gateway policies.**

### The Difference

- **Graph navigation** (current): Follow links within scope
- **Graph access control** (new): Policy controls which edges can be traversed

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  GRAPH ACCESS CONTROL VIA GATEWAY                                    │
│                                                                      │
│  1. Agent requests: "Follow link from A to B"                       │
│  2. Gateway checks: "Is A→B an allowed edge for this agent?"        │
│  3. Policy can check:                                                │
│     • Edge type (reference vs contains_secret)                      │
│     • Source/target classification                                   │
│     • Relationship metadata                                          │
│  4. Allow or deny traversal                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Implementation: Edge-Based Policies

```rego
# OPA policy: graph edge access control
package mcp.access

default allow_traversal = false

# Get edge metadata from graph index
edge_info := data.graph_index.edges[concat("->", [input.source, input.target])]

# Allow traversal of reference edges
allow_traversal {
    edge_info.type == "reference"
}

# Deny traversal to sensitive nodes
deny_traversal {
    data.graph_index.nodes[input.target].classification == "sensitive"
    not input.agent in data.sensitive_access_agents
}

# Final decision
allow {
    input.tool == "obsidian_follow_link"
    allow_traversal
    not deny_traversal
}
```

### Graph Index Structure

```yaml
# graph-index.yaml
nodes:
  "/vault/projects/api.md":
    classification: "public"
    tags: ["work"]
  "/vault/secrets/keys.md":
    classification: "sensitive"
    tags: ["secrets"]

edges:
  "/vault/projects/api.md->/vault/secrets/keys.md":
    type: "references"
    source: "/vault/projects/api.md"
    target: "/vault/secrets/keys.md"
```

### Building Graph Index

Use obsidian-mcp or custom tooling:

```python
def build_graph_index(vault_path):
    nodes = {}
    edges = {}

    for file in glob.glob(f"{vault_path}/**/*.md", recursive=True):
        # Parse frontmatter for node metadata
        fm = parse_frontmatter(file)
        nodes[file] = {
            "classification": fm.get("classification", "public"),
            "tags": fm.get("tags", [])
        }

        # Parse links for edges
        content = read_file(file)
        links = extract_wikilinks(content)
        for link in links:
            target = resolve_link(link, vault_path)
            edge_key = f"{file}->{target}"
            edges[edge_key] = {
                "type": "reference",
                "source": file,
                "target": target
            }

    return {"nodes": nodes, "edges": edges}
```

---

## Mechanism 4: Explicit Grants

**Purpose-bound tokens + conditional policies.**

From [Identity Governance Patterns](../../architecture/10-identity-governance-patterns.md):

### Token Claims for Explicit Grants

```json
{
  "sub": "agent-finance-report",
  "scope": "base_access",
  "purpose": {
    "ticket_id": "INC0012345",
    "justification": "Monthly close",
    "granted_paths": ["/finance/q4-report.xlsx"],
    "granted_tags": ["finance-sensitive"],
    "expires": "2024-01-15T18:00:00Z"
  }
}
```

### OPA Policy for Explicit Grants

```rego
# OPA policy: explicit grants via purpose-bound tokens
package mcp.access

default allow = false

# Normal access (path or tag based)
allow {
    normal_access_allowed
}

# Explicit grant in token
allow {
    input.resource.path in input.token.purpose.granted_paths
    valid_ticket(input.token.purpose.ticket_id)
    time.now_ns() < time.parse_rfc3339_ns(input.token.purpose.expires)
}

# Explicit tag grant
allow {
    some tag in input.resource.tags
    tag in input.token.purpose.granted_tags
    valid_ticket(input.token.purpose.ticket_id)
}

# Validate ticket is real and open
valid_ticket(ticket_id) {
    response := http.send({
        "method": "GET",
        "url": concat("", ["https://servicenow/api/now/table/incident/", ticket_id])
    })
    response.body.result.state != "closed"
}
```

### Workflow for Getting Explicit Grants

```
┌─────────────────────────────────────────────────────────────────────┐
│  EXPLICIT GRANT WORKFLOW                                             │
│                                                                      │
│  1. Agent requests access to out-of-scope resource                  │
│  2. Gateway denies, returns: "Requires explicit grant"              │
│  3. User/agent creates ticket with justification                    │
│  4. Approval workflow (Power Automate, n8n) triggers                │
│  5. If approved, token service adds grant to agent's token          │
│  6. Agent retries with new token                                    │
│  7. Gateway validates ticket, allows access                         │
│  8. Access logged with full context                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Complete Policy Example

Combining all four mechanisms:

```rego
# OPA policy: complete access control
package mcp.access

import future.keywords.in

default allow = false

#################
# PATH-BASED ACCESS
#################
path_allowed {
    some pattern in data.agents[input.agent].allowed_paths
    glob.match(pattern, [], input.resource.path)
}

#################
# TAG-BASED ACCESS
#################
resource_tags := data.tag_index.files[input.resource.path].tags

tag_allowed {
    some tag in resource_tags
    tag in data.agents[input.agent].allowed_tags
}

tag_denied {
    some tag in resource_tags
    tag in data.agents[input.agent].denied_tags
}

#################
# GRAPH-BASED ACCESS
#################
traversal_allowed {
    input.action == "follow_link"
    edge_key := concat("->", [input.source, input.target])
    edge := data.graph_index.edges[edge_key]
    edge.type in data.agents[input.agent].allowed_edge_types
}

traversal_denied {
    input.action == "follow_link"
    target_node := data.graph_index.nodes[input.target]
    target_node.classification == "sensitive"
    not input.agent in data.sensitive_access_agents
}

#################
# EXPLICIT GRANTS
#################
explicit_path_grant {
    input.resource.path in input.token.purpose.granted_paths
    valid_purpose(input.token.purpose)
}

explicit_tag_grant {
    some tag in resource_tags
    tag in input.token.purpose.granted_tags
    valid_purpose(input.token.purpose)
}

valid_purpose(purpose) {
    purpose.ticket_id != ""
    # Optional: validate ticket is real
    time.now_ns() < time.parse_rfc3339_ns(purpose.expires)
}

#################
# FINAL DECISION
#################
allow {
    # Path or tag access (normal)
    (path_allowed; tag_allowed)
    not tag_denied
}

allow {
    # Graph traversal
    input.action == "follow_link"
    traversal_allowed
    not traversal_denied
}

allow {
    # Explicit grants
    (explicit_path_grant; explicit_tag_grant)
}
```

---

## Implementation Paths

### Personal Stack (Simpler)

1. **Deploy MCPJungle** on TrueNAS
   - Tool groups = basic path separation
   - Bearer tokens = basic auth

2. **Add tag filtering** via custom MCP server
   - Fork obsidian-mcp
   - Add tag filtering in read operations
   - Config: `allowed_tags: ["home-lab"]`

3. **Explicit grants** via skills
   - Use `allowed-paths` in skill files
   - Manual, but works today

### Enterprise Stack (Full)

1. **Deploy MCP Gateway Registry** with Keycloak
   - Full RBAC at tool level
   - OAuth/OIDC auth

2. **Add OPA policy engine**
   - Deploy OPA alongside gateway
   - Write policies for all four mechanisms

3. **Build metadata services**
   - Tag index (SQLite or vector DB)
   - Graph index (Neo4j or flat file)

4. **Integrate ticketing** for explicit grants
   - ServiceNow/Jira integration
   - Approval workflows

---

## What We Still Need to Build

| Component | Status | Effort |
|-----------|--------|--------|
| Tag index builder | Custom script needed | Low |
| Graph index builder | Custom script needed | Medium |
| OPA policy templates | Examples above | Low |
| MCP server with tag filtering | Fork existing | Medium |
| Approval workflow integration | n8n or Power Automate | Medium |

---

## See Also

- [Identity Governance Patterns](../../architecture/10-identity-governance-patterns.md) — Full identity architecture
- [Enterprise Reference Architecture](../../architecture/09-enterprise-reference-architecture.md) — Stack patterns
- [MCP Gateway Options](../../research/mcp-gateway-options.md) — Gateway comparison
- [MCP Gateway Comparison](../../research/mcp-gateway-comparison.md) — Feature matrix
