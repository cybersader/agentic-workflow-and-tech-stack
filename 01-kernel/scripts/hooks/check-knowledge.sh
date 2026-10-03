#!/bin/bash
# check-knowledge.sh — Stop hook for knowledge-base awareness
# Prompts for knowledge capture and gradient transitions before session end
#
# Used by Stop hook in .claude/settings.local.json
# Replaces inline echo commands for KB status

KB_DIR="${1:-knowledge-base}"

# No knowledge-base = skip (standard projects don't have one)
if [ ! -d "$KB_DIR" ]; then
  exit 0
fi

echo "=== Knowledge Base Status ==="

INBOX=$(ls -1 "$KB_DIR/00-inbox/"*.md 2>/dev/null | grep -v _README | wc -l)
WORKING=$(ls -1 "$KB_DIR/01-working/"*.md 2>/dev/null | grep -v _README | wc -l)
LEARNINGS=$(ls -1 "$KB_DIR/02-learnings/"*.md 2>/dev/null | grep -v _README | wc -l)
REFERENCE=$(ls -1 "$KB_DIR/03-reference/"*.md 2>/dev/null | grep -v _README | wc -l)

echo "  00-inbox:      $INBOX items"
echo "  01-working:    $WORKING drafts"
echo "  02-learnings:  $LEARNINGS insights"
echo "  03-reference:  $REFERENCE docs"

# Prompt gradient transitions
if [ "$INBOX" -gt 0 ]; then
  echo ""
  echo "[Knowledge] Inbox has $INBOX unprocessed items."
  echo "  Process before stopping: promote to 01-working/ or 02-learnings/, or archive to 04-archive/"
fi

if [ "$WORKING" -gt 0 ]; then
  echo ""
  echo "[Knowledge] Working has $WORKING active drafts."
  echo "  Any ready to promote? Distilled insight -> 02-learnings/ | Stable doc -> 03-reference/"
fi

# Prompt if nothing was captured this session
TOTAL=$((INBOX + WORKING + LEARNINGS + REFERENCE))
if [ "$TOTAL" -eq 0 ]; then
  echo ""
  echo "[Knowledge] Knowledge base is empty. Any insights from this session worth capturing?"
  echo "  Quick capture -> 00-inbox/ | Distilled insight -> 02-learnings/"
fi

exit 0
