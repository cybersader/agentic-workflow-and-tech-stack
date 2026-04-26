---
created: 2025-12-18
updated: 2025-12-18
tags:
  - guides
  - practical
  - knowledge
  - semantic
  - research
---

# Solving Semantic Problems with Claude Code

Semantic problems are **knowledge, meaning, research** — things where you need to gather context, synthesize information, and make interpretive judgments. This guide shows how to practically solve them at scale.

**Key insight:** Breadth-first traversal. Gather related information, then synthesize.

---

## When to Use This Approach

- Research and learning
- Writing documentation
- Synthesizing information from multiple sources
- Answering "why" questions (not just "what")
- Knowledge base curation
- Summarization and explanation

---

## The Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  SEMANTIC TRAVERSAL                                              │
│                                                                  │
│  1. Cast wide → What topics relate to this?                     │
│  2. Gather sources → What do different sources say?             │
│  3. Find connections → How do these ideas relate?               │
│  4. Synthesize → What's the coherent picture?                   │
│  5. Verify coherence → Does this make sense together?           │
│                                                                  │
│  BREADTH-FIRST: Gather related context before going deep        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Practical Claude Code Workflows

### 1. Researching a Topic

```
Prompt: "Research MCP gateway implementations.
- Check my Obsidian vault for existing notes
- Search the web for recent announcements
- Check GitHub for active projects
- Synthesize findings into a summary"
```

**What Claude does:**
1. `obsidian-mcp` search for existing notes
2. `WebSearch` for current information
3. `github-mcp` search for repos
4. Synthesize and optionally write to vault

### 2. Writing Documentation

```
Prompt: "Write documentation for the authentication system.
- Read the code to understand what it does
- Check existing docs for context/history
- Explain it for a new developer
- Add to docs/architecture/"
```

**What Claude does:**
1. Reads code (deterministic part)
2. Searches for related docs (semantic context)
3. Synthesizes into coherent explanation
4. Writes with frontmatter

### 3. Knowledge Synthesis

```
Prompt: "I've collected notes on AI security from 3 conferences.
Synthesize them into a single reference document.
Identify common themes and unique insights."
```

**What Claude does:**
1. Reads all source files
2. Identifies themes across sources
3. Organizes by concept, not source
4. Attributes insights to sources

### 4. Answering "Why" Questions

```
Prompt: "Why does this codebase use this particular auth pattern?
Check:
- Code comments
- Git history
- Related documentation
- Team conventions"
```

---

## Tool Usage for Semantic Problems

| Task | Best Tool | Why |
|------|-----------|-----|
| Search vault | `obsidian-mcp` | Semantic search in notes |
| Search web | `WebSearch` | Current information |
| Search GitHub | `github-mcp` | Projects, discussions |
| Get video content | `youtube-mcp` | Conference talks, tutorials |
| Read multiple files | `Read` in parallel | Gather context quickly |
| Explore codebase for context | `Explore` agent | Handles breadth |
| Write results | `Edit` or `Write` | Persist findings |

---

## Access Constraints for Knowledge Problems

Semantic problems often need **cross-cutting access** — information that spans folders.

### Using Obsidian MCP

```yaml
# Obsidian MCP gives search across entire vault
mcpServers:
  obsidian:
    env:
      VAULT_PATH: /home/user/vault  # Full vault scope
```

**Searching by topic (pseudo tag-based):**
```
Prompt: "Search my Obsidian vault for all notes about 'MCP security'.
Include notes that mention these topics even if not tagged."
```

### Using Multiple Sources

```
Prompt: "Research this topic using:
1. My Obsidian vault (obsidian-mcp)
2. Recent web articles (WebSearch)
3. GitHub repos (github-mcp)
4. YouTube talks (youtube-mcp)

Cross-reference and synthesize."
```

### Web Research

```
Prompt: "Search the web for recent information about [topic].
Focus on:
- Official announcements
- Technical blog posts
- GitHub discussions
Give me sources I can verify."
```

---

## Handling Large Knowledge Bases

### 1. Start with Search, Not Browse

```
# Bad: "Read all my notes about security"
# Good: "Search my vault for notes matching 'MCP security' and 'prompt injection'"
```

Search narrows scope; browsing fills context.

### 2. Use Progressive Refinement

```
1. "What topics in my vault relate to AI agents?"
2. "Show me the notes about agent security specifically"
3. "Now synthesize those into a single reference"
```

### 3. Explicit Source Attribution

```
Prompt: "For each insight, note which source it came from.
I need to be able to verify and update later."
```

---

## Common Patterns

### Literature Review Pattern

```
Prompt: "Do a literature review on [topic]:
1. Search my vault for existing notes
2. Search web for recent papers/posts
3. Identify key themes
4. Note gaps in my knowledge
5. Write summary to docs/research/"
```

### Competitive Analysis Pattern

```
Prompt: "Compare [Tool A] vs [Tool B]:
1. Search for documentation on each
2. Find user experiences/reviews
3. Create comparison table
4. Note which is better for [use case]"
```

### Knowledge Capture Pattern

```
Prompt: "I just had a conversation about [topic].
Extract the key insights and:
1. Check if docs/learnings/ already has this
2. If new, create docs/learnings/YYYY-MM-DD-topic.md
3. If exists, update the existing doc
4. Use proper frontmatter"
```

### FAQ Generation Pattern

```
Prompt: "Based on my notes about [topic]:
1. Identify common questions someone might have
2. Find answers in the existing documentation
3. Generate an FAQ section
4. Note any unanswered questions"
```

---

## When Semantic Meets Deterministic

Sometimes you need both:

```
Prompt: "Help me understand this system:
1. DETERMINISTIC: What does the code actually do?
   - Read the implementation
   - Trace the data flow
2. SEMANTIC: What is it supposed to do and why?
   - Check documentation
   - Look at design docs
   - Search for related discussions
3. SYNTHESIS: Are they aligned? What's missing?"
```

---

## Quality Verification

Semantic work needs coherence checking:

### Internal Consistency

```
Prompt: "Review what you've written.
Does it contradict itself anywhere?
Are the claims supported by the sources?"
```

### Source Verification

```
Prompt: "For each major claim, show me where it came from.
Flag anything that's inference vs direct source."
```

### Gap Analysis

```
Prompt: "What questions remain unanswered?
What would I need to research further?"
```

---

## Output Conventions

When writing semantic findings to the vault:

### Frontmatter

```yaml
---
created: 2025-12-18
updated: 2025-12-18
tags:
  - research
  - [topic]
sources:
  - url or file path
  - attribution
---
```

### Structure

```markdown
# Topic

## Summary
[2-3 sentence overview]

## Key Findings
- Finding 1 (source)
- Finding 2 (source)

## Open Questions
- What we don't know yet

## Sources
- [Source 1](link)
- [Source 2](link)
```

---

## See Also

- [Solving Deterministic Problems](solving-deterministic-problems.md) — For code/structural tasks
- [Agent Workflow Guide](../tools/agent-workflow-guide.md) — When to use subagents
- [Problem Types Framework](../research/problem-types-framework.md) — Theory behind this
- [Pragmatic Workflow Guide](../personal-workflow/pragmatic-workflow-guide.md) — Daily workflows
