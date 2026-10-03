---
title: Claude Code UI surfaces and trust boundaries
description: Local-first decision guide for the CLI, VS Code extension, Remote Control, cloud execution, and tailnet-constrained remote desktop access.
stratum: 2
status: research
tags:
  - stack
  - ai-coding
  - claude-code
  - vscode
  - privacy
  - cross-device
date: 2026-08-21
branches: [agentic]
---

A polished interface and a local-first system of record are separate decisions. This stack can use a graphical Claude Code surface without moving project authority out of files, Git, Portagenty manifests, Obsidian notes, project-local instructions, and local session records.

"Local" also needs a precise meaning: Claude Code can execute tools and read the filesystem on the workstation while still sending prompts and selected context to a hosted model provider. Local execution does not mean offline inference or zero provider-side retention.

## Source-of-truth rule

Regardless of frontend:

- **Projects and instructions:** repository files, Git history, `CLAUDE.md`, and `.claude/` configuration.
- **Workspace launch state:** Portagenty manifests and local multiplexer sessions.
- **Durable knowledge:** filesystem documents and Obsidian notes.
- **Conversation recovery:** local Claude Code transcript files and explicit exports, subject to the configured local cleanup period.
- **Frontend:** a view and control surface over those assets, not a second project database.

Do not adopt a consumer-OAuth wrapper or other account-mediated workaround merely to gain a nicer UI. Provider support and terms are part of the trust boundary.

## Surface matrix

| Surface | Where execution and filesystem access happen | Conversation/session state | Remote path | Fit for this stack |
|---|---|---|---|---|
| **Claude Code CLI** | Local workstation | Claude Code writes local project-associated transcripts; model requests still traverse the configured provider | Local terminal or SSH over the tailnet | **Primary** — inspectable, scriptable, and filesystem-first |
| **Official VS Code extension, Remote Control off** | Local workstation through the extension's bundled Claude Code runtime and local IDE integration | The extension exposes session history and shares conversation history with the CLI; normal model-provider data handling still applies | Local IDE, or the whole desktop reached through a separately secured remote-desktop path | **Good local GUI layer to evaluate** — not a replacement for Portagenty or project files |
| **Claude Code Remote Control** | Execution and filesystem access remain local | While connected, messages, responses, and tool activity are also stored on Anthropic servers for synchronization and reconnection | Account-authenticated connection through Anthropic infrastructure over TLS | **Off by default** — coherent SaaS model, but not the preferred tailnet-scoped control boundary |
| **T3 Code local server + web client** | The workstation's T3 server owns provider CLIs, terminals, Git, and filesystem operations | T3's local server owns its orchestration/session state; each provider CLI retains its own underlying conversation behavior | Authenticated WebSocket over LAN/tailnet, opt-in Tailscale Serve HTTPS, or another explicitly configured endpoint | **First-class local-web candidate** — better mobile UI without cloud execution, but adds a listener, pairing/session credentials, and another runtime to secure |
| **Claude Code on the web / cloud execution** | Anthropic-managed VM by default, unless an organization supplies a supported self-hosted environment | Repository and session data enter the cloud-execution environment and applicable retention policy | Browser or app to hosted session | **Not the local project authority** — useful only as an explicitly chosen cloud workspace |
| **Tailnet-constrained remote desktop** | Local workstation | Whatever local CLI or IDE surface is already open; no separate Claude session-sync layer is required | `Phone → Tailscale → remote desktop → local Claude Code surface` | **Preferred graphical remote path to evaluate** |

## Local Claude Code CLI

Claude Code runs locally, including shell commands, filesystem operations, MCP processes, and other local tools. To call the model, it sends data over the network. That request can include the prompt and any file content, tool results, or other context added to the conversation; the response returns from the configured provider.

Claude Code also stores resumable transcripts locally under `~/.claude/projects/` by default. Those JSONL files are useful for local recovery, but their internal format is not a stable API. Use `/export` or supported session interfaces when building durable automation around conversations.

**Conclusion:** local execution and local transcript ownership support the filesystem-first model, but they do not eliminate hosted inference or the provider's applicable data-retention policy.

## Official VS Code extension without Remote Control

The official extension is a native graphical interface for Claude Code. Current capabilities include:

- conversation history and resume;
- multiple conversations in separate tabs or windows;
- inline and native diff review;
- file and selected-line mentions;
- terminal-output references through `@terminal:name`;
- shared settings and conversation history with the CLI.

