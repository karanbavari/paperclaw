# Square Commerce Tools

Use this skill when a PaperClaw agent needs to inspect or operate Square catalog, inventory, orders, or customers through the Square Commerce plugin.

## Before Using Tools

1. Confirm a Square sandbox or production access token secret reference is configured.
2. Use `squareCommerce.storeOverview` to inspect locations first.
3. Use catalog and order read tools before any live update.
4. Keep dry-run enabled for catalog, inventory, and order writes unless live execution is explicitly approved.

## Guardrails

- Treat Square access tokens as secrets.
- Mention whether the operation targets sandbox or production.
- Do not use payment-changing Square operations through this ecommerce connector unless a payment-specific plugin/policy is installed.
