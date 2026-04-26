---
created: 2025-12-18
updated: 2025-12-18
tags:
  - guides
  - practical
  - code
  - deterministic
---

# Solving Deterministic Problems with Claude Code

Deterministic problems are **code, logic, structural** — things with formal foundations where you follow chains of reasoning. This guide shows how to practically solve them at scale.

**Key insight:** Depth-first traversal. Follow the logic chain until you understand, then backtrack.

---

## When to Use This Approach

- Debugging / tracing errors
- Understanding codebases
- Refactoring
- Adding features to existing code
- Code review
- Security audits of code

---

## The Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  DETERMINISTIC TRAVERSAL                                         │
│                                                                  │
│  1. Entry point → What calls this?                              │
│  2. Follow imports/dependencies → What does this use?           │
│  3. Trace data flow → Where does this value come from?          │
│  4. Follow types → What's the shape of this?                    │
│  5. Verify with tests → Does this actually work?                │
│                                                                  │
│  DEPTH-FIRST: Go deep into one path before exploring others     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Practical Claude Code Workflows

### 1. Understanding a Codebase (Cold Start)

```
Prompt: "I'm new to this codebase. Help me understand the architecture.
Start with the entry points and trace through the main flows."
```

**What Claude does:**
1. Uses `Glob` to find entry points (main.*, index.*, app.*)
2. Reads entry files with `Read`
3. Follows imports depth-first
4. Builds mental model, reports back

**Better prompt for large codebases:**
```
Use the Explore agent to map this codebase:
- Find all entry points
- Identify the major modules/layers
- Trace 2-3 key user flows
Report the architecture before we dive deeper.
```

### 2. Debugging an Error

```
Prompt: "I'm getting this error: [paste error + stack trace].
Trace through the code to find the root cause."
```

**What Claude does:**
1. Parses stack trace for file:line references
2. Reads the relevant files
3. Traces backward through the call chain
4. Identifies where the assumption breaks

**Pro tip:** Include the full stack trace. Claude can parse it.

### 3. Refactoring Safely

```
Prompt: "I want to rename this function from X to Y.
Find all usages and update them."
```

**What Claude does:**
1. `Grep` for the function name
2. Reads each file to understand context
3. Uses `Edit` to update each occurrence
4. Suggests test runs to verify

**For complex refactors:**
```
Use the Plan agent to design this refactor:
- What files are affected?
- What's the order of operations?
- What tests should pass after?
```

### 4. Adding a Feature

```
Prompt: "Add a logout button to the user menu.
Follow the existing patterns in the codebase."
```

**What Claude does:**
1. Searches for similar features (login, other menu items)
2. Identifies the patterns used
3. Proposes implementation following patterns
4. Makes changes with `Edit`

---

## Tool Usage for Deterministic Problems

| Task | Best Tool | Why |
|------|-----------|-----|
| Find entry points | `Glob` with patterns | Fast pattern matching |
| Find usages | `Grep` with symbol name | Finds all references |
| Understand a file | `Read` | Full context |
| Understand many files | `Explore` agent | Handles complexity |
| Plan complex changes | `Plan` agent | Thinks through implications |
| Make targeted edits | `Edit` | Precise, minimal changes |
| Run tests | `Bash` | Verify changes |

---

## Access Constraints for Code Problems

You're limited to what you can see (path-based access). Strategies:

### Working Directory Scope

```bash
# Run Claude from the project root
cd /path/to/project
claude
```

Now Claude sees everything under that directory.

### Multiple Codebases

If you need to reference multiple repos:

```bash
# Option 1: Run from parent directory
cd ~/projects
claude
# Can see project-a/, project-b/, etc.

# Option 2: Use symlinks
ln -s /path/to/shared-lib ./shared-lib
# Now it's in scope
```

### Monorepo Pattern

For monorepos, scope to what you need:

```bash
cd ~/monorepo/packages/frontend
claude
# Only sees frontend, not all packages
```

---

## Handling Large Codebases

When the codebase is too big to read entirely:

### 1. Use Subagents for Exploration

```
Use the Explore agent (very thorough) to understand:
- The authentication system
- How it connects to the user service
- What the token validation flow looks like
```

The Explore agent will read many files without filling your context.

### 2. Progressive Narrowing

```
1. First: "What are the main modules in this codebase?"
2. Then: "Tell me about the auth module"
3. Then: "Show me the token validation function"
4. Then: "Now let's fix the bug in that function"
```

### 3. Targeted Searches

```
Prompt: "Search for where JWT tokens are validated.
Use Grep to find jwt.verify or similar patterns."
```

---

## Common Patterns

### Following Imports (JavaScript/TypeScript)

```
Prompt: "Start at src/index.ts and trace through:
- What does it import?
- What do those files import?
- Build a dependency graph 2 levels deep."
```

### Following Types (TypeScript)

```
Prompt: "Find the User type definition and trace:
- Where is it defined?
- What interfaces does it extend?
- Where is it used?"
```

### Following API Calls

```
Prompt: "Find all API endpoints in this codebase.
For each endpoint:
- What route handles it?
- What service does it call?
- What database queries does it make?"
```

---

## When Deterministic Meets Semantic

Sometimes you need context that's not in the code:

```
Prompt: "This function is called 'processLegacyOrder'.
I need to understand:
1. What the code does (deterministic - read the code)
2. WHY it does this (semantic - check docs, comments, git history)"
```

For the semantic part, you might need:
- Git blame: `git log -p -- path/to/file`
- Documentation in docs/ folder
- Obsidian notes about the system

---

## See Also

- [Solving Semantic Problems](solving-semantic-problems.md) — For knowledge/research tasks
- [Agent Workflow Guide](../tools/agent-workflow-guide.md) — When to use subagents
- [Problem Types Framework](../research/problem-types-framework.md) — Theory behind this