The extension bundles a Claude Code runtime for its panel and uses a local loopback IDE integration for editor context and diff operations. Installing it does **not** require making the editor or an Anthropic-hosted project view the system of record.

Remote Control is a separate, optional capability. Keep it disabled unless the owner explicitly accepts the different synchronization and account-authentication boundary.

**Conclusion:** this is the strongest current candidate for cleaner multiline rendering, one-click copy, structured diffs, and session tabs while preserving local project authority.

## Remote Control

Remote Control is not cloud execution: the Claude Code process, tools, and filesystem access stay on the workstation. The local process makes outbound HTTPS requests and does not open an inbound port for Remote Control.

Its control plane is nevertheless cloud-mediated. Connected browser and mobile clients authenticate through the Claude account, traffic routes through the Anthropic API, and the synchronized transcript—including messages, model responses, and tool activity—is stored on Anthropic servers while connected. This is not restricted to a private tailnet merely because the workstation itself is on one.

For this stack:

- do not enable `remoteControlAtStartup`;
- do not treat Remote Control as equivalent to tailnet-only access;
- enable it only through a separate, explicit privacy and access-control decision.

## T3 Code local web control plane

T3 Code is not merely a browser terminal. Its server owns agent-provider processes,
terminals, Git operations, and filesystem access on the workstation; web, desktop, and
mobile clients use an authenticated WebSocket RPC boundary. Claude Code remains a
separately installed and authenticated provider CLI.

Its official remote flow supports direct Tailnet IP/MagicDNS endpoints, one-time pairing
credentials, session revocation, and opt-in Tailscale Serve HTTPS. The hosted web client
connects directly to the configured backend rather than proxying the agent session, but it
requires an HTTPS/WSS-reachable endpoint. The official native mobile app is currently
marked as in development and not generally distributed.

This keeps execution local but adds a persistent server/listener, pairing and session
credentials, a Node runtime, an update lifecycle, and optional hosted-web or managed-tunnel
surfaces. Treat installation, network binding, Tailscale Serve configuration, background
service setup, and provider compatibility as an explicit adoption review—not a cosmetic UI
change. See [Mobile agent access surfaces](../03-cross-device/mobile-agent-access-surfaces.md)
for the cross-device comparison and evaluation order.

## Preferred graphical remote path to evaluate

```text
Phone → Tailscale → RustDesk → local graphical Claude Code surface
```

This keeps the desktop and working surface on the workstation and uses the tailnet as the intended remote-access perimeter. It does **not** make inference local: prompts and selected context still go to the configured model provider.

This is an evaluation target, not an installation instruction. Before adoption, verify that the remote-desktop connection is actually constrained to the desired tailnet path and that no public relay, listening port, or account-mediated fallback silently broadens the boundary.

## Portagenty boundary

A local graphical frontend does not need to become a Portagenty feature. Portagenty's durable role is workspace discovery, launch configuration, and session attachment. The better first move is to let it launch or return to whichever local CLI or IDE surface is selected.

Reconsider a Portagenty-owned frontend only after repeated friction proves that an external local UI cannot satisfy the workflow. Any future proposal must preserve these invariants:

1. Portagenty manifests, Git, and project files remain authoritative.
2. Existing local Claude Code sessions remain recoverable outside the frontend.
3. The frontend introduces no mandatory hosted project database.
4. Remote access is separately scoped and never enabled implicitly.

## Primary sources

- [Claude Code data usage](https://code.claude.com/docs/en/data-usage) — local data flow, provider retention, local transcript caching, and cloud-execution distinctions.
- [Manage Claude Code sessions](https://code.claude.com/docs/en/sessions) — project-associated local transcripts, resume behavior, and supported export/session interfaces.
- [Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code) — graphical panel, history, diffs, file/line and terminal references, multiple conversations, and CLI interoperability.
- [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control) — local execution, outbound-only connection, Anthropic-mediated transport, and server-side transcript synchronization.
- [T3 Code architecture](https://github.com/pingdotgg/t3code/blob/main/docs/internals/overview.md) — local server execution boundary, provider drivers, and authenticated WebSocket client/server model.
- [T3 Code remote access](https://github.com/pingdotgg/t3code/blob/main/docs/user/remote-access.md) — pairing, Tailnet endpoints, Tailscale Serve HTTPS, hosted-web behavior, and credential cautions.
- [T3 Code mobile status](https://github.com/pingdotgg/t3code/blob/main/apps/mobile/README.md) — current native mobile distribution status.
