# Claude Code Sessions and Conversations

## My Use Case

I want to:
- See past prompts and responses when getting back into a Claude Code session
- Move conversation data between working directories (e.g., when reorganizing projects)
- Understand the layers: sessions vs context windows vs chat history

**Pain points:**
- Resume shows there was a conversation but doesn't re-render old messages
- History is tied to absolute path - move the folder and you "lose" memory
- No built-in export/import for session data
- Ideally I'd right-click a folder and choose "move + migrate Claude sessions"

**Current reality:** Claude Code is still maturing. Session management is basic but workable with the right patterns.

---

## Session Basics

Claude Code sessions are **tied to your project directory**. Each directory gets its own conversation history.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Session** | A running `claude` process with its chat history |
| **Context Window** | Maximum text Claude can see at once (auto-managed) |
| **Chat History** | Your messages + Claude's responses |
| **File Context** | Files Claude has read/edited in the session |

---

## Essential Commands

### Starting Sessions

```bash
# New session in current directory
claude

# Continue most recent session
claude --continue
claude -c

# Resume with session picker
claude --resume

# Resume specific session
claude --resume abc123
```

### In-Session Commands

```bash
/clear    # Wipe chat history, keep same project
/help     # Show available commands
```

---

## Session Storage

Claude stores session data in:
```
~/.claude/projects/
```

Folder names are your project's absolute path with slashes replaced by hyphens:
```
/Users/me/projects/myapp → -Users-me-projects-myapp
```

### Session Files

- `[session_id].jsonl` - Full conversation data
- `CLAUDE.md` - Project memory (you create this)

---

## Multiple Conversations

### Same Project, Different Topics

```bash
# Terminal 1: Feature work
claude

# Terminal 2: Bug fixes (separate session)
# Open new terminal in same directory
claude
```

Each terminal = separate session with separate history.

### Within One Session

```bash
# Clear history but stay in project
/clear

# Then start new topic
"New topic: Let's work on authentication now"
```

---

## Moving Session Data

Claude doesn't have built-in export. To move history to new directory:

### Manual Migration

1. Find the old folder:
```bash
cd ~/.claude/projects
ls -lht  # Most recent first
# Look for: -Users-me-old_project
```

2. Rename to new path:
```bash
mv -Users-me-old_project -Users-me-new_project
```

3. Resume in new location:
```bash
cd /new/project/path
claude --continue
```

### Using ccmanager (Recommended)

```bash
npm install -g ccmanager
ccmanager
# TUI to copy sessions between directories
```

---

## Viewing Past Sessions

### Ask Claude to Summarize

After resuming, ask:
```
Please summarize everything we've done so far, including key decisions and code changes.
```

### Export to File

```bash
claude --print > my_conversation_backup.txt
```

### VS Code Extension

"Claude Code Assist - Chat History & Diff Viewer" provides a UI for browsing session history.

---

## Best Practices

### 1. Use CLAUDE.md for Persistent Memory

Create `CLAUDE.md` in your project root:
```markdown
# Project Context

## Architecture
- Using Next.js with App Router
- PostgreSQL database

## Conventions
- Use TypeScript strict mode
- Follow ESLint rules

## Key Decisions
- [2025-01-15] Switched to tRPC for API
```

This file moves with your project and Claude reads it every session.

### 2. Directory = Workspace

- One repo/folder = one "workspace"
- Use `/clear` when changing topics within a project
- Use new terminal for parallel work

### 3. Session Hygiene

- `/clear` frequently to keep context focused
- Start fresh session for unrelated work
- Exit and restart when changing projects (`cd` doesn't reset context)

---

## VS Code + Obsidian Workflow

### Code Work (VS Code)

1. Open project in VS Code
2. Terminal → `claude`
3. New topic? `/clear` or new terminal

### Notes (Obsidian)

Create session notes:
```markdown
# Claude – Auth Refactor

## Session 1 (2025-01-16)
Terminal: VS Code Terminal #1

### Key prompts:
- "Scan routes/ and propose refactor plan"
- "Extract auth middleware"

### Decisions:
- Switched to zod for validation
- Split public/private routes

### Next steps:
- Add rate limiting
- Write tests
```

---

## Troubleshooting

### "Permission Denied" After Moving Project

Your session folder name doesn't match new path. Follow migration steps above.

### Lost Context After Resume

Claude has context but doesn't re-display it. Ask:
```
What were we working on? Give me a summary.
```

### Sessions Not Showing in Resume

Check that you're in the same directory where you originally ran Claude.
