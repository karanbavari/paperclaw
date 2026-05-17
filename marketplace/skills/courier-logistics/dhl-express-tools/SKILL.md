# DHL Express Tools

Use this skill when a PaperClaw agent needs DHL Express workflows through the DHL Express plugin.

## Protocol

1. Confirm DHL Express MyDHL API credentials are configured.
2. Use `dhlExpress.rateQuote` before shipment creation.
3. Use `dhlExpress.trackingLookup` for shipment status.
4. Keep shipment, label, and pickup tools in dry-run until approved.

## Guardrails

- Never expose DHL API credentials.
- Confirm account, service, customs, and pickup details before live shipment creation.
- Stop on unsupported route/service errors.
