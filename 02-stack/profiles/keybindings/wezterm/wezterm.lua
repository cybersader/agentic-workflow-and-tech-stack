-- ─── WezTerm config for agentic workflows ────────────────────────────────
-- Fast tab switching, one-key SSH bootstrap, clone-tab-at-remote-cwd.
--
-- Install:
--   - Windows: copy or symlink this file to %USERPROFILE%\.wezterm.lua
--   - WSL/Linux/Mac: copy or symlink to ~/.wezterm.lua
-- See README.md in this directory for setup + OSC 7 prereq.
--
-- Layer model: this file covers the EMULATOR layer. For multiplexer
-- keybindings, see ../opencode-zellij/zellij/config.kdl.
-- For the layer precedence model, see 02-stack/02-terminal/hotkey-reference.md.

local wezterm = require('wezterm')
local act = wezterm.action
local config = wezterm.config_builder()

-- ─── Appearance ───────────────────────────────────────────────────────────
config.color_scheme = 'Catppuccin Mocha'       -- change to taste
config.font = wezterm.font('JetBrains Mono')   -- install first if missing
config.font_size = 11.5
config.window_background_opacity = 0.97
config.window_decorations = 'RESIZE'            -- no title bar; keep borders

-- Tab bar: show index + title, no auto-close on single tab
config.use_fancy_tab_bar = false
config.tab_bar_at_bottom = false
config.hide_tab_bar_if_only_one_tab = false
config.show_tab_index_in_tab_bar = true

-- Scrollback
config.scrollback_lines = 50000

-- Windows-specific: prefer WSL as default launch
if wezterm.target_triple:find('windows') then
  config.default_domain = 'WSL:Ubuntu'
end

-- ─── Keybindings ─────────────────────────────────────────────────────────
config.keys = {}

-- Tab switching (fastest ergonomic pattern)
-- Alt+1..9 → jump directly to tab N (0-indexed in the API, 1-indexed for users)
for i = 1, 9 do
  table.insert(config.keys, {
    key = tostring(i),
    mods = 'ALT',
    action = act.ActivateTab(i - 1),
  })
end

-- Ctrl+Tab / Ctrl+Shift+Tab → cycle next/prev
table.insert(config.keys, { key = 'Tab', mods = 'CTRL',       action = act.ActivateTabRelative(1)  })
table.insert(config.keys, { key = 'Tab', mods = 'CTRL|SHIFT', action = act.ActivateTabRelative(-1) })

-- Ctrl+Shift+Space → fuzzy tab picker (WezTerm's built-in navigator)
table.insert(config.keys, { key = 'Space', mods = 'CTRL|SHIFT', action = act.ShowTabNavigator })

-- Tab management
table.insert(config.keys, { key = 't', mods = 'CTRL|SHIFT', action = act.SpawnTab('CurrentPaneDomain') })
table.insert(config.keys, { key = 'w', mods = 'CTRL|SHIFT', action = act.CloseCurrentTab({ confirm = true }) })

-- ─── Bootstrap: Ctrl+Shift+D → new tab with SSH desktop → pa ───
-- Change "desktop" to your SSH host alias (see ~/.ssh/config).
table.insert(config.keys, {
  key = 'd',
  mods = 'CTRL|SHIFT',
  action = act.SpawnCommandInNewTab({
    args = { 'ssh', '-t', 'desktop', 'pa' },
  }),
})

-- ─── Clone tab at current cwd (works over SSH via OSC 7) ───
-- Requires OSC 7 reporting in the remote shell (see bashrc-snippets/osc7-cwd.sh).
-- Requires SSH ControlMaster for speed (see README.md).
table.insert(config.keys, {
  key = 'Enter',
  mods = 'CTRL|SHIFT',
  action = wezterm.action_callback(function(window, pane)
    local uri = pane:get_current_working_dir()
    if uri and uri.host and uri.path then
      local host = uri.host
      local path = uri.path
      -- If the reported host is the local hostname, just spawn locally in that path
      if host == wezterm.hostname() then
        window:perform_action(act.SpawnCommandInNewTab({ cwd = path }), pane)
      else
        -- Remote: SSH back to the same host and cd to the reported path
        window:perform_action(act.SpawnCommandInNewTab({
          args = { 'ssh', '-t', host, string.format('cd %q && exec $SHELL -l', path) },
        }), pane)
      end
    else
      -- Fallback: new tab in default domain (shell has no OSC 7 configured)
      window:perform_action(act.SpawnTab('CurrentPaneDomain'), pane)
    end
  end),
})

-- ─── Launcher menu: Ctrl+Shift+L opens a picker ──────────────
-- Add one entry per remote workspace you use. `-t` forces a TTY for pa's TUI.
config.launch_menu = {
  { label = 'desktop → pa (TUI)',          args = { 'ssh', '-t', 'desktop', 'pa' } },
  { label = 'desktop → raw shell',         args = { 'ssh', '-t', 'desktop' } },
  -- Add workspace-specific entries below — one key, one workspace, ready to go.
  -- { label = 'agentic-workflow',         args = { 'ssh', '-t', 'desktop', 'pa', 'launch', 'agentic-workflow' } },
  -- { label = 'cynario',                  args = { 'ssh', '-t', 'desktop', 'pa', 'launch', 'cynario' } },
}
table.insert(config.keys, { key = 'l', mods = 'CTRL|SHIFT', action = act.ShowLauncher })

-- ─── Command palette (WezTerm built-in, but add Ctrl+Shift+P shortcut) ───
table.insert(config.keys, { key = 'p', mods = 'CTRL|SHIFT', action = act.ActivateCommandPalette })

-- ─── Copy/paste (sensible defaults for WSL/Linux) ──────────────
table.insert(config.keys, { key = 'c', mods = 'CTRL|SHIFT', action = act.CopyTo('Clipboard') })
table.insert(config.keys, { key = 'v', mods = 'CTRL|SHIFT', action = act.PasteFrom('Clipboard') })

-- Quick select (grab URLs, hashes, paths from scrollback with one keystroke)
table.insert(config.keys, { key = 'f', mods = 'CTRL|SHIFT', action = act.Search({ CaseInSensitiveString = '' }) })

-- Copy mode (vim-like selection in scrollback)
table.insert(config.keys, { key = 'x', mods = 'CTRL|SHIFT', action = act.ActivateCopyMode })

-- Reload config
table.insert(config.keys, { key = 'r', mods = 'CTRL|SHIFT', action = act.ReloadConfiguration })

-- ─── Status bar: minimal, shows hostname + time ───────────────
wezterm.on('update-right-status', function(window, pane)
  window:set_right_status(wezterm.format({
    { Foreground = { AnsiColor = 'Grey' } },
    { Text = wezterm.hostname() .. '  ' .. wezterm.strftime('%H:%M') .. '  ' },
  }))
end)

return config
