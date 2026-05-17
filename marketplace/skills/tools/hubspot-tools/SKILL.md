---
name: hubspot-tools
description: Use the PaperClaw HubSpot plugin to let agents operate HubSpot CRM through private app tokens or OAuth-backed tools.
---

# HubSpot Tools

Use this skill when a marketplace micro-service agent needs to connect a
PaperClaw company to HubSpot CRM.

## Setup

1. Install and enable the `@kesarcloud/plugin-hubspot` plugin.
2. Open the HubSpot plugin settings page in PaperClaw.
3. Choose either private app token setup or OAuth app setup.
4. Keep dry-run enabled while validating agent workflows.
5. Switch to live only after the board approves mutating CRM actions.

Private app setup stores the pasted access token as a PaperClaw secret. OAuth
setup stores the client secret and refresh token as PaperClaw secrets.

## Agent Tool Groups

- CRM objects: `hubspot.objectGet`, `hubspot.objectList`,
  `hubspot.objectSearch`, `hubspot.objectCreate`, `hubspot.objectUpdate`,
  `hubspot.objectArchive`.
- Batch operations: `hubspot.batchRead`, `hubspot.batchCreate`,
  `hubspot.batchUpdate`, `hubspot.batchArchive`.
- Standard aliases: contacts, companies, deals, and tickets list/search/get/
  create/update/archive tools.
- Activities: `hubspot.noteCreate`, `hubspot.noteGet`,
  `hubspot.noteUpdate`, `hubspot.noteArchive`, `hubspot.taskCreate`,
  `hubspot.taskGet`, `hubspot.taskUpdate`, `hubspot.taskArchive`.
- Metadata: `hubspot.propertiesList`, `hubspot.propertyGet`,
  `hubspot.propertyCreate`, `hubspot.propertyUpdate`, `hubspot.ownersList`,
  `hubspot.pipelinesList`, `hubspot.pipelineGet`.
- Associations: `hubspot.associationsList`,
  `hubspot.associationCreateDefault`, `hubspot.associationCreateLabeled`,
  `hubspot.associationRemove`.
- Advanced fallback: `hubspot.apiRequest`, limited to configured CRM-safe API
  paths and disabled by default.

All mutating tools honor the plugin-level dry-run setting and write PaperClaw
activity/audit entries.
