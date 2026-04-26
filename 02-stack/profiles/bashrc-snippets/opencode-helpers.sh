# ============================================================================
# OPENCODE HELPERS - Smart session matcher
# Requires: jq
# Optional: fzf (for prettier picker UI)
#
# Source this file in ~/.bashrc: source /path/to/opencode-helpers.sh
# ============================================================================

# Helper: get sessions for current directory
_oc_get_sessions() {
    local session_dir="$HOME/.local/share/opencode/storage/session/global"
    local cwd="$1"
    grep -l "\"directory\": \"$cwd\"" "$session_dir"/*.json 2>/dev/null | while read -r f; do
        jq -r '[.time.updated, .id, (.title // "untitled")[0:50]] | @tsv' "$f" 2>/dev/null
    done | sort -rn
}

# Smart session picker (interactive)
# Usage: o
#
# Keybindings (with fzf):
#   Enter   - Continue selected session
#   Ctrl-N  - New session (prompts for task description)
#   ESC     - Cancel (do nothing)
#
o() {
    local cwd
    cwd="$(pwd)"

    if ! command -v jq &>/dev/null; then
        echo "jq not found, starting fresh"
        opencode "$@"
        return
    fi

    local session_data
    session_data=$(_oc_get_sessions "$cwd" | head -20)

    if [ -z "$session_data" ]; then
        # No sessions - prompt for new
        echo "No sessions for $(basename "$cwd")"
        read -p "Describe your task (Enter=skip): " task_desc
        if [ -n "$task_desc" ]; then
            opencode "$@" -p "$task_desc"
        else
            opencode "$@"
        fi
        return
    fi

    local session_count
    session_count=$(echo "$session_data" | wc -l)

    # Use fzf if available for prettier UI
    if command -v fzf &>/dev/null; then
        local formatted
        formatted=$(echo "$session_data" | while IFS=$'\t' read -r ts id title; do
            local date
            date=$(date -d @$((ts/1000)) '+%m/%d %H:%M' 2>/dev/null || echo "???")
            printf "%s\t%s  %s\n" "$id" "$date" "$title"
        done)

        local selected
        selected=$(echo "$formatted" | fzf \
            --header="Sessions for $(basename "$cwd") ($session_count found)
Enter=continue · Ctrl-N=new · ESC=cancel" \
            --prompt="Select> " \
            --height=50% \
            --reverse \
            --bind="ctrl-n:abort" \
            --expect=ctrl-n \
            --info=hidden \
            --border=rounded \
            --header-first)

        local key action_line
        key=$(echo "$selected" | head -1)
        action_line=$(echo "$selected" | tail -1)

        if [ "$key" = "ctrl-n" ]; then
            # Ctrl-N pressed: new session with optional task description
            echo ""
            read -p "Describe your task (Enter=skip): " task_desc
            if [ -n "$task_desc" ]; then
                opencode "$@" -p "$task_desc"
            else
                opencode "$@"
            fi
        elif [ -n "$action_line" ]; then
            # Session selected
            local session_id
            session_id=$(echo "$action_line" | cut -f1)
            opencode -s "$session_id" "$@"
        fi
        # ESC = do nothing (cancelled)
        return
    fi

    # Fallback: simple numbered list
    echo "Sessions for $(basename "$cwd"):"
    echo ""
    local i=1
    local -a ids=()
    while IFS=$'\t' read -r ts id title; do
        local date
        date=$(date -d @$((ts/1000)) '+%m/%d %H:%M' 2>/dev/null || echo "???")
        ids+=("$id")
        echo "  [$i] $date  $title"
        ((i++))
    done <<< "$session_data"
    echo ""
    echo "  [n] New session"
    echo "  [q] Cancel"
    echo ""
    read -p "Choice [1]: " choice

    case "$choice" in
        n|N)
            read -p "Describe your task (Enter=skip): " task_desc
            if [ -n "$task_desc" ]; then
                opencode "$@" -p "$task_desc"
            else
                opencode "$@"
            fi
            ;;
        q|Q) echo "Cancelled" ;;
        "") opencode -s "${ids[0]}" "$@" ;;
        [0-9]*)
            if [ "$choice" -ge 1 ] && [ "$choice" -lt "$i" ]; then
                opencode -s "${ids[$((choice-1))]}" "$@"
            else
                echo "Invalid choice"
            fi
            ;;
        *) echo "Cancelled" ;;
    esac
}

# Quick continue - prefers current directory's most recent session
# Usage: oc
oc() {
    local cwd
    cwd="$(pwd)"

    if ! command -v jq &>/dev/null; then
        echo "jq not found, using global continue"
        opencode -c "$@"
        return
    fi

    local session_data
    session_data=$(_oc_get_sessions "$cwd" | head -1)

    if [ -n "$session_data" ]; then
        local ts id title date
        IFS=$'\t' read -r ts id title <<< "$session_data"
        date=$(date -d @$((ts/1000)) '+%m/%d %H:%M' 2>/dev/null || echo "???")
        echo "Continuing: $title ($date)"
        opencode -s "$id" "$@"
    else
        echo "No sessions for $(basename "$cwd"), using global continue"
        opencode -c "$@"
    fi
}

# New session (skip picker)
alias on='opencode'
