# UPS Tools

Use this skill when a PaperClaw agent needs UPS shipping workflows through the UPS plugin.

## Protocol

1. Confirm UPS OAuth token setup is complete.
2. Use `ups.rateQuote` before shipment or label work.
3. Use `ups.trackingLookup` for package status.
4. Keep label, shipment, and pickup tools in dry-run until live execution is approved.

## Guardrails

- Never expose UPS credentials.
- Verify shipper account, service, address, and package details before live label creation.
- Report UPS validation errors with status and message.
