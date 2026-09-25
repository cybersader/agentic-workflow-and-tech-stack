# ============================================================================
# TMUX SESSION HELPERS
# Source this file in ~/.bashrc: source /path/to/tmux-helpers.sh
# ============================================================================

# Attach to tmux session (or create if doesn't exist)
t() {
    if [ -n "$1" ]; then
        tmux attach -t "$1" 2>/dev/null || tmux new -s "$1"
    else
        tmux attach 2>/dev/null || tmux new
    fi
}

# Kill a tmux session
tk() {
    if [ -n "$1" ]; then
        tmux kill-session -t "$1"
    else
        echo "Usage: tk <session-name>"
        echo "Sessions:"
        tmux list-sessions -F "  #{session_name}" 2>/dev/null
    fi
}

# List tmux sessions
tl() {
    tmux list-sessions 2>/dev/null || echo "No tmux sessions"
}

# Autocomplete tmux session names for t, tk commands
_tmux_complete() {
    local sessions
    sessions=$(tmux list-sessions -F "#{session_name}" 2>/dev/null)
    COMPREPLY=($(compgen -W "$sessions" -- "${COMP_WORDS[COMP_CWORD]}"))
}
complete -F _tmux_complete t
complete -F _tmux_complete tk
complete -F _tmux_complete tmux
