---
created: 2025-12-18
updated: 2025-12-18
tags:
  - reference
  - philosophy
  - foundations
  - dmaf
---

# DMAF Concepts Reference

This page links key concepts from the Digital Moral Agency Framework (DMAF) that ground some of the architectural decisions in this knowledge base.

**Source:** DMAF documentation in B&G vault (`/PHILOSOPHICAL_FOUNDATIONS.md`, `/ABSTRACTION_AND_MORAL_ASYMMETRY.md`)

---

## Key Concepts Applied Here

### Form vs Matter

| Concept | Definition | Application Here |
|---------|------------|------------------|
| **Form** | Structure, pattern, the "what shape" | Folder hierarchy, file structure, access boundaries |
| **Matter** | Content, substance, the "what stuff" | The actual knowledge, data, configurations |

**Insight:** The file system hierarchy IS a form that carries meaning. It's not arbitrary structure—it's ontological (what things ARE).

---

### Ontology vs Epistemology

| Concept | Definition | Application Here |
|---------|------------|------------------|
| **Ontology** | What things ARE, their nature | Folder structure (where things live = what they are) |
| **Epistemology** | How we KNOW things, relationships | Tags, links, graph connections (how things relate) |

**From FOUNDATIONS.md:**
> The folder structure represents **what something IS** (ontology).
> Tags/links represent **how things RELATE** (epistemology).

---

### Deterministic vs Semantic (Stacked Abstractions vs Stacked Meaning)

Two fundamentally different problem types require different agent strategies:

| Aspect | Deterministic | Semantic |
|--------|--------------|----------|
| **DMAF Term** | Stacked abstractions | Stacked meaning |
| **Nature** | Formal, structural, logical | Interpretive, contextual, linguistic |
| **Foundation** | Necessary mathematical truths | Assigned/conventional meaning |
| **Examples** | Code, proofs, algorithms | Knowledge, documents, discourse |
| **Agent Strategy** | Depth-first (follow logic chains) | Breadth-first (gather context) |
| **Verification** | Proof/trace | Coherence/interpretation |

**From DMAF:** Computer programs are "stacked abstractions" with mathematical underpinning—each layer builds necessarily on the one below. Natural language meaning is "stacked" too, but via convention and interpretation rather than necessity.

---

### Moral Asymmetry (Why Security Matters)

**From DMAF:** There's an inherent asymmetry in the consequences of errors:
- Errors in deterministic systems propagate predictably
- Errors in agentic systems can have unbounded consequences

**Application:** This is why we care about:
- Access control (limit blast radius)
- Audit logging (trace what happened)
- Purpose-bound tokens (justify access)

The agent can take actions the human didn't intend. The file system hierarchy limits what those actions CAN affect.

---

## How This Grounds the Architecture

### 1. Why Hierarchy = Access

The file system isn't just convenient—it's ontologically meaningful. The structure SAYS what things are and therefore what access to grant.

```
/projects/client-a/  → Access to client-a concerns
/projects/client-b/  → Access to client-b concerns
```

This isn't arbitrary organization. It's a statement about the nature of these files.

### 2. Why Tags ≠ Folders

Tags are epistemological (relational) not ontological (categorical):
- A file CAN be about multiple topics (multiple tags)
- A file CAN'T be in multiple folders (singular location)

Tags cross-cut the hierarchy because relationships cross-cut categories.

### 3. Why Agents Need Different Strategies

From problem-types-framework.md:
- **Code comprehension:** Follow the logic chain (depth-first)
- **Knowledge synthesis:** Gather related context (breadth-first)

The hierarchy supports both—it's just the traversal strategy that differs.

---

## Further Reading

**In this vault:**
- [FOUNDATIONS.md](../FOUNDATIONS.md) — The principles these concepts support
- [Problem Types Framework](problem-types-framework.md) — Deterministic vs semantic deep dive
- [Access Model Implementation](../architecture/14-access-model-implementation.md) — Where access is enforced

**In B&G vault:**
- `PHILOSOPHICAL_FOUNDATIONS.md` — Full DMAF philosophical grounding
- `ABSTRACTION_AND_MORAL_ASYMMETRY.md` — Stacked abstractions analysis
- SEACOW framework documentation
