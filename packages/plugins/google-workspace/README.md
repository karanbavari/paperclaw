# Google Workspace Plugin

First-party PaperClaw plugin that gives agents governed access to Google Workspace through the `gws` CLI.

The plugin wraps the Google Workspace CLI instead of storing OAuth material itself. Operators authenticate `gws` once with:

```sh
gws auth setup
gws auth login
```

Then configure the plugin with the `gws` binary path and, optionally, `GOOGLE_WORKSPACE_CLI_CONFIG_DIR`.

Safety defaults:

- Dry run is enabled by default.
- Raw `gws` command execution is disabled by default.
- Raw commands are still structured as service/resource/method/params/json, never shell strings.
- The plugin stores only health/audit metadata in PaperClaw `plugin_state`; Google credentials remain in the `gws` auth store.
