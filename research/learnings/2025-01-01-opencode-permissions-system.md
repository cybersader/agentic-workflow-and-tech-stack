---
date: 2025-01-01
tags:
  - opencode
  - permissions
  - configuration
  - workflow
---

# OpenCode Permissions System

## Overview

OpenCode has a granular permission system with three modes per tool and pattern-based bash command allowlisting.

## Permission Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `"allow"` | Auto-execute without prompting | Fast iteration, trusted workflows |
| `"ask"` | Prompt for approval each time | Security-conscious, learning mode |
| `"deny"` | Block the tool entirely | Restrict dangerous operations |

**Default**: OpenCode defaults to `"allow"` for most operations. Only `doom_loop` and `external_directory` default to `"ask"`.

## Configuration Hierarchy

| Scope | Location | Priority |
|-------|----------|----------|
| Global | `~/.config/opencode/opencode.json` | Lowest |
| Per-project | `.opencode/opencode.json` | Middle |
| Per-agent | Agent definition file | Highest |

## Configurable Tools

- `edit` - File modifications
- `bash` - Command execution
- `skill` - Skill tool access
- `webfetch` - Web fetching
- `doom_loop` - Infinite loop protection
- `external_directory` - Operations outside project

## Configuration Examples

### Basic Permission Config

```json
{
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "webfetch": "allow"
  }
}
```

### Granular Bash Allowlisting

Pattern-based rules with wildcard support:

```json
{
  "permission": {
    "bash": {
      "npm install": "allow",
      "npm run *": "allow",
      "git status": "allow",
      "git add *": "allow",
      "git commit *": "ask",
      "git push *": "ask",
      "rm -rf *": "deny",
      "terraform *": "deny",
      "*": "ask"
    }
  }
}
```

**Wildcards:**
- `*` = matches any character sequence
- `?` = matches single character
- Specific commands override wildcards

### Production-Safe Config

```json
{
  "permission": {
    "edit": "ask",
    "bash": {
      "rm *": "deny",
      "truncate": "deny",
      "dd": "deny",
      "mkfs": "deny",
      "chmod 777": "deny",
      "*": "ask"
    },
    "external_directory": "deny"
  }
}
```

### Read-Only Agent

```json
{
  "tools": {
    "write": false,
    "edit": false,
    "bash": false
  },
  "permission": {
    "read": "allow"
  }
}
```

## Session-Wide Approval

During interactive use, the "accept always" option in the permission dialog:

**IMPORTANT: Pattern-Based, Not Path-Based**

Session approval works on the **first two command elements** (pattern), not the exact command:

- Approving `ls /some/folder` → whitelists `ls *` for entire session
- ALL subsequent `ls` commands will auto-approve
- Pipelines accumulate: Approving `cd dir && ls` whitelists BOTH `cd *` AND `ls *`
- **Session only** — does NOT persist across OpenCode restarts

**Example:**
1. Config: `"ls *": "ask"`
2. User approves `ls /home/user/project`
3. Result: ALL `ls` commands auto-approve for rest of session

**Security Consideration:** Be cautious with "accept always" for risky commands. Once you approve one variation, all variations of that command will auto-execute for the session.

**Source:** [GitHub #5330 - More Explicit Bash Command Permissions](https://github.com/sst/opencode/issues/5330)

## Non-Interactive Mode

```bash
opencode -p "your task here"
```

All permission prompts auto-approved. Use for CI/CD or scripting.

## Comparison: Claude Code vs OpenCode

| Feature | Claude Code | OpenCode |
|---------|-------------|----------|
| Permission prompts | Yes, for risky ops | Configurable per tool |
| Granular bash allowlist | No | Yes, pattern-based |
| Session approval | Yes | Yes (`A` key) |
| Default behavior | Ask for risky ops | Allow most |
| Per-agent override | Limited | Full support |
| Mode toggle | Shift+Tab | Manual config |

## Recommended Workflow Setup

For this scaffold, add to `.opencode/opencode.json`:

```json
{
  "permission": {
    "edit": "ask",
    "bash": {
      "npm run *": "allow",
      "git status": "allow",
      "git diff *": "allow",
      "git add *": "ask",
      "git commit *": "ask",
      "git push *": "ask",
      "rm -rf *": "deny",
      "*": "ask"
    },
    "webfetch": "allow",
    "external_directory": "ask"
  }
}
```

## Sources

- [OpenCode Permissions Docs](https://opencode.ai/docs/permissions/)
- [OpenCode Config Docs](https://opencode.ai/docs/config/)
- [GitHub Issue #1813 - Yolo mode](https://github.com/sst/opencode/issues/1813)
- [GitHub Issue #2632 - Default permissions](https://github.com/sst/opencode/issues/2632)
- [GitHub Issue #5330 - More Explicit Bash Command Permissions](https://github.com/sst/opencode/issues/5330)
- [GitHub Issue #4041 - Accept All Behavior for Bash Chains](https://github.com/sst/opencode/issues/4041)
