# ─── OSC 7: report current working directory to the terminal emulator ───
# Paste into ~/.bashrc on any machine you SSH into (desktop, remote VMs, etc.).
#
# WHY: modern terminal emulators (WezTerm, Kitty, Ghostty, iTerm2) can
# "clone this tab at the current path" only if the shell tells them where
# it is. OSC 7 is the escape sequence that does it — a URI like
# file://hostname/abs/path printed on every prompt.
#
# WHAT IT ENABLES:
#   - WezTerm's Ctrl+Shift+Enter → new tab at same cwd (even across SSH)
#   - Kitty's `kitty @ new-tab --cwd=current`
#   - Smarter spawn behavior in Windows Terminal / iTerm2
#
# COST: one extra escape sequence per prompt. Imperceptible.
#
# USAGE: source this file from ~/.bashrc, OR paste the function + PROMPT_COMMAND
# line directly into your ~/.bashrc.

# Report CWD via OSC 7.
# URL-encode the path so spaces/unicode don't break the URI.
__wezterm_osc7_cwd() {
  local path="${PWD}"
  local encoded=""
  local i ch
  for (( i = 0; i < ${#path}; i++ )); do
    ch="${path:i:1}"
    case "$ch" in
      [a-zA-Z0-9/._~-]) encoded+="$ch" ;;
      *) encoded+=$(printf '%%%02X' "'$ch") ;;
    esac
  done
  printf '\033]7;file://%s%s\033\\' "${HOSTNAME}" "${encoded}"
}

# Prepend to PROMPT_COMMAND (runs before the next prompt is drawn)
case "$PROMPT_COMMAND" in
  *__wezterm_osc7_cwd*) ;;  # already present, don't duplicate
  *) PROMPT_COMMAND="__wezterm_osc7_cwd;${PROMPT_COMMAND}" ;;
esac

# ─── Zsh equivalent (if/when you switch) ────────────────────────
# autoload -Uz add-zsh-hook
# __wezterm_osc7_cwd_zsh() {
#   printf '\033]7;file://%s%s\033\\' "${HOST}" "${PWD}"
# }
# add-zsh-hook chpwd __wezterm_osc7_cwd_zsh
# __wezterm_osc7_cwd_zsh   # fire once at shell start
