# Problem Statement: MCP Gateway for Home Assistant Configuration

## The Gap

**Current State**: Home Assistant's official MCP server (2025.2+) provides:
- Entity state queries
- Service calls (turn on/off, etc.)
- Natural language device control

**Missing**:
- File system access to `/config/`
- Ability to edit `configuration.yaml`, `automations.yaml`, `scripts.yaml`
- Creating/modifying dashboards, templates, packages
- Full configuration management

## User Need

> "I want Claude to do configurations for me"

This means:
1. Read existing HA config files
2. Write/modify YAML configurations
3. Create automations, scripts, helpers
4. Validate changes before applying
5. Reload configurations after changes

## Why Current Solutions Don't Work

### HA Official MCP
- REST API only - no file access
- Can call services, can't edit config

### Docker MCP Gateway
- Manages Docker containers
- Doesn't proxy arbitrary APIs or file systems
- Wrong tool for this job

### Generic REST MCP Servers
- Can call HA REST API
- Still no file system access
- Same limitation as official MCP

## What's Actually Needed

An MCP server that provides **file system access** to the HA config directory, securely tunneled via Tailscale.

### Options to Evaluate

1. **SSH MCP Server** - Connect to HA via SSH, read/write files
2. **Filesystem MCP Server** - Mount or access HA config remotely
3. **Custom HA Add-on** - MCP server running inside HA with config access
4. **Samba/NFS + Local MCP** - Mount config share, use local filesystem MCP

## Security Requirements

- Tailscale-only access (no public exposure)
- Scoped to `/config/` directory only
- Ideally read-write but with backup/validation
- Token/key rotation capability
