---
name: seacow-conventions
description: SEACOW meta-framework expertise for organizational design. Use when designing structures, analyzing systems, asking 'where should this go', creating conventions for projects/vaults, or understanding organizational patterns.
title: "SEACOW Meta-Framework: Analytical Lens for Organization"
stratum: 2
branches: [agentic]
---

## Purpose
Expertise in using SEACOW as an analytical lens for designing and understanding organizational structures. This skill teaches you HOW TO THINK about organization, not what folders to create.

---

## Critical Understanding

**SEACOW IS NOT A FOLDER STRUCTURE.**

SEACOW is a meta-framework - a set of questions and categories for ANALYZING any organizational system, whether it's:
- A personal Obsidian vault
- A corporate file share
- A code repository
- A Claude Code project
- A Notion workspace
- A physical filing cabinet

---

## The Framework: S.E.A.(C.O.W.r)

### System (S)
**Question:** What platform/technology context are we in?

**Examples:**
- Obsidian vault with plugins
- Windows SMB file share
- Git repository
- Notion workspace
- Claude Code `.claude/` directory
- Physical office with file cabinets

**Analysis:** The system determines your constraints and affordances:
- Can you use tags? Properties? Wikilinks? Only folders?
- Is it hierarchical? Graph-based? Database-like?
- Who has access? What are the permissions?
- Is it versioned? Searchable? Shareable?

### Entity (E)
**Question:** WHO accesses or interacts with this?

**Examples:**
- Just you (personal knowledge base)
- Multiple teams (engineering, marketing, sales)
- Public audiences (blog readers, recruiters)
- AI agents (Claude, custom tools)
- Mix of internal/external stakeholders

**Analysis:** Entities create natural boundaries:
- Personal vs shared spaces
- Read-only vs read-write access
- Different views of the same content
- Audience-specific outputs

### Activities (A)

These are the three fundamental activities that happen to information:

#### Capture (C)
**Question:** Where and how does information ENTER the system?

**NOT prescribing:** "You must have a `/Capture/` folder"

**Instead asking:**
- Where do raw inputs land?
- How do you save things for later?
- What's your "inbox" (whatever you call it)?
- Where does unprocessed information live?

**Example implementations:**
- Personal vault: `Inbox/`, `Clippings/`, `Quick Notes/`
- Corporate share: `Teams/[name]/Drop/`, `Incoming/`, `Submissions/`
- Code repo: `docs/ADRs/`, issue templates, `raw-data/`
- Email: Inbox, unread messages
- Physical: In-tray on desk

#### Work (W)
**Question:** Where and how does information get PROCESSED?

**NOT prescribing:** "You must have a `/Work/` folder"

**Instead asking:**
- Where does active processing happen?
- What's the difference between raw input and finished output?
- Where do you iterate, refine, synthesize?
- What's "in progress" vs "done"?

**Example implementations:**
- Personal vault: `Projects/`, `Zettelkasten/`, `Active/`
- Corporate share: `Teams/[name]/Active/`, `WIP/`, `Drafts/`
- Code repo: `src/`, `tests/`, `docs/drafts/`
- Email: Flagged, folders, drafts
- Physical: Working files on desk, active project folders

#### Output (O)
**Question:** Where and how does finished information EXIT to consumers?

**NOT prescribing:** "You must have an `/Output/` folder"

**Instead asking:**
- Where do finished artifacts go?
- What's ready for an audience?
- How do you distinguish drafts from published work?
- What leaves your control (shared, published, delivered)?

**Example implementations:**
- Personal vault: `Blog/`, `Published/`, `Presentations/`, `Portfolio/`
- Corporate share: `Shared/Reports/`, `Public/`, `Client Deliverables/`
- Code repo: `dist/`, `build/`, `docs/api/`, releases
- Email: Sent folder, templates
- Physical: Outbox, filed completed work

### Relation (r)
**Question:** How do things CONNECT across the structure?

**NOT prescribing:** "Use these exact tags"

**Instead asking:**
- How do you link related items?
- How do you track dependencies?
- How do you navigate cross-cutting concerns?
- What's your graph/network layer?

**Example implementations:**
- Obsidian: Wikilinks, tags, graph view, Dataview queries
- File share: Shortcuts, README files, index documents
- Code repo: Import statements, references, dependency graphs
- Notion: Relations, mentions, backlinks
- Physical: Cross-reference notes, index cards

---

## How to Use SEACOW: The Analysis Process

### Step 1: Identify Your System
What platform/context are you in? What are its affordances?

Example: "I'm using Obsidian with Templater and Dataview plugins. I have wikilinks, tags, and properties available."

### Step 2: Identify Your Entities
Who accesses this? Are there boundaries between different users/audiences?

Example: "Just me, but I share some notes publicly on my blog."

### Step 3: Map Activities

**For Capture:**
- Where do things land when you first encounter them?
- What's raw/unprocessed?
- Examples: Web clipper → `Clippings/`, voice notes → `Inbox/`, PDFs → `References/`

**For Work:**
- Where do you process/refine/synthesize?
- What's the workspace?
- Examples: Active projects, permanent notes, drafts

**For Output:**
- What's finished and ready for consumption?
- Where do published/delivered artifacts live?
- Examples: Blog posts, presentations, client deliverables

**For Relation:**
- How do you connect things?
- What's your linking/tagging strategy?
- Examples: Tags for topics, wikilinks for connections, MOCs for structure

### Step 4: Design Your Structure

Based on your analysis, create a structure that fits YOUR context.

---

## Diagnostic Questions

When you're stuck organizing something, ask:

1. **Is this raw input or processed?**
   - Raw → Capture area
   - Processed → Work or Output area

2. **Is this finished or in progress?**
   - Finished → Output area
   - In progress → Work area

3. **Who is this for?**
   - Just me processing → Work area
   - An audience → Output area
   - Future me to process → Capture area

4. **Does this support the system itself?**
   - Yes → System area (templates, config, meta)
   - No → Content area (capture, work, output)

5. **How does this connect to other things?**
   - Use your system's relation layer (tags, links, properties)

---

## Anti-Patterns to Avoid

### Don't Copy Blindly
❌ "I'll create `/Capture/`, `/Work/`, `/Output/` because SEACOW says so"
✓ "Let me think about where information enters, gets processed, and exits MY system"

### Don't Force the Framework
❌ "This doesn't fit any SEACOW category, so I don't know where to put it"
✓ "SEACOW is a lens, not a prison. Some things span categories or don't fit neatly."

### Don't Ignore Your Platform
❌ "I'll use this exact tag structure even though my system doesn't support tags"
✓ "My platform uses database properties, so I'll adapt the SEACOW activities to that"

### Don't Forget Evolution
❌ "I must get the perfect SEACOW structure before I start"
✓ "I'll start with a basic structure and refine as I learn how I actually work"

---

## Summary: The Core Insight

**SEACOW is about asking the right questions:**

- Where does information **ENTER**? (Capture)
- Where does it get **PROCESSED**? (Work)
- Where does it **EXIT**? (Output)
- What **PLATFORM** are you on? (System)
- **WHO** interacts with it? (Entity)
- How do things **CONNECT**? (Relation)

Answer these for YOUR context, and design a structure that fits. Don't copy folder names. Copy the thinking process.
