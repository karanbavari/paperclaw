---
name: grafana-tools
description: Use the PaperClaw Grafana Developer plugin to operate official Grafana APIs with dry-run guardrails.
---

# Grafana Tools

Use this skill when a PaperClaw company needs governed developer-platform automation through Grafana.

## Setup

1. Install and enable the `@kesarcloud/plugin-grafana` plugin.
2. Open the plugin settings page.
3. Configure an access token/PAT/API key or OAuth app credentials.
4. Keep dry-run enabled while validating agent workflows.
5. Switch to live only after board approval for production-impacting actions.

All mutating tools honor dry-run and write PaperClaw activity/audit entries.
