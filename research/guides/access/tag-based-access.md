---
created: 2025-12-18
updated: 2025-12-18
tags:
  - guides
  - access-control
  - practical
  - mcp
---

# Tag-Based Access: Implementation Guide

Tag-based access allows granting access by metadata (tags) regardless of folder location.

**Status: IMPLEMENTABLE via Gateway + Policy Engine**

> **Key insight:** The MCP Gateway + OPA can enforce tag-based access by querying a tag index and filtering based on policy. See [Implementing All Access Mechanisms](implementing-all-access-mechanisms.md) for full architecture.

---

## The Concept

```
┌─────────────────────────────────────────────────────────────────┐
│  TAG-BASED ACCESS (Theoretical)                                  │
│                                                                  │
│  /vault/                                                         │
│  ├── work/                                                       │
│  │   └── meeting-notes.md     [#work, #project-x]              │
│  ├── personal/                                                   │
│  │   └── journal.md           [#personal, #health]              │
│  └── research/                                                   │
│      └── mcp-security.md      [#work, #security, #research]     │
│                                                                  │
│  Grant: #work                                                    │
│  Agent sees: meeting-notes.md, mcp-security.md                  │
│  Agent does NOT see: journal.md                                  │
│                                                                  │
│  Access crosses folders based on tag metadata.                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why It Doesn't Exist Yet

### Technical Challenges

1. **No standard tag format**
   - YAML frontmatter tags?
   - Inline #hashtags?
   - Obsidian-specific format?

2. **Performance**
   - Every file read requires parsing for tags
   - Index would need to be maintained

3. **Policy complexity**
   - Tag hierarchies (#work/client-a)
   - Tag combinations (AND/OR logic)
   - Inheritance rules

### Where It Would Need to Be Implemented

```
Option A: MCP Server Layer
└── Server parses tags, filters before returning

Option B: Gateway Layer
└── Gateway inspects responses, filters by policy

Option C: RAG/Search Layer
└── Index includes tags, filters at query time
```

---

## Workarounds Today

### Workaround 1: Folder Structure as Proxy

Use folders instead of tags for access boundaries:

```
# Instead of tagging files #work
# Put them in /vault/work/

# Instead of tagging #personal
# Put them in /vault/personal/

# Run MCP server scoped to /vault/work
```

**Limitation:** Files can only be in ONE folder (can't be #work AND #research).

### Workaround 2: Multiple MCP Servers

Duplicate or symlink files into domain-specific folders:

```json
{
  "mcpServers": {
    "work-vault": {
      "env": { "VAULT_PATH": "/home/user/vault/work" }
    },
    "research-vault": {
      "env": { "VAULT_PATH": "/home/user/vault/research" }
    }
  }
}
```

Then use [explicit grants](explicit-grants.md) to control which servers an agent calls.

### Workaround 3: Search-Based Filtering

Use Obsidian MCP search with tag queries:

```
Prompt: "Search my vault for notes tagged #work.
Only work with results from that search."
```

**Limitation:** This is "honor system" — the agent CAN see other files, you're just asking it not to.

### Workaround 4: Pre-Filtered Views

Create an index file that lists "allowed" content:

```markdown
# Work Notes Index

Files the work agent should access:
- [[meeting-notes]]
- [[mcp-security]]
- [[project-x-plan]]
```

Then tell the agent to reference this index.

---

## Building Tag-Based Access (If You Want To)

### Option A: Fork an MCP Server

1. Fork [obsidian-mcp](https://github.com/...)
2. Add configuration:
   ```json
   {
     "access_control": {
       "type": "tag-based",
       "allowed_tags": ["#work", "#research"],
       "denied_tags": ["#personal"]
     }
   }
   ```
3. Modify file read/list operations to:
   - Parse YAML frontmatter
   - Check tags against policy
   - Filter results

### Option B: Build a Gateway Filter

1. Deploy MCP gateway (MCPJungle, custom)
2. Add response interceptor:
   ```python
   def filter_response(response, policy):
       # Parse content for tags
       # Filter based on policy
       return filtered_response
   ```

### Option C: Use RAG with Tag Filtering

If using a vector database:

```python
# At indexing time, store tags as metadata
doc = {
    "content": "...",
    "path": "/vault/work/notes.md",
    "tags": ["work", "project-x"]
}

# At query time, filter
results = vectordb.query(
    query="meeting notes",
    filter={"tags": {"$in": ["work"]}}
)
```

This is probably the **most practical path** if you need tag-based access.

---

## Obsidian-Specific: Using Dataview

If you're in Obsidian, you can use Dataview to create filtered views:

```dataview
TABLE file.tags
FROM #work
WHERE !contains(file.tags, "#personal")
```

Then have the agent work with Dataview output, not raw files.

**Limitation:** Still honor system — agent can access raw files.

---

## Enterprise Context

In enterprise, tag-based access would likely be:

1. **Metadata stored in SharePoint/M365**
   - Sensitivity labels
   - Classification tags
   - Retention labels

2. **Policy enforced by gateway**
   - OPA/Cedar rules checking metadata
   - MS Purview integration

3. **Example policy:**
   ```rego
   allow {
       input.user.clearance >= input.resource.classification
       input.resource.sensitivity_label in input.user.allowed_labels
   }
   ```

This is the direction enterprise will go, but tooling doesn't exist yet for MCP.

---

## Recommendations

### Today (2024-2025)

1. **Use folder structure** as your primary access boundary
2. **Design folders around access zones**, not just organization
3. **Use search + honor system** for cross-cutting queries
4. **Accept the limitation** — true tag-based ACL isn't here yet

### Future (When Available)

Watch for:
- Obsidian MCP updates with tag filtering
- MCP gateway products with content inspection
- RAG platforms with metadata filtering

---

## See Also

- [Path-Based Access](path-based-access.md) — What works today
- [Graph-Based Access](graph-based-access.md) — Navigation within scope
- [Explicit Grants](explicit-grants.md) — Breaking out of scope
- [Access Model Implementation](../../architecture/14-access-model-implementation.md) — Full theory
