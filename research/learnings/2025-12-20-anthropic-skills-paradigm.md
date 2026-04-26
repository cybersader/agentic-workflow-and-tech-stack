---
created: 2025-12-20
updated: 2025-12-20
tags:
  - learned
  - anthropic
  - skills
  - agents
  - mcp
  - reference
  - architecture
source: "Anthropic DevDay Talk: Barry Zhang & Mahesh Murag - 'Don't Build Agents, Build Skills Instead'"
url: https://www.anthropic.com/devday
---

# Anthropic's Skills Paradigm: Don't Build Agents, Build Skills Instead

## The Core Thesis

> **"We think it's time to stop rebuilding agents and start building skills instead."**
> — Barry Zhang & Mahesh Murag, Anthropic DevDay

## What Are Skills?

**Official Definition:**
> "Skills are organized collections of files that package composable procedural knowledge for agents. In other words, they're folders."

### Key Design Principles

1. **Simplicity First**: Skills are just folders with markdown files
2. **Universal Access**: "Anyone, human or agent, can create and use them as long as they have a computer"
3. **Works With What You Have**: Git, Google Drive, zip files - standard file operations
4. **Code as Tools**: Scripts live in skills as self-documenting, modifiable tools

## Progressive Disclosure (Confirmed by Anthropic)

This validates our existing documentation:

> **"Skills are progressively disclosed. At runtime, only metadata is shown to the model. When an agent needs to use a skill, it can read in the rest of the skill.md"**

**How this maps to our model:**
- Level 1: Skill metadata (always in context, ~50-100 tokens)
- Level 2: SKILL.md (loaded when relevant, ~500-2000 tokens)
- Level 3+: Referenced files, scripts, assets (loaded as needed)
- Level ∞: Full knowledge via filesystem/search

**Connection to our docs:** This directly validates the progressive disclosure model in `docs/tools/agent-workflow-guide.md` (lines 527-595).

## Skills + MCP: Complementary, Not Competing

> **"MCP is providing the connection to the outside world while skills are providing the expertise."**

**The Emerging Architecture:**
```
Agent Runtime
├── Agent Loop (manages context, tokens in/out)
├── Runtime Environment (file system, code execution)
├── MCP Servers (connectivity to external data/tools)
└── Skills Library (domain expertise, procedural knowledge)
```

**Practical distinction:**
- **MCP**: "How do I call Home Assistant API?" (connectivity)
- **Skill**: "How do I check if a light is on and turn it off if needed?" (workflow expertise)

**Connection to our docs:** This aligns with our personal architecture (`docs/architecture/12-personal-architecture.md`) where MCP provides the gateway to services, and skills define how to use them.

## The Computing Stack Analogy

Anthropic's framework for understanding the agent stack:

| Layer | Computing | AI Agents |
|-------|-----------|-----------|
| **Hardware** | Processors | Models (Claude, GPT, Gemini) |
| **Operating System** | OS (Windows, Linux) | Agent Runtime (Claude Code, Cursor) |
| **Applications** | Apps (browser, IDE) | **Skills** (domain expertise) |

**Key insight:**
- Few companies build processors and OSes
- Millions of developers build applications
- Skills are the "application layer" for AI agents

**Implication:** Skills democratize agent capabilities. You don't need to rebuild the agent runtime - you just add skills.

## Skills Enable Continuous Learning

> **"This standardized format gives a very important guarantee. Anything that Claude writes down can be used efficiently by a future version of itself. This makes the learning actually transferable."**

**What this means:**
- Skills are Claude's "memory" across sessions (not just chat history)
- Claude can create skills for future Claude
- Knowledge compounds over time within an organization
- Day 30 Claude > Day 1 Claude (because of accumulated skills)

**Connection to our docs:** This validates our "files are memory" principle in `docs/FOUNDATIONS.md` and the self-improving knowledge pattern in `agent-workflow-guide.md`.

## Types of Skills in the Ecosystem

Anthropic identified three categories emerging since launch (5 weeks ago, thousands of skills created):

### 1. Foundational Skills
General or domain-specific capabilities the model didn't have before.

**Examples:**
- Anthropic's document skills (create/edit professional office docs)
- Cadence's scientific research skills (EHR data analysis, bioinformatics libraries)

### 2. Third-Party Skills
Partners building skills for their own products/APIs.

**Examples:**
- Browserbase: Stage hand browser automation skill
- Notion: Workspace navigation and research skills

### 3. Enterprise Skills
Company/team-specific skills for internal use.

**Examples:**
- Organizational best practices
- How to use bespoke internal software
- Code style enforcement (developer productivity teams)

**Connection to our use case:** Our home lab skills, MCP workflow skills, and fitness vault skills would be "enterprise" (personal) skills.

## Skills Are Getting More Complex

**Evolution observed:**
- **Basic**: Just a `SKILL.md` with prompts/instructions
- **Current**: Skills packaging software, executables, binaries, scripts, assets
- **Future**: Skills that take weeks/months to build and maintain (like traditional software)

**Implication:** Skills are not just "prompt templates" - they're becoming full software artifacts.

## Code Is All We Need

> **"Put simply, we think code is all we need."**

**The realization:**
- Originally thought each domain needs its own agent (finance agent, research agent, etc.)
- Actually, code is the "universal interface to the digital world"
- Claude Code is already a general-purpose agent
- **Example:** Financial report generation uses API calls, file organization, Python analysis, document synthesis - all through code

**Connection to our docs:** This aligns with our decision to use Claude Code as the primary interface, with MCP providing domain connectivity.

## Domain Expertise vs Raw Intelligence

The tax professional metaphor:

