---
name: netlify-tools
description: Use the PaperClaw Netlify Developer plugin to operate official Netlify APIs with dry-run guardrails.
---

# Netlify Tools

Use this skill when a PaperClaw company needs governed developer-platform automation through Netlify.

## Setup

1. Install and enable the `@kesarcloud/plugin-netlify` plugin.
2. Open the plugin settings page.
3. Configure an access token/PAT/API key or OAuth app credentials.
4. Keep dry-run enabled while validating agent workflows.
5. Switch to live only after board approval for production-impacting actions.

All mutating tools honor dry-run and write PaperClaw activity/audit entries.
