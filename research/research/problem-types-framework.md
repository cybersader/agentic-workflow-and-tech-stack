---
created: 2025-12-15
updated: 2025-12-15
tags:
  - research
  - philosophy
  - agents
  - architecture
  - wip
---

# Two Types of Problems: Deterministic vs Semantic

This document explores a fundamental distinction in how agents should approach different types of problems—a distinction rooted in the nature of the information itself.

---

## The Core Distinction

```
┌─────────────────────────────────────────────────────────────────┐
│  DETERMINISTIC / STRUCTURAL (Code, Math, Logic)                 │
│  ─────────────────────────────────────────────────────────────  │
│  Nature: Stacked abstractions with mathematical underpinning    │
│  Foundation: Necessary truths (law of non-contradiction)        │
│  Structure: Nested, hierarchical, traceable                     │
│  Verification: Can be proven correct or incorrect               │
│  Example: Understanding a large codebase                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  SEMANTIC / LINGUISTIC (Knowledge, Meaning, Language)           │
│  ─────────────────────────────────────────────────────────────  │
│  Nature: Stacked meaning with conventional interpretation       │
│  Foundation: Assigned meaning (arbitrary but contextual)        │
│  Structure: Networked, associative, contextual                  │
│  Verification: Interpretation, not proof                        │
│  Example: Understanding a knowledge base                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Philosophical Grounding (from DMAF)

> "Computers don't manipulate arbitrary signs—they manipulate physical states (voltage high/low) according to necessary mathematical laws. The arbitrariness enters at the layer of interpretation: what we decide those states mean. The logic is necessary; the meaning is assigned."
> — Digital Moral Agency Framework

### The Stacking Problem

```
Physical world (matter)
  └── Transistor states (simplest form)
        └── Binary logic (mathematical form)
              └── Machine instructions (computational form)
                    └── Programming language (linguistic form)
                          └── Application logic (purposive form)
                                └── User experience (human meaning)
```

**Key insight:** Each layer is a complete formal system with its own grammar, vocabulary, rules, and idioms. Knowing one doesn't automatically give you another.

### Form and Matter

From Thomistic metaphysics:
- **Matter** = what makes something physical
- **Form** = what makes something intelligible (structure, pattern)

> "Digital systems minimize matter (tiny transistors) while maximizing form (vast, nested structures of meaning)."

**Why this matters for agents:** Code is primarily about FORM (structure, logic flow). Knowledge curation is about MEANING (interpretation, context). Different problems require different approaches.

---

## How Agents Should Approach Each Type

### Deterministic Problems (Code Comprehension)

```
┌─────────────────────────────────────────────────────────────────┐
│  PATTERN: Hierarchical Decomposition                            │
│                                                                  │
│  1. MAP THE STRUCTURE                                           │
│     └── Entry points, dependencies, call graphs                 │
│     └── Logical flow between components                         │
│                                                                  │
│  2. DECOMPOSE INTO LAYERS                                       │
│     └── Spawn agents for each abstraction layer                 │
│     └── Each agent understands its layer + interfaces           │
│                                                                  │
│  3. FUNNEL UNDERSTANDING UPWARD                                 │
│     └── Lower agents report summaries to higher                 │
│     └── Synthesis happens at the top                            │
│                                                                  │
│  4. VERIFY DETERMINISTICALLY                                    │
│     └── Can trace exact logic flow                              │
│     └── Can prove correctness at each layer                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Example: Understanding a Large Program**

```
┌─────────────────────────────────────────────────────────────────┐
│  ROOT AGENT (orchestrator)                                      │
│  Mission: "Understand how auth works in this codebase"          │
│                                                                  │
│  Step 1: Map entry points                                       │
│    └── Spawn: file-mapper agent → returns structure             │
│                                                                  │
│  Step 2: Identify auth boundary                                 │
│    └── Spawn: grep-searcher agent → finds auth-related files    │
│                                                                  │
│  Step 3: Trace logic flow                                       │
│    └── Spawn: flow-tracer agent → follows auth from entry       │
│        └── This agent may spawn sub-agents for nested modules   │
│                                                                  │
│  Step 4: Synthesize understanding                               │
│    └── Root agent combines all summaries                        │
│    └── Returns: "Auth works by X → Y → Z"                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Semantic Problems (Knowledge Retrieval)

```
┌─────────────────────────────────────────────────────────────────┐
│  PATTERN: Associative Search + Synthesis                        │
│                                                                  │
│  1. INTERPRET THE QUERY                                         │
│     └── What does the user actually mean?                       │
│     └── What context shapes the question?                       │
│                                                                  │
│  2. SEARCH ACROSS CONNECTIONS                                   │
│     └── Semantic similarity (RAG)                               │
│     └── Graph relationships (concepts linked to concepts)       │
│     └── Tag/folder heuristics                                   │
│                                                                  │
│  3. SYNTHESIZE MEANING                                          │
│     └── Combine fragments into coherent answer                  │
│     └── Preserve nuance and context                             │
│                                                                  │
│  4. VERIFY THROUGH COHERENCE                                    │
│     └── Does the answer make sense?                             │
│     └── Does it match user intent?                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why This Distinction Matters for Agent Architecture

### Different Traversal Patterns

| Aspect | Deterministic (Code) | Semantic (Knowledge) |
|--------|---------------------|---------------------|
| **Traversal** | Depth-first (follow logic chains) | Breadth-first (gather related concepts) |
| **Verification** | Proof (can trace) | Coherence (makes sense) |
| **Decomposition** | By abstraction layer | By topic/concept |
| **Synthesis** | Bottom-up (build from primitives) | Top-down (start with meaning, refine) |
| **Agent spawning** | Follow call graph / imports | Follow semantic connections |

