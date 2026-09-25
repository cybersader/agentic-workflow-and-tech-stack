---
title: Cross-Device SSH (Tailscale + SSH config + Termux)
description: Full walkthrough of the cross-device pattern — reach your dev PC from any device via one alias, without managing SSH keys across devices.
stratum: 2
status: research
tags:
  - stack
  - pattern
  - tailscale
  - ssh
  - termux
  - cross-device
date: 2026-04-17
branches: [agentic]
---

## The promise

Run `ssh pc` from any device you own — laptop, phone, remote machine — and land inside the PC's WSL shell, reattach the running Zellij session, pick up exactly where you left off. No port forwarding, no key management, no IP memorization.

## What you need

| Component | Role |
|---|---|
| [Tailscale](https://tailscale.com/) | Device-mesh authentication + stable IP per device |
| `tailscaled` with Tailscale SSH enabled | The SSH server and identity-aware authorization path; guest `sshd` is not used for tailnet-intercepted Tailscale SSH |
| `~/.ssh/config` with an alias | One-word hostname |
| [Termux](https://f-droid.org/en/packages/com.termux/) (Android) or Termix (iOS) | Mobile client |
| Zellij or tmux inside the SSH session | So the session survives disconnect |

## Setup

### 1. Install Tailscale everywhere

On the PC (server side):

```bash
# WSL2 on Windows:
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

On the phone (Android): Install Tailscale from Play Store, sign in with the same account.

On any other device: same — install the client, sign in. All devices now appear in your tailnet.

### 2. Enable Tailscale SSH (optional but recommended)

```bash
sudo tailscale up --ssh
```

This lets `tailscaled` handle the SSH server and authentication via the tailnet identity — no SSH keys or guest `sshd` are needed for the intercepted tailnet path. Authorization comes from the tailnet SSH policy, and a policy may require a periodic browser check.

If you prefer classic SSH key auth, skip `--ssh`, run a normal SSH daemon, and continue with `~/.ssh/authorized_keys`. Keep the two paths conceptually separate: restarting `sshd` cannot repair a Tailscale SSH policy check.

### 3. Find your PC's tailnet name

```bash
# On the PC
tailscale status
```

You'll see a MagicDNS name like `pc-name.your-tailnet.ts.net` and an IP like `100.x.y.z`. MagicDNS is preferred — it's stable across IP reassignments.

### 4. Configure SSH alias on each client device

In `~/.ssh/config` on laptop, phone, any other client:

```
Host pc
    HostName pc-name.your-tailnet.ts.net
    User your-username
    ForwardAgent yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Replace `pc-name.your-tailnet.ts.net` with your actual MagicDNS name (or the `100.x.y.z` IP if you skip MagicDNS).

### 5. Test

```bash
ssh pc
```

You should land on the PC's shell. If Tailscale SSH is enabled: no password prompt, no key prompt. Authentication happened via Tailscale. A tailnet policy using `check` may periodically require browser reauthentication instead.

### 5a. Browser re-check recovery

When the client prints:

```text
# Tailscale SSH requires an additional check.
# To authenticate, visit: https://login.tailscale.com/a/...
```

that is a healthy authorization challenge, not evidence that `tailscaled` or `sshd` failed. Use this exact flow:

1. Confirm the node is online with `tailscale status` or `tailscale ping <host>`.
2. Start one bounded command and **leave that process running**:

   ```bash
   tailscale ssh <linux-user>@<host> 'id && hostname'
   ```

3. Present the emitted Tailscale URL as a clickable link. The human completes the browser check.
4. Let the original process resume and verify the expected Linux user and hostname.

The identity shown as the node owner in the Tailscale admin console is not a substitute for the target Linux username. Use the username configured inside the target operating system.

Do not kill the pending command and generate a chain of replacement URLs. Do not restart `sshd`: Tailscale SSH is served by `tailscaled`. Do not restart `tailscaled`, use VNC/serial recovery, or edit tailnet policy unless node status/ping fails or the completed browser check returns a separate error.

### 6. Chain into Zellij

Two options:

**Option A: Auto-attach on SSH login** — append to `~/.bashrc` on the PC:

```bash
# If SSH'd in and not already in zellij, attach main session
if [[ -n "$SSH_CONNECTION" ]] && [[ -z "$ZELLIJ" ]]; then
    zellij attach --create main
fi
```

**Option B: Manual attach** — just run `zellij attach main` after SSH'ing in, or use the `z`/`zk`/`zl` helpers from [`../profiles/bashrc-snippets/zellij-helpers.sh`](../profiles/bashrc-snippets/).

**Option C: Portagenty** — from [github.com/cybersader/portagenty](https://github.com/cybersader/portagenty) — run `pa` to pick a workspace, which attaches the right session.

## Mobile client: Termux on Android

```bash
# On first install
pkg update && pkg upgrade
pkg install openssh

# Copy ~/.ssh/config from laptop to Termux's ~/.ssh/config
# Then
ssh pc
```

Tailscale's Android app keeps the mesh up in the background. As long as Tailscale is active, `ssh pc` works.

## iOS workaround

Termux doesn't exist for iOS due to Apple's sandboxing. Options:

- **Termix** — iOS SSH client with a terminal emulator. Works. Less rich than Termux.
- **GitHub Codespaces** — access a cloud dev env from mobile. Different model (dev container vs your-machine).
- **a-Shell** — Linux-ish shell for iOS. Limited SSH capability.

I haven't committed to an iOS workflow. Termix is the lowest-effort path.

## Session-survives-disconnect flow

The session lives on the PC. Any client with Tailscale + SSH config reattaches it.

```mermaid
sequenceDiagram
    participant L as Laptop
    participant P as PC (Zellij)
    participant Ph as Phone

    L->>P: ssh pc
    P-->>L: attach "main" session
    Note over L,P: working...
    L--xP: disconnect (close lid)
    Note over P: session persists
    Ph->>P: ssh pc (later)
    P-->>Ph: same session resumes
    Note over Ph,P: working...
    L->>P: ssh pc (next day)
    P-->>L: same session, all devices can attach
```

## Security hygiene

- **Disable public SSH port** on the PC. Tailscale makes this fine — clients reach the PC via the tailnet only.
- **Tailscale ACLs** — if your tailnet has multiple users, restrict who can SSH to your dev machine.
- **Rotate Tailscale auth keys** periodically. Tailscale admin console supports this.
- **Don't use `ForwardAgent yes`** on untrusted systems. Only on your own devices.

## Gotchas

### PC's Tailscale IP changed

Use MagicDNS hostnames in your SSH config, not IPs. Hostnames are stable; IPs can rotate.

### SSH times out while working

Add `ServerAliveInterval 60` to the SSH config (already in the example above). This keeps the session alive during brief network blips.

### Zellij session disappeared

Check if the PC rebooted. Zellij sessions don't survive reboots unless you use a supervisor. For reboot survival, consider [zellij-layout](https://zellij.dev/documentation/layouts) with auto-launch via systemd user unit.

### Termux won't connect

Confirm Tailscale is active on Android (notification shield icon). Confirm `ssh your-full-tailnet-hostname` works from another device before trying the alias.

## Integration

- [03 · Cross-Device](../03-cross-device/) — this pattern is the core walkthrough.
- [02 · Terminal](../02-terminal/) — Zellij provides the session survival.
- [Tailnet browser access](./tailnet-browser-access/) — sibling pattern: same tailnet, but for serving a directory or rendered site to a browser instead of a shell.
- [Portagenty](https://github.com/cybersader/portagenty) — wraps the attach logic per workspace.

## See also

- [Tailscale SSH docs](https://tailscale.com/kb/1193/tailscale-ssh)
- [Termux wiki](https://wiki.termux.com/)
- [`../../01-kernel/principles/06-single-canonical-addressability.md`](../../01-kernel/principles/06-single-canonical-addressability.md) — why one alias beats many IPs
