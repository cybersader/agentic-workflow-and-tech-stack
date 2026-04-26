---
stratum: 2
name: opencode-permissions
description: Expert in OpenCode permission configuration. Use when user asks about opencode.json, permission allowlists, bash command patterns, or wants to create/configure OpenCode permissions for a project.
branches: [agentic]
---

# OpenCode Permissions Configuration Expert

## Overview

I help configure OpenCode's granular permission system. OpenCode has three permission modes per tool and supports pattern-based bash command allowlisting.

## Permission Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `"allow"` | Auto-execute without prompting | Trusted operations, fast iteration |
| `"ask"` | Prompt for approval each time | Security-conscious, learning |
| `"deny"` | Block entirely | Dangerous operations |

**Default:** OpenCode defaults to `"allow"` for most operations.

## Configuration Hierarchy

| Scope | Location | Priority |
|-------|----------|----------|
| Global | `~/.config/opencode/opencode.json` | Lowest |
| Per-project | `.opencode/opencode.json` | Middle |
| Per-agent | Agent definition file | Highest |

## Configurable Tools

- `edit` - File modifications
- `bash` - Command execution (supports patterns!)
- `skill` - Skill tool access
- `webfetch` - Web fetching
- `doom_loop` - Infinite loop protection
- `external_directory` - Operations outside project

## Bash Pattern Syntax

Wildcards:
- `*` = matches any characters (e.g., `git *` matches all git commands)
- `?` = matches single character
- Specific commands override wildcards
- Last matching rule wins

## Project Type Templates

### Coding Project (Conservative)

```json
{
  "permission": {
    "edit": "ask",
    "bash": {
      "npm run *": "allow",
      "npm install": "allow",
      "npm test": "allow",
      "git status": "allow",
      "git diff *": "allow",
      "git log *": "allow",
      "git add *": "ask",
      "git commit *": "ask",
      "git push *": "ask",
      "rm -rf *": "deny",
      "rm -r *": "deny",
      "*": "ask"
    },
    "webfetch": "allow",
    "external_directory": "ask"
  }
}
```

### Media/Content Project (Read-Heavy)

```json
{
  "permission": {
    "edit": "ask",
    "bash": {
      "ls *": "allow",
      "find *": "allow",
      "du *": "allow",
      "file *": "allow",
      "mediainfo *": "allow",
      "ffprobe *": "allow",
      "exiftool *": "allow",
      "cat *": "allow",
      "head *": "allow",
      "tail *": "allow",
      "ffmpeg *": "ask",
      "mv *": "ask",
      "cp *": "ask",
      "rm *": "deny",
      "*": "ask"
    },
    "webfetch": "allow",
    "external_directory": "ask"
  }
}
```

### Home Automation / IoT Project

```json
{
  "permission": {
    "edit": "ask",
    "bash": {
      "curl *": "ask",
      "wget *": "ask",
      "docker ps *": "allow",
      "docker logs *": "allow",
      "docker exec *": "ask",
      "systemctl status *": "allow",
      "systemctl restart *": "ask",
      "journalctl *": "allow",
      "ping *": "allow",
      "ssh *": "deny",
      "rm *": "deny",
      "*": "ask"
    },
    "webfetch": "allow",
    "external_directory": "deny"
  }
}
```

### Read-Only Exploration Agent

```json
{
  "tools": {
    "write": false,
    "edit": false
  },
  "permission": {
    "bash": {
      "ls *": "allow",
      "cat *": "allow",
      "head *": "allow",
      "tail *": "allow",
      "find *": "allow",
      "grep *": "allow",
      "wc *": "allow",
      "*": "deny"
    },
    "webfetch": "allow",
    "external_directory": "allow"
  }
}
```

### Production-Safe (Maximum Security)

```json
{
  "permission": {
    "edit": "ask",
    "bash": {
      "rm *": "deny",
      "rmdir *": "deny",
      "truncate *": "deny",
      "dd *": "deny",
      "mkfs *": "deny",
      "chmod 777 *": "deny",
      "curl * | sh": "deny",
      "wget * | sh": "deny",
      "sudo *": "deny",
      "*": "ask"
    },
    "external_directory": "deny",
    "doom_loop": "deny"
  }
}
```

## Session Approval

During interactive use, the "accept always" option in the permission dialog:
- Grants "allow for session" for the **pattern** (first two command elements)
- Example: Approving `ls /some/folder` whitelists `ls *` for the entire session
- This means ALL `ls` commands will auto-approve after the first one
- **Session only** — does NOT persist across OpenCode restarts
- **Pipelines accumulate**: Approving `cd dir && ls` whitelists BOTH `cd *` AND `ls *`

**Security consideration:** Be cautious with "accept always" for risky commands. Once approved, all variations of that command will auto-execute.

## Process for Creating Config

1. **Identify project type** - Coding, media, automation, exploration?
2. **List common operations** - What commands will be run frequently?
3. **Identify risks** - What commands could cause damage?
4. **Set defaults** - Usually `"ask"` as fallback
5. **Add allowlist** - Frequently used safe commands
6. **Add denylist** - Dangerous commands to block
7. **Test** - Run through typical workflow to tune

## Quick Reference

```json
{
  "$schema": "https://opencode.ai/schema.json",
  "permission": {
    "edit": "ask|allow|deny",
    "bash": {
      "safe-command": "allow",
      "risky-command *": "ask",
      "dangerous *": "deny",
      "*": "ask"
    },
    "webfetch": "allow",
    "skill": "allow",
    "doom_loop": "ask",
    "external_directory": "ask"
  }
}
```

## See Also

- [Full permissions documentation](../../../research/learnings/2025-01-01-opencode-permissions-system.md)
- [Tool comparison](../../../docs/tool-comparison.md#permission-systems)
