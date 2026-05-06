# ============================================================================
# CLAUDE CODE HELPERS
# Source this file in ~/.bashrc: source /path/to/claude-code-helpers.sh
# ============================================================================

# Basic aliases
#
# Resume semantics: `--continue` auto-jumps to the most recent session in the
# current directory. `--resume` opens the interactive session picker. The
# lowercase-r aliases do what you usually want ("just get me back in");
# capital-R exposes the picker when you actually want it.
alias cc='claude'                                             # Normal start
alias ccy='claude --dangerously-skip-permissions'             # Skip all permission prompts
alias ccr='claude --continue'                                 # Resume most-recent session
alias ccry='claude --continue --dangerously-skip-permissions' # Resume most-recent + skip
alias ccR='claude --resume'                                   # Session picker
alias ccRy='claude --resume --dangerously-skip-permissions'   # Session picker + skip

# Quick project start with skip permissions
# Usage: ccp /path/to/project
ccp() {
    if [ -n "$1" ]; then
        cd "$1" && claude --dangerously-skip-permissions
    else
        echo "Usage: ccp <project-path>"
        echo "Starts Claude Code with --dangerously-skip-permissions in the specified directory"
    fi
}

# Start Claude with a specific prompt
# Usage: ccs "Help me refactor this function"
ccs() {
    if [ -n "$1" ]; then
        claude --dangerously-skip-permissions -p "$1"
    else
        echo "Usage: ccs \"your prompt here\""
    fi
}
