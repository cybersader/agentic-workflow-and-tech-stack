# Android MCP Clients and AI Assistants

## My Use Case

I'm looking for AI clients on Android that:
- Could be used for the digital assistant side button
- Support MCP ideally - so I can connect to my home infrastructure

**Key realization:** The digital assistant button route is totally different from the Termux SSH → desktop route. They would be separate AI instances with different context/state.

---

## The Problem

You want an AI assistant on Android that:
1. Can be triggered via the side button (Digital Assistant role)
2. Supports MCP for tool integration
3. Controls your phone or connects to your infrastructure

**Current Reality:** The intersection of "Digital Assistant button" and "MCP client" is nearly empty.

---

## Digital Assistant Button Apps

These can be bound to Android's assistant button/gesture (Settings → Apps → Default apps → Digital assistant app):

| App | MCP Support | Notes |
|-----|-------------|-------|
| **Google Gemini** | ❌ No | Full system integration, proprietary tools |
| **Google Assistant** | ❌ No | Legacy, being replaced by Gemini |
| **Samsung Bixby** | ❌ No | Samsung-only, proprietary |
| **Microsoft Copilot** | ❌ No | M365 integration, no MCP |
| **ChatGPT** | ⚠️ Web only | Android app doesn't expose MCP |
| **Perplexity** | ❌ No | Search-focused, no MCP |

---

## MCP Clients on Android

| App | Digital Assistant? | MCP Support | Notes |
|-----|-------------------|-------------|-------|
| **systemprompt MCP** | ⚠️ Unlikely | ✅ Yes | Voice-controlled MCP client |
| **Tasker + MCP Server** | N/A | ✅ Yes | Exposes Tasker as MCP tools |

### systemprompt MCP

The **only clearly MCP-native mobile client**:
- Connects to multiple MCP servers
- Supports OAuth, streaming
- Voice-controlled

**Install:** Search "systemprompt MCP" on Google Play

**Limitation:** Not documented as registering for Digital Assistant role (side button).

---

## Workarounds

### Option A: systemprompt + Tasker MCP Server

1. Install **systemprompt MCP** from Play Store
2. Set up **Tasker** with **Tasker MCP Server** (exposes Tasker tasks as MCP tools)
3. In systemprompt, connect to your Tasker MCP server
4. Use OEM shortcut (double-press side key, back-tap) to launch systemprompt

This gives you:
- MCP-powered AI
- Android automation via Tasker
- Physical button trigger (not the official assistant role, but functional)

### Option B: Remote MCP via Phone Assistant

1. Use **Claude Desktop** or **ChatGPT web** on PC as MCP host
2. Run MCP servers like:
   - `tasker-mcp-server` (Android automation)
   - `android-adb-mcp-server` (ADB control)
3. Map side button to Gemini/ChatGPT app
4. Use voice to trigger actions that the desktop agent performs via MCP

**Clunky but gives MCP power without waiting for mobile client support.**

### Option C: SSH to Claude Code

Using Termux + SSH to your desktop running Claude Code:
```bash
# In Termux
ssh desktop -t "cd /project && claude --print 'Your prompt here'"
```

---

## Future Outlook

**ChatGPT is the most likely candidate** to become the first mainstream "side button + MCP" app because:
- Already has Digital Assistant role on Android
- Has MCP support in Developer Mode (web)
- Mobile support is just a matter of time

---

## Setting Up the Side Button

### Check Available Assistants

1. Install candidate apps (Gemini, ChatGPT, Perplexity)
2. Go to **Settings → Apps → Default apps → Digital assistant app**
3. See which apps are listed (only these can be bound)

### Samsung Specific

1. **Settings → Advanced features → Side key**
2. Set "Press and hold" = "Digital assistant"
3. Choose assistant in Default apps menu

### Using Custom Shortcuts for MCP Apps

Since systemprompt MCP may not appear in Digital Assistant list:

**Back Tap (Pixel/supported phones):**
- Settings → System → Gestures → Quick Tap
- Set to launch systemprompt

**Tasker/Automate:**
- Create automation to launch app on specific trigger

**Bxactions (Samsung, requires ADB):**
- Remap Bixby button to any app

---

## Tasker MCP Server Setup

Turn your phone into an MCP server:

1. **Install Tasker** from Play Store
2. **Install Tasker MCP Server** plugin
3. **Create Tasker Tasks** for actions you want (toggle WiFi, send SMS, etc.)
4. **Expose via MCP** using the plugin
5. **Connect from desktop** Claude to your phone's MCP endpoint

This allows Claude to:
- Control phone settings
- Send messages
- Read notifications
- Run automations

---

## Summary

| Goal | Solution |
|------|----------|
| MCP on Android | systemprompt MCP |
| Side button + AI | ChatGPT (no MCP yet) |
| Side button + MCP | Not available yet |
| Phone automation via MCP | Tasker MCP Server |
| Workaround | systemprompt + gesture shortcut |

**Best current path:** Use systemprompt MCP with a custom gesture/shortcut, not the official Digital Assistant role.
