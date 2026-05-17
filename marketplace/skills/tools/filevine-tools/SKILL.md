---
name: filevine-tools
description: Use the PaperClaw Filevine Legal & Law plugin to let agents operate official Filevine APIs.
---

# Filevine Tools

Use this skill when a marketplace micro-service agent needs to connect a PaperClaw company to Filevine for legal operations workflows.

## Setup

1. Install and enable the `@kesarcloud/plugin-filevine` plugin.
2. Open the plugin settings page.
3. Configure an access token/API key or OAuth credentials where supported.
4. Set any tenant, account, organization, region, or API base URL required by the vendor.
5. Keep dry-run enabled while validating agent workflows.
6. Switch to live only after board approval for mutating actions.

All mutating tools honor dry-run and write PaperClaw activity/audit entries. These tools automate legal records and documents; they do not provide legal advice.
