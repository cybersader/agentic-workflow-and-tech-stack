---
date created: 2025-12-29
tags:
  - tools
  - ai-agents
  - coding-assistants
  - open-source
source: https://github.com/OpenHands/OpenHands
---

# OpenHands: Open-Source AI Coding Agent Platform

## Overview

OpenHands (formerly OpenDevin) is an open-source, model-agnostic platform for AI coding agents. It's the leading open-source alternative to proprietary tools like Devin, with 65K+ GitHub stars.

**Key differentiator:** Bring your own LLM (Claude, GPT, local models) - not locked to a single provider.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      OpenHands Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   CLI    │  │ Local UI │  │  Cloud   │  │Enterprise│    │
│  │          │  │ (React)  │  │          │  │  (K8s)   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
│       └─────────────┴──────┬──────┴─────────────┘           │
│                            │                                 │
│                    ┌───────▼───────┐                        │
│                    │  Agent SDK    │ ◄── Python + REST APIs │
│                    │  (the engine) │                        │
│                    └───────┬───────┘                        │
│                            │                                 │
│       ┌────────────────────┼────────────────────┐           │
│       │                    │                    │           │
│  ┌────▼────┐         ┌─────▼─────┐        ┌────▼────┐      │
│  │  Tools  │         │ Workspace │        │   LLM   │      │
│  │Terminal │         │Local/Docker│       │ Agnostic│      │
│  │ Editor  │         │   K8s     │        │         │      │
│  └─────────┘         └───────────┘        └─────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

| Component | Description |
|-----------|-------------|
| **SDK** | Core Python library - "the engine that powers everything" |
| **CLI** | Terminal interface, similar to Claude Code |
| **Local GUI** | React app with REST API, similar to Devin |
| **Cloud** | Hosted version with GitHub/GitLab integrations |
| **Enterprise** | Self-hosted K8s deployment |

---

## SDK: Defining Agents

Agents are defined programmatically in Python:

```python
from openhands import Agent, Tool, LLM
from openhands.tools import TerminalTool, FileEditTool

# Configure LLM (model-agnostic)
llm = LLM(
    model="claude-sonnet-4-20250514",
    api_key="..."
)

# Define agent with tools
agent = Agent(
    llm=llm,
    tools=[
        Tool(name=TerminalTool.name),
        Tool(name=FileEditTool.name),
    ]
)

# Run in conversation
conversation = agent.create_conversation()
result = conversation.send("Refactor the authentication module")
```

### Workspace Types

1. **Local Workspace** - Agents operate directly on host filesystem
2. **Remote Agent Server** - Ephemeral Docker/K8s containers with REST/WebSocket

---

## Supported Models

- Claude (all versions)
- GPT-4, GPT-4o
- Local LLMs (via Ollama, etc.)
- Any OpenAI-compatible API

---

## Integrations

- GitHub / GitLab
- CI/CD pipelines
- Slack
- Jira / Linear
- Toad (universal terminal interface for AI agents)

---

## Performance

- **77.6%** on SWE-Bench evaluations
- Consistently ranked as top-performing open-source agent

---

## Comparison to Our Current Stack

| Aspect | Claude Code | OpenCode | OpenHands |
|--------|-------------|----------|-----------|
| **Model Lock-in** | Anthropic only | Multi-provider | Multi-provider |
| **Open Source** | No | Yes | Yes (MIT) |
| **Recursive Agents** | No | Yes | Yes (SDK) |
| **Session Management** | Reliable | Buggy | TBD |
| **SDK for Custom Agents** | No | No | Yes |
| **Local LLM Support** | No | Limited | Yes |
| **Enterprise Self-Host** | No | No | Yes (K8s) |

### Potential Advantages

1. **Model flexibility** - Use Claude, GPT, or local models based on task
2. **SDK for orchestration** - Build custom multi-agent workflows
3. **Local execution** - Run on workstation with local LLMs
4. **Enterprise deployment** - Self-hosted K8s for organizations

### Potential Concerns

1. **Session management** - Unknown if has same bugs as OpenCode
2. **Maturity** - Newer than Claude Code
3. **Workflow compatibility** - Would need to test with our SEACOW patterns
4. **AGENTS.md support** - Unknown if reads portable agent definitions

---

## Use Cases (from SDK docs)

1. **One-off tasks** - "Build a README for your repo"
2. **Routine maintenance** - "Update dependencies"
3. **Major refactors** - "Multi-agent rewrites"

---

## Installation

```bash
# CLI
pip install openhands

# Or with Docker
docker pull ghcr.io/openhands/openhands
```

---

## Next Steps to Evaluate

1. [ ] Test CLI experience vs Claude Code
2. [ ] Check session persistence behavior
3. [ ] Test if it reads AGENTS.md or .claude/ structure
4. [ ] Evaluate SDK for custom agent orchestration
5. [ ] Test local LLM support with Ollama

---

## Links

- [OpenHands Official Site](https://openhands.dev/)
- [GitHub Repository](https://github.com/OpenHands/OpenHands)
- [Software Agent SDK](https://github.com/OpenHands/software-agent-sdk)
- [OpenHands + Toad Collaboration](https://www.openhands.dev/blog/20251218-openhands-toad-collaboration)
- [arXiv Paper](https://arxiv.org/abs/2407.16741)
- [ICLR 2025 Publication](https://openreview.net/forum?id=OJd3ayDDoF)

---

## My Use Case Notes

**Pain points this could address:**
- Model lock-in with Claude Code
- Lack of SDK for custom agent orchestration
- Can't use local LLMs for cost savings on simple tasks

**Questions to answer:**
- Does it have the same session bugs as OpenCode?
- Can it read our .claude/ structure or AGENTS.md?
- How does the SDK compare to Claude Code's Task tool?
