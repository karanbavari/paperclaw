---
name: linear-tools
description: Use the PaperClaw Linear productivity plugin to let agents operate official Linear APIs.
---

# Linear Tools

Use this skill when a marketplace micro-service agent needs to connect a
PaperClaw company to Linear.

## Setup

1. Install and enable the `@kesarcloud/plugin-linear` plugin.
2. Open the plugin settings page.
3. Configure either an access token/PAT or OAuth app credentials.
4. Keep dry-run enabled while validating agent workflows.
5. Switch to live only after board approval for mutating actions.

All mutating tools honor dry-run and write PaperClaw activity/audit entries.
