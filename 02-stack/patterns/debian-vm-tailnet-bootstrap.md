---
title: Debian VM → tailnet handoff bootstrap
description: Practitioner walkthrough for "fresh Debian VM to fully tailnet-managed in under 30 minutes." Every-screen netinst installer recipe, the two installer footguns nobody warns you about (sudo + curl), the VNC-once → SSH-via-tailnet handoff pattern, and the cloud-init alternative for the next time you do this. Generic — works on TrueNAS, Proxmox, libvirt, anywhere a Debian VM lives.
stratum: 2
status: stable
sidebar:
  order: 8
tags:
  - stack
  - pattern
  - debian
  - vm
  - tailscale
  - vnc
  - cloud-init
  - homelab
date: 2026-04-26
branches: [agentic]
---

## The promise

You're setting up a new Debian VM somewhere — TrueNAS, Proxmox, libvirt, Hetzner, doesn't matter. Goal: from "click Start" to "I can `ssh user@vm-hostname` from any tailnet device" in **under 30 minutes**, with VNC retired permanently after the first boot.

This pattern is the every-screen recipe. After the first one or two of these, it's muscle memory. The hand-holding here exists because (a) the netinst installer has 20+ screens that all matter; (b) Debian 13 specifically removed tools you'd expect to be there; (c) the VNC-then-SSH handoff is straightforward but not obvious.

## The setup arc

```mermaid
flowchart LR
    A["Provision VM<br/>(zvol, vCPU, RAM,<br/>bridge, ISO)"]
    B["VNC into<br/>installer<br/>~10–15 min"]
    C["Detach CD-ROM<br/>BEFORE reboot"]
    D["First boot<br/>console login"]
    E["Install sudo +<br/>curl<br/>(footgun fixes)"]
    F["SSH from<br/>dev machine<br/>over LAN"]
    G["Install Tailscale,<br/>tailscale up"]
    H["SSH via<br/>&lt;hostname&gt; from<br/>any tailnet device"]
    I["VNC + LAN IP<br/>retired"]

    A --> B --> C --> D --> E --> F --> G --> H --> I

    classDef once fill:#fcc,stroke:#a33,stroke-width:2px
    class B,C,D,E,F once
```

Pink steps are **one-time only** — once you're on the tailnet (step H), VNC and the LAN IP are irrelevant for the life of the VM. The right thing happens automatically.

## Phase 1 — Provision

This depends on your hypervisor. Sane defaults for any VM that'll run Docker workloads:

| Setting | Value | Why |
|---|---|---|
| OS | Linux | |
| CPU | 2–4 vCPU | Docker uses cores during builds |
| Memory | 4–8 GB | 2 minimum for anything; 4 for "real" use |
| Boot loader | UEFI | Skip BIOS unless you have a reason |
| Disk | single, 60–80 GB | thin/sparse if your hypervisor supports |
| Disk type | VirtIO | best perf on KVM-based hypervisors |
| Network | bridged to LAN | gives the VM its own DHCP-assigned IP |
| Network type | VirtIO | best perf |
| ISO | **Debian 13 netinst** | smaller download, mirror-based install — pulls latest packages |
| Display | VNC | the only "before-tailnet" access method |

> **Single disk, no exceptions.** Docker volumes, app data, swap — all fit on the one disk. Multi-disk VMs are a future-self problem.

> **Get the ISO first.** Either upload to a dataset on your hypervisor (TrueNAS) or attach a URL (Proxmox). Debian's mirror redirector is at [debian.org/distrib](https://www.debian.org/distrib/) — `debian-13.X.Y-amd64-netinst.iso` is what you want.

## Phase 2 — Debian installer over VNC

Connect TigerVNC (or any VNC client) to the hypervisor-assigned port:

```
<hypervisor-lan-ip>:590X
```

> **TigerVNC for Windows** is a 1 MB standalone .exe — no install required. macOS/Linux use whatever's local. The installer is graphical; mouse navigation works.

### Screen-by-screen

**0. Boot menu.** Pick `Graphical install` → Enter.

