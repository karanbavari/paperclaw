---
name: postman-tools
description: Use the PaperClaw Postman Developer plugin to operate official Postman APIs with dry-run guardrails.
---

# Postman Tools

Use this skill when a PaperClaw company needs governed developer-platform automation through Postman.

## Setup

1. Install and enable the `@kesarcloud/plugin-postman` plugin.
2. Open the plugin settings page.
3. Configure an access token/PAT/API key or OAuth app credentials.
4. Keep dry-run enabled while validating agent workflows.
5. Switch to live only after board approval for production-impacting actions.

All mutating tools honor dry-run and write PaperClaw activity/audit entries.
