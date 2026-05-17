# AfterShip Tools

Use this skill when a PaperClaw agent needs tracking-focused courier workflows through the AfterShip plugin.

## Protocol

1. Confirm the AfterShip API key secret reference is configured.
2. Use `aftership.carrierServices` to identify supported couriers.
3. Use `aftership.trackingLookup` for shipment status.
4. Use tracking creation only in dry-run unless the issue explicitly approves live registration.

## Guardrails

- Never expose AfterShip API keys.
- Keep customer/order data out of comments unless required.
- Report courier detection failures clearly.
