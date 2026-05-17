# Wix eCommerce Tools

Use this skill when a PaperClaw agent needs to inspect or operate a Wix eCommerce site through the Wix eCommerce plugin.

## Before Using Tools

1. Confirm the Wix OAuth/access token secret reference is configured.
2. Use read/query tools before product, inventory, order, or customer mutations.
3. Keep dry-run enabled for writes unless the issue explicitly asks for live execution.

## Guardrails

- Never request Wix tokens in chat.
- Respect Wix API permissions and site boundaries.
- If Wix query endpoints require a specific filter body, prepare it in dry-run first and explain it before live execution.