### Different Tool Needs

| Problem Type | Primary Tools |
|--------------|---------------|
| **Code** | AST parsers, call graph analysis, grep/find, language servers |
| **Knowledge** | Semantic search (RAG), graph traversal, tag queries |

### Different Failure Modes

| Problem Type | What Goes Wrong |
|--------------|-----------------|
| **Code** | Missing a dependency, wrong abstraction layer, incorrect trace |
| **Knowledge** | Missing context, wrong interpretation, semantic drift |

---

## Hybrid Problems

Most real problems are BOTH:

```
┌─────────────────────────────────────────────────────────────────┐
│  EXAMPLE: "Why is this API slow?"                               │
│                                                                  │
│  Deterministic component:                                       │
│  └── Trace actual code execution                                │
│  └── Measure timings at each layer                              │
│  └── Find the bottleneck                                        │
│                                                                  │
│  Semantic component:                                            │
│  └── What was the design intent?                                │
│  └── What constraints shaped this?                              │
│  └── What do the docs say about expected behavior?              │
│                                                                  │
│  Agent architecture needs BOTH traversal patterns               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent Architecture for Code Comprehension

Based on your description: "Deploy agents as you delve down into nested logic, funnel understanding to the top."

### The Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                     ROOT AGENT (You)                            │
│                          │                                      │
│                    ┌─────┴─────┐                                │
│                    │           │                                │
│              ┌─────▼─────┐ ┌───▼───┐                            │
│              │ Structure │ │ Logic │                            │
│              │  Mapper   │ │ Tracer│                            │
│              └─────┬─────┘ └───┬───┘                            │
│                    │           │                                │
│              ┌─────▼─────┐ ┌───▼───┐                            │
│              │ Module A  │ │ Flow  │                            │
│              │  Expert   │ │ Analyzer│                          │
│              └───────────┘ └───────┘                            │
│                                                                  │
│  Each layer:                                                    │
│  1. Gets fresh context (not polluting parent)                   │
│  2. Loads relevant files for ITS abstraction level              │
│  3. Returns compressed summary                                  │
│  4. Parent synthesizes summaries into understanding             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Works

1. **Context isolation** — Each agent focuses on its layer without confusion
2. **Progressive disclosure** — Only load what's needed at each level
3. **Parallel exploration** — Multiple branches can be explored simultaneously
4. **Synthesis at appropriate level** — Details compressed before returning

### Implementation Sketch

```yaml
---
name: codebase-comprehension
description: Understand large codebases by hierarchical decomposition
---

# Codebase Comprehension Agent

## Mission
Given a question about a codebase, recursively decompose into sub-problems,
spawn specialized agents, and synthesize understanding.

## Workflow
1. **Map structure** → Spawn structure-mapper agent
2. **Identify relevant modules** → Based on question
3. **For each module:**
   - Spawn module-expert agent
   - Agent loads only that module's files
   - Agent returns summary of how it works
4. **Trace connections** → Spawn flow-tracer agent
5. **Synthesize** → Combine all summaries into answer

## When to spawn sub-agents
- When entering a new abstraction layer
- When a module is complex enough to warrant isolation
- When following a call across module boundaries

## What to return
- High-level summary (1-2 paragraphs)
- Key files identified
- Logic flow diagram (if relevant)
- Remaining unknowns (if any)
```

---

## Open Questions

1. **How to detect which type of problem you're facing?**
   - Could an agent classify problems before choosing approach?

2. **Optimal decomposition depth?**
   - How many layers of sub-agents before diminishing returns?

3. **Cross-type problems?**
   - When code comprehension meets knowledge retrieval
   - Example: "How does this relate to our architectural decisions?"

4. **Tool gaps?**
   - What tools are missing for deterministic traversal?
   - AST analysis, call graphs, type inference → need MCP servers?

---

## Resources to Explore

### Philosophy
- Thomistic form/matter distinction
- Philosophy of computer science
- Information theory (Shannon) vs meaning theory (semiotics)

### Agent Architecture
- Anthropic's multi-agent patterns
- WWHF 2025 insights (orchestrators with specialized subagents)
- ReAct, Tree of Thoughts, other reasoning patterns

### Code Analysis Tools
- Language Server Protocol (LSP)
- AST parsers for various languages
- Static analysis tools
- Call graph generators

---

## Connection to Progressive Disclosure

The deterministic/semantic distinction maps to progressive disclosure:

| Aspect | Deterministic | Semantic |
|--------|---------------|----------|
| **Level 1** | File/module index | Topic index |
| **Level 2** | Module summaries | Document summaries |
| **Level 3** | Function details | Paragraph context |
| **Level ∞** | Line-by-line code | Full documents |

Both use progressive disclosure, but the TRAVERSAL PATTERN differs:
- Deterministic: Follow logic edges (imports, calls, types)
- Semantic: Follow meaning edges (similarity, tags, links)

---

## See Also

- [Agent Workflow Guide](../tools/agent-workflow-guide.md) - Progressive disclosure fundamentals
- [WWHF 2025 Insights](wwhf-2025-insights.md) - Agent architecture patterns
- DMAF: PHILOSOPHICAL_FOUNDATIONS.md - Form/matter distinction
- DMAF: ABSTRACTION_AND_MORAL_ASYMMETRY.md - Stacking problem
