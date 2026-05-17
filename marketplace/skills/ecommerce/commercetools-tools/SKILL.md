# commercetools Tools

Use this skill when a PaperClaw agent needs to inspect or operate a commercetools project through the commercetools plugin.

## Before Using Tools

1. Confirm Store / Project ID is set to the commercetools project key.
2. Confirm the access token secret reference is configured.
3. Use product, inventory, order, and customer read tools before update actions.
4. Keep dry-run enabled for writes until versioned update actions are checked.

## Guardrails

- Never expose commercetools client credentials or bearer tokens.
- commercetools mutations are versioned; if the API requires a current version, read the resource again before live update.
- Report missing scopes clearly instead of retrying.
