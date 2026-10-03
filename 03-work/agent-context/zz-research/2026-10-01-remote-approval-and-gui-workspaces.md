---
title: Approving agent work away from the terminal — and what GUI agent workspaces offer
description: Research crumb on approving workflow/agent nonces and permission-controller requests from a phone without weakening a simple, secure, tailnet-only architecture; verdict on mosh; and a late-2026 snapshot of agent orchestration GUIs judged by whether they preserve the local guard as the approval authority.
stratum: 5
status: research
date: 2026-10-01
tags:
  - research
  - approvals
  - cross-device
  - security
  - agent-workspaces
---

## Question

How can the owner approve guarded work (`approve-workflow` / `approve-agent` nonces, and permission-controller requests) without sitting at the terminal? Does mosh help? Which GUI agent workspaces could eventually replace the TUI without giving up the guard?

## Answer

**Use what already exists first.** There are two approval mechanisms, and each already has a phone path with no new code:

1. **Guard nonces:** Tailscale SSH from the phone, attach to the *same* multiplexer pane, and type the approval line yourself. The server-side session survives disconnects.
2. **Permission-controller requests** (desktop, browser, allowance): Tailscale SSH into a separate shell and run the controller in its documented human-operated terminal mode. Read the stored terms and answer.

Neither path proves to a hostile same-user agent that a human authored the approval. That matches the current threat model, which guards against same-user accidents, not a hostile agent running as you. If anti-forgery becomes a hard requirement, the fix is a protected approval authority, not a new transport.

**Mosh:** comfort, not security. It smooths roaming and flaky links but adds no identity or human-presence check, needs UDP policy, and doesn't keep scrollback (the multiplexer still does). Add it only after real disconnect pain.

## Options ranked

| Option | Verdict |
|---|---|
| Tailscale SSH + existing multiplexer pane | **Now**, for nonces |
| Tailscale SSH + controller terminal mode | **Now**, for controller requests; one check that the installed version covers `desktop_session` |
| Self-hosted push (ntfy) with an "Open review" link | **For attention only.** An HTTP action button is a replayable request, so it must never mint grants |
| Mosh on top of SSH | Optional, only once disconnects actually hurt |
| Tailnet remote desktop to the controller GUI | Fallback if a GUI is preferred. It hands over the whole desktop, which is broader than approval |
| Tailnet-only approval PWA | **Best future GUI path.** Serve with Tailscale Serve (not Funnel), require a per-decision WebAuthn assertion with user verification, bound to the request digest, the decision and the expiry. Show the enforced terms apart from the agent-written purpose, and commit atomically once. It only means something if the verifier, grant store and enrollment are isolated from agents; otherwise WebAuthn is decorative |
| Claude Code Remote Control | **No.** It syncs to the vendor and rejects custom proxy base URLs, so it doesn't fit the proxy lanes |
| Claude Code channels permission relay | Covers native tool prompts, not the custom guard nonce or controller protocols. A possible future adapter |

## GUI agent workspaces (snapshot, 2026-10-01)

The test for each one: does it keep the local guard and permission core as the approval authority, and does it avoid a vendor relay?

- **Official Claude Code VS Code surface:** the strongest first GUI step. It shares hooks and settings with the CLI. Still to test against the installed runtime: proxy env, model lock, `UserPromptSubmit` and transcript identity.
- **Claude Code Desktop:** worth evaluating, local only. Compatibility with the proxy lanes is unverified. Cloud sessions don't carry workstation guard policy.
- **Superset:** a GUI multiplexer over local CLIs with worktrees. The Linux build is experimental. Keep its remote and mobile features off until their relay boundary is known.
- **OpenCode web:** a credible long-term harness, but adopting it would be a migration. Its server is unauthenticated unless a password is set, and its permission engine is not the guard.
- **OpenHands Agent Canvas:** the most capable self-hosted orchestration control plane. A bounded prototype is worth it later, but don't move approval authority onto it.
- **Vibe Kanban:** the original company sunset it in April 2026, so don't make it the approval authority.
- **Nimbalyst:** its mobile path relays through vendor servers and is iOS-only.
- **Conductor:** Mac-only.
- **opcode:** builds from source only.

## Recommendation

- **Stage 1 (now):** one phone route (Tailscale SSH) for both mechanisms. Add ntfy "Open review" notifications if *attention*, not access, is the problem.
- **Stage 2 (moving beyond TUIs):** build a small approval inbox before changing platforms, while keeping the guard and permission core authoritative. Then try the VS Code surface for daily GUI work, and treat any OpenCode or OpenHands move as a deliberate harness migration with new enforcement adapters.

## Caveats

- This is a documentation snapshot. Nothing (SSH, mosh, the controller, passkeys, the GUIs) was tested live.
- Tailscale may relay encrypted traffic via DERP. "Tailnet-only" here means no extra application relay.
- Research by a GPT-6.1 Sol worker in workflow `cu-sandbox-improve-wave1-sol`. Sources are primary vendor docs and repos.

## Related

- [[sandboxed-computer-use-plan]]
- [[portable-agent-permissions]]
- [[claude-code-ui-trust-boundaries]]
- [[cross-device-ssh]]
