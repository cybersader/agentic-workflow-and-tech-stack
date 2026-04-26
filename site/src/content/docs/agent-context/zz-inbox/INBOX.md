---
title: Running inbox — quick idea capture
description: Unsorted bullet-list of ideas for the agentic workflow scaffold. Append with a date prefix; promote to a per-idea file under this folder when a bullet grows into a paragraph. No frontmatter requirements on individual bullets — keep it cheap to append.
stratum: 5
status: active
sidebar:
  order: 1
tags:
  - meta
  - agent-context
  - inbox
  - capture
  - running-list
date: 2026-04-24
---

Append bullets at the **top**, newest first. Date prefix: `- YYYY-MM-DD: …`.

When a bullet grows into a real thought, give it its own file (`YYYY-MM-DD-topic.md`) in this folder; leave a one-line stub bullet here pointing to it so the chronology stays scannable.

---

<!-- 
  Append new bullets under this comment.
  Format: - YYYY-MM-DD: idea text. Optional trailing link.
  When a bullet gets its own file, replace with:
    - YYYY-MM-DD: <short label> → [zz-inbox/YYYY-MM-DD-topic.md](/agentic-workflow-and-tech-stack/agent-context/zz-inbox/YYYY-MM-DD-topic/)
-->

- 2026-04-25: `claude -r <uuid>` is cwd-strict — sharpens portaconv's wedge → [2026-04-25-claude-r-cwd-strict-vs-portaconv-wedge.md](/agentic-workflow-and-tech-stack/agent-context/zz-inbox/2026-04-25-claude-r-cwd-strict-vs-portaconv-wedge/). Tier-2 substrate bug (upstream [#5768](https://github.com/anthropics/claude-code/issues/5768) open). Empirically reproduced; portaconv's docs updated to name the bug + add "When `claude -r` is enough" section.
