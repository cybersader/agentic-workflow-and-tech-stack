---
created: 2025-12-17
updated: 2025-12-17
tags:
  - learned
  - architecture
  - access-control
  - wisdom
source: Claude.ai conversation (2025-12-17)
---

# Hierarchy + Graph Access Model

## The Key Insight

From research conversation on 12/17/2025:

> **"The hierarchy remains the access primitive. The graph is a navigation aid within granted scope."**

## The Problem

When giving AI agents access to file systems:
- Hierarchies give you **free access control** (the tree structure IS the permission)
- Graphs give you **free relationships** (but destroy natural scoping)

## The Solution

Don't give an agent "access to the graph." Give it access to a directory, and WITHIN that scope, the graph helps navigation.

**Metaphor:**
- File system = building with locked doors
- Graph = map on the wall inside each room
- The map doesn't unlock doors, but helps you understand the space once you're in

## Application to SEACOW

The hierarchical structure should reflect **domains of concern** or **spheres of responsibility**:
- Folder structure = what something IS (ontology)
- Tags/links = how things RELATE (epistemology)

## What This Means Practically

1. Access flows downward in hierarchy (fundamental, unchangeable)
2. Graph connections within scope are free navigation
3. Graph connections crossing scope boundaries require explicit permission
4. Skills/agents see their granted scope + can navigate via graph within it

## Distilled to FOUNDATIONS.md

This insight was distilled into the foundational `docs/FOUNDATIONS.md` document.
