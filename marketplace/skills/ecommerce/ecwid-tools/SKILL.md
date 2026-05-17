# Ecwid Tools

Use this skill when a PaperClaw agent needs to inspect or operate an Ecwid store through the Ecwid plugin.

## Before Using Tools

1. Confirm Store / Project ID is the Ecwid store ID.
2. Confirm an Ecwid access token secret reference is configured.
3. Search/read products and orders before making changes.
4. Use dry-run for product, inventory, and order mutations until approved.

## Guardrails

- Never expose Ecwid tokens.
- Keep customer/order data minimal in comments.
- Report Ecwid API validation errors exactly and stop.
