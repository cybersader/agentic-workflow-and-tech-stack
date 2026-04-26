---
date: 2025-01-01
tags:
  - api-limits
  - images
  - opencode
  - claude-code
  - workflow-issue
---

# Anthropic API Image Size Limits

## The Issue

When pasting large images (screenshots, etc.) in Claude Code or OpenCode:

```
messages.16.content.2.image.source.base64: image exceeds 5 MB maximum: 21478728 bytes > 5242880 bytes
```

## Anthropic API Limits

| Limit | Value |
|-------|-------|
| Single image file size | **5 MB** (base64 encoded) |
| Single image dimensions | 8000 x 8000 pixels max |
| Multi-image (20+) dimensions | 2000 x 2000 pixels max |
| Total request size | 32 MB |

## Current Status

- **Claude Code**: Likely has image compression - haven't hit this limit in practice
- **OpenCode**: No compression yet - [PR #6455](https://github.com/sst/opencode/pull/6455) pending merge
  - Fix adds auto-compression to <4MB with smart format handling
  - Watch for merge, then update OpenCode to get fix

## Workarounds

1. **Manual compression** before pasting:
   - [TinyPNG](https://tinypng.com/)
   - [Squoosh](https://squoosh.app/)
   - ImageMagick: `convert input.png -resize 1568x1568\> -quality 85 output.jpg`

2. **Screenshot settings**: Reduce resolution in screenshot tool settings

3. **Format choice**: Use JPEG instead of PNG for screenshots (smaller file size)

## Impact on Workflow

- Breaks conversation flow when large image is pasted
- Error persists in `--continue` mode
- Must manually compress and re-paste

## Future Fix

Both tools should implement client-side image compression before API submission. Until then, pre-compress images manually.
