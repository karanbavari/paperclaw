---
name: canva-tools
description: >
  Use when a PaperClaw agent needs the Canva plugin for Canva Connect API
  workflows: designs, exports, assets, brand templates, autofill, folders,
  comments, imports, resizes, and governed dry-run/live creative operations.
---

# Canva Tools

Use this skill with the Canva plugin. The plugin exposes Canva Connect API tools for agent-safe creative operations.

## Preflight

1. Confirm the Canva plugin is installed, connected, and scoped to the current PaperClaw company.
2. Check whether dry-run mode is enabled before creating, uploading, deleting, commenting, importing, resizing, or autofilling.
3. Confirm the target design, folder, asset, brand template, export format, and intended audience before changing Canva.
4. Use the narrowest tool that fits the task.

## Common Workflows

- Design research: use `canva.listDesigns`, `canva.getDesign`, `canva.getDesignPages`, and `canva.getDesignExportFormats`.
- Export: use `canva.createExportJob` with `poll: true` when the task needs final export URLs.
- Brand template autofill: inspect `canva.getBrandTemplateDataset`, validate data keys, then use `canva.createAutofillJob`.
- Assets: prefer `canva.uploadAssetFromUrl` for external files and `canva.uploadAssetBytes` only when content is already available as base64.
- Folders: list/get before moving or deleting items.
- Comments: write concise, task-relevant comments only when the issue explicitly authorizes collaboration inside Canva.

## Safety Rules

- Treat dry-run output as a preview, not a completed Canva change.
- Do not publish, delete, resize, overwrite, or comment on production creative assets without clear task authority.
- Do not expose OAuth tokens, secret refs, exported private URLs, customer data, or unreleased creative copy in comments unless the task requires it.
- When a job is asynchronous, report the job ID, status, and returned design/export/asset IDs or URLs.
- If Canva returns missing-scope or permission errors, ask the board to reconnect with the required scope instead of guessing.

## Reporting

Include:

- design, asset, folder, template, job, or comment IDs touched
- dry-run/live status
- final job status for async operations
- links or URLs returned by Canva when relevant
- any required follow-up approval
