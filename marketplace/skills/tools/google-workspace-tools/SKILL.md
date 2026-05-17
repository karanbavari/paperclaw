---
name: google-workspace-tools
description: >
  Use when a PaperClaw agent needs the Google Workspace plugin for Gmail,
  Calendar, Drive, Docs, Sheets, Chat, or governed raw gws workflows. Covers
  safe read-first usage, dry-run behavior, audit expectations, and when to ask
  for approval before sending or changing external Google Workspace data.
---

# Google Workspace Tools

Use this skill with the Google Workspace plugin. The plugin wraps the `gws` CLI and exposes governed tools for Gmail, Calendar, Drive, Docs, Sheets, Chat, and optional raw `gws` commands.

## Preflight

1. Confirm the plugin is installed and configured with an authenticated `gws` profile.
2. Check whether dry-run mode is enabled before any mutating operation.
3. Confirm the target account, calendar, drive, document, sheet, or chat space.
4. Use the narrowest tool that fits the task. Avoid raw `workspace.runGwsCommand` unless the curated tool set cannot do the job.

## Common Workflows

- Gmail research: search with a precise query, read only relevant messages, summarize with message IDs and dates.
- Gmail send/reply: draft first, ask for confirmation when content has external impact, then send or reply.
- Calendar: load agenda before creating/updating/deleting events; verify time zone and attendee/customer context.
- Drive: search before upload/share; confirm file IDs and permission role before sharing.
- Docs: create a doc only when the task output belongs in Google Docs; append text with a clear target document ID.
- Sheets: read exact ranges; append rows only after validating column order and values.
- Chat: draft and confirm message text before posting to external or shared spaces.

## Safety Defaults

- Treat dry-run output as the approval artifact for mutating operations.
- Never expose OAuth tokens, config directory contents, private message bodies, or raw customer data in comments unless the task requires it.
- Do not send email, share files, delete calendar events, or post chat messages without explicit task authority.
- Prefer read-only inspection when the task is ambiguous.
- Keep audit notes brief: tool used, target resource, outcome, and whether it was dry-run or live.

## Raw gws Policy

Use `workspace.runGwsCommand` only when:

- no curated tool supports the required Google Workspace API method
- the service is allowed by plugin configuration
- the command is expressed as structured service/resource/method/params/json
- the operation is dry-run first if it mutates data

Document why the raw tool was necessary.
