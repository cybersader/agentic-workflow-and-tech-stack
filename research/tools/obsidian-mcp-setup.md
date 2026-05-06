# Obsidian MCP Setup Guide

## My Use Case

I want Claude Code to help me build very large content files in my Obsidian vault without losing context. The issue is LLMs have short context windows, but I need it to:
- Feed data into itself as it goes
- Maintain a goal while building large documents
- Read/write vault files programmatically

**Setup context:**
- Have Claude Code installed via PS
- Tried pulling `mcp/obsidian` in Podman - kept spinning/timing out
- Docker Hub connectivity issues with Podman on Windows
- Eventually realized Local REST API plugin is the key requirement

---

## Overview

Connect Claude Code or Claude Desktop to your Obsidian vault for:
- Reading/writing vault files
- Searching notes
- Managing content programmatically

**Key Requirement:** You need the **Local REST API** plugin running in Obsidian.

---

## Prerequisites

1. **Obsidian** installed and running
2. **Local REST API plugin** installed and enabled
3. **Claude Desktop** or **Claude Code**

---

## Step 1: Install Local REST API Plugin

1. Open Obsidian → Settings → Community Plugins
2. Browse → Search "Local REST API"
3. Install and Enable
4. Go to plugin settings:
   - Note the **API Key** (copy this)
   - Note the **Port** (default: 27124)
   - **Disable HTTPS** for localhost use
   - **Enable CORS** (important!)

---

## Step 2: Test the Plugin

```bash
# Test if the plugin is responding
curl http://127.0.0.1:27124/

# Test with authentication
curl -H "Authorization: Bearer YOUR_API_KEY" http://127.0.0.1:27124/vault/
```

If you get a response, the plugin is working.

---

## Step 3: Configure Claude Desktop

Edit the config file at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

### Option A: NPM (Recommended)

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-obsidian"],
      "env": {
        "OBSIDIAN_HOST": "127.0.0.1",
        "OBSIDIAN_PORT": "27124",
        "OBSIDIAN_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Option B: Docker

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "OBSIDIAN_HOST=host.docker.internal",
        "-e", "OBSIDIAN_PORT=27124",
        "-e", "OBSIDIAN_API_KEY=your_api_key_here",
        "ghcr.io/modelcontextprotocol/server-obsidian:latest"
      ]
    }
  }
}
```

**Note:** Use `host.docker.internal` (not `127.0.0.1`) for Docker to reach your host.

---

## Step 4: Configure Claude Code

For Claude Code CLI, create or edit:
```
~/.config/claude/mcp_servers.json
```

```json
{
  "obsidian": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-obsidian"],
    "env": {
      "OBSIDIAN_HOST": "127.0.0.1",
      "OBSIDIAN_PORT": "27124",
      "OBSIDIAN_API_KEY": "your_api_key_here"
    }
  }
}
```

---

## Step 5: Restart and Test

1. Completely close Claude Desktop (check system tray)
2. Restart Claude Desktop
3. Ask: "What MCP servers are available?"
4. Ask: "Can you list files in my Obsidian vault?"

---

## Available Tools

The official Obsidian MCP server provides:

| Tool | Description |
|------|-------------|
| `obsidian_get_file_contents` | Read a single file |
| `obsidian_batch_get_file_contents` | Read multiple files |
| `obsidian_append_content` | Add content to file |
| `obsidian_patch_content` | Insert at heading/block |
| `obsidian_simple_search` | Text search across vault |
| `obsidian_complex_search` | JsonLogic queries |
| `obsidian_get_recent_changes` | Recently modified files |
| `obsidian_list_files_in_dir` | List directory contents |
| `obsidian_delete_file` | Delete file/directory |
| `obsidian_get_periodic_note` | Get daily/weekly notes |

---

## Common Issues

### "Connection Refused"

- Ensure Obsidian is running
- Check Local REST API plugin is enabled
- Verify port 27124 is correct

### "Permission Denied"

- Check API key is correct
- Ensure CORS is enabled in plugin settings

### Docker Can't Connect

- Use `host.docker.internal` not `127.0.0.1`
- Or use `--network host` flag

### HTTPS Issues

- Disable HTTPS in Local REST API plugin for localhost
- Use `http://` not `https://` in OBSIDIAN_HOST

---

## Configuration Mistakes to Avoid

❌ **Wrong:**
```json
{
  "env": {
    "OBSIDIAN_HOST": "https://127.0.0.1:27124/"
  }
}
```

✅ **Correct:**
```json
{
  "env": {
    "OBSIDIAN_HOST": "127.0.0.1",
    "OBSIDIAN_PORT": "27124",
    "OBSIDIAN_API_KEY": "your_key"
  }
}
```

Host should be just the hostname, not a full URL.

---

## Container Setup (Podman/Docker)

### Pull the Image

```bash
# Official MCP image
docker pull ghcr.io/modelcontextprotocol/server-obsidian:latest

# Alternative if Docker Hub works
docker pull mcp/obsidian:latest
```

### Run the Container

```bash
docker run -d \
  --name obsidian-mcp \
  -p 9001:8000 \
  -e OBSIDIAN_HOST=host.docker.internal \
  -e OBSIDIAN_PORT=27124 \
  -e OBSIDIAN_API_KEY=your_api_key \
  ghcr.io/modelcontextprotocol/server-obsidian:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  obsidian-mcp:
    image: ghcr.io/modelcontextprotocol/server-obsidian:latest
    environment:
      - OBSIDIAN_HOST=host.docker.internal
      - OBSIDIAN_API_KEY=${OBSIDIAN_API_KEY}
      - OBSIDIAN_PORT=27124
    ports:
      - "9001:8000"
    restart: unless-stopped
```

---

## Building Large Content Files

The MCP approach is ideal for building large files without context loss:

### Workflow

1. **Create outline** first
2. **Build incrementally** with `obsidian_append_content`
3. **Read existing** content for context
4. **Use search** to find related material

### Example Prompts

```
"Create an outline for [topic] in a new note"
"Read the outline and write section 1"
"Read sections 1-2 and write section 3, maintaining consistency"
"Search for related notes about [topic]"
```

---

## Official Resources

- **Official MCP Server:** [@modelcontextprotocol/server-obsidian](https://github.com/modelcontextprotocol/servers/tree/main/src/obsidian)
- **Local REST API Plugin:** [GitHub](https://github.com/coddingtonbear/obsidian-local-rest-api)
- **Docker Image:** `ghcr.io/modelcontextprotocol/server-obsidian`
