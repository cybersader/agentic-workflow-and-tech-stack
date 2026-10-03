#!/bin/bash
# Verify all phases in task_plan.md are complete before stopping
# Used by Stop hook to prevent premature session termination
#
# Source: Adapted from planning-with-files (Manus pattern)
# https://github.com/OthmanAdi/planning-with-files

PLAN_FILE="${1:-task_plan.md}"

# If no plan file exists, that's fine - not all sessions use one
if [ ! -f "$PLAN_FILE" ]; then
  echo "No task_plan.md found - OK to stop"
  exit 0
fi

# Detect empty or malformed plan files (no phases defined)
TOTAL=$(grep -c "### Phase" "$PLAN_FILE" 2>/dev/null | tr -d '[:space:]' || echo 0)
TOTAL=${TOTAL:-0}

if [ "$TOTAL" -eq 0 ]; then
  echo "=== Task Plan Warning ==="
  echo ""
  echo "⚠ task_plan.md exists but has no phases (### Phase headings)."
  echo "  This file is not doing anything useful."
  echo ""
  echo "  Either:"
  echo "    - Delete it:  rm task_plan.md"
  echo "    - Or populate it with phases for your current task"
  echo ""
  echo "OK to stop (empty plan is not a blocker)."
  exit 0
fi

echo "=== Task Completion Check ==="
echo ""

# Count phases by status
COMPLETE=$(grep -cF "**Status:** complete" "$PLAN_FILE" 2>/dev/null | tr -d '[:space:]' || echo 0)
IN_PROGRESS=$(grep -cF "**Status:** in_progress" "$PLAN_FILE" 2>/dev/null | tr -d '[:space:]' || echo 0)
PENDING=$(grep -cF "**Status:** pending" "$PLAN_FILE" 2>/dev/null | tr -d '[:space:]' || echo 0)

COMPLETE=${COMPLETE:-0}
IN_PROGRESS=${IN_PROGRESS:-0}
PENDING=${PENDING:-0}

echo "Total phases: $TOTAL"
echo "Complete: $COMPLETE"
echo "In progress: $IN_PROGRESS"
echo "Pending: $PENDING"
echo ""

# Check completion
if [ "$COMPLETE" -eq "$TOTAL" ]; then
  echo "✓ ALL PHASES COMPLETE"
  echo ""
  # Trigger thorough knowledge funnel when plan completes
  if [ -d "knowledge-base" ]; then
    echo "=== Knowledge Funnel Review ==="
    echo ""
    echo "All phases are done. Before wrapping up, do a thorough knowledge funnel:"
    echo ""
    echo "1. DISCOVERIES: Review each phase — what was learned that wasn't known before?"
    echo "   → Write atomic insights to knowledge-base/02-learnings/"
    echo "   → One insight per file, with frontmatter (date, temperature, tags)"
    echo ""
    echo "2. DECISIONS: Were architectural or design decisions made?"
    echo "   → Write stable docs to knowledge-base/03-reference/"
    echo ""
    echo "3. INBOX REVIEW: Process any raw captures in knowledge-base/00-inbox/"
    echo "   → Promote to 01-working/ (needs more work) or 02-learnings/ (distilled)"
    echo "   → Archive to 04-archive/ if done"
    echo ""
    echo "4. WORKING REVIEW: Finalize drafts in knowledge-base/01-working/"
    echo "   → Promote to 02-learnings/ (atomic insight) or 03-reference/ (stable doc)"
    echo ""
    echo "5. PLAN CLEANUP: Archive task_plan.md to knowledge-base/04-archive/ or delete it"
    echo ""
    echo "Ask the user: 'All phases complete. Want me to do a knowledge funnel review before wrapping up?'"
  fi
  exit 0
else
  echo "⚠ TASK NOT COMPLETE"
  echo ""
  echo "Do not stop until all phases are complete."
  exit 1
fi
