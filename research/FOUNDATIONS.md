---
created: 2025-12-17
updated: 2025-12-18
tags:
  - foundations
  - architecture
  - reference
  - access-control
---

# Foundations: What Doesn't Change

> "Foundations are the principles and truths that remain valid regardless of which tools, conventions, or implementations evolve."

This document captures the essential truths about agent architecture in hierarchical file systems—principles that remain valid regardless of which AI system (Claude Code, Gemini CLI, Codex) or which specific conventions evolve.

---

## The Core Insight

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  THE HIERARCHY IS THE ACCESS PRIMITIVE.                         │
│  THE GRAPH IS A NAVIGATION AID WITHIN GRANTED SCOPE.            │
│                                                                  │
│  You don't give an agent "access to the graph."                 │
│  You give it access to a directory (or set of directories),    │
│  and WITHIN that granted scope, there's a graph overlay         │
│  that helps it understand relationships between things          │
│  it can already see.                                             │
│                                                                  │
│  The file system is the building with locked doors.             │
│  The graph is the map on the wall inside each room              │
│  showing how the rooms connect.                                  │
│  The map doesn't unlock doors—but once you're in,               │
│  it helps you understand the space.                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why Hierarchies Work for Access Control

**Hierarchies give you free access control.**

The tree structure *is* the permission boundary. Give access to `/projects/client-a/` and the scope is self-evident. It's why NTFS, AD, and file systems work—**the structure carries the policy**.

**Graphs give you free relationships.**

But they destroy that natural scoping. Suddenly you need explicit rules: "traverse this edge but not that one," "two hops but only through nodes of type X." You've traded implicit boundaries for explicit policy management.

```
HIERARCHY                          GRAPH
─────────────────────────────────  ─────────────────────────────────
Access flows downward              Access requires policy at every edge
Scope is self-evident              Scope requires explicit definition
Structure IS permission            Structure is separate from permission
Simple to reason about             Complex to reason about
```

---

## The Complete Access Model

