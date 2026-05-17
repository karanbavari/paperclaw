---
name: microsoft-365-tools
description: Use the PaperClaw Microsoft 365 productivity plugin to let agents operate official Microsoft 365 APIs.
---

# Microsoft 365 Tools

Use this skill when a marketplace micro-service agent needs to connect a
PaperClaw company to Microsoft 365.

## Setup

1. Install and enable the `@kesarcloud/plugin-microsoft-365` plugin.
2. Open the plugin settings page.
3. Configure either an access token/PAT or OAuth app credentials.
4. Keep dry-run enabled while validating agent workflows.
5. Switch to live only after board approval for mutating actions.

All mutating tools honor dry-run and write PaperClaw activity/audit entries.
