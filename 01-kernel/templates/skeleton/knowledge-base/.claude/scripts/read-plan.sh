#!/bin/bash
# read-plan.sh — Smart PreToolUse plan reader
# Detects empty/malformed task_plan.md and prompts Claude to act
#
# Used by PreToolUse hook in .claude/settings.local.json
# Replaces inline: cat task_plan.md 2>/dev/null | head -30 || true

PLAN_FILE="${1:-task_plan.md}"

# No file = silent (not all sessions use planning)
if [ ! -f "$PLAN_FILE" ]; then
  exit 0
fi

# File exists but is empty or has no phases
TOTAL=$(grep -c "### Phase" "$PLAN_FILE" 2>/dev/null || echo 0)
if [ "$TOTAL" -eq 0 ]; then
  echo "[task-plan] ⚠ task_plan.md exists but has no phases."
  echo "  Ask the user: 'task_plan.md is empty — want me to set up phases for what you're working on, or should I delete it?'"
  echo "  To populate: break current work into 2-7 phases with ### Phase headings"
  echo "  To remove: rm task_plan.md"
  exit 0
fi

# Valid file — show first 30 lines
head -30 "$PLAN_FILE"