Four mechanisms:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. HIERARCHICAL ACCESS (path-based, default)                   │
│  ─────────────────────────────────────────────                  │
│  Access flows downward automatically.                           │
│  Grant /projects/client-a/ → agent sees all children.          │
│  This is the PRIMARY access primitive.                          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  2. TAG-BASED ACCESS (metadata-based, cross-cutting)            │
│  ──────────────────────────────────────────────────             │
│  Grant access to everything with a specific tag, regardless     │
│  of where it lives in the hierarchy.                            │
│                                                                  │
│  Examples:                                                       │
│  • "Access all #home-lab content" (flat tag)                   │
│  • "Access all --entity/cybersader/* content" (nested tag)     │
│  • "Access all files tagged #client-a" (cross-folder)          │
│                                                                  │
│  Nested tags create HIERARCHIES WITHIN the tag system:          │
│  • --entity/cybersader/home-lab                                │
│  • Grant --entity/cybersader/* → sees all nested beneath       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  3. GRAPH NAVIGATION WITHIN SCOPE (free)                        │
│  ───────────────────────────────────────                        │
│  Links, tags, backlinks between things you can already see.     │
│  No additional permission needed—just navigation aids.          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  4. EXPLICIT EDGE GRANTS (relationship-based, configurable)     │
│  ───────────────────────────────────────────────────────────    │
│  Graph edges that CROSS boundaries (path or tag) can be         │
│  explicitly allowed. This is the escape hatch.                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation varies by technology:**

| Mechanism | Claude Code | Obsidian | Enterprise |
|-----------|-------------|----------|------------|
| Path-based | Working directory | Vault path | RBAC on paths |
| Tag-based | MCP search by tag | Tag queries | Metadata policies |
| Graph nav | File reading | Links/backlinks | Graph traversal |
| Edge grants | `allowed-tools` | Plugin access | OPA/Cedar rules |

**The principle:** Path hierarchy is default. Tags create cross-cutting access. Graph helps navigation. Explicit grants are the escape hatch. Implementation varies.

---

## Organizing Principle for the Hierarchy

The hierarchy should reflect **domains of concern** or **spheres of responsibility**, not just arbitrary categorization. That way the access boundaries align with something meaningful rather than being purely administrative.

This connects to the SEACOW framework:
- **S**ystem — Templates, config (/)
- **E**ntity — People, agents, organizations (--entity/)
- **A**ctivities:
  - **C**apture — Getting knowledge in (-clip/, -inbox)
  - **O**utput — Interfacing outward (_/)
  - **W**ork — Deriving utility (under entity)
- **r**elation — Cross-cutting links (flat tags)

The folder structure represents **what something IS** (ontology).
Tags/links represent **how things RELATE** (epistemology).

---

## What This Means for Agents

### 1. Agents See Downward

When you give an agent access to a directory, it sees that directory and all children. This is the fundamental access primitive. It's not configurable—it's how file systems work.

### 2. Graph Overlays Don't Expand Access

Obsidian links, tags, and backlinks help an agent understand relationships *within its granted scope*. They don't unlock additional directories.

### 3. Skills/Conventions Are Scope-Specific

A skill that knows about `/projects/mcp-workflow/` conventions doesn't automatically know about `/projects/home-assistant/` conventions. Each scope may have different rules.

### 4. Context Funneling Is Still Required

Even with full access to a directory tree, you can't load everything into context. Progressive disclosure remains essential:
- Level 1: Metadata (always loaded)
- Level 2: Core instructions (loaded when relevant)
- Level 3+: Referenced files (loaded as needed)
- Level ∞: Full corpus via search/RAG

---

## The Two Types of Problems

Different problem types require different traversal patterns:

| Aspect | Deterministic (Code) | Semantic (Knowledge) |
|--------|---------------------|---------------------|
| **Nature** | Stacked abstractions | Stacked meaning |
| **Foundation** | Necessary mathematical truths | Assigned/interpreted meaning |
| **Traversal** | Depth-first (follow logic) | Breadth-first (gather related) |
| **Verification** | Proof/trace | Coherence/interpretation |
| **Access pattern** | Follow imports/calls | Follow links/tags |

Both operate within the same hierarchical access model, but the *navigation strategy* differs.

---

## What Never Changes

1. **Files are files.** No magic persistence beyond what's written.

2. **Path hierarchy = default access.** Giving access to a folder gives access to its children. This is the primary primitive.

3. **Tags = cross-cutting access.** Tags (especially nested tags) create another access dimension that spans the folder hierarchy. Grant by tag = access regardless of path.

4. **Graph within scope = navigation.** Links help you understand relationships between things you can already see (via path or tag).

5. **Cross-boundary access requires explicit grants.** Edges crossing both path AND tag boundaries need explicit permission. The mechanism varies by technology.

6. **Context is finite.** Progressive disclosure is always required.

7. **Retrieval beats storage.** Skills define how to find, not what to store.

8. **Agents are ephemeral.** Only the vault persists across sessions.

---

## What Changes (Implementation Details)

These are opinionated and will evolve:

- Specific AI system (Claude Code, Gemini CLI, Codex, etc.)
- Skill/agent file formats and conventions
- MCP server configurations
- RAG implementation details
- Specific folder structures

**Keep foundations in this document. Keep implementation in other docs.**

---

## See Also

- [Access Model Deep Dive](architecture/14-access-model-implementation.md) — Where each mechanism is enforced in the stack
- [Agent Workflow Guide](tools/agent-workflow-guide.md) — Implementation details for Claude Code
- [Problem Types Framework](research/problem-types-framework.md) — Deterministic vs semantic traversal
- [Reference Project Structure](tools/reference-project-structure.md) — Portable vs tool-specific
- [Five Strata of Repeatability](../01-kernel/principles/07-five-strata.md) — the deeper grounding for stratal thinking that this foundation underpins
- DMAF Philosophical Foundations (B&G vault) — Form/matter grounding
