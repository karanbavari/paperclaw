# EasyPost Tools

Use this skill when a PaperClaw agent needs to inspect or operate EasyPost through the EasyPost plugin.

## Protocol

1. Confirm EasyPost credentials are configured.
2. Use `easypost.rateQuote` before shipment or label work.
3. Use `easypost.trackingLookup` for delivery status checks.
4. Keep labels, shipments, and pickups in dry-run unless live execution is approved.

## Guardrails

- Never expose EasyPost API keys.
- Verify addresses before creating live labels.
- Report carrier API validation errors exactly and stop.
