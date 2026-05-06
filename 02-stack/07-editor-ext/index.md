---
title: 07 · Editor Extensions
description: VS Code extensions that complement the terminal-first workflow — terminal workspace management, image paste, AI assistance.
stratum: 2
status: research
sidebar:
  order: 1
tags:
  - stack
  - vscode
  - extensions
  - editor
date: 2026-04-17
branches: [agentic]
---

## The pattern (stratum 2)

The [AI coding CLI layer](../01-ai-coding/) deliberately puts agentic work in the terminal. The editor (VS Code) plays a **complementary, not primary** role:

- Visual diff and merge
- Large refactors across many files
- UI component preview
- Running tests with inline gutter results
- Managing multiple terminal sessions visually alongside the file tree

For this to work, a small set of extensions extends VS Code into a terminal-friendly workspace.

## Core editor

**VS Code** — my primary editor. Reasons: extension ecosystem, integrated terminal, remote SSH extension (useful even with Tailscale direct SSH for some tasks), no license friction.

Alternatives I don't use but are fine:
- **Cursor** — IDE-level AI integration. I don't use it because I want the AI in the terminal for portability, not tied to the editor.
- **Neovim / Helix** — terminal-native. Great if you prefer terminal everywhere; I use them only occasionally.
- **Zed** — fast, modern. Watching but not primary.

## Extensions I use (and author)

### My extensions

| Extension | Repo | Purpose |
|---|---|---|
| **Terminal Workspaces** | [vscode-terminal-workspaces](https://github.com/cybersader/vscode-terminal-workspaces) | Sidebar GUI for managing terminal sessions — tasks.json-syncable, works well with Claude Code / Gemini CLI / Codex CLI |
| **Terminal Image Paste** | [vscode-terminal-image-paste](https://github.com/cybersader/vscode-terminal-image-paste) | Paste clipboard images directly into terminal (alternative path to the [Zipline pipeline](../patterns/image-paste-pipeline.md)) |

### Standard quality-of-life

| Category | Extension |
|---|---|
| Git | GitLens (selective features — it can be noisy) |
| Markdown | Markdown All in One (shortcuts, TOC) |
| Editor | Editor Config, Prettier, ESLint (per-project as needed) |
| Language | Astro, Svelte, Rust Analyzer, Tauri extensions, etc. (per project) |
| Obsidian-style | "Foam" or vscode-memo if I'm editing my vault in VS Code (rare — Obsidian directly is preferred) |

### AI-adjacent I intentionally avoid

- **Copilot** — I'm already paying for Claude; don't need another AI autocomplete layer. And Copilot's suggestions often conflict with what Claude Code produces.
- **Continue.dev** — similar concern; ties AI to editor
- **Codeium** / **Tabnine** — same reasoning

If you want editor-level AI, pick one and stick with it. Layering them produces noisy suggestions.

## Configuration patterns

### settings.json (selected preferences)

```json
{
  "editor.fontFamily": "'JetBrains Mono', 'Menlo', monospace",
  "editor.fontLigatures": true,
  "terminal.integrated.fontFamily": "'JetBrains Mono'",
  "editor.rulers": [100],
  "editor.formatOnSave": true,
  "files.autoSave": "onFocusChange",
  "workbench.colorTheme": "<whatever matches current project theme>",
  "terminal.integrated.defaultProfile.linux": "bash"
}
```

### Workspace (per-project) vs user (global)

- **User settings** — editor behavior (font, keybindings, auto-save)
- **Workspace settings** — project-specific formatter config, language-specific behaviors
- **`.vscode/tasks.json`** — define `claude`, `gemini`, etc. launch tasks per workspace so Terminal Workspaces picks them up

## Keybindings I customize

See [`../profiles/keybindings/`](../profiles/keybindings/) for my keybinding config files (both VS Code and OpenCode/Zellij variants).

Notable customizations:
- Cmd/Ctrl+\` to cycle terminals
- Cmd/Ctrl+K Cmd/Ctrl+L to open a new Claude terminal in the active folder
- Custom layout shortcuts to match my Zellij keybindings so muscle memory carries

## When to use the editor vs terminal

Quick heuristic:

| Task | Tool |
|---|---|
| "Rename symbol across codebase" | Editor (VS Code's refactor tools) |
| "Explain how this function works / refactor it" | Terminal (Claude Code) |
| "Review a diff before commit" | Editor (GitLens diff view) |
| "Run the full test suite" | Terminal (direct test command) |
| "Find usages of X across project" | Editor (Go to References) |
| "Research an approach / explore a codebase" | Terminal (Claude Code + Explore agent) |
| "Merge a conflicted branch" | Editor (3-way merge view) |
| "Scaffold a new feature end-to-end" | Terminal (Claude Code with task_plan.md) |

## Integration with the rest of the stack

| Alongside | For |
|---|---|
| [01 · AI Coding CLIs](../01-ai-coding/) | Terminal runs inside editor for agentic work when useful |
| [02 · Terminal](../02-terminal/) | Terminal Workspaces extension manages these sessions visually |
| [06 · Dev Infra](../06-dev-infra/) | Git, Docker, etc. integrate with VS Code natively |

## Deep dives

- [Terminal Workspaces README](https://github.com/cybersader/vscode-terminal-workspaces)
- [Terminal Image Paste README](https://github.com/cybersader/vscode-terminal-image-paste)
