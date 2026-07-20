# ============================================================================
# DISABLE TERMINAL FLOW CONTROL
# Source this file in ~/.bashrc: source /path/to/flow-control.sh
# ============================================================================

# Disable XON/XOFF flow control
# This frees up Ctrl+S (was: stop output) and Ctrl+Q (was: resume output)
# for use by applications like vim, OpenCode, etc.
stty -ixon