> **"Who do you want doing your taxes? A 300 IQ mathematical genius who figures out tax code from first principles, or an experienced tax professional?"**

**The problem with current agents:**
- Brilliant but lack expertise
- Can do "slow, amazing things" with guidance
- Missing important context upfront
- Don't absorb your expertise well
- Don't learn over time

**Skills solve this by:**
- Encoding domain expertise (not just intelligence)
- Providing consistent execution
- Accumulating organizational knowledge
- Making expertise transferable

## Future Directions (From Anthropic)

### 1. Treating Skills Like Software
- Testing and evaluation frameworks
- Tooling to ensure skills load/trigger correctly
- Output quality measurement
- **Connection:** We should version skills in Git, like we version code

### 2. Versioning
- Clear tracking of skill evolution
- Lineage of agent behavior changes
- **Connection:** Our Git-based approach already supports this

### 3. Dependencies and Composition
- Skills depending on other skills
- Skills depending on MCP servers
- Skills depending on packages/binaries in environment
- **Connection:** This would make skills more predictable across environments

### 4. Sharing and Distribution
- Collective, evolving knowledge base within orgs
- Community-built skills (like open source)
- Skills built elsewhere make your agents better
- **Connection:** Similar to how we use MCP servers from the community

## Organizational Vision

> **"A collecting and collective and evolving knowledge base of capabilities that's curated by people and agents inside of an organization."**

**How it works:**
1. New hire joins team → Claude already knows team conventions
2. Agent gets feedback → Gets better for everyone
3. Team accumulates skills → Agents improve over time
4. Community builds skills → Your agents benefit

**Connection to our docs:** This aligns with our `docs/learnings/` pattern where agents discover insights and write them down for future sessions.

## Key Quotes

**On simplicity:**
> "We want something that anyone human or agent can create and use as long as they have a computer."

**On progressive disclosure:**
> "At runtime, only metadata is shown to the model. When an agent needs to use a skill, it can read in the rest of the skill.md"

**On MCP + Skills:**
> "MCP is providing the connection to the outside world while skills are providing the expertise."

**On transferable learning:**
> "Anything that Claude writes down can be used efficiently by a future version of itself. This makes the learning actually transferable."

**On the new paradigm:**
> "We think it's time to stop rebuilding agents and start building skills instead."

## Connections to Our Existing Docs

### Validates Existing Concepts

1. **Progressive Disclosure** (`agent-workflow-guide.md`)
   - Anthropic confirms: metadata → SKILL.md → referenced files
   - Our implementation already follows this pattern

2. **Files Are Memory** (`FOUNDATIONS.md`)
   - Anthropic confirms: Skills are how Claude "remembers" across sessions
   - Our `docs/learnings/` pattern is the right approach

3. **MCP + Skills Complementary** (`12-personal-architecture.md`)
   - MCP = connectivity
   - Skills = expertise
   - Our architecture already separates these concerns

4. **Context Funneling** (`agent-workflow-guide.md`)
   - Progressive disclosure solves the gigabytes → 200K tokens problem
   - Skills orchestrate disclosure, not hold all knowledge

### New Insights to Incorporate

1. **Computing Stack Analogy**
   - Model = Processor
   - Runtime = OS
   - Skills = Applications
   - This is a powerful mental model to add to our docs

2. **Skills Enable Continuous Learning**
   - Skills aren't just for human-authored knowledge
   - Claude can create skills for future Claude
   - This strengthens the "agent-written learnings" pattern

3. **Three Types of Skills**
   - Foundational (new capabilities)
   - Third-party (partner products)
   - Enterprise (org-specific)
   - Helps categorize which skills to build vs consume

4. **Skills Are Evolving into Full Software**
   - Not just prompt templates
   - Can include executables, scripts, binaries
   - Implies: version control, testing, CI/CD for skills

## Practical Implications for Our Workflow

1. **Keep Skills in Git**
   - They're software artifacts now, not just prompts
   - Version them, test them, review them

2. **Let Claude Write Skills**
   - Use the skill-builder agent to create skills
   - Claude-written skills are usable by future Claude

3. **Separate MCP from Skills**
   - MCP servers = connectivity layer
   - Skills = expertise layer
   - Don't conflate the two

4. **Build Enterprise (Personal) Skills**
   - Home lab expertise
   - Fitness vault conventions
   - Project-specific workflows

5. **Think in Applications, Not Just Prompts**
   - Skills can package binaries, scripts, assets
   - Build robust, tested, versioned skills

## Questions This Raises

1. **Skill Discovery**: How does Claude decide which skill to use from hundreds?
   - Answer: Description field in metadata (our docs already cover this)

2. **Skill Conflicts**: What if two skills have overlapping descriptions?
   - Not addressed in talk - research needed

3. **Skill Testing**: How to validate a skill works as expected?
   - Anthropic mentioned this as a future direction
   - We could adopt test-driven skill development

4. **Skill Composition**: How do skills depend on each other?
   - Anthropic mentioned this as future work
   - Current workaround: skills reference files that other skills also use

## Sources

- **Video**: Anthropic DevDay Talk (December 2024)
- **Speakers**: Barry Zhang & Mahesh Murag, Anthropic
- **Title**: "Don't Build Agents, Build Skills Instead"
- **URL**: https://www.anthropic.com/devday
- **Context**: Talk delivered ~5 weeks after Claude Code skills launch

## Related Docs

- `docs/tools/agent-workflow-guide.md` - Progressive disclosure model (VALIDATED)
- `docs/FOUNDATIONS.md` - Files are memory principle (VALIDATED)
- `docs/architecture/12-personal-architecture.md` - MCP + Skills architecture (VALIDATED)
- `docs/tools/context-management.md` - Context funneling strategies (VALIDATED)
