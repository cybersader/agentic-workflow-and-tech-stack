---
title: Recommended terminal stack
description: Opinionated picks at each layer of the agentic terminal stack. Windows Terminal + Zellij + Portagenty + bash. Portable pattern — adoptable by anyone doing agentic coding on Windows+WSL.
stratum: 2
status: stable
sidebar:
  order: 0
tags:
  - stack
  - terminal
  - windows-terminal
  - zellij
  - portagenty
date: 2026-04-18
branches: [agentic]
---

Same [three-layer model](../../../agent-context/zz-research/2026-04-18-terminal-emulator-stack.md), concrete lightweight picks. Minimum friction, no premature optimization.

> **Keystrokes flow top → bottom.** First layer to match a binding eats the key; lower layers never see it.

<div style="border: 2px solid currentColor; padding: 1em; margin: 1em 0; background: rgba(128,128,128,0.04); border-radius: 6px;">
  <strong>Terminal Emulator</strong> &nbsp;·&nbsp; <a href="https://github.com/microsoft/terminal"><strong>Windows Terminal</strong></a> &nbsp;<em>(pre-installed; zero setup)</em>
  <div style="border: 2px solid currentColor; padding: 1em; margin: 0.6em 0; background: rgba(128,128,128,0.08); border-radius: 6px;">
    <strong>Multiplexer</strong> &nbsp;·&nbsp; <a href="https://zellij.dev"><strong>Zellij</strong></a> &nbsp;<em>(status bar shows all keys — no memorization)</em>
    <div style="border: 2px solid currentColor; padding: 1em; margin: 0.6em 0; background: rgba(128,128,128,0.12); border-radius: 6px;">
      <strong>Launcher</strong> &nbsp;·&nbsp; <a href="https://github.com/cybersader/portagenty"><strong>Portagenty</strong></a> &nbsp;<em>(TOML-defined workspaces; one command to land)</em>
      <div style="border: 2px solid currentColor; padding: 0.8em 1em; margin: 0.6em 0 0 0; background: rgba(128,128,128,0.18); border-radius: 6px;">
        <strong>Shell / App</strong> &nbsp;·&nbsp; <strong>bash</strong> + <a href="https://claude.com/claude-code"><strong>Claude Code</strong></a>
      </div>
    </div>
  </div>
</div>

## Why these picks

| Layer | Why lightweight | Deep dive |
|---|---|---|
| Windows Terminal | Pre-installed, command palette (`Ctrl+Shift+P`) as discovery layer — no memorization needed. | [hotkey-reference](./hotkey-reference.md#emulator-windows-terminal-defaults) |
| Zellij | Status bar teaches itself — better ergonomics than tmux for anyone new. Survives SSH disconnect. | [hotkey-reference](./hotkey-reference.md#multiplexer-zellij-defaults) · [index.md](./index.md#primary-zellij) |
| Portagenty | Single command → right dir, right session, agent resumed. `pa claim` for cross-device handoff. | [portagenty repo](https://github.com/cybersader/portagenty) · [index.md § Portagenty in detail](./index.md#portagenty-in-detail) |
| bash + Claude Code | A shell alias can compress the 4-step launch into one word. Reference helpers in [`../profiles/bashrc-snippets/`](../profiles/bashrc-snippets/). | [`profiles/bashrc-snippets/`](../profiles/bashrc-snippets/) |

## When to upgrade (and to what)

Stick with Windows Terminal until one of these hits. The [WezTerm config is pre-written](../profiles/keybindings/wezterm/) for when the time comes.

| Friction you start feeling | Upgrade to |
|---|---|
| "I want a new tab at the **same remote SSH path** I'm in" | WezTerm (OSC 7 + Lua callback) |
| Too many tabs; dropdown picker is slow | WezTerm (fuzzy `ShowTabNavigator`) |
| Want a custom status bar / dynamic info | WezTerm (Lua scripting) |
| Need preset workspace-launch buttons across many workspaces | WezTerm `launch_menu` or Windows Terminal profile-per-workspace |

## See also

- [Hotkey reference](./hotkey-reference.md) — every tool, every layer, full keymaps
- [Terminal emulator stack research](../../../agent-context/zz-research/2026-04-18-terminal-emulator-stack.md) — abstract layer model
- [02 · Terminal (overview)](./index.md) — tradeoffs tables per layer
- [WezTerm config (upgrade path)](../profiles/keybindings/wezterm/) — ready when you are
- [Cybersader's actual terminal workflow](#private-reference) — worked tier-3 example: laptop→SSH→`pa`→`ccry` daily flow
- [Known issues & fixes](#private-reference) — running log of stack-level quirks (Termux bell bubble over SSH'd Zellij, etc.)
