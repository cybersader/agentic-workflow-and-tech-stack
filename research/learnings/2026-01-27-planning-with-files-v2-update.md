---
date created: 2026-01-27
tags:
  - context-engineering
  - planning-with-files
  - hooks
  - manus
source: https://github.com/OthmanAdi/planning-with-files
---

# Planning-with-Files v2.0.0+ Update Analysis

## Context

We adopted the planning-with-files approach for context persistence hooks (PreToolUse, PostToolUse, Stop) in our scaffold. This learning captures what changed in v2.0.0+ and what we should incorporate.

## What Changed (v2.0.0 - v2.11.0, Jan 2026)

### Three Core Files (expanded from one)

v1.x had just `task_plan.md`. v2.0.0 adds two more:

| File | Purpose | Scope |
|------|---------|-------|
| `task_plan.md` | Phases, decisions, status tracking | Task lifecycle |
| `findings.md` | Research discoveries, data collected | Session-scoped |
| `progress.md` | Session activity log, test results | Session-scoped |

### New Operational Rules

**2-Action Rule:** After every 2 view/search operations, save findings to `findings.md`. Prevents context erosion from visual information loss.

**3-Strike Error Protocol:**
1. First failure: Diagnose root cause
2. Second attempt: Try a different approach
3. Third failure: Escalate/pivot (never repeat identical failing actions)

**5-Question Reboot Test:** Validation checklist for task_plan.md completeness:
1. Goal defined?
2. Phases outlined?
3. Key questions listed?
4. Decisions documented?
5. Error log present?

### New Scripts

- `session-catchup.py` - Python utility for session recovery after `/clear` commands. Extracts work between last file save and context reset.
- `init-session.sh` / `init-session.ps1` - Session initialization helpers
- `check-complete.ps1` - Windows PowerShell equivalent of check-complete.sh

### Manus Context Engineering Reference

The reference.md documents six principles from Manus AI's production deployment:

1. **KV-cache optimization** - Keep prompt prefixes stable (10x cost difference: $0.30 cached vs $3.00 uncached per MTok)
2. **Logit masking over deletion** - Don't delete context, mask it
3. **Filesystem-as-memory** - Core principle we already follow
4. **Attention manipulation through recitation** - Re-reading files to prime attention
5. **Preserve error context** - Keep error logs for learning
6. **Avoid pattern fragility** - Don't over-rely on specific formatting

Three architectural strategies: context reduction, multi-agent isolation, context offloading.

**7-step agent loop:** Analyze, Think, Select, Execute, Observe, Iterate, Deliver. Emphasizes single-action execution and filesystem persistence.

### Multi-IDE Expansion

v2.7-v2.11 added support for 10+ AI coding tools including Gemini CLI, Clawd, Kiro, Continue, Kilocode, FactoryAI. We handle this differently through AGENTS.md portability.

## What We Already Have

| Capability | Our Implementation | Status |
|-----------|-------------------|--------|
| task_plan.md | Yes, core of our hooks | Equivalent |
| PreToolUse hook | settings.local.json | Equivalent |
| PostToolUse hook | settings.local.json | Equivalent |
| Stop hook | check-complete.sh | Equivalent |
| Filesystem-as-memory | Core principle | Equivalent |
| Phase-based tracking | task_plan.md phases | Equivalent |

## What to Incorporate

### High Value

1. **2-Action Rule** - Add to our hooks documentation as recommended practice. During exploration-heavy work, save findings every 2 operations to prevent context loss. We could mention this in CONCEPTS.md or the seacow-scaffolder output.

2. **3-Strike Error Protocol** - Good operational discipline. Add as a convention in project CLAUDE.md files when scaffolding.

3. **findings.md as recommended practice** - Not as a required file, but as a recommended pattern for research-heavy sessions. Our knowledge-base/00-inbox/ serves a similar but different purpose (project-scoped vs session-scoped). Both can coexist.

### Medium Value

4. **Session recovery pattern** - The session-catchup.py concept is useful but we solve this differently (Zellij for session persistence, knowledge-base for cross-session memory). Worth documenting as an option.

5. **5-Question Reboot Test** - Good checklist to include in our task_plan.md template suggestions.

### Low Value (Already Covered Differently)

6. **progress.md** - Our knowledge-base 01-working/ zone + 00-inbox/ captures this need. Adding a third required file adds friction.

7. **Multi-IDE support scripts** - We use AGENTS.md + tool-specific configs rather than script-per-IDE.

8. **Windows PowerShell scripts** - We're WSL-based.

## Recommendations

1. **Update CONCEPTS.md** - Add 2-Action Rule and 3-Strike Error Protocol as operational patterns
2. **Update seacow-scaffolder** - When creating task_plan.md template, mention findings.md as optional companion
3. **Update docs/02-project-init.md** - Reference these operational rules when explaining hooks
4. **Consider adding to knowledge-curator skill** - The 2-Action Rule aligns with "save context to filesystem" philosophy

## Key Insight

The planning-with-files project has grown from a simple hooks approach to a comprehensive context engineering skill. Our scaffold takes a different architectural path (temperature gradient, SEACOW-based organization, knowledge-base zones) but the operational rules (2-Action, 3-Strike) are tool-agnostic wisdom worth adopting.

The biggest difference: planning-with-files is a **skill** (loaded into one project). Our approach is a **scaffold** (organizational structure across projects). They're complementary, not competing.
