---
date created: 2025-12-29
tags:
  - tools
  - ai-agents
  - terminal
  - hidden-gem
source: https://github.com/batrachianai/toad
verdict: hidden-gem
---

# Toad: Universal Terminal Interface for AI Agents

## Verdict: Hidden Gem

Worth adopting if you're terminal-first with AI agents. The UX improvements over raw terminals are significant.

---

## What Is Toad?

**Not a terminal emulator** - it's a unified TUI wrapper that runs AI coding agents through a single polished interface. Built on the Textual framework by Will McGugan (creator of Rich and Textual).

Think: IDE for terminal-based AI agents.

---

## Why It's Different

| Aspect | Regular Terminal | Toad |
|--------|-----------------|------|
| **Purpose** | General shell | AI agent interface |
| **Screen updates** | Full redraws (flickering) | Character-level (smooth) |
| **Scrollback** | Garbled with TUI apps | Works, interactive |
| **Markdown** | Plain text | Rendered with syntax highlighting |
| **Agent switching** | Learn each CLI | One interface for all |

---

## Supported Agents (12+)

- OpenHands
- Claude Code
- Gemini CLI
- Codex CLI
- goose
- Any ACP-compatible agent

Uses **Agent Client Protocol (ACP)** - standardized JSON-RPC protocol for vendor-agnostic agent integration.

---

## Killer Features

1. **No visual artifacts** - Character-level updates mean smooth UX while agents think
2. **Persistent scrollback** - Scroll back and interact with outputs (broken in most terminal TUIs)
3. **Fuzzy file context** - "@" convention with fuzzy search + `.gitignore` filtering
4. **Interactive shell** - Commands with "!" prefix run with full color/interactivity
5. **Notebook ergonomics** - Navigate blocks, export to SVG, copy without formatting loss
6. **Unified experience** - One interface for Claude Code, OpenHands, Gemini, etc.

---

## Technical Details

- **Framework:** Textual (Python)
- **License:** AGPL 3.0
- **GitHub stars:** 1.3k+
- **Latest release:** v0.5.13 (Dec 29, 2025)
- **Commits:** 598+
- **Author:** Will McGugan (Rich, Textual - proven pedigree)

---

## Limitations

- **Linux/macOS only** - Windows requires WSL
- **Early stage** - v0.5.x, some features still coming
- **Missing (as of Dec 2025):**
  - Multi-agent sessions
  - MCP server UI
  - Model selection UI
  - Native Windows support

---

## When to Use

**Adopt if:**
- You spend 2+ hours/day in terminal AI agents
- You want vendor independence (switch agents easily)
- You work headless/remote
- You want to avoid Electron/VS Code bloat

**Skip if:**
- You're IDE-first (use VS Code/JetBrains extensions instead)
- You're Windows-native without WSL
- You only use one agent (just use its native CLI)
- You need advanced features now (sessions still coming)

---

## Installation

```bash
# Requires Python 3.10+
pip install toad-ai

# Or with pipx (recommended)
pipx install toad-ai

# Launch with an agent
toad openhands
toad claude
toad gemini
```

---

## Comparison to Our Stack

| Tool | What It Is | When to Use |
|------|-----------|-------------|
| **Claude Code** | Agent CLI | Direct, reliable, works in tmux |
| **OpenCode** | Agent CLI | Recursive agents, but tmux issues |
| **Toad** | Agent wrapper | Unified UX for multiple agents |
| **WezTerm** | Terminal emulator | Run any of the above |

Toad sits on top of the agent CLIs - it's not a replacement but an enhancement layer.

---

## Risk Assessment

**Low risk:**
- Open source (AGPL)
- Proven author (Rich/Textual track record)
- Active development
- OpenHands sponsorship signals institutional confidence

**Worst case:** You stop using it and go back to raw CLI.
**Best case:** Years of QoL improvements for terminal AI work.

---

## Links

- [Toad GitHub](https://github.com/batrachianai/toad)
- [Will McGugan's Release Post](https://willmcgugan.github.io/toad-released/)
- [OpenHands + Toad Partnership](https://www.openhands.dev/blog/20251218-openhands-toad-collaboration)
- [Agent Client Protocol](https://github.com/zed-industries/agent-client-protocol)
- [InfoQ Coverage](https://www.infoq.com/news/2025/12/llm-agent-cli/)

---

## My Use Case Notes

**Pain points this addresses:**
- Flickering/garbled output when AI agents update
- Having to learn different UIs for different agents
- Poor scrollback in terminal TUI apps

**Questions to answer:**
- Does it work well with Claude Code specifically?
- How does it handle long-running agent tasks?
- Can it replace my tmux workflow or complement it?

**Testing priority:** Medium - try after WezTerm/OpenCode testing
