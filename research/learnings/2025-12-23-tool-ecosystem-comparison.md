---
created: 2025-12-23
updated: 2025-12-23
tags:
  - research
  - tools
  - agents
  - comparison
  - learned
---

# AI Coding Tool Ecosystem Comparison

**Source:** Research on oh-my-opencode, wshobson/agents, AGENTS.md standard, Gemini CLI, OpenAI Codex, and Cline

---

## Tool Feature Matrix

| Feature | Claude Code | oh-my-opencode | wshobson/agents | Gemini CLI | Codex | Cline |
|---------|-------------|----------------|-----------------|------------|-------|-------|
| **Recursive Agents** | NO | YES (via OpenCode) | NO (plugin-based) | NO | NO | NO |
| **Hooks System** | Documented, NOT working | YES (4 hook types) | NO | NO | NO | NO |
| **AGENTS.md Support** | Via @reference | Native | Native | Planned | Native | Via .clinerules |
| **Multi-Model Agents** | NO | YES | YES | YES | NO | NO |
| **Plugin Marketplace** | YES (limited) | NO | YES (67 plugins) | Extensions | NO | NO |
| **LSP Integration** | NO | YES (rename, actions) | NO | NO | NO | NO |
| **Session Recovery** | NO | YES | NO | NO | NO | NO |
| **Context Anxiety Mgmt** | NO | YES (70% warning) | NO | NO | NO | NO |
| **Background Agents** | NO | YES (parallel) | NO | NO | NO | NO |
| **Todo Enforcement** | NO | YES | NO | NO | NO | NO |

---

## oh-my-opencode: Key Features Your Workflow Lacks

### 1. Working Hooks System

**What it does:**
```json
{
  "hooks": {
    "PreToolUse": [{ "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "eslint --fix $FILE" }] }],
    "PostToolUse": [...],
    "UserPromptSubmit": [...],
    "Stop": [...]
  }
}
```

**Gap in your workflow:** Your ARCHITECTURE.md correctly notes Claude Code hooks are "documented but NOT functional." oh-my-opencode actually implements them.

**Recommendation:** If you use OpenCode, leverage hooks. For Claude Code, continue using the delegation-advisor pattern.

### 2. Background Agent Orchestration

**What it does:** "Have GPT debug while Claude tries different approaches...Gemini writes frontend while Claude handles backend."

**Gap:** Your workflow is sequential (context funneling). oh-my-opencode enables TRUE parallel multi-model execution.

### 3. Todo Continuation Enforcer

**What it does:** Forces agents to complete all TODOs before stopping.

**Gap:** Your workflow relies on manual TodoWrite tracking. This is an automated enforcement mechanism.

### 4. Context Window Anxiety Management

**What it does:** At 70%+ token usage, reassures agents there's remaining capacity.

**Gap:** Your "dumb zone" documentation is educational but doesn't have automated mitigation.

### 5. Session Recovery

**What it does:** "Automatically recovers from session errors (missing tool results, thinking block issues, empty messages)."

**Gap:** No equivalent in your workflow.

### 6. LSP Operational Tools

**What it does:** `lsp_rename` for cross-workspace refactoring, `lsp_code_actions` for quick-fixes.

**Gap:** Your workflow doesn't leverage LSP for refactoring automation.

---

## wshobson/agents: Plugin Architecture Patterns

### 1. Three-Tier Skill Loading

```
Tier 1: Metadata (always present)
Tier 2: Instructions (activated contextually)
Tier 3: Resources (loaded on-demand)
```

**Gap:** Your skills load entirely or not at all. Progressive disclosure could save context.

### 2. Plugin Isolation

"Each plugin loads only its specific agents, commands, and skills"

**Gap:** Your agents inherit all tools if not specified. More granular isolation could help.

### 3. Orchestration Commands

`/full-stack-orchestration:full-stack-feature "user authentication"` triggers 7+ agents sequentially.

**Your equivalent:** Your `context funneling` pattern achieves similar results manually.

### 4. Model Tiering Strategy

```
Opus 4.5 → Architecture, security (critical)
Sonnet 4.5 → Development (balanced)
Haiku 4.5 → Deployment, operations (fast)
```

**Gap:** Your agents mostly use `model: sonnet`. You could optimize with tiered model selection.

---

## Gemini CLI: Unique Patterns

### 1. GEMINI.md Files

Similar to CLAUDE.md but for Gemini-specific instructions.

### 2. Conductor Extension

Uses persistent Markdown files for specs and plans rather than ephemeral chat.

**Similarity:** Your plan files in `.claude/plans/` achieve similar persistence.

### 3. MCP Support

"Building on emerging standards like MCP, system prompts (via GEMINI.md)"

