# BigCommerce Tools

Use this skill when a PaperClaw agent needs to inspect or operate a BigCommerce store through the BigCommerce plugin.

## Before Using Tools

1. Confirm the plugin has the store hash in Store / Project ID and an access token secret reference.
2. Use `bigcommerce.storeOverview` to verify access before catalog or order work.
3. Search and read products/orders before mutating them.
4. Keep live mutations behind dry-run review unless the issue explicitly approves a live operation.

## Guardrails

- Never expose BigCommerce API tokens.
- Respect operation allowlists for catalog, inventory, order, and customer work.
- Summarize results instead of dumping full API payloads.
- If a v2/v3 endpoint returns a schema error, include the exact status and message in the issue comment.
