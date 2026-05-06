---
stratum: 3
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion
argument-hint: "[focus: skills|agents|docs|all]"
branches: [agentic]
---

# Improve Workflow

Analyze recent work and suggest improvements to skills, agents, or documentation.

## Process

### Step 1: Analyze Conversation Context

Scan recent conversation for:

**Pattern Detection:**
- Same concepts explained multiple times → skill opportunity
- Same multi-step task repeated → agent opportunity
- Questions that took research → documentation gap
- User frustration or friction → workflow improvement

**Knowledge Discovery:**
- New domain concepts emerged
- Conventions discussed but not documented
- External information that should be internalized

**Workflow Observations:**
- Manual work that could be automated
- Repeated file/folder patterns
- Actions that would benefit from commands

### Step 2: Check Existing Components

Read current state:
- `.claude/skills/` - what skills exist?
- `.claude/agents/` - what agents exist?
- `CLAUDE.md` - current conventions
- `README.md` - documentation state

Compare against conversation:
- Is the discussed knowledge already captured?
- Are there outdated sections?
- Are there gaps?

### Step 3: Present Findings

Format findings clearly:

```
## Improvement Opportunities

Based on our work, I noticed:

### 1. Skill Opportunity: [Domain]
**Evidence:** [What I observed - e.g., "We discussed X conventions 4 times"]
**Recommendation:** Create [skill-name] skill with keywords: [keywords]
**Effort:** Low - just needs to capture our discussion

### 2. Documentation Gap: [Area]
**Evidence:** [What I observed - e.g., "You had to explain the folder structure"]
**Recommendation:** Add [section] to [file]
**Effort:** Low - information already known

### 3. Agent Opportunity: [Task]
**Evidence:** [What I observed - e.g., "We did the same 5 steps 3 times"]
**Recommendation:** Create [agent-name] agent to automate this
**Effort:** Medium - needs process documentation

---

Which would you like me to work on?
- [1] First improvement
- [2] Second improvement
- [3] Third improvement
- [A] All of them
- [N] None for now
```

### Step 4: Implement (If Approved)

Based on user selection:

**For new skill:**
1. Invoke skill-writer agent (or return request for orchestrator)
2. Provide: domain, keywords, content from conversation
3. Create skill file

**For documentation update:**
1. Read existing file
2. Add new section with discovered content
3. Preserve existing content

**For new agent:**
1. Invoke agent-writer agent (or return request for orchestrator)
2. Provide: purpose, tools needed, process steps
3. Create agent file

**For command creation:**
1. Create command file with proper frontmatter
2. Define allowed tools and behavior

### Step 5: Report Results

```
## Improvements Applied

### Created: .claude/skills/[name].md
- Keywords: [list]
- Purpose: [brief]

### Updated: README.md
- Added: [section name]
- Changed: [what changed]

### Created: .claude/agents/[name].md
- Purpose: [brief]
- Tools: [list]

---

The workflow now includes these enhancements. Use them in future work!
```

## Focus Options

If argument provided, filter analysis:

- `/improve skills` - Only look for skill opportunities
- `/improve agents` - Only look for agent opportunities
- `/improve docs` - Only look for documentation gaps
- `/improve all` (default) - Look for everything

## Examples

### Example: After Research Session

```
User: /improve

AI: Based on our work on the API integration, I noticed:

### 1. Skill Opportunity: REST API Patterns
**Evidence:** We discussed error handling, rate limiting, and auth
             patterns multiple times
**Recommendation:** Create rest-api-conventions skill
**Effort:** Low

### 2. Documentation Gap: Integration Guide
**Evidence:** We figured out the integration steps through trial/error
**Recommendation:** Document steps in README
**Effort:** Low

Which would you like? [1/2/A/N]

User: A

AI: Creating both...
[Creates skill and updates README]

Done! Created rest-api-conventions.md and updated README with
integration guide section.
```

### Example: After Code Review

```
User: /improve skills

AI: Looking specifically at skill opportunities...

### 1. Skill Opportunity: Code Review Checklist
**Evidence:** We applied the same 6 review criteria to each file
**Recommendation:** Encode as code-review-conventions skill
**Effort:** Low

Create this skill? [Y/N]

User: Y

AI: [Creates skill]

Created .claude/skills/code-review-conventions.md with your
6-point checklist. Will auto-load when reviewing code.
```

## Important Notes

- **Ask first, act second** - Never auto-modify without approval
- **Specific evidence** - Show what triggered each recommendation
- **Actionable recommendations** - Be specific about what to create/update
- **Respect "no"** - If declined, don't repeat immediately
- **Batch when sensible** - Offer to do multiple related improvements