**1. Language.** `English` → Continue. (Or your language; doesn't affect anything functional.)

**2. Location.** Your country → Continue. (Affects mirror choice + clock later.)

**3. Locales.** `en_US.UTF-8` (or your locale) → Continue.

**4. Keyboard.** `American English` (or yours) → Continue.

*~30 sec hardware detection happens here.*

**5. Network — hostname.** Pick a meaningful name (`dokploy`, `vault`, `hass`, `media`). This becomes:
- The shell hostname (`<user>@hostname:~$`)
- The **MagicDNS name** on Tailscale once you join the tailnet — i.e. `ssh user@hostname` Just Works from any tailnet device.

**Domain name.** Leave **blank** (or `local` if your network uses it). Blank is fine.

**6. Root password.** Set a strong one. Save in your password manager. Continue twice.

> **⚠️ FOOTGUN #1 — DO NOT SKIP THIS:** if you set a root password here, the installer **will not install `sudo`** and **will not add your user to the sudo group**. This is documented but easy to miss. You'll fix it in Phase 4 — it adds 60 seconds.
>
> *Alternative:* leave the root password blank. Then the installer auto-installs sudo and adds your user to the sudo group. Costs you the ability to `su -` to root with a separate password (you'd `sudo -i` instead). Either approach works; the no-root-password path is slightly less footgun-prone.

**7. First user.** Full name (display only) → Continue. Username (`cybersader`, `admin`, `ubuntu` — match your shell habits) → Continue. Password → Continue twice.

**8. Clock.** Pick your time zone → Continue.

**9. Partition disks** ⚠️ — the screen to actually read.

- **Method:** `Guided - use entire disk` → Continue.
- **Disk:** the only one in the list (your VirtIO block device, e.g. `vda`) → Continue.
- **Scheme:** `All files in one partition (recommended for new users)` → Continue.
- **Review:** `Finish partitioning and write changes to disk` → Continue.
- **"Write the changes?"** → `Yes` → Continue.

*~3–5 min installing the base system.*

**10. Package manager.**

- Scan extra installation media? `No` → Continue.
- Use a network mirror? `Yes` → Continue.
- Mirror country: yours → Continue.
- Mirror: `deb.debian.org` (top of list) → Continue.
- HTTP proxy: leave blank → Continue.

*~2–4 min downloading packages.*

**11. Popcon (popularity-contest).** `No` → Continue. (Privacy preference. `Yes` is harmless.)

**12. Software selection** ⚠️ — the OTHER screen to read.

A list with checkboxes. **Default has multiple things checked.** You want minimal:

```
[ ] Debian desktop environment
[ ]   ... GNOME / Xfce / KDE / LXDE / LXQt / Cinnamon / MATE
[ ] web server
[ ] print server
[X] SSH server                  ← keep checked, critical for Phase 3
[X] standard system utilities   ← keep checked
```

Continue. *~2–4 min installing.*

**13. GRUB.**

- Install GRUB to the primary drive? `Yes` → Continue.
- Device: `/dev/vda` (the disk you partitioned) → Continue.

*~30 sec.*

**14. Installation complete.** ⚠️

> **⚠️ STOP — DO THIS BEFORE CLICKING CONTINUE:**
>
> Switch to your hypervisor's UI and **detach the install ISO**.
>
> - **TrueNAS:** Virtual Machines → click the VM → Devices → CD-ROM row → kebab → Delete.
>   - If TrueNAS refuses ("VM is running"): stop the VM first, then delete CD-ROM, then start.
> - **Proxmox:** VM → Hardware → CD/DVD Drive → Edit → "Do not use any media."
> - **libvirt/virsh:** `virsh detach-disk <vm> hdc --persistent` (or via virt-manager).
>
> If you skip this, the VM reboots, the ISO is still attached, BIOS picks the CD-ROM as the boot device, and you're back at the installer's first screen. ~15 minutes round-trip to recover.

After detaching: click **Continue** in VNC. VM reboots.

## Phase 3 — First boot, console login

After ~30 sec the VM presents a text login prompt (no GUI, this is intentional):

```
Debian GNU/Linux 13 <hostname> tty1

<hostname> login: _
```

Log in as your **regular user** (not root). You're at:

```
<user>@<hostname>:~$
```

### Find the LAN IP

```bash
ip -4 a | grep inet
# inet 192.168.x.y/24 brd ... scope global enp1s0
```

That IP is what you'll SSH to **once** to set up Tailscale. After that it's not load-bearing.

## Phase 4 — The two footgun fixes

### Footgun fix 1 — install sudo

```bash
# Become root via the root password you set in installer step 6
su -

apt update
apt install -y sudo
usermod -aG sudo <user>

exit            # leave root shell
exit            # log out (group membership applies on next login)
```

Log back in as `<user>`. `sudo -v` should succeed silently.

If you skipped setting a root password in step 6, sudo is already installed and you can skip this section.

### Footgun fix 2 — install curl

Debian's "standard system utilities" no longer includes `curl`. Without it, every modern install one-liner (`curl -fsSL ... | sh`) fails. Fix:

```bash
sudo apt install -y curl ca-certificates
```

While you're at it, the always-useful set for any new VM:

```bash
sudo apt install -y curl ca-certificates wget git htop ufw vim
```

(Pick `vim` or `nano` per your habits. `htop` is for any "what's eating my CPU" moment. `ufw` is the simple firewall.)

## Phase 5 — SSH from your dev machine

Close VNC. From wherever you do work:

```bash
ssh <user>@192.168.x.y
```

Accept the host key fingerprint, enter the password. You're now SSH'd into the VM over LAN. *VNC will not be opened again for the life of this VM.*

## Phase 6 — Tailscale install + handoff

```bash
sudo -i
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --ssh --hostname=<hostname>
```

Output prints a URL like `https://login.tailscale.com/a/abc123def`. Open it in your browser, approve the device, return to the terminal. You'll see `Success.`

> **`--ssh`** enables Tailscale-SSH on this device. SSH connections from other tailnet devices then use Tailscale's identity layer — no password, no SSH keys to manage, controlled by Tailscale ACLs. **`--hostname=<hostname>`** sets the MagicDNS name explicitly (otherwise it's auto-derived from the system hostname, which may have weird casing/dashes).

Verify:

```bash
tailscale status                 # should show your other tailnet devices
tailscale ip -4                  # the VM's tailnet IP — usually 100.x.y.z
```

## Phase 7 — VNC and LAN IP retire

Drop the LAN SSH session, then from any tailnet device:

```bash
ssh <user>@<hostname>            # MagicDNS resolves; Tailscale-SSH handles auth
```

If MagicDNS doesn't resolve `<hostname>` for you, double-check it's enabled at [login.tailscale.com/admin/dns](https://login.tailscale.com/admin/dns), or fall back to `ssh <user>@<100-tailnet-ip>`.

You're done. **VNC, the LAN IP, and any DHCP-changes-screwed-me concerns are now in the past for this VM.** Subsequent management is `ssh <user>@<hostname>` from anywhere on your tailnet.

## The cloud-init alternative — for next time

If you'll be doing this more than once, or you find Phase 2 (the 15-min installer) tedious, there's a fully-automated path: **Debian cloud-init images**. Total touches between "click Start" and "ssh <user>@<hostname> works": **zero**.

```bash
# 1. Download cloud image (already-installed Debian, no installer)
wget https://cloud.debian.org/images/cloud/bookworm/latest/debian-13-genericcloud-amd64.qcow2

# 2. Convert/copy into your hypervisor's storage
qemu-img convert -O raw debian-13-genericcloud-amd64.qcow2 /dev/zvol/<pool>/vm/<name>
# (or upload qcow2 directly if your hypervisor takes that format)
```

Make a **cloud-init seed ISO** with this `user-data`:

```yaml
#cloud-config
hostname: <vm-hostname>
users:
  - name: <user>
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - ssh-ed25519 AAAA... your-public-key
package_update: true
packages:
  - curl
  - ca-certificates
  - wget
  - git
  - htop
runcmd:
  - curl -fsSL https://tailscale.com/install.sh | sh
  - tailscale up --authkey=tskey-auth-YOUR-EPHEMERAL-KEY --hostname=<vm-hostname> --ssh
```

Generate the seed ISO:

```bash
cloud-localds seed.iso user-data.yaml
# (or: genisoimage -output seed.iso -V cidata -r -J user-data meta-data)
```

Attach `seed.iso` to the VM as a **second CD-ROM**. Boot. Within ~60 seconds the VM is up, Tailscale auto-authed via the auth key, joined the tailnet, ready to `ssh <user>@<hostname>` from anywhere.

**Auth key generation:** [login.tailscale.com/admin/settings/keys](https://login.tailscale.com/admin/settings/keys) — set Reusable: false, Ephemeral: false, Pre-approved: yes, expiry 1 day (you only need it for first boot).

When to use cloud-init vs. interactive installer:

| Situation | Pick |
|---|---|
| Your first VM ever | Interactive — you learn the screens, see the failure modes |
| 2nd–3rd VM, similar shape | Either — the interactive walkthrough is muscle memory by now |
| 4th+ VM, "I'm doing this routinely" | Cloud-init — the 30-min interactive cost adds up |
| You're standing up a fleet (5+) | Cloud-init absolutely; consider a Packer template |

## Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Reboots back into installer | CD-ROM still attached | Detach in hypervisor UI; may need to stop VM first |
| `sudo: command not found` | Footgun #1 — root password set during install | `su -`, `apt install sudo`, `usermod -aG sudo <user>`, relog |
| `curl: command not found` | Footgun #2 — Debian "standard utilities" no longer includes it | `apt install -y curl ca-certificates` |
| Network mirror screen hangs | Bridge not connected to a NIC with internet | Check hypervisor: bridge member must be up; VM's NIC must be VirtIO and bridged |
| `ssh user@<lan-ip>` says "Connection refused" | SSH server unchecked in installer step 12 | Boot via VNC, log in, `sudo apt install openssh-server` |
| `tailscale up` hangs at auth URL | Browser blocked the URL or you closed terminal | Re-run `tailscale up --ssh --hostname=<hostname>` |
| MagicDNS doesn't resolve `<hostname>` | MagicDNS off in tailnet, or key DNS feature disabled | [login.tailscale.com/admin/dns](https://login.tailscale.com/admin/dns) → enable MagicDNS |
| `tailscale up` says "no route to backend" | DNS can't resolve `login.tailscale.com` from VM | DNS is broken on the VM — check `cat /etc/resolv.conf`; fix the bridge or DHCP DNS |
| VM has no `enp1s0` (different NIC name) | Different VirtIO version or hypervisor | `ip a` to find the actual interface name; works the same way |

## Composition with other patterns

| Pattern | How it composes |
|---|---|
| [Dokploy on TrueNAS via VM](./dokploy-on-truenas-via-vm.md) | The PaaS use case for this bootstrap — Phase 7 ends, then Dokploy install begins |
| [Tailscale HTTPS three levels](./tailscale-https-three-levels.md) | After Phase 7 you have HTTP-over-tailnet (Level 0); upgrade to Level 1/2 when needed |
| [Cross-device SSH](./cross-device-ssh.md) | Phase 7's `ssh <user>@<hostname>` is the cross-device-SSH pattern in concrete form |
| [Tailnet browser access](./tailnet-browser-access.md) | If the VM serves any web UI, that pattern composes on top of the tailnet handoff this doc establishes |

## See also

- [Debian installation guide](https://www.debian.org/releases/stable/installmanual) — upstream reference
- [Tailscale install docs](https://tailscale.com/kb/1031/install) — upstream
- [cloud-init Debian docs](https://cloudinit.readthedocs.io/) — for the automated path
- [TigerVNC](https://tigervnc.org/) — the VNC client used in Phase 2
