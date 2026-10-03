---
title: AI-tooling sweep + Forgejo migration considerations
description: Five-tool survey — Depot, Blacksmith, earendil-works/pi, Amp, Factory.ai — evaluated by category. Most are point solutions for problems an agentic-CLI-centered stack may not actually have. One (Pi's modular toolkit) has component-level potential as building blocks. Plus general considerations for what changes when moving from GitHub Actions to a self-hosted Forgejo + Forgejo Actions / Woodpecker setup.
stratum: 2
status: research
sidebar:
  order: 9
tags:
  - stack
  - ai-coding
  - amp
  - pi-toolkit
  - depot
  - blacksmith
  - factory-ai
  - forgejo
  - ci-cd
  - eval
  - deferred
date: 2026-05-12
branches: [agentic]
---

## Scope

Five tools evaluated against the kind of agentic stack this scaffold describes (AI coding CLI primary, MCP integrations, self-hosted homelab, lightweight CI). Question for each: does it have a legitimate better place in this kind of stack than what the typical agentic workflow already has?

- **Depot** ([depot.dev](https://depot.dev)) — cloud Docker / GitHub Actions build accelerator
- **Blacksmith** ([blacksmith.sh](https://www.blacksmith.sh)) — GitHub Actions runner replacement
- **earendil-works/pi** ([github.com/earendil-works/pi](https://github.com/earendil-works/pi)) — MIT-licensed modular AI agent toolkit
- **Amp** ([ampcode.com](https://ampcode.com)) — Sourcegraph's AI coding CLI (closed source)
- **Factory.ai** ([factory.ai](https://factory.ai)) — enterprise FinServ AI dev platform

## Per-tool verdicts

### Depot — fits only if CI is build-bound

Cloud build acceleration. Headline claims: 40× faster Docker builds, 10× faster GitHub Actions. Paid SaaS, not self-hostable, not open source.

**Fits** when:

- CI has long Docker layer-rebuild loops
- Builds involve Bazel / Gradle / Turborepo / sccache / Pants — Depot's documented optimization targets
- The team is large enough that CI minutes are a meaningful line item

**Doesn't fit** when:

- CI is structurally lightweight — single short workflow per repo, sub-minute runs
- The stack is moving toward self-hosting (Depot is GitHub-Actions / `docker build` specific; orphaned by any Forgejo Actions / Woodpecker migration)
- Open source / self-hostable is a hard requirement

### Blacksmith — same shape as Depot, different vendor

GitHub Actions runner replacement. Faster hardware, lower per-minute cost than GitHub-hosted runners. Pay-as-you-go SaaS.

Same evaluation as Depot — different vendor, same architectural fit conditions. Add a meaningful CI-minutes-per-month threshold before the per-minute savings outweigh the operational cost of a third-party CI dependency.

### earendil-works/pi — toolkit, not a replacement

MIT-licensed monorepo (~50K stars at time of writing). Six independently-usable packages plus a Slack-bot sibling repo:

| Package | Purpose | Reuse pattern |
|---|---|---|
| `pi-coding-agent` | Interactive coding agent CLI | Competes with Claude Code / Cursor / Amp as primary. Switching cost is high for any deeply-integrated stack. |
| `pi-agent-core` | Agent runtime with tool calling + state | Useful when building a custom agent outside an existing CLI's harness. |
| `pi-ai` | Unified multi-provider LLM API | **High-value building block.** Replaces ad-hoc curl-to-LLM scripts. Provider-agnostic, future-proof against any single LLM vendor change. |
| `pi-tui` | Terminal UI library with differential rendering | Useful for any custom TUI work (health-check dashboards, registry browsers, etc.). |
| `pi-web-ui` | Web components for AI chat interfaces | Useful if a web-served agent UI is on the horizon (mobile or cross-device access). |
| `pi-chat` (separate repo) | Slack / chat automation | Useful for non-terminal agent access — particularly over a private tailnet. |

Open source, npm-distributed, modular — survives Git-host migrations and primary-CLI switches.

**Strongest fit:** `pi-ai` as a provider-agnostic LLM SDK in custom helpers. Worth experimenting with the next time a script needs LLM access.

### Amp — competitor to existing AI coding CLIs

Sourcegraph's AI coding agent CLI. Multi-model (Claude Opus 4.7, GPT-5.5, others). Plugin architecture explicitly inspired by Pi. Pay-as-you-go pricing, no markup for individuals. Closed source.

**Would compete head-to-head** with whatever AI coding CLI is the stack's primary (Claude Code, etc.). Switching cost includes:

- Re-implementing any MCP-based integrations against Amp's plugin model
- Re-creating the agent + skill + hook ecosystem
- Migrating CLI-specific conventions documented for the prior tool
- Re-validating any bashrc / shell helpers that assume the prior tool's CLI shape
- Loss of any prior-tool-specific session tooling (conversation-extraction utilities, session-management wrappers, etc.)

A reasonable cadence for re-evaluating the primary AI coding CLI is every 6–12 months. Amp warrants inclusion in that re-eval, especially as its plugin ecosystem matures.

### Factory.ai — enterprise FinServ vertical

"Droids" agents for enterprise financial institutions. SOC 2 Type II, compliance/audit logging, RBAC, deployment options (cloud/hybrid/on-prem), contact-sales pricing.

Built specifically for large financial institutions. The vertical isn't marketing framing — it's the actual product focus. Skip for solo-dev / homelab / general-purpose stacks. Reconsider only if work shifts into FinServ consulting that demands exactly this shape.

## Forgejo migration — general considerations

[Forgejo](https://forgejo.org/) is a community-maintained Gitea fork, fully open source, drop-in replacement for many GitHub flows. A migration from GitHub to a self-hosted Forgejo instance is a recurring direction for self-sovereignty-oriented stacks. What changes:

| Component | GitHub-Actions-based stack | Post-Forgejo stack |
|---|---|---|
| Source repo hosting | GitHub | Forgejo (self-hosted), optionally with GitHub as a public mirror |
| CI engine | GitHub Actions | **Forgejo Actions** (high syntactic compatibility with GitHub Actions — same `runs-on` / `uses` semantics, smaller third-party action ecosystem) **or Woodpecker CI** (lighter, Forgejo-native, simpler YAML) |
| Tailscale-OAuth-gated tailnet-deploy patterns (e.g., the pattern in [`02-stack/patterns/github-actions-tailnet-paas-autodeploy.md`](/agentic-workflow-and-tech-stack/stack/patterns/github-actions-tailnet-paas-autodeploy/)) | Run on GitHub-hosted runner | **Survive** — `tailscale/github-action` works on any CI runner that can run Linux containers. Forgejo Actions can use the same action. |
| Public-mirror sync workflows (private source → public mirror with PII gate) | Source on GitHub (private repo) → public repo, gated | **Direction flips** — Forgejo (private) → GitHub (public mirror) via the same gate logic. Auth method changes: deploy key on the GitHub side, runner-side credentials on the Forgejo side. The `STRICT_RE`-style leak gates are shell-side and translate cleanly. |
| GitHub-specific integrations (Dependabot, Code Scanning, GitHub Apps) | Native | Replaced by self-hosted equivalents (Renovate, self-hosted CodeQL CLI, etc.) or accepted as losses |

### Forgejo-readiness checklist

When the migration moves from "considering" to "planning," these are the questions worth resolving up front:

- **Forgejo Actions vs Woodpecker** — Forgejo Actions wins on migration cost (drop-in for most workflows). Woodpecker wins on simplicity and Forgejo-nativeness.
- **Forgejo deployment topology** — alongside other services on a PaaS, dedicated VM, or container in the homelab. Affects backup strategy and HA story.
- **Migration vs duplication** — full move vs keep GitHub as the public-facing canonical and Forgejo for private source. Duplication lowers risk; adds sync overhead.
- **CI compatibility verification** — list the GitHub-Actions actions in use across the stack and confirm each works on the chosen Forgejo CI flavor.
- **Public-mirror sync inversion** — the workflow that previously pushed *out* of GitHub must now push *into* it from Forgejo. Same leak-gate logic, different auth direction.

## Effect of the Forgejo direction on the 5 tools

| Tool | Forgejo-compatible? |
|---|---|
| Depot | No — GitHub Actions / `docker build` specific. Orphaned by the migration. |
| Blacksmith | No — same as Depot. |
| earendil-works/pi | Yes — Git-host-agnostic. |
| Amp | Yes — Git-host-agnostic. |
| Factory.ai | Yes — Git-host-agnostic (but irrelevant for non-FinServ stacks regardless). |

## Open questions (deferred-eval thread)

- **Pi `pi-ai` as a building block** — does provider-agnostic SDK use feel meaningfully better than ad-hoc curl scripts? Worth a small experiment before committing to the pattern.
- **Amp re-evaluation cadence** — quarterly check on agent capabilities + plugin maturity vs the current primary AI coding CLI.
- **Forgejo Actions vs Woodpecker decision** — usually answered by listing the GitHub-Actions actions actually in use and counting which ones port cleanly.
- **General principle:** self-hosting trades vendor lock-in for self-maintenance load. Worth being explicit about which problems are worth self-hosting (sovereignty, sensitivity, customization) vs which aren't (where SaaS reliability is the value).

## Related research

- [`2026-05-12-local-search-tooling-alternatives.md`](/agentic-workflow-and-tech-stack/agent-context/zz-research/2026-05-12-local-search-tooling-alternatives/) — sibling deferred-eval thread for the search-tool layer (ck vs codebase-memory-mcp vs qmd vs Meilisearch vs simonw-llm+sqlite-vss).

## Status

Open. Conclusions inform future decisions but no immediate action.
