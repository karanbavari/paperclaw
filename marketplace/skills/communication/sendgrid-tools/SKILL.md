# SendGrid Communication Tools

Use the PaperClaw SendGrid plugin for governed communication workflows.

## Scope
- Region: Global
- Capabilities: email-send, templates, suppressions, sender-identities
- Official-provider API only; do not scrape inboxes, bypass consent, or use unofficial channel endpoints.

## Operating Rules
- Confirm the plugin is connected before using tools.
- Keep dry-run enabled for sends, calls, campaigns, templates, and opt-in mutations until an authorized manager approves live changes.
- Verify consent, opt-out, approved templates, recording disclosure, quiet hours, and local telecom/channel rules before live use.
- Prefer provider-specific tools before enabling raw API access.

## Handoff
After each operation, summarize the provider, channel, recipients or records touched, dry-run/live mode, and any follow-up needed.