**Gap:** Your MCP gateway research is thorough but you don't document Gemini MCP integration.

---

## OpenAI Codex: AGENTS.md Chain Discovery

### Discovery Order
1. `~/.codex/AGENTS.override.md` or `AGENTS.md` (global)
2. Walk from repo root to CWD, collecting `AGENTS.md` at each level
3. Merge in order (root → leaf)

**Gap:** Your workflow uses AGENTS.md but doesn't document this hierarchical discovery pattern.

### Fallback Names
`AGENTS.override.md`, `AGENTS.md`, `TEAM_GUIDE.md`, `.agents.md`

**Gap:** You only use AGENTS.md. Codex supports multiple fallback names.

---

## Cline: Context Management

### .clinerules Files

Cline uses `.clinerules` files for project-specific instructions (similar to AGENTS.md).

### Memory Bank Pattern

Cline's context engineering approach focuses on "memory banks" for persistent context.

**Gap:** Your research/learnings/ directory serves a similar purpose but isn't documented as a "memory bank" pattern.

---

## What Your Workflow Does Well (Validated)

| Your Pattern | Status |
|--------------|--------|
| SEACOW meta-framework | Unique - not found elsewhere |
| Skills vs Agents distinction | Well-documented, accurate |
| Context funneling | Standard pattern, well-explained |
| Delegation advisor pattern | Novel solution for Claude Code limitations |
| YAML frontmatter for agents | Correct format per official docs |
| "Use PROACTIVELY when" descriptions | Best practice, confirmed |

---

## Recommended Improvements

### High Priority

1. **Add Model Tiering to Agents**
   - Use Haiku for exploration (fast, cheap)
   - Use Sonnet for development (balanced)
   - Reserve Opus for architecture decisions

2. **Document AGENTS.md Hierarchy**
   - Codex supports nested AGENTS.md per directory
   - Consider adopting this pattern for monorepos

3. **Add Progressive Skill Loading**
   - Tier 1: YAML description + summary (Claude discovers via description field)
   - Tier 2: Core patterns
   - Tier 3: Deep examples (load on request)
   - Note: Skills discovered via YAML `description`, NOT keywords. See `2025-12-23-skill-mechanism-correction.md`

### Medium Priority

4. **Create OpenCode-Specific Guide**
   - Document working hooks
   - Background agent orchestration
   - Session recovery patterns

5. **Add Todo Enforcement Pattern**
   - Could be a skill that reminds about incomplete todos
   - Or leverage oh-my-opencode if using OpenCode

6. **Context Window Monitoring**
   - Document the 70% threshold
   - Add guidance for when to compress/offload

### Lower Priority

7. **LSP Integration Documentation**
   - If using OpenCode, document LSP refactoring tools
   - Research if Claude Code will add this

8. **Multi-Model Orchestration**
   - Document how to use different models per task
   - Only relevant if using oh-my-opencode

---

## Testing Process Recommendations

### Multi-Tool Test Directory Structure

```
test-workspace/
├── .claude/                    # Claude Code config
│   ├── agents/
│   ├── skills/
│   └── commands/
├── .opencode/                  # OpenCode config (oh-my-opencode)
│   └── oh-my-opencode.json
├── AGENTS.md                   # Universal (Codex, Gemini, Cline)
├── GEMINI.md                   # Gemini-specific
├── .clinerules                 # Cline-specific
├── test-scenarios/
│   ├── 01-skill-loading/       # Test description-based skill discovery
│   ├── 02-agent-invocation/    # Test proactive agent triggering
│   ├── 03-delegation/          # Test delegation-advisor pattern
│   ├── 04-context-funneling/   # Test multi-agent sequential
│   └── 05-hooks/               # Test hooks (OpenCode only)
├── TESTING.md                  # Test instructions
└── RESULTS.md                  # Track results per tool
```

### Test Scenarios

| Scenario | Tests | Tools |
|----------|-------|-------|
| Skill Loading | Description-based skill discovery | All |
| Agent Proactive | "Use PROACTIVELY" triggers agent | Claude Code, OpenCode |
| Delegation | Ask-first pattern works | Claude Code |
| Multi-Agent | Sequential context funneling | All |
| Hooks | Pre/Post tool hooks fire | OpenCode only |
| Background Agents | Parallel execution | OpenCode only |
| AGENTS.md Hierarchy | Nested files merge correctly | Codex, Gemini |

---

## Sources

- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
- [wshobson/agents](https://github.com/wshobson/agents)
- [AGENTS.md Standard](https://agents.md/)
- [Gemini CLI Blog](https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/)
- [Codex AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md/)
- [Conductor for Gemini CLI](https://developers.googleblog.com/conductor-introducing-context-driven-development-for-gemini-cli/)
