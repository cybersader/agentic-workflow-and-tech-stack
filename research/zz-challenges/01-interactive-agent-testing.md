---
title: "01 · Interactive Agent Testing with Live Feedback"
description: How do we build a testing system where users and AI agents can interactively validate behavior with shared observability of results?
date created: 2026-04-18
tags:
  - /meta
  - research
  - challenges
  - testing
  - agents
status: research
priority: high
source: cynario project testing session
---

# 01 · Interactive Agent Testing with Live Feedback

## The Assignment

When building AI-integrated systems (like cynario), a critical gap emerges: **the AI agent and the user cannot share a live feedback loop on test results.**

The user runs tests, logs accumulate in `test-logs.txt`, but the agent has no way to:
- See what the user is seeing in real-time
- Know whether a change worked without being told
- Iterate autonomously based on observed behavior

Your job: **design a pattern that lets agents participate in testing loops as full peers**, seeing the same signals the user sees, without requiring the user to relay every result.

## Why This Matters

This is a **foundational primitive** for any AI-assisted development workflow where:
- The product is being actively built AND tested
- The agent needs to verify its own work
- The user wants to delegate more than code generation (delegate *verification* too)

Without this, every test cycle requires human-in-the-loop translation, which kills velocity.

## What to Investigate

1. **Log ingestion patterns** — How should agents consume logs? Tail a file? Subscribe to events? MCP server exposing log stream? What are the tradeoffs for different tools (Claude Code, OpenCode)?

2. **Interactive test harnesses** — Playwright/Puppeteer can drive browsers. Can agents directly drive these? What permissions/sandbox considerations exist? How does this compose with existing skills?

3. **Feedback signals** — Beyond pass/fail: how do agents understand WHY something failed? Screenshot diffs? DOM state? Network traces? What signal-to-noise ratio is tolerable?

4. **Role boundaries** — Who runs what? User starts the dev server → agent drives tests → results flow back → agent proposes fix → user approves → agent applies → loop repeats. Is this the right shape? What breaks at scale?

5. **Comparison to existing approaches** — GitHub Actions agents (Copilot in CI), Playwright MCP, browser-use, Aider's test-driven dev loop. What do they get right? What's missing?

6. **Applicability to this workflow** — Should this become a new skill (`interactive-testing-patterns`)? A new meta-agent (`test-runner`)? A convention that skill-writer embeds in generated test skills?

## Context to Read First

- [cynario project notes](../../knowledge-base/02-learnings/) — where this friction was first felt
- [test-workspace/TESTING.md](../../test-workspace/TESTING.md) — current testing framework
- [testing-patterns skill](../../.claude/skills/testing-patterns/SKILL.md) — existing testing conventions
- [tool-comparison.md](../../docs/tool-comparison.md) — what each tool can/can't do

## What Success Looks Like

A design document with:

- **One-sentence pattern statement** — e.g., "Agents participate in test loops by X, producing Y signals."
- **Tool-agnostic core pattern** — Works in Claude Code AND OpenCode
- **Tool-specific adapters** — Where needed, documented separately
- **Comparison table** — vs Playwright MCP, browser-use, Aider TDD, GitHub Actions agents
- **Minimal proof-of-concept** — Working example in cynario or test-workspace
- **Decision on productization** — Skill? Agent? Convention? Combination?
- **Validity window** — "This holds until [e.g., MCP browser-control becomes standard]"

## What This Does NOT Decide

- Specific test framework choice (Playwright vs Cypress vs Vitest)
- How to test the workflow scaffold itself (that's already in `test-workspace/`)
- Authentication/authorization for agent-driven testing (separate challenge)
- CI/CD integration patterns (separate challenge, may emerge later)

## Open Threads

- How does this interact with `inter-agent-messaging` skill? Could test results flow through an inbox?
- Is there a "screenshot → agent" primitive worth building? (Zipline pattern already exists for images)
- Should `test-improver` agent be extended to run tests itself, or stay analysis-only?
