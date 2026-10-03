# ============================================================================
# ZELLIJ SESSION HELPERS
# Source this file in ~/.bashrc: source /path/to/zellij-helpers.sh
#
# Session behavior:
#   z <name>   — Normal session (no resurrection, dies when terminal closes)
#   zp <name>  — Persistent session (resurrection enabled, survives disconnect)
#
# Requires: session_serialization false  in ~/.config/zellij/config.kdl
# ============================================================================

# --- Session Management ---

# Attach to zellij session (or create if doesn't exist)
# Sessions are NOT resurrectable by default (clean behavior)
# NOTE: Zellij+WSL resize bug - run `zfix` if content looks squished
z() {
    if [ -n "$1" ]; then
        zellij attach "$1" 2>/dev/null || zellij -s "$1"
    else
        zellij attach 2>/dev/null || zellij
    fi
}

# Start/attach a PERSISTENT session (resurrection enabled)
# Use for sessions you want to survive disconnects (SSH, phone access)
zp() {
    if [ -n "$1" ]; then
        zellij attach "$1" -c --session-serialization true 2>/dev/null || \
        zellij -s "$1" --session-serialization true
    else
        echo "Usage: zp <session-name>"
        echo "  Starts session with resurrection enabled"
        echo "  Use 'z <name>' for normal (no resurrection) sessions"
    fi
}

# Attach with resurrection support (forces layout commands to re-run)
zr() {
    if [ -n "$1" ]; then
        zellij attach "$1" --force-run-commands 2>/dev/null || zellij -s "$1"
    else
        zellij attach --force-run-commands 2>/dev/null || zellij
    fi
}

# --- Listing ---

# List zellij sessions (active first, dead count summary)
zl() {
    if [ "$1" = "-a" ]; then
        # Show everything (raw output)
        zellij list-sessions 2>/dev/null || echo "No zellij sessions"
        return
    fi

    local output
    output=$(zellij list-sessions 2>/dev/null)
    if [ -z "$output" ]; then
        echo "No zellij sessions"
        return
    fi

    # Show active sessions first
    local active
    active=$(echo "$output" | grep -v "EXITED")
    if [ -n "$active" ]; then
        echo "Active:"
        echo "$active" | sed 's/^/  /'
    fi

    # Show dead count (not full list — use zl -a to see all)
    local dead_count
    dead_count=$(echo "$output" | grep -c "EXITED" 2>/dev/null || true)
    if [ "$dead_count" -gt 0 ]; then
        echo ""
        echo "$dead_count dead sessions (zclean to remove, zl -a to list all)"
    fi
}

# List only ACTIVE sessions (filter out EXITED)
zla() {
    zellij list-sessions 2>/dev/null | grep -v "EXITED" || echo "No active zellij sessions"
}

# --- Cleanup ---

# Clean up all EXITED (dead) sessions
zclean() {
    zellij delete-all-sessions -y 2>/dev/null && echo "Cleaned dead sessions" || echo "No dead sessions to clean"
}

# Smart remove: kills if active, then deletes (solves "can't delete active" problem)
zrm() {
    if [ -z "$1" ]; then
        echo "Usage: zrm <session-name>  (or 'zrm all' for everything)"
        return
    fi
    if [ "$1" = "all" ]; then
        zellij kill-all-sessions -y 2>/dev/null
        zellij delete-all-sessions -y 2>/dev/null
        echo "All sessions removed"
    else
        zellij kill-session "$1" 2>/dev/null
        zellij delete-session "$1" 2>/dev/null
        echo "Removed session: $1"
    fi
}

# Kill a zellij session
zk() {
    if [ -n "$1" ]; then
        zellij kill-session "$1"
    else
        echo "Usage: zk <session-name>"
        echo "Sessions:"
        zellij list-sessions 2>/dev/null | sed 's/^/  /'
    fi
}

# Delete session (alias for zk)
alias zd='zk'

# Kill ALL sessions (active + dead) — nuclear option
zka() {
    zellij kill-all-sessions -y 2>/dev/null
    zellij delete-all-sessions -y 2>/dev/null
    echo "All zellij sessions killed and cleaned"
}

# --- Utilities ---

# Fix Zellij terminal size (workaround for WSL resize bug)
zfix() {
    if [ -n "$ZELLIJ" ]; then
        zellij action toggle-fullscreen
        sleep 0.1
        zellij action toggle-fullscreen
        echo "Zellij size recalculated"
    else
        echo "Not inside Zellij"
    fi
}

# --- Autocomplete ---

_zellij_complete() {
    local sessions
    sessions=$(zellij list-sessions 2>/dev/null | sed 's/\x1b\[[0-9;]*m//g' | awk '{print $1}')
    COMPREPLY=($(compgen -W "$sessions" -- "${COMP_WORDS[COMP_CWORD]}"))
}
complete -F _zellij_complete z
complete -F _zellij_complete zp
complete -F _zellij_complete zk
complete -F _zellij_complete zr
complete -F _zellij_complete zrm
complete -F _zellij_complete zd
complete -F _zellij_complete zellij
