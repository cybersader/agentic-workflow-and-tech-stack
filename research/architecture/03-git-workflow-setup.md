# Git-Based HA Config Workflow - Setup Guide

## Architecture

```
┌─────────────┐     ┌─────────────────────┐     ┌──────────────┐
│ Claude Code │────▶│ GitLab/Gitea        │────▶│ Home Assistant│
│ (local)     │push │ (TrueNAS)           │pull │ (Git Pull)   │
└─────────────┘     └─────────────────────┘     └──────────────┘
                            │
                    All on LAN / Tailscale
```

## Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Claude Code | Edit config files | Your machine |
| Git repo (local) | Working copy | Your machine |
| GitLab/Gitea | Central repo, access control | TrueNAS app |
| Git Pull add-on | Sync config to HA | Home Assistant |

## Security Model

- **No direct HA access** - Claude edits local files only
- **You review all changes** - `git diff` before push
- **GitLab on your infra** - No external exposure
- **Deploy keys** - HA has read-only access to repo
- **Tailscale routing** - All traffic encrypted

---

## Setup Steps

### 1. Install Git Server on TrueNAS

**Option A: Gitea (Recommended - Lightweight)**
- TrueNAS Apps → Gitea
- ~200MB RAM
- Simple UI

**Option B: GitLab CE**
- TrueNAS Apps → GitLab
- ~4GB RAM minimum
- More features (CI/CD, etc.)

### 2. Create HA Config Repository

```bash
# On GitLab/Gitea web UI:
# Create new repo: "ha-config" (private)

# Or via CLI after setup:
git init ha-config
cd ha-config
git remote add origin http://gitea.<your-local-domain>:3000/user/ha-config.git
```

### 3. Export Current HA Config

**Via HA File Editor or Samba (one-time):**
- Copy contents of `/config/` from HA
- Key files:
  - `configuration.yaml`
  - `automations.yaml`
  - `scripts.yaml`
  - `scenes.yaml`
  - `secrets.yaml` → **ADD TO .gitignore**

**Create .gitignore:**
```
secrets.yaml
.storage/
home-assistant_v2.db
home-assistant.log
*.log
tts/
deps/
__pycache__/
```

### 4. Initial Commit & Push

```bash
git add .
git commit -m "Initial HA config export"
git push -u origin main
```

### 5. Set Up HA Git Pull Add-on

**Install:**
- HA → Settings → Add-ons → Git Pull → Install

**Configure (add-on config):**
```yaml
git_branch: main
git_command: pull
git_remote: origin
repository: "git@gitea.<your-local-domain>:user/ha-config.git"  # SSH
# OR
repository: "http://gitea.<your-local-domain>:3000/user/ha-config.git"  # HTTPS

# For SSH auth:
deployment_key:
  - "-----BEGIN OPENSSH PRIVATE KEY-----"
  - "... your deploy key ..."
  - "-----END OPENSSH PRIVATE KEY-----"

# For HTTPS auth (alternative):
# repository: "https://oauth2:TOKEN@gitea.<your-local-domain>:3000/user/ha-config.git"
```

**Generate Deploy Key:**
```bash
ssh-keygen -t ed25519 -f ha_deploy_key -N ""
# Add ha_deploy_key.pub to GitLab/Gitea as deploy key (read-only)
# Paste ha_deploy_key contents into add-on config
```

### 6. Clone Locally for Claude

```bash
git clone http://gitea.<your-local-domain>:3000/user/ha-config.git
cd ha-config
# Point Claude Code at this folder
```

---

## Daily Workflow

```
1. Open ha-config folder in Claude Code
2. Ask Claude to create/modify automations
3. Review changes: git diff
4. Commit: git commit -am "Add motion light automation"
5. Push: git push
6. HA Git Pull add-on syncs (auto or manual trigger)
7. HA reloads config
```

## Trigger Options

- **Manual**: Click "Start" on Git Pull add-on
- **Scheduled**: Add-on polls every X minutes
- **Webhook**: GitLab/Gitea webhook → HA automation → restart add-on

---

## Secrets Management

**Never commit secrets.yaml!**

Options:
1. **Manual sync**: Keep secrets.yaml only on HA, edit via File Editor
2. **Encrypted secrets**: Use `git-crypt` or SOPS
3. **Environment vars**: Reference in config, set in HA
